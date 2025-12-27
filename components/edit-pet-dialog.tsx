"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, MapPin, CheckCircle, Trash2 } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { PhoneInput } from "@/components/phone-input"
import { LocationPickerMap } from "@/components/location-picker-map"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Pet } from "@/types"

interface EditPetDialogProps {
  pet: Pet
  onUpdate: (petId: string, updatedData: Partial<Pet>) => Promise<void>
  onDelete: (petId: string) => Promise<void>
  trigger?: React.ReactNode
  isLoading?: boolean
}

export function EditPetDialog({ pet, onUpdate, onDelete, trigger, isLoading = false }: EditPetDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [locationSelected, setLocationSelected] = useState(true) // Al editar, la ubicación ya está seleccionada
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeTimeout, setGeocodeTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const [formData, setFormData] = useState({
    name: pet.name,
    type: pet.type,
    breed: pet.breed || "",
    age: pet.age || "",
    location: pet.location,
    description: pet.description,
    status: pet.status,
    urgent: pet.urgent,
    contact: pet.contact,
    image: pet.image || "",
    imagePublicId: (pet as any).imagePublicId || "",
    lat: pet.lat || 0,
    lng: pet.lng || 0,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    if (typeof value === "string") {
      // Aplicar límites de caracteres según el campo
      const limits: Record<string, number> = {
        name: 20,
        breed: 20,
        location: 50,
        description: 150,
        contact: 20
      }
      
      const limit = limits[field]
      if (limit && value.length > limit) {
        return // No actualizar si excede el límite
      }
      
      // Validación especial para edad - solo números sin formatear
      if (field === "age") {
        // Permitir solo números
        const numbersOnly = value.replace(/[^\d]/g, "")
        // Limitar la edad a máximo 30 años (razonable para animales)
        const ageNumber = parseInt(numbersOnly)
        if (numbersOnly === "" || (ageNumber >= 1 && ageNumber <= 30)) {
          setFormData((prev) => ({ ...prev, [field]: numbersOnly }))
        }
        if (error) setError("")
        return
      }
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const handleImageUploaded = (imageData: { url: string; publicId: string }) => {
    setFormData((prev) => ({
      ...prev,
      image: imageData.url,
      imagePublicId: imageData.publicId,
    }))
  }

  const handleLocationSelect = (locationData: { lat: number; lng: number; address: string }) => {
    setFormData((prev) => ({
      ...prev,
      lat: locationData.lat,
      lng: locationData.lng,
      location: locationData.address,
    }))
    setLocationSelected(true)
    // Limpiar error si había uno relacionado con la ubicación
    if (error.includes("ubicación")) setError("")
  }

  // Función para geocodificar cuando el usuario escriba la ubicación manualmente
  const geocodeLocation = async (address: string) => {
    if (!address || address.length < 3) return false

    setIsGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1&accept-language=es`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const newLat = parseFloat(result.lat)
        const newLng = parseFloat(result.lon)
        
        setFormData((prev) => ({
          ...prev,
          lat: newLat,
          lng: newLng,
        }))
        setLocationSelected(true)
        console.log("✅ Ubicación geocodificada:", result.display_name)
        return true
      }
      return false
    } catch (error) {
      console.error("Error geocodificando ubicación:", error)
      return false
    } finally {
      setIsGeocoding(false)
    }
  }

  // Debounced geocoding cuando el usuario escribe
  const handleLocationInputChange = (value: string) => {
    handleInputChange("location", value)
    
    // Resetear estado de ubicación seleccionada si el usuario está editando
    if (locationSelected) {
      setLocationSelected(false)
    }
    
    // Limpiar timeout anterior
    if (geocodeTimeout) {
      clearTimeout(geocodeTimeout)
    }
    
    // Establecer nuevo timeout para geocodificar después de 2 segundos
    const newTimeout = setTimeout(() => {
      if (value && value.length > 3) {
        geocodeLocation(value)
      }
    }, 2000)
    
    setGeocodeTimeout(newTimeout)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsUpdating(true)

    try {
      // ✨ Validar que se haya proporcionado un número de contacto
      if (!formData.contact || formData.contact.trim() === "" || formData.contact.trim() === "+506") {
        setError("El número de WhatsApp es obligatorio")
        setIsUpdating(false)
        return
      }

      // ✨ Validar ubicación - permitir geocodificación manual o selección de mapa
      if (!formData.location || formData.location.trim() === "") {
        setError("📍 Por favor, ingresa la ubicación del animal")
        setIsUpdating(false)
        return
      }

      // Si no hay coordenadas pero hay ubicación, intentar geocodificar una última vez
      if ((!formData.lat || !formData.lng || formData.lat === 0 || formData.lng === 0) && formData.location) {
        console.log("🔄 Intentando geocodificar ubicación antes de actualizar...")
        const geocoded = await geocodeLocation(formData.location)
        
        // Verificar de nuevo después de intentar geocodificar
        if (!geocoded || !formData.lat || !formData.lng || formData.lat === 0 || formData.lng === 0) {
          setError("📍 No se pudo detectar la ubicación automáticamente. Por favor, selecciona la ubicación exacta en el mapa haciendo clic en él.")
          setIsUpdating(false)
          return
        }
      }

      console.log("🔄 Actualizando datos de mascota...")

      // Crear el objeto con los tipos correctos
      const petData = {
        ...formData,
        type: formData.type as "perro" | "gato" | "conejo" | "ave" | "hamster" | "cobayo" | "tortuga" | "pez" | "iguana" | "hurón" | "chinchilla" | "otros",
        status: formData.status as "adopcion" | "rescate" | "cuidados" | "temporal" | "adoptado",
      }

      await onUpdate(pet.id, petData)
      setSuccess("¡Animal actualizado exitosamente!")
      setTimeout(() => {
        setIsOpen(false)
        setSuccess("")
      }, 1500)
    } catch (error) {
      console.error("Error actualizando mascota:", error)
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(pet.id)
      setIsOpen(false)
    } catch (error) {
      console.error("Error deleting pet:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar {pet.name}</DialogTitle>
          <DialogDescription>Actualiza la información de tu mascota</DialogDescription>
        </DialogHeader>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del animal *</Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="Ej: Luna"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                disabled={isUpdating}
                maxLength={20}
              />
              <p className="text-xs text-gray-400">
                {formData.name.length}/20 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo de animal *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perro">🐕 Perro</SelectItem>
                  <SelectItem value="gato">🐱 Gato</SelectItem>
                  <SelectItem value="conejo">🐰 Conejo</SelectItem>
                  <SelectItem value="ave">🐦 Ave</SelectItem>
                  <SelectItem value="hamster">🐹 Hámster</SelectItem>
                  <SelectItem value="cobayo">🐹 Cobayo (Cuy)</SelectItem>
                  <SelectItem value="tortuga">🐢 Tortuga</SelectItem>
                  <SelectItem value="pez">🐠 Pez</SelectItem>
                  <SelectItem value="iguana">🦎 Iguana</SelectItem>
                  <SelectItem value="hurón">🦔 Hurón</SelectItem>
                  <SelectItem value="chinchilla">🐭 Chinchilla</SelectItem>
                  <SelectItem value="otros">🐾 Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-breed">Raza</Label>
              <Input
                id="edit-breed"
                type="text"
                placeholder="Ej: Golden Retriever"
                value={formData.breed}
                onChange={(e) => handleInputChange("breed", e.target.value)}
                disabled={isUpdating}
                maxLength={20}
              />
              <p className="text-xs text-gray-400">
                {formData.breed.length}/20 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-age">Edad (años)</Label>
              <Input
                id="edit-age"
                type="text"
                placeholder="Solo números"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                disabled={isUpdating}
              />
              <p className="text-xs text-gray-400">
                Solo números (1-30 años) - Se mostrará como "X años" en el perfil
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Ubicación del animal *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
              <Input
                id="edit-location"
                type="text"
                placeholder="Ej: Limon, Costa Rica (se detectará en el mapa)"
                value={formData.location}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                className="pl-10"
                required
                disabled={isUpdating}
                maxLength={50}
              />
              {locationSelected && (
                <div className="absolute right-3 top-3">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              )}
              {isGeocoding && (
                <div className="absolute right-3 top-3">
                  <div className="flex items-center text-orange-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {locationSelected 
                ? "✅ Ubicación detectada. Puedes cambiarla editando el texto o haciendo clic en el mapa."
                : "📍 Escribe la ubicación (ej: Limon, Costa Rica) y se detectará automáticamente, o haz clic en el mapa para seleccionar manualmente"
              }
            </p>
            <p className="text-xs text-gray-400">
              {formData.location.length}/50 caracteres
            </p>
          </div>

          {/* Mapa para seleccionar ubicación */}
          <div className="space-y-2">
            <LocationPickerMap
              onLocationSelect={handleLocationSelect}
              initialLocation={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : undefined}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Estado *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adopcion">En adopción</SelectItem>
                <SelectItem value="rescate">Necesita rescate</SelectItem>
                <SelectItem value="cuidados">Necesita cuidados médicos</SelectItem>
                <SelectItem value="temporal">Hogar temporal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción *</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe al animal, su personalidad, necesidades especiales, etc."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              required
              disabled={isUpdating}
              maxLength={150}
              className="resize-none"
            />
            <p className="text-xs text-gray-400">
              {formData.description.length}/150 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label>Foto del animal</Label>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              currentImage={formData.image}
              disabled={isUpdating}
            />
          </div>

          {/* PhoneInput con selector de país */}
          <PhoneInput
            value={formData.contact}
            onChange={(value) => handleInputChange("contact", value)}
            label="WhatsApp de contacto"
            required
            disabled={isUpdating}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-urgent"
              checked={formData.urgent}
              onCheckedChange={(checked) => handleInputChange("urgent", checked as boolean)}
              disabled={isUpdating}
            />
            <Label htmlFor="edit-urgent" className="flex items-center text-sm">
              <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
              Caso urgente
            </Label>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive" 
                  disabled={isUpdating || isDeleting}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar {pet.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente a {pet.name} de Safe Haven. 
                    No se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600" 
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </div>
              ) : (
                "Actualizar Animal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}