import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { generateToken } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/mailgun"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Iniciando recuperación de contraseña...")

    await connectDB()

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña",
      })
    }

    // Generar token de recuperación (válido por 1 hora)
    const resetToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    // Crear URL de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    // Enviar email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl)
      console.log("✅ Email de recuperación enviado a:", user.email)
    } catch (emailError) {
      console.error("❌ Error enviando email:", emailError)
      return NextResponse.json({ error: "Error enviando email de recuperación" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña",
    })
  } catch (error) {
    console.error("❌ Error en forgot-password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
