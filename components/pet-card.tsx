"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, AlertTriangle, User, Edit, Trash2, CheckCircle, Undo2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { EditPetDialog } from "@/components/edit-pet-dialog"
import { useAuth } from "@/hooks/use-auth"
import { usePets } from "@/hooks/use-pets"
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
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { Pet } from "@/types"

interface PetCardProps {
  pet: Pet
  showEditButtons?: boolean
  allowDelete?: boolean // Nueva prop para permitir eliminación desde cualquier lugar
}

export function PetCard({ pet, showEditButtons = false, allowDelete = false }: PetCardProps) {
  const { user } = useAuth()
  const { updatePet, deletePet } = usePets()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMarkingAdopted, setIsMarkingAdopted] = useState(false)

  const formatWhatsAppNumber = (phone: string) => {
    // Remover caracteres no numéricos excepto +
    const cleaned = phone.replace(/[^\d+]/g, "")
    return cleaned
  }

  const handleWhatsAppContact = () => {
    const phone = formatWhatsAppNumber(pet.contact)
    const message = encodeURIComponent(
      `Hola! Estoy interesado en ${pet.name}. Vi su publicación en Safe Haven y me gustaría obtener más información.`,
    )
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
  }

  const handleUpdatePet = async (petId: string, updatedData: Partial<Pet>) => {
    try {
      const result = await updatePet(petId, updatedData)
      if (!result.success) {
        throw new Error(result.error)
      }

      // ✨ Feedback visual inmediato
      toast({
        title: "✅ Actualizado",
        description: `${pet.name} ha sido actualizado exitosamente`,
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error actualizando mascota",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    }
  }

  const handleMarkAsAdopted = async () => {
    setIsMarkingAdopted(true)
    try {
      const result = await updatePet(pet.id, { status: "adoptado" })
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "🎉 ¡Felicidades!",
        description: `${pet.name} ha sido marcado como adoptado. ¡Gracias por darle un hogar!`,
        duration: 5000,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error marcando como adoptado",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsMarkingAdopted(false)
    }
  }

  const handleRevertAdoption = async () => {
    setIsMarkingAdopted(true)
    try {
      const result = await updatePet(pet.id, { status: "adopcion" })
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "✅ Adopción revertida",
        description: `${pet.name} vuelve a estar disponible para adopción.`,
        duration: 5000,
      })
    } catch (error) {
      toast({
        title: "❌ Error", 
        description: error instanceof Error ? error.message : "Error revirtiendo adopción",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsMarkingAdopted(false)
    }
  }

  const handleDeletePet = async () => {
    setIsDeleting(true)
    try {
      const result = await deletePet(pet.id)
      if (!result.success) {
        throw new Error(result.error)
      }

      // ✨ Feedback visual inmediato
      toast({
        title: "✅ Eliminado",
        description: `${pet.name} ha sido eliminado exitosamente`,
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error eliminando mascota",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Verificar si el usuario actual es el propietario
  const isOwner = user && pet.userId === user.id

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="relative">
        <Image
          src={pet.image || "/placeholder.svg"}
          alt={pet.name}
          width={400}
          height={300}
          className="w-full h-40 sm:h-48 object-cover"
        />
        {pet.urgent && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Urgente
          </Badge>
        )}
        <Badge
          className={`absolute top-2 right-2 text-xs ${
            pet.status === "adopcion" ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          <span className="capitalize">{pet.status}</span>
        </Badge>
      </div>

      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate pr-2">{pet.name}</CardTitle>
            <CardDescription className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{pet.location}</span>
            </CardDescription>
            
            {/* Publicado por */}
            {pet.userName && pet.userId && (
              <div className="mt-2">
                <button 
                  type="button"
                  className="inline-flex items-center text-xs text-gray-500 hover:text-orange-600 transition-colors cursor-pointer bg-transparent border-none p-0"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Clic en publicado por:', pet.userName, 'userId:', pet.userId)
                    window.location.href = `/profile/${pet.userId}`
                  }}
                >
                  <User className="w-3 h-3 mr-1" />
                  Publicado por {pet.userName}
                </button>
              </div>
            )}
          </div>
          {/* Ocultar botón de corazón si está adoptado */}
          {pet.status !== "adoptado" && (
            <Button variant="ghost" size="sm" className="text-pink-500 hover:text-pink-600 flex-shrink-0 ml-2">
              <Heart className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* Información básica en formato compacto */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600 min-w-[40px]">Tipo:</span>
              <span className="capitalize text-gray-800 font-medium">{pet.type}</span>
            </div>
            
            {pet.age && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-600 min-w-[40px]">Edad:</span>
                <span className="text-gray-800">{pet.age}</span>
              </div>
            )}
            
            {pet.breed && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-600 min-w-[40px]">Raza:</span>
                <span className="text-gray-800 truncate">{pet.breed}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed flex-1 border-t pt-2">{pet.description}</p>
        </div>

        {/* Botones de acción */}
        <div className="mt-4 space-y-2 flex-shrink-0">
          {/* Botón de WhatsApp - ocultar si está adoptado */}
          {pet.status !== "adoptado" && (
            <Button onClick={handleWhatsAppContact} className="w-full bg-green-500 hover:bg-green-600 text-sm h-9">
              <span className="mr-2">📱</span>
              Contactar por WhatsApp
            </Button>
          )}

          {/* Botones de gestión: para propietarios o si allowDelete está activado */}
          {(showEditButtons || isOwner || allowDelete) && (
            <div className="space-y-2">
              {/* Botón de editar información del animal */}
              <EditPetDialog
                pet={pet}
                onUpdate={handleUpdatePet}
                onDelete={handleDeletePet}
                isLoading={isDeleting}
                trigger={
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm h-9">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar información
                  </Button>
                }
              />

              {/* Botón para marcar como adoptado - solo si no está adoptado */}
              {pet.status !== "adoptado" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm h-9" 
                      disabled={isMarkingAdopted}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isMarkingAdopted ? "Marcando..." : "Marcar como adoptado"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>🎉 ¡Marcar como adoptado!</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Confirmas que <strong>{pet.name}</strong> ya encontró su hogar? 
                        Esta acción marcará la mascota como adoptada y dejará de aparecer en las búsquedas públicas.
                        <br/><br/>
                        ¡Felicidades por ayudar a que {pet.name} encuentre una familia! 🐾❤️
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isMarkingAdopted}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleMarkAsAdopted}
                        disabled={isMarkingAdopted}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isMarkingAdopted ? "Marcando..." : "Sí, ¡ya fue adoptado!"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Botón para revertir adopción - solo si está adoptado */}
              {pet.status === "adoptado" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 text-sm h-9" 
                      disabled={isMarkingAdopted}
                    >
                      <Undo2 className="w-4 h-4 mr-2" />
                      {isMarkingAdopted ? "Procesando..." : "Revertir adopción"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Revertir adopción de {pet.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esto cambiará el estado de <strong>{pet.name}</strong> de "adoptado" a "disponible para adopción".
                        <br/><br/>
                        La mascota volverá a aparecer en las búsquedas públicas y estará disponible para contacto.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isMarkingAdopted}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRevertAdoption}
                        disabled={isMarkingAdopted}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {isMarkingAdopted ? "Procesando..." : "Sí, revertir adopción"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
