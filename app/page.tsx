"use client"

import { useState, useEffect, useCallback, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Map, X } from "lucide-react"
import Link from "next/link"
import Head from "next/head"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { LoadingGrid } from "@/components/optimized-loading"
import { useAuth } from "@/hooks/use-auth"
import { usePets } from "@/hooks/use-pets"
import { useStats } from "@/hooks/use-stats"

// ✨ Lazy loading de componentes pesados
const PetCard = lazy(() => import("@/components/pet-card").then((module) => ({ default: module.PetCard })))

// ✨ Componente de loading para PetCard
function PetCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="h-40 sm:h-48 bg-gray-200 rounded-t-lg"></div>
      <CardHeader className="pb-3">
        <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const { isLoggedIn, logout } = useAuth()
  const { pets, isLoading, fetchPets } = usePets()
  const { stats } = useStats()

  // ✨ Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm("")
    setFilterType("all")
    fetchPets() // Recargar todas las mascotas
  }

  // ✨ Usar directamente los resultados del backend (ya filtrados)
  // El filtrado local puede interferir con los resultados del backend
  const filteredPets = pets

  // ✨ Debounced search optimizado
  const debouncedFetch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string, type: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          fetchPets(query, type)
        }, 300) // Reducido de 500ms a 300ms
      }
    })(),
    [fetchPets],
  )

  // Solo buscar cuando cambie el término de búsqueda o filtro
  useEffect(() => {
    if (searchTerm || filterType !== "all") {
      debouncedFetch(searchTerm, filterType)
    } else {
      // Si no hay búsqueda ni filtro, cargar todas las mascotas
      fetchPets()
    }
  }, [searchTerm, filterType, debouncedFetch])

  // ✨ Cargar datos iniciales con límite menor para carga más rápida
  useEffect(() => {
    // Cargar solo 12 mascotas inicialmente para carga más rápida
    fetchPets()
  }, []) // Sin dependencias para que solo se ejecute una vez

  return (
    <>
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-pink-50">
        <Navigation isLoggedIn={isLoggedIn} onLogout={logout} />

        <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-800 mb-4">🐾 Safe Haven</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tu refugio seguro para adoptar, rescatar y amar. Conectamos animales que necesitan hogar con familias que
            buscan amor incondicional.
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, raza o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {(searchTerm || filterType !== "all") && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
            >
              <option value="all">Todos los animales</option>
              <option value="perro">🐕 Perros</option>
              <option value="gato">🐱 Gatos</option>
              <option value="conejo">🐰 Conejos</option>
              <option value="ave">🐦 Aves</option>
              <option value="hamster">🐹 Hámsters</option>
              <option value="cobayo">🐹 Cobayos</option>
              <option value="tortuga">🐢 Tortugas</option>
              <option value="pez">🐠 Peces</option>
              <option value="iguana">🦎 Iguanas</option>
              <option value="hurón">🦔 Hurones</option>
              <option value="chinchilla">🐭 Chinchillas</option>
              <option value="otros">🐾 Otros</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-8">
            {isLoggedIn && (
              <Link href="/add-pet" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar Animal
                </Button>
              </Link>
            )}
            <Link href="/map" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-orange-500 text-orange-500 hover:bg-orange-50 bg-transparent"
              >
                <Map className="w-4 h-4 mr-2" />
                Ver Mapa
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-orange-500">{stats?.totalPets || pets.length}</CardTitle>
              <CardDescription>Animales esperando hogar</CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-pink-500">
                {stats?.urgentPets || pets.filter((p) => p.urgent).length}
              </CardTitle>
              <CardDescription>Casos urgentes</CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
                            <CardTitle className="text-3xl font-bold text-green-500">
                {stats?.successfulAdoptions || 0}
              </CardTitle>
              <CardDescription>Adopciones exitosas</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pet Feed */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Animales disponibles ({filteredPets.length})
            {isLoading && <span className="text-sm text-gray-500 ml-2">Cargando...</span>}
          </h2>

          {isLoading && pets.length === 0 ? (
            <LoadingGrid count={6} />
          ) : filteredPets.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-500 text-lg">No se encontraron animales con esos criterios de búsqueda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPets.map((pet) => (
                <Suspense key={pet.id} fallback={<PetCardSkeleton />}>
                  <PetCard pet={pet} />
                </Suspense>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {!isLoggedIn && (
          <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-center">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">¿Quieres ayudar a más animales?</h3>
              <p className="text-lg mb-6 opacity-90">
                Únete a nuestra comunidad y publica animales que necesitan hogar
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Crear cuenta
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-orange-500 bg-transparent"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      </div>
      <Footer />
    </>
  )
}
