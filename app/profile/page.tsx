"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  User,
  Mail,
  Calendar,
  Edit,
  Trash2,
  Heart,
  AlertTriangle,
  CheckCircle,
  PawPrint,
  Lock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PetCard } from "@/components/pet-card"
import { useAuth } from "@/hooks/use-auth"
import type { Pet } from "@/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

interface ProfileStats {
  totalPets: number
  urgentPets: number
  adoptionPets: number
  rescuePets: number
  adoptedPets: number
}

export default function ProfilePage() {
  const { isLoggedIn, logout, user, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const router = useRouter()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("profile")

  // ✨ Separar mascotas activas de adoptadas
  const activePets = pets.filter(pet => pet.status !== "adoptado")
  const adoptedPets = pets.filter(pet => pet.status === "adoptado")

  // Esperar a que termine la verificación de auth antes de redirigir
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      console.log("❌ Usuario no autenticado, redirigiendo a login")
      router.push("/login")
      return
    }

    if (!authLoading && isLoggedIn) {
      
      fetchProfile()
    }
  }, [authLoading, isLoggedIn, router])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      console.log("🔄 Obteniendo perfil...")

      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error obteniendo perfil")
      }

      console.log("✅ Perfil obtenido:", data.user.email)

      setProfile(data.user)
      setPets(data.pets)
      setStats(data.stats)
      setEditData({
        name: data.user.name,
        email: data.user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setError("")
    } catch (error) {
      console.error("❌ Error fetching profile:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true)
      setError("")
      setSuccess("")

      // Validar contraseñas si se está cambiando
      if (editData.newPassword) {
        if (!editData.currentPassword) {
          setError("Contraseña actual requerida para cambiar contraseña")
          return
        }
        if (editData.newPassword !== editData.confirmPassword) {
          setError("Las nuevas contraseñas no coinciden")
          return
        }
        if (editData.newPassword.length < 6) {
          setError("La nueva contraseña debe tener al menos 6 caracteres")
          return
        }
      }

      const token = localStorage.getItem("token")

      const updatePayload: any = {
        name: editData.name,
        email: editData.email,
      }

      if (editData.newPassword) {
        updatePayload.currentPassword = editData.currentPassword
        updatePayload.newPassword = editData.newPassword
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error actualizando perfil")
      }

      // Si hay nuevo token, actualizar localStorage
      if (data.newToken) {
        localStorage.setItem("token", data.newToken)
        localStorage.setItem("user", JSON.stringify(data.user))
      }

      setProfile(data.user)
      setIsEditing(false)
      setEditData({
        ...editData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setSuccess("Perfil actualizado exitosamente")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      const token = localStorage.getItem("token")

      const response = await fetch("/api/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error eliminando cuenta")
      }

      // Limpiar localStorage y redirigir
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setIsDeleting(false)
    }
  }

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-pink-50">
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

  // Mostrar loading del perfil
  if (isLoading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-pink-50">
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

  return (
    <>
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-pink-50">
        <Navigation isLoggedIn={isLoggedIn} onLogout={logout} />

        <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información y tus publicaciones</p>
          </div>

          {/* Mensajes */}
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {isMobile ? (
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una sección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Información Personal</SelectItem>
                  <SelectItem value="pets">Mis Animales ({activePets.length})</SelectItem>
                  <SelectItem value="adopted">Adoptados ({adoptedPets.length})</SelectItem>
                  <SelectItem value="stats">Estadísticas</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Información Personal</TabsTrigger>
                <TabsTrigger value="pets">Mis Animales ({activePets.length})</TabsTrigger>
                <TabsTrigger value="adopted">Adoptados ({adoptedPets.length})</TabsTrigger>
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
              </TabsList>
            )}

            {/* Información Personal */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Información Personal
                      </CardTitle>
                      <CardDescription>Gestiona tu información de perfil</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={isUpdating}>
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? "Cancelar" : "Editar"}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          disabled={isUpdating}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          disabled={isUpdating}
                        />
                      </div>

                      {/* Cambiar contraseña */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 flex items-center">
                          <Lock className="w-4 h-4 mr-2" />
                          Cambiar Contraseña (Opcional)
                        </h4>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Contraseña actual</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={editData.currentPassword}
                              onChange={(e) => setEditData({ ...editData, currentPassword: e.target.value })}
                              disabled={isUpdating}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva contraseña</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={editData.newPassword}
                              onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
                              disabled={isUpdating}
                              minLength={6}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={editData.confirmPassword}
                              onChange={(e) => setEditData({ ...editData, confirmPassword: e.target.value })}
                              disabled={isUpdating}
                              minLength={6}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={isUpdating}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          {isUpdating ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{profile?.name}</p>
                          <p className="text-sm text-gray-500">Nombre completo</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{profile?.email}</p>
                          <p className="text-sm text-gray-500">Correo electrónico</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">Miembro desde</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zona de peligro */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Zona de Peligro</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Eliminar tu cuenta es permanente. Se eliminarán todos tus datos y publicaciones.
                    </p>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isDeleting ? "Eliminando..." : "Eliminar Cuenta"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todas tus
                            publicaciones de animales ({pets.length} animales).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                            Sí, eliminar cuenta
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mis Animales */}
            <TabsContent value="pets">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PawPrint className="w-5 h-5 mr-2" />
                    Mis Animales Activos ({activePets.length})
                  </CardTitle>
                  <CardDescription>
                    Animales que has publicado y están disponibles. Puedes editar su información o marcarlos como adoptados.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {activePets.length === 0 ? (
                    <div className="text-center py-12">
                      <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No tienes animales activos</h3>
                      <p className="text-gray-500 mb-4">¡Ayuda a un animal a encontrar hogar!</p>
                      <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => router.push("/add-pet")}>
                        Publicar Animal
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Información sobre opciones de edición */}
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Edit className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">Opciones de gestión</h4>
                            <div className="text-sm text-blue-700 space-y-1">
                              <p>• <strong>Editar:</strong> Actualiza información, fotos y datos de contacto</p>
                              <p>• <strong>Marcar como adoptado:</strong> Cuando el animal encuentre hogar</p>
                              <p>• <strong>Eliminar:</strong> Quita la publicación permanentemente</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activePets.map((pet) => (
                          <PetCard key={pet.id} pet={pet} showEditButtons={true} allowDelete={true} />
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Animales Adoptados */}
            <TabsContent value="adopted">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Animales Adoptados ({adoptedPets.length})
                  </CardTitle>
                  <CardDescription>
                    🎉 ¡Felicidades! Estos animales encontraron su hogar gracias a ti
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {adoptedPets.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Aún no tienes adopciones registradas
                      </h3>
                      <p className="text-gray-500">
                        Cuando uno de tus animales sea adoptado, aparecerá aquí.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">
                            ¡Has ayudado a {adoptedPets.length} animal{adoptedPets.length > 1 ? 'es' : ''} a encontrar un hogar! 🎉
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {adoptedPets.map((pet) => (
                          <PetCard key={pet.id} pet={pet} showEditButtons={true} allowDelete={true} />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Estadísticas */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-2">{stats?.totalPets || 0}</div>
                    <div className="text-sm text-gray-600">Total Publicados</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">{stats?.adoptionPets || 0}</div>
                    <div className="text-sm text-gray-600">En Adopción</div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{adoptedPets.length}</div>
                    <div className="text-sm text-green-700 font-medium">🎉 Adoptados</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-2">{stats?.rescuePets || 0}</div>
                    <div className="text-sm text-gray-600">Necesitan Rescate</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-red-500 mb-2">{stats?.urgentPets || 0}</div>
                    <div className="text-sm text-gray-600">Casos Urgentes</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Tu Impacto en Safe Haven</CardTitle>
                  <CardDescription>Gracias por ayudar a los animales que más lo necesitan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 text-orange-500 mr-3" />
                        <span>Animales ayudados</span>
                      </div>
                      <Badge className="bg-orange-500">{stats?.totalPets || 0}</Badge>
                    </div>

                    {adoptedPets.length > 0 && (
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                          <span>Adopciones logradas</span>
                        </div>
                        <Badge className="bg-green-600">{adoptedPets.length}</Badge>
                      </div>
                    )}

                    {(stats?.urgentPets || 0) > 0 && (
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                          <span>Casos urgentes atendidos</span>
                        </div>
                        <Badge className="bg-red-500">{stats?.urgentPets}</Badge>
                      </div>
                    )}

                    <div className="text-center pt-4">
                      <p className="text-gray-600">
                        ¡Gracias por ser parte de la comunidad Safe Haven! 🐾
                        {adoptedPets.length > 0 && (
                          <span className="block mt-2 text-green-600 font-medium">
                            Has cambiado la vida de {adoptedPets.length} animal{adoptedPets.length > 1 ? 'es' : ''}! 🎉
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      </div>
      <Footer />
    </>
  )
}
