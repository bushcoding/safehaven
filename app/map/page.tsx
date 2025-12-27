"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { MapPin, Mail, AlertTriangle } from "lucide-react"
import { Footer } from "@/components/footer"
import { LeafletMap } from "@/components/leaflet-map"
import Head from "next/head"
import { useAuth } from "@/hooks/use-auth"
import { usePets } from "@/hooks/use-pets"
import type { Pet } from "@/types"

export default function MapPage() {
  const { isLoggedIn, logout } = useAuth()
  const { pets, isLoading, fetchPets } = usePets()
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  // ✨ Cargar todas las mascotas al montar el componente
  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  const handleContact = (contact: string, name: string) => {
    window.open(
      `mailto:${contact}?subject=Interés en ${name}&body=Hola, estoy interesado en ${name}. Me gustaría obtener más información.`,
    )
  }

  return (
    <>
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-pink-50">
        <Navigation isLoggedIn={isLoggedIn} onLogout={logout} className="relative z-50" />

        <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">🗺️ Mapa Safe Haven</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Encuentra animales cerca de ti. Cada huellita representa un animal que necesita ayuda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col relative z-10">
              <CardHeader className="pb-2 sm:pb-4 flex-shrink-0">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500" />
                  Mapa Interactivo
                </CardTitle>
                <CardDescription className="text-sm">
                  Haz clic en las huellitas para ver los detalles de cada animal
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-2 sm:p-4 overflow-hidden">
                <div className="h-full w-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando mapa...</p>
                      </div>
                    </div>
                  ) : (
                    <LeafletMap pets={pets} selectedPet={selectedPet} onPetSelect={setSelectedPet} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {selectedPet ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{selectedPet.name}</CardTitle>
                    {selectedPet.urgent && (
                      <Badge className="bg-red-500 hover:bg-red-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Urgente
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedPet.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img
                    src={selectedPet.image || "/placeholder.svg?height=200&width=300"}
                    alt={selectedPet.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Tipo:</span>
                      <span className="capitalize">{selectedPet.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Raza:</span>
                      <span>{selectedPet.breed || "No especificada"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Edad:</span>
                      <span>{selectedPet.age || "No especificada"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Estado:</span>
                      <Badge
                        className={
                          selectedPet.status === "adopcion"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }
                      >
                        <span className="capitalize">{selectedPet.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{selectedPet.description}</p>

                  <Button
                    onClick={() => handleContact(selectedPet.contact, selectedPet.name)}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contactar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Selecciona un animal</h3>
                  <p className="text-sm text-gray-500">Haz clic en una huellita del mapa para ver los detalles</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total animales:</span>
                  <Badge variant="outline">{pets.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Casos urgentes:</span>
                  <Badge className="bg-red-500 hover:bg-red-600">{pets.filter((p) => p.urgent).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">En adopción:</span>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    {pets.filter((p) => p.status === "adopcion").length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Necesitan rescate:</span>
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    {pets.filter((p) => p.status === "rescate").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      </div>
      <Footer />
    </>
  )
}