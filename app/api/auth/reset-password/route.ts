import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { verifyToken, hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Iniciando reset de contraseña...")

    await connectDB()

    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token y contraseña son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verificar token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    // Buscar usuario
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(password)

    // Actualizar contraseña
    await User.findByIdAndUpdate(decoded.userId, {
      password: hashedPassword,
    })

    console.log("✅ Contraseña actualizada para:", user.email)

    return NextResponse.json({
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    console.error("❌ Error en reset-password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
