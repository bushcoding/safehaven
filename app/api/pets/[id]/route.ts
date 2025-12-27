import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Pet from "@/models/Pet"
import { verifyToken } from "@/lib/auth"
import { deleteImageFromCloudinary } from "@/lib/cloudinary"
import mongoose from "mongoose"

// GET - Obtener mascota por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "ID de mascota inválido" }, { status: 400 })
    }

    const pet = await Pet.findById(params.id).populate("userId", "name email")

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Formatear respuesta
    const formattedPet = {
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
      userId: pet.userId._id.toString(),
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    }

    return NextResponse.json({ pet: formattedPet })
  } catch (error) {
    console.error("Error obteniendo mascota:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT - Actualizar mascota
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "ID de mascota inválido" }, { status: 400 })
    }

    // Buscar mascota
    const pet = await Pet.findById(params.id)
    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario es el propietario
    if (pet.userId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "No tienes permisos para actualizar esta mascota" }, { status: 403 })
    }

    const updateData = await request.json()

    // Si se está cambiando la imagen, eliminar la anterior de Cloudinary
    if (updateData.imagePublicId && pet.imagePublicId && updateData.imagePublicId !== pet.imagePublicId) {
      try {
        await deleteImageFromCloudinary(pet.imagePublicId)
      } catch (error) {
        console.error("Error eliminando imagen anterior:", error)
      }
    }

    // Actualizar mascota
    const updatedPet = await Pet.findByIdAndUpdate(
      params.id,
      {
        ...updateData,
        type: updateData.type?.toLowerCase(),
        status: updateData.status?.toLowerCase(),
      },
      { new: true, runValidators: true },
    ).populate("userId", "name email")

    // Formatear respuesta
    const formattedPet = {
      id: updatedPet!._id.toString(),
      name: updatedPet!.name,
      type: updatedPet!.type,
      breed: updatedPet!.breed || "",
      age: updatedPet!.age || "",
      location: updatedPet!.location,
      description: updatedPet!.description,
      image: updatedPet!.image || "/placeholder.svg?height=300&width=400",
      imagePublicId: updatedPet!.imagePublicId,
      status: updatedPet!.status,
      urgent: updatedPet!.urgent,
      contact: updatedPet!.contact,
      lat: updatedPet!.lat,
      lng: updatedPet!.lng,
      userId: updatedPet!.userId._id.toString(),
      createdAt: updatedPet!.createdAt,
      updatedAt: updatedPet!.updatedAt,
    }

    return NextResponse.json({
      message: "Mascota actualizada exitosamente",
      pet: formattedPet,
    })
  } catch (error: any) {
    console.error("Error actualizando mascota:", error)

    // Manejar errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar mascota
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "ID de mascota inválido" }, { status: 400 })
    }

    // Buscar mascota
    const pet = await Pet.findById(params.id)
    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario es el propietario
    if (pet.userId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "No tienes permisos para eliminar esta mascota" }, { status: 403 })
    }

    // Eliminar imagen de Cloudinary si existe
    if (pet.imagePublicId) {
      try {
        await deleteImageFromCloudinary(pet.imagePublicId)
        console.log("✅ Imagen eliminada de Cloudinary")
      } catch (error) {
        console.error("❌ Error eliminando imagen de Cloudinary:", error)
      }
    }

    // Eliminar mascota
    await Pet.findByIdAndDelete(params.id)

    return NextResponse.json({
      message: "Mascota eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando mascota:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
