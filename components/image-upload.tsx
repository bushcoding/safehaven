"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"
import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';

interface ImageUploadProps {
  onImageUploaded: (imageData: { url: string; publicId: string }) => void
  currentImage?: string
  disabled?: boolean
}

export function ImageUpload({ onImageUploaded, currentImage, disabled = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nsfwModel, setNsfwModel] = useState<nsfwjs.NSFWJS | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  useEffect(() => {
    async function loadModel() {
      try {
        // Ensure TensorFlow.js backend is ready
        await tf.setBackend('webgl'); // Or 'cpu' if webgl is not available
        await tf.ready();

        const model = await nsfwjs.load();
        setNsfwModel(model);
      } catch (error) {
        console.error("Error loading NSFW model:", error);
        setError("Error al cargar el filtro de imágenes. Intenta de nuevo más tarde.");
      } finally {
        setIsModelLoading(false);
      }
    }
    loadModel();
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5MB")
      return
    }

    setError("")
    setIsUploading(true)

    // ✨ NSFW detection
    if (!nsfwModel) {
      setError("El filtro de imágenes aún no está listo. Intenta de nuevo en unos segundos.");
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = async () => {
        try {
          const predictions = await nsfwModel.classify(img);
          const isNSFW = predictions.some(p => 
            (p.className === 'Porn' || p.className === 'Hentai' || p.className === 'Sexy') && p.probability > 0.75
          );

          if (isNSFW) {
            setError("La imagen contiene contenido inapropiado y no puede ser subida.");
            setIsUploading(false);
            return;
          }

          // Proceed with upload if safe
          // Crear preview
          const previewUrl = URL.createObjectURL(file)
          setPreview(previewUrl)

          // Subir archivo
          const formData = new FormData()
          formData.append("file", file)

          const token = localStorage.getItem("token")
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Error subiendo imagen")
          }

          // Limpiar preview temporal
          URL.revokeObjectURL(previewUrl)

          // Actualizar con la URL de Cloudinary
          setPreview(data.image.url)
          onImageUploaded({
            url: data.image.url,
            publicId: data.image.publicId,
          })
        } catch (error) {
          console.error("❌ Error durante la detección NSFW o subida:", error);
          setError(error instanceof Error ? error.message : "Error procesando la imagen.");
        } finally {
          setIsUploading(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreview(null)
    setError("")
    onImageUploaded({ url: "", publicId: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        {preview ? (
          <div className="relative group">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              width={400}
              height={300}
              className="w-full h-48 object-cover"
              unoptimized={preview.startsWith("blob:")}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleClick}
                  disabled={disabled || isUploading || isModelLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Cambiar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveImage}
                  disabled={disabled || isUploading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Quitar
                </Button>
              </div>
            </div>
            {(isUploading || isModelLoading) && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">
                    {isModelLoading ? "Cargando filtro de imágenes..." : "Subiendo..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
              disabled || isModelLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={handleClick}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {isModelLoading ? "Cargando filtro de imágenes..." : isUploading ? "Subiendo imagen..." : "Haz clic para seleccionar una imagen"}
            </p>
            <p className="text-sm text-gray-500">PNG, JPG, GIF hasta 5MB</p>
            {(isUploading || isModelLoading) && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading || isModelLoading}
      />
    </div>
  )
}