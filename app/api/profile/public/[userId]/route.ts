import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Pet from "@/models/Pet"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB()

    const { userId } = params

    // Obtener información pública del usuario
    const user = await User.findById(userId).select('name email phone createdAt')
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Obtener mascotas del usuario (solo las activas para perfil público)
    const pets = await Pet.find({ 
      userId: userId,
      status: { $ne: "adoptado" }
    }).sort({ createdAt: -1 })

    // Obtener estadísticas
    const totalPets = await Pet.countDocuments({ userId: userId })
    const adoptedPets = await Pet.countDocuments({ 
      userId: userId, 
      status: "adoptado" 
    })

    const publicProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      totalPets,
      adoptedPets
    }

    return NextResponse.json({
      user: publicProfile,
      pets: pets
    })

  } catch (error) {
    console.error("Error en GET /api/profile/public/[userId]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
