import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Pet from "@/models/Pet"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Probando conexión a MongoDB...")

    // Conectar a la base de datos
    await connectDB()
    console.log("✅ Conectado a MongoDB")

    // Probar consultas básicas
    const userCount = await User.countDocuments()
    const petCount = await Pet.countDocuments()

    console.log(`📊 Usuarios: ${userCount}, Mascotas: ${petCount}`)

    return NextResponse.json({
      message: "Conexión exitosa a MongoDB",
      stats: {
        users: userCount,
        pets: petCount,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Error en test:", error)

    return NextResponse.json(
      {
        error: "Error de conexión a MongoDB",
        details: error.message,
        type: error.name,
      },
      { status: 500 },
    )
  }
}
