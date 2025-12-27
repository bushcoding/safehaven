import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
}

export async function uploadImageToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string
    public_id?: string
    transformation?: any
    resource_type?: "image" | "video" | "raw" | "auto"
  } = {},
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions = {
      folder: options.folder || "safehaven",
      resource_type: options.resource_type || "image",
      public_id: options.public_id,
      transformation: options.transformation || [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
      ...options,
    }

    console.log("📤 Subiendo imagen a Cloudinary...")

    const result = await cloudinary.uploader.upload(file as string, uploadOptions)

    console.log("✅ Imagen subida exitosamente:", result.public_id)

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      created_at: result.created_at,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error("❌ Error subiendo imagen a Cloudinary:", error)
    throw new Error("Error subiendo imagen")
  }
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    console.log("🗑️ Eliminando imagen de Cloudinary:", publicId)

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === "ok") {
      console.log("✅ Imagen eliminada exitosamente")
    } else {
      console.warn("⚠️ La imagen no se pudo eliminar:", result.result)
    }
  } catch (error) {
    console.error("❌ Error eliminando imagen de Cloudinary:", error)
    throw new Error("Error eliminando imagen")
  }
}

export function getCloudinaryUrl(
  publicId: string,
  transformations: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {},
): string {
  const { width = 400, height = 300, crop = "fill", quality = "auto", format = "auto" } = transformations

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format,
  })
}

export default cloudinary
