import mongoose, { type Document, Schema } from "mongoose"

export interface IPet extends Document {
  name: string
  type: string
  breed?: string
  age?: string
  location: string
  description: string
  image?: string
  imagePublicId?: string
  status: "adopcion" | "rescate" | "cuidados" | "temporal"
  urgent: boolean
  contact: string
  lat: number
  lng: number
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PetSchema = new Schema<IPet>(
  {
    name: {
      type: String,
      required: [true, "El nombre del animal es requerido"],
      trim: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
      index: true, // ✨ Índice para búsquedas
    },
    type: {
      type: String,
      required: [true, "El tipo de animal es requerido"],
      enum: {
        values: ["perro", "gato", "conejo", "ave", "hamster", "cobayo", "tortuga", "pez", "iguana", "hurón", "chinchilla", "otros"],
        message: "Tipo de animal no válido",
      },
      index: true, // ✨ Índice para filtros
    },
    breed: {
      type: String,
      trim: true,
      maxlength: [50, "La raza no puede exceder 50 caracteres"],
      index: true, // ✨ Índice para búsquedas
    },
    age: {
      type: String,
      trim: true,
      maxlength: [20, "La edad no puede exceder 20 caracteres"],
    },
    location: {
      type: String,
      required: [true, "La ubicación es requerida"],
      trim: true,
      maxlength: [100, "La ubicación no puede exceder 100 caracteres"],
      index: true, // ✨ Índice para búsquedas geográficas
    },
    description: {
      type: String,
      required: [true, "La descripción es requerida"],
      trim: true,
      maxlength: [1000, "La descripción no puede exceder 1000 caracteres"],
      index: "text", // ✨ Índice de texto completo
    },
    image: {
      type: String,
      trim: true,
    },
    imagePublicId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: [true, "El estado es requerido"],
      enum: {
        values: ["adopcion", "rescate", "cuidados", "temporal", "adoptado"],
        message: "Estado no válido",
      },
      index: true, // ✨ Índice para filtros
    },
    urgent: {
      type: Boolean,
      default: false,
      index: true, // ✨ Índice para casos urgentes
    },
    contact: {
      type: String,
      required: [true, "El contacto es requerido"],
      trim: true,
      validate: {
        validator: (v: string) => {
          return /^[+]?[0-9\s\-()]{9,15}$/.test(v.replace(/\s/g, ""))
        },
        message: "Por favor ingresa un número de WhatsApp válido (ej: +34 600 123 456)",
      },
    },
    lat: {
      type: Number,
      required: [true, "La latitud es requerida"],
      min: [-90, "La latitud debe estar entre -90 y 90"],
      max: [90, "La latitud debe estar entre -90 y 90"],
    },
    lng: {
      type: Number,
      required: [true, "La longitud es requerida"],
      min: [-180, "La longitud debe estar entre -180 y 180"],
      max: [180, "La longitud debe estar entre -180 y 180"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es requerido"],
      index: true, // ✨ Índice para consultas por usuario
    },
  },
  {
    timestamps: true,
  },
)

// ✨ ÍNDICES COMPUESTOS OPTIMIZADOS
PetSchema.index({ type: 1, status: 1 }) // Filtros combinados
PetSchema.index({ urgent: 1, createdAt: -1 }) // Casos urgentes recientes
PetSchema.index({ userId: 1, createdAt: -1 }) // Mascotas por usuario
PetSchema.index({ location: 1, type: 1 }) // Búsqueda geográfica + tipo
PetSchema.index({ createdAt: -1 }) // Orden cronológico
PetSchema.index({ lat: 1, lng: 1 }) // Geolocalización

// ✨ Índice de texto completo para búsquedas
PetSchema.index(
  {
    name: "text",
    breed: "text",
    location: "text",
    description: "text",
  },
  {
    weights: {
      name: 10,
      breed: 5,
      location: 3,
      description: 1,
    },
  },
)

// Middleware para eliminar imagen de Cloudinary cuando se elimina el documento
PetSchema.pre("findOneAndDelete", async function () {
  const pet = await this.model.findOne(this.getQuery())
  if (pet?.imagePublicId) {
    try {
      const { deleteImageFromCloudinary } = await import("@/lib/cloudinary")
      await deleteImageFromCloudinary(pet.imagePublicId)
    } catch (error) {
      console.error("Error eliminando imagen de Cloudinary:", error)
    }
  }
})

// Evitar re-compilación del modelo
const Pet = mongoose.models.Pet || mongoose.model<IPet>("Pet", PetSchema)

export default Pet
