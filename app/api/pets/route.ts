import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Pet from "@/models/Pet"
import User from "@/models/User"
import mongoose from "mongoose" // Import mongoose to declare the variable
import { verifyToken, getDefaultCoordinates } from "@/lib/auth"

// ✨ Cache en memoria para consultas frecuentes
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 segundos

function getCacheKey(searchParams: URLSearchParams): string {
  const params = Array.from(searchParams.entries()).sort()
  return JSON.stringify(params)
}

function getFromCache(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("✅ Cache hit:", key)
    return cached.data
  }
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
  // Limpiar cache viejo
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value
    cache.delete(oldestKey)
  }
}

// GET - Obtener todas las mascotas con filtros opcionales
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const cacheKey = getCacheKey(searchParams)

    // ✨ Verificar cache primero
    const cachedResult = getFromCache(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    await connectDB()

    const query = searchParams.get("q") || ""
    const type = searchParams.get("type")
    const urgent = searchParams.get("urgent")
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "12"), 50) // Reducido el default de 50 a 12
    const page = Number.parseInt(searchParams.get("page") || "1")

    // ✨ Construir pipeline de agregación optimizado
    const pipeline: any[] = []

    // Match stage - filtros básicos
    const matchStage: any = {}

    // ✨ Por defecto, excluir mascotas adoptadas
    if (!status) {
      matchStage.status = { $ne: "adoptado" }
    }

    if (userId) matchStage.userId = new mongoose.Types.ObjectId(userId)
    if (type && type !== "all") matchStage.type = type.toLowerCase()
    if (urgent === "true") matchStage.urgent = true
    if (status && status !== "all") matchStage.status = status.toLowerCase()

    // Búsqueda de texto robusta (compatible con cualquier configuración de BD)
    if (query) {
      // ✨ Usar $or con regex para máxima compatibilidad
      matchStage.$or = [
        { name: { $regex: query, $options: "i" } },
        { breed: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ]
    }

    pipeline.push({ $match: matchStage })

    // ✨ Lookup optimizado - solo campos necesarios
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: { name: 1, email: 1 } }], // Solo campos necesarios
      },
    })

    // Unwind user
    pipeline.push({ $unwind: "$user" })

    // Sort por fecha (más recientes primero)
    pipeline.push({ $sort: { createdAt: -1 } })

    // ✨ Facet para obtener datos y count en una sola consulta
    pipeline.push({
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name: 1,
              type: 1,
              breed: 1,
              age: 1,
              location: 1,
              description: 1,
              image: 1,
              imagePublicId: 1,
              status: 1,
              urgent: 1,
              contact: 1,
              lat: 1,
              lng: 1,
              userId: 1,
              userName: "$user.name",
              userEmail: "$user.email",
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    })

    console.log("🔄 Ejecutando consulta optimizada...")
    const queryStart = Date.now()

    const [result] = await Pet.aggregate(pipeline)

    const queryDuration = Date.now() - queryStart
    console.log(`✅ Consulta ejecutada en ${queryDuration}ms`)

    const pets = result.data || []
    const total = result.totalCount[0]?.count || 0

    // Formatear respuesta
    const formattedPets = pets.map((pet: any) => ({
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
      userId: pet.userId.toString(),
      userName: pet.userName,
      userEmail: pet.userEmail,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    }))

    const response = {
      pets: formattedPets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }

    // ✨ Guardar en cache
    setCache(cacheKey, response)

    const totalDuration = Date.now() - startTime
    console.log(`✅ GET /api/pets completado en ${totalDuration}ms`)

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ Error en GET /api/pets (${duration}ms):`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nueva mascota (optimizado)
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🔄 Iniciando creación de mascota...")
    await connectDB()

    // Verificar autenticación
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      console.log("❌ No hay token")
      return NextResponse.json({ error: "Token de autenticación requerido" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("❌ Token inválido")
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    console.log("✅ Usuario autenticado:", decoded.userId)

    // ✨ Verificar usuario en paralelo con parsing del body
    const [user, petData] = await Promise.all([
      User.findById(decoded.userId)
        .select("_id name email")
        .lean(), // lean() para mejor performance
      request.json(),
    ])

    if (!user) {
      console.log("❌ Usuario no encontrado")
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("📝 Datos de mascota recibidos")

    // Obtener coordenadas por defecto si no se proporcionan
    let { lat, lng } = petData
    if (!lat || !lng) {
      const coords = getDefaultCoordinates(petData.location || "")
      lat = coords.lat
      lng = coords.lng
    }

    // Preparar datos para crear la mascota
    const petToCreate = {
      name: petData.name,
      type: petData.type?.toLowerCase(),
      breed: petData.breed || "",
      age: petData.age || "",
      location: petData.location,
      description: petData.description,
      image: petData.image || "",
      imagePublicId: petData.imagePublicId || "",
      status: petData.status?.toLowerCase(),
      urgent: Boolean(petData.urgent),
      contact: petData.contact,
      lat: Number(lat),
      lng: Number(lng),
      userId: decoded.userId,
    }

    console.log("🐾 Creando mascota...")
    const createStart = Date.now()

    // Crear mascota
    const newPet = await Pet.create(petToCreate)

    const createDuration = Date.now() - createStart
    console.log(`✅ Mascota creada en ${createDuration}ms:`, newPet._id)

    // ✨ Limpiar cache relacionado
    cache.clear()

    // Formatear respuesta con datos del usuario
    const formattedPet = {
      id: newPet._id.toString(),
      name: newPet.name,
      type: newPet.type,
      breed: newPet.breed || "",
      age: newPet.age || "",
      location: newPet.location,
      description: newPet.description,
      image: newPet.image || "/placeholder.svg?height=300&width=400",
      imagePublicId: newPet.imagePublicId,
      status: newPet.status,
      urgent: newPet.urgent,
      contact: newPet.contact,
      lat: newPet.lat,
      lng: newPet.lng,
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      createdAt: newPet.createdAt,
      updatedAt: newPet.updatedAt,
    }

    const totalDuration = Date.now() - startTime
    console.log(`✅ POST /api/pets completado en ${totalDuration}ms`)

    return NextResponse.json(
      {
        message: "Mascota creada exitosamente",
        pet: formattedPet,
      },
      { status: 201 },
    )
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ Error creando mascota (${duration}ms):`, error)

    // Manejar errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
