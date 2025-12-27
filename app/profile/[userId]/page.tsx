"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  User,
  Calendar,
  PawPrint,
  Heart,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PetCard } from "@/components/pet-card"
import { useAuth } from "@/hooks/use-auth"
import type { Pet } from "@/types"

interface PublicProfile {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  totalPets: number
  adoptedPets: number
}

export default function PublicProfilePage() {
  const { isLoggedIn, logout } = useAuth()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  useEffect(() => {
    if (userId) {
      fetchPublicProfile()
    }
  }, [userId])

  const fetchPublicProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/profile/public/${userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error obteniendo perfil")
      }

      setProfile(data.user)
      setPets(data.pets)
      setError("")
    } catch (error) {
      console.error("Error fetching public profile:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactWhatsApp = (phone: string) => {
    const message = `Hola! Me interesa uno de los animales que tienes publicados en Safe Haven. ¿Podríamos conversar?`
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <Navigation isLoggedIn={isLoggedIn} onLogout={logout} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando perfil...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <Navigation isLoggedIn={isLoggedIn} onLogout={logout} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Perfil no encontrado</h2>
                <p className="text-gray-500 mb-6">
                  {error || "Este usuario no existe o su perfil no está disponible."}
                </p>
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const activePets = pets.filter(pet => pet.status !== "adoptado")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Navigation isLoggedIn={isLoggedIn} onLogout={logout} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Botón de volver */}
          <div className="mb-6">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          {/* Header del perfil */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription className="text-base">
                      Miembro de Safe Haven desde {new Date(profile.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Estadísticas */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-1">{profile.totalPets}</div>
                    <div className="text-sm text-gray-600">Animales Publicados</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500 mb-1">{activePets.length}</div>
                    <div className="text-sm text-gray-600">Disponibles</div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{profile.adoptedPets}</div>
                    <div className="text-sm text-green-700 font-medium">🎉 Adoptados</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Animales publicados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PawPrint className="w-5 h-5 mr-2" />
                Animales Disponibles ({activePets.length})
              </CardTitle>
              <CardDescription>
                Animales que {profile.name} tiene disponibles para adopción
              </CardDescription>
            </CardHeader>

            <CardContent>
              {activePets.length === 0 ? (
                <div className="text-center py-12">
                  <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No hay animales disponibles
                  </h3>
                  <p className="text-gray-500">
                    {profile.name} no tiene animales disponibles para adopción en este momento.
                  </p>
                </div>
              ) : (
                <>
                  {profile.adoptedPets > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-green-800">
                          <strong>{profile.name}</strong> ha ayudado a {profile.adoptedPets} animal{profile.adoptedPets > 1 ? 'es' : ''} a encontrar un hogar! 🎉
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activePets.map((pet) => (
                      <PetCard 
                        key={pet.id} 
                        pet={pet} 
                        showEditButtons={false}
                        allowDelete={false}
                      />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
