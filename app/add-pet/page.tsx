"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, MapPin, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ImageUpload } from "@/components/image-upload"
import { PhoneInput } from "@/components/phone-input"
import { LocationPickerMap } from "@/components/location-picker-map"
import { useAuth } from "@/hooks/use-auth"
import { usePets } from "@/hooks/use-pets"

export default function AddPetPage() {
  const { isLoggedIn, logout, user, isLoading: authLoading } = useAuth()
  const { createPet } = usePets()
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    location: "",
    description: "",
    status: "",
    urgent: false,
    contact: "+506", // Código de Costa Rica por defecto
    image: "",
    imagePublicId: "",
    lat: 0,
    lng: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [locationSelected, setLocationSelected] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeTimeout, setGeocodeTimeout] = useState<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Esperar a que termine la verificación de auth antes de redirigir
    if (!authLoading && !isLoggedIn) {
      console.log("❌ Usuario no autenticado, redirigiendo a login")
      router.push("/login")
      return
    }

    // Establecer el teléfono del usuario como contacto por defecto
    if (!authLoading && isLoggedIn && user?.phone) {
      console.log("✅ Usuario autenticado, configurando contacto")
      // Solo establecer si el teléfono del usuario está en formato válido
      const userPhone = user.phone
      if (userPhone && userPhone.startsWith('+') && userPhone.length > 3) {
        setFormData((prev) => ({ ...prev, contact: userPhone }))
      }
    }
  }, [authLoading, isLoggedIn, user, router])

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <Navigation isLoggedIn={false} onLogout={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando autenticación...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No mostrar nada si no está autenticado (se redirigirá)
  if (!isLoggedIn) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // ✨ Validar que se haya proporcionado un número de contacto
      if (!formData.contact || formData.contact.trim() === "" || formData.contact.trim() === "+506") {
        setError("El número de WhatsApp es obligatorio para publicar un animal")
        setIsLoading(false)
        return
      }

      // ✨ Validar ubicación - permitir geocodificación manual o selección de mapa
      if (!formData.location || formData.location.trim() === "") {
        setError("📍 Por favor, ingresa la ubicación del animal")
        setIsLoading(false)
        return
      }

      // Si no hay coordenadas pero hay ubicación, intentar geocodificar una última vez
      if ((!formData.lat || !formData.lng || formData.lat === 0 || formData.lng === 0) && formData.location) {
        console.log("🔄 Intentando geocodificar ubicación antes de enviar...")
        const geocoded = await geocodeLocation(formData.location)
        
        // Verificar de nuevo después de intentar geocodificar
        if (!geocoded || !formData.lat || !formData.lng || formData.lat === 0 || formData.lng === 0) {
          setError("📍 No se pudo detectar la ubicación automáticamente. Por favor, selecciona la ubicación exacta en el mapa haciendo clic en él.")
          setIsLoading(false)
          return
        }
      }

      console.log("🔄 Enviando datos de mascota...")

      // Crear el objeto con los tipos correctos
      const petData = {
        ...formData,
        type: formData.type as "perro" | "gato" | "conejo" | "ave" | "hamster" | "cobayo" | "tortuga" | "pez" | "iguana" | "hurón" | "chinchilla" | "otros",
        status: formData.status as "adopcion" | "rescate" | "cuidados" | "temporal" | "adoptado",
      }

      const result = await createPet(petData)

      if (result.success) {
        setSuccess("¡Animal publicado exitosamente! Redirigiendo...")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setError(result.error || "Error publicando el animal")
      }
    } catch (error) {
      console.error("Error creando mascota:", error)
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Navigation isLoggedIn={isLoggedIn} onLogout={logout} />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="flex justify-center mb-4">
                <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Publicar en Safe Haven</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Ayuda a un animal a encontrar su hogar ideal
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
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

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del animal *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ej: Luna"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      disabled={isLoading}
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-400">
                      {formData.name.length}/20 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de animal *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange("type", value)}
                      disabled={isLoading}
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
                    <Label htmlFor="breed">Raza</Label>
                    <Input
                      id="breed"
                      type="text"
                      placeholder="Ej: Golden Retriever"
                      value={formData.breed}
                      onChange={(e) => handleInputChange("breed", e.target.value)}
                      disabled={isLoading}
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-400">
                      {formData.breed.length}/20 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Edad (años)</Label>
                    <Input
                      id="age"
                      type="text"
                      placeholder="Solo números"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-400">
                      Solo números (1-30 años) - Se mostrará como "X años" en el perfil
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación del animal *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="Ej: Limon, Costa Rica (se detectará en el mapa)"
                      value={formData.location}
                      onChange={(e) => handleLocationInputChange(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
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

                {/* ✨ NUEVO: Mapa para seleccionar ubicación */}
                <div className="space-y-2">
                  <LocationPickerMap
                    onLocationSelect={handleLocationSelect}
                    initialLocation={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : undefined}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                    disabled={isLoading}
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
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe al animal, su personalidad, necesidades especiales, etc."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    required
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                {/* ✨ NUEVO: PhoneInput con selector de país */}
                <PhoneInput
                  value={formData.contact}
                  onChange={(value) => handleInputChange("contact", value)}
                  label="WhatsApp de contacto"
                  required
                  disabled={isLoading}
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={formData.urgent}
                    onCheckedChange={(checked) => handleInputChange("urgent", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="urgent" className="flex items-center text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                    Caso urgente
                  </Label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publicando...
                      </div>
                    ) : (
                      "Publicar Animal"
                    )}
                  </Button>
                  <Link href="/" className="w-full sm:w-auto">
                    <Button type="button" variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}