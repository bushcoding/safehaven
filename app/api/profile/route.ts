import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Pet from "@/models/Pet"
import { verifyToken, hashPassword, verifyPassword, generateToken } from "@/lib/auth"

// GET - Obtener perfil del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Verificar autenticación
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token de autenticación requerido" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Buscar usuario
    const user = await User.findById(decoded.userId).select("-password")
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener mascotas del usuario
    const pets = await Pet.find({ userId: decoded.userId }).sort({ createdAt: -1 })

    // Estadísticas del usuario
    const stats = {
      totalPets: pets.length,
      urgentPets: pets.filter((p) => p.urgent).length,
      adoptionPets: pets.filter((p) => p.status === "adopcion").length,
      rescuePets: pets.filter((p) => p.status === "rescate").length,
    }

    // Formatear mascotas
    const formattedPets = pets.map((pet) => ({
      id: pet._id.toString(),
      name: pet.name,
      type: pet.type,
      breed: pet.breed || "",
      age: pet.age || "",
      location: pet.location,
      description: pet.description,
      image: pet.image || "/placeholder.svg?height=300&width=400",
      imagePublicId: pet.imagePublicId,
      status: pet.status,
      urgent: pet.urgent,
      contact: pet.contact,
      lat: pet.lat,
      lng: pet.lng,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    }))

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      pets: formattedPets,
      stats,
    })
  } catch (error) {
    console.error("Error obteniendo perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT - Actualizar perfil del usuario
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    // Verificar autenticación
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token de autenticación requerido" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const updateData = await request.json()
    const { name, phone, email, currentPassword, newPassword } = updateData

    // Buscar usuario actual
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Preparar datos de actualización
    const updateFields: any = {}
    let needsNewToken = false

    // Actualizar nombre y teléfono
    if (name && name !== user.name) {
      updateFields.name = name.trim()
      needsNewToken = true
    }
    if (phone && phone !== user.phone) {
      updateFields.phone = phone.trim()
    }

    // Actualizar email si se proporciona
    if (email && email !== user.email) {
      // Verificar que el nuevo email no esté en uso
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: decoded.userId } })
      if (existingUser) {
        return NextResponse.json({ error: "Este email ya está en uso" }, { status: 409 })
      }
      updateFields.email = email.toLowerCase().trim()
      needsNewToken = true
    }

    // Cambiar contraseña si se proporciona
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Contraseña actual requerida para cambiar contraseña" }, { status: 400 })
      }

      // Verificar contraseña actual
      const isValidPassword = await verifyPassword(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 })
      }

      // Hashear nueva contraseña
      updateFields.password = await hashPassword(newPassword)
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(decoded.userId, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 })
    }

    // Generar nuevo token si cambió email o nombre
    let newToken = null
    if (needsNewToken) {
      newToken = generateToken({
        userId: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
      })
    }

    const response = NextResponse.json({
      message: "Perfil actualizado exitosamente",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      newToken,
    })

    // Actualizar cookie si hay nuevo token
    if (newToken) {
      response.cookies.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 días
      })
    }

    return response
  } catch (error: any) {
    console.error("Error actualizando perfil:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar cuenta y todas las mascotas
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    // Verificar autenticación
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token de autenticación requerido" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Eliminar todas las mascotas del usuario (esto también eliminará las imágenes de Cloudinary)
    const pets = await Pet.find({ userId: decoded.userId })
    for (const pet of pets) {
      if (pet.imagePublicId) {
        try {
          const { deleteImageFromCloudinary } = await import("@/lib/cloudinary")
          await deleteImageFromCloudinary(pet.imagePublicId)
        } catch (error) {
          console.error("Error eliminando imagen:", error)
        }
      }
    }

    const deletedPets = await Pet.deleteMany({ userId: decoded.userId })
    console.log(`🗑️ Eliminadas ${deletedPets.deletedCount} mascotas del usuario`)

    // Eliminar usuario
    const deletedUser = await User.findByIdAndDelete(decoded.userId)
    if (!deletedUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log(`🗑️ Usuario eliminado: ${deletedUser.email}`)

    return NextResponse.json({
      message: "Cuenta eliminada exitosamente",
      deletedPets: deletedPets.deletedCount,
    })
  } catch (error) {
    console.error("Error eliminando cuenta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
