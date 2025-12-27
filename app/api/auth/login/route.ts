import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Iniciando login...")

    // Conectar a la base de datos
    await connectDB()
    console.log("✅ Conectado a MongoDB")

    const body = await request.json()
    console.log("📝 Datos de login recibidos:", { email: body.email, password: "[HIDDEN]" })

    const { email, password } = body

    // Validación básica
    if (!email || !password) {
      console.log("❌ Faltan credenciales")
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario por email
    console.log("🔍 Buscando usuario...")
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log("❌ Usuario no encontrado")
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    console.log("✅ Usuario encontrado:", user._id)

    // Verificar contraseña
    console.log("🔐 Verificando contraseña...")
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      console.log("❌ Contraseña incorrecta")
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    console.log("✅ Contraseña correcta")

    // Generar token JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    // Crear respuesta con usuario (sin contraseña)
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
    }

    const response = NextResponse.json({
      message: "Login exitoso",
      user: userResponse,
      token,
    })

    // Establecer cookie con el token
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 días
    })

    console.log("✅ Login completado exitosamente")
    return response
  } catch (error: any) {
    console.error("❌ Error en login:", error)

    // Error de conexión a MongoDB
    if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 503 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
