import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Pet from "@/models/Pet"
import mongoose from "mongoose"

// ✨ Cache optimizado
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 15000 // 15 segundos para carga inicial más rápida

function getCacheKey(searchParams: URLSearchParams): string {
  const params = Array.from(searchParams.entries()).sort()
  return JSON.stringify(params)
}

function getFromCache(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("✅ Cache hit")
    return cached.data
  }
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
  if (cache.size > 50) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) {
      cache.delete(oldestKey)
    }
  }
}

// GET - Endpoint optimizado para carga inicial rápida
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
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "12"), 24)

    // ✨ Consulta ultra-optimizada solo con campos esenciales
    let mongoQuery: any = {
      status: { $ne: "adoptado" } // ✨ Excluir mascotas adoptadas por defecto
    }

    if (type && type !== "all") {
      mongoQuery.type = type.toLowerCase()
    }

    if (query) {
      // Usar $text search que es más rápido con índices
      mongoQuery.$text = { $search: query }
    }

    console.log("🔄 Consulta optimizada iniciada...")
    const queryStart = Date.now()

    // ✨ Consulta simple y rápida con populate optimizado
    const pets = await Pet.find(mongoQuery)
      .populate("userId", "name email") // Solo campos necesarios
      .select("name type breed age location image status urgent contact lat lng createdAt") // Solo campos esenciales
      .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .limit(limit)
      .lean() // ✨ Usar lean() para mejor rendimiento

    const queryDuration = Date.now() - queryStart
    console.log(`✅ Consulta ejecutada en ${queryDuration}ms`)

    // Formatear respuesta rápido
    const formattedPets = pets.map((pet: any) => ({
      id: pet._id.toString(),
      name: pet.name,
      type: pet.type,
      breed: pet.breed || "",
      age: pet.age || "",
      location: pet.location,
      image: pet.image || "/placeholder.jpg",
      status: pet.status,
      urgent: pet.urgent,
      contact: pet.contact,
      lat: pet.lat,
      lng: pet.lng,
      userId: pet.userId._id.toString(),
      userName: pet.userId.name,
      userEmail: pet.userId.email,
      createdAt: pet.createdAt,
    }))

    const response = {
      pets: formattedPets,
      total: formattedPets.length,
      page: 1,
      totalPages: 1,
      hasMore: formattedPets.length === limit,
    }

    // ✨ Cachear resultado
    setCache(cacheKey, response)

    const totalDuration = Date.now() - startTime
    console.log(`✅ GET /api/pets/optimized completado en ${totalDuration}ms`)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ Error en /api/pets/optimized:", error)
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
