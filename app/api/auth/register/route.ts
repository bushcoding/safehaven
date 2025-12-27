import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Iniciando registro...")

    // Conectar a la base de datos
    await connectDB()
    console.log("✅ Conectado a MongoDB")

    const body = await request.json()
    console.log("📝 Datos completos recibidos:", body)

    const { name, email, phone, password, consentAccepted } = body

    console.log("📋 Campos extraídos:", {
      name,
      email,
      phone,
      consentAccepted,
    })

    // Validación básica
    if (!name || !email || !password) {
      console.log("❌ Faltan campos requeridos")
      return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 })
    }

    // Validación de consentimientos obligatorios
    if (!consentAccepted) {
      console.log("❌ Consentimiento legal no aceptado")
      return NextResponse.json(
        { error: "Debes aceptar los Términos y Condiciones y la Política de Privacidad" },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      console.log("❌ Contraseña muy corta")
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    console.log("🔍 Verificando si el usuario existe...")
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log("❌ Usuario ya existe")
      return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 409 })
    }

    // Hashear contraseña
    console.log("🔐 Hasheando contraseña...")
    const hashedPassword = await hashPassword(password)

    // Crear nuevo usuario
    console.log("👤 Creando nuevo usuario...")
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      legalConsent: {
        accepted: true,
        acceptedAt: new Date(),
      },
    }
    
    if (phone) {
      userData.phone = phone.trim()
    }

    console.log("💾 Datos que se van a guardar:", {
      ...userData,
      password: "[HIDDEN]"
    })

    const newUser = await User.create(userData)

    console.log("✅ Usuario creado:", newUser._id)
    console.log("📋 Usuario completo guardado:", {
      ...newUser.toObject(),
      password: "[HIDDEN]"
    })

    // Generar token JWT
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
    })

    // Crear respuesta con usuario (sin contraseña)
    const userResponse = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
    }

    const response = NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: userResponse,
        token,
      },
      { status: 201 },
    )

    // Establecer cookie con el token
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 días
    })

    console.log("✅ Registro completado exitosamente")
    return response
  } catch (error: any) {
    console.error("❌ Error en registro:", error)

    // Manejar errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    // Error de duplicado (email único)
    if (error.code === 11000) {
      return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 409 })
    }

    // Error de conexión a MongoDB
    if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 503 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
