import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Pet from "@/models/Pet"
import User from "@/models/User"

// ✨ Cache para estadísticas (se actualiza cada 5 minutos)
let statsCache: any = null
let lastStatsUpdate = 0
const STATS_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // ✨ Verificar cache de estadísticas
    if (statsCache && Date.now() - lastStatsUpdate < STATS_CACHE_DURATION) {
      console.log("✅ Stats cache hit")
      return NextResponse.json(statsCache)
    }

    console.log("🔄 Calculando estadísticas...")
    await connectDB()

    // ✨ Una sola agregación para obtener todas las estadísticas
    const [petsStats] = await Pet.aggregate([
      {
        $facet: {
          // Contadores básicos
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                urgent: { $sum: { $cond: ["$urgent", 1, 0] } },
                adoption: { $sum: { $cond: [{ $eq: ["$status", "adopcion"] }, 1, 0] } },
                rescue: { $sum: { $cond: [{ $eq: ["$status", "rescate"] }, 1, 0] } },
                adopted: { $sum: { $cond: [{ $eq: ["$status", "adoptado"] }, 1, 0] } }, // Added this line
                recent: {
                  $sum: {
                    $cond: [{ $gte: ["$createdAt", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0],
                  },
                },
              },
            },
          ],
          // Estadísticas por tipo
          byType: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],
          // Estadísticas por ubicación (top 10)
          byLocation: [
            {
              $group: {
                _id: "$location",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ])

    // Obtener conteo de usuarios en paralelo
    const userCountPromise = User.countDocuments()

    const [userCount] = await Promise.all([userCountPromise])

    const counts = petsStats.counts[0] || {
      total: 0,
      urgent: 0,
      adoption: 0,
      rescue: 0,
      recent: 0,
    }

    // ✨ Construir respuesta optimizada
    const stats = {
      totalPets: counts.total,
      urgentPets: counts.urgent,
      adoptionPets: counts.adoption,
      rescuePets: counts.rescue,
      totalUsers: userCount,
      recentPets: counts.recent,
      petsByType: petsStats.byType,
      petsByLocation: petsStats.byLocation,
      successfulAdoptions: counts.adopted, // Changed this line
    }

    // ✨ Actualizar cache
    statsCache = stats
    lastStatsUpdate = Date.now()

    const duration = Date.now() - startTime
    console.log(`✅ Stats calculadas en ${duration}ms`)

    return NextResponse.json(stats)
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ Error obteniendo estadísticas (${duration}ms):`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
