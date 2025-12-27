import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Por favor define la variable MONGODB_URI en .env.local")
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var myMongoose: MongooseCache | undefined
}

const cached: MongooseCache = global.myMongoose || { conn: null, promise: null }

if (!global.myMongoose) {
  global.myMongoose = cached
}

async function connectDB(): Promise<typeof mongoose> {
  // Si ya hay conexión, devolverla inmediatamente
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Pool de conexiones optimizado
      serverSelectionTimeoutMS: 1500, // Timeout más agresivo
      socketTimeoutMS: 8000, // Socket timeout reducido
      connectTimeoutMS: 1500, // Conexión más rápida
      maxIdleTimeMS: 8000, // Idle time reducido
      retryWrites: true,
      w: "majority" as const,
      // ✨ OPTIMIZACIONES CRÍTICAS
      minPoolSize: 3, // Pool mínimo
      heartbeatFrequencyMS: 8000, // Heartbeat más frecuente
      compressors: ["zlib" as const], // Compresión de datos
      readPreference: "primaryPreferred" as const, // Lectura optimizada
    }

    console.log("🔄 Conectando a MongoDB...")
    const startTime = Date.now()

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        const duration = Date.now() - startTime
        console.log(`✅ MongoDB conectado en ${duration}ms`)
        return mongoose
      })
      .catch((error) => {
        console.error("❌ Error conectando a MongoDB:", error)
        cached.promise = null // Reset promise on error
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("❌ Error en conexión MongoDB:", e)
    throw e
  }

  return cached.conn
}

export default connectDB
