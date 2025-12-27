// Script para crear índices optimizados en MongoDB
// Ejecutar este script una vez para optimizar la base de datos

import connectDB from "./lib/mongodb.js"
import mongoose from "mongoose"

async function createOptimizedIndexes() {
  try {
    console.log("🔄 Conectando a MongoDB...")
    await connectDB()

    const db = mongoose.connection.db
    const petsCollection = db?.collection("pets")

    if (!petsCollection) {
      throw new Error("No se pudo acceder a la colección de pets")
    }

    console.log("🔄 Creando índices optimizados...")

    // Eliminar índices existentes que no son útiles
    try {
      await petsCollection.dropIndexes()
      console.log("✅ Índices anteriores eliminados")
    } catch (error) {
      console.log("ℹ️ No había índices anteriores para eliminar")
    }

    // Crear índices optimizados
    const indexes = [
      // Índice principal para listado ordenado
      { createdAt: -1 },
      
      // Índices para filtros comunes
      { type: 1, status: 1 },
      { urgent: 1, createdAt: -1 },
      { userId: 1, createdAt: -1 },
      
      // Índice para geolocalización
      { lat: 1, lng: 1 },
      { location: 1, type: 1 },
      
      // Índice de texto completo para búsquedas
      {
        name: "text",
        breed: "text",
        location: "text",
        description: "text"
      }
    ]

    for (const index of indexes) {
      try {
        const indexName = Object.keys(index).join("_")
        console.log(`🔄 Creando índice: ${indexName}`)
        
        if (index.name === "text") {
          // Índice de texto con pesos
          await petsCollection.createIndex(index, {
            weights: {
              name: 10,
              breed: 5,
              location: 3,
              description: 1
            },
            name: "text_search_index"
          })
        } else {
          await petsCollection.createIndex(index)
        }
        
        console.log(`✅ Índice creado: ${indexName}`)
      } catch (error) {
        console.error(`❌ Error creando índice ${Object.keys(index).join("_")}:`, error.message)
      }
    }

    // Mostrar estadísticas de índices
    const indexStats = await petsCollection.listIndexes().toArray()
    console.log("✅ Índices actuales:")
    indexStats.forEach((index, i) => {
      console.log(`  ${i + 1}. ${index.name} - ${JSON.stringify(index.key)}`)
    })

    console.log("✅ Optimización de base de datos completada")
    
  } catch (error) {
    console.error("❌ Error optimizando base de datos:", error)
  } finally {
    await mongoose.connection.close()
    console.log("🔐 Conexión cerrada")
  }
}

// Ejecutar el script
createOptimizedIndexes()
