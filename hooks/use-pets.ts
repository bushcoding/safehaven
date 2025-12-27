"use client"

import { usePetsContext } from "@/contexts/pets-context"
import type { Pet } from "@/types"

export function usePets() {
  const context = usePetsContext()

  const createPet = async (petData: Omit<Pet, "id" | "createdAt" | "updatedAt" | "userId">) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No estás autenticado")
      }

      console.log("🔄 Creando mascota...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(petData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error creando mascota")
      }

      // ✨ TIEMPO REAL: Añadir inmediatamente al contexto
      context.addPet(data.pet)

      console.log("✅ Mascota creada y añadida al contexto")
      return { success: true, pet: data.pet }
    } catch (error: any) {
      console.error("❌ Create pet error:", error)
      if (error.name === "AbortError") {
        return { success: false, error: "Tiempo de espera agotado. Inténtalo de nuevo." }
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  const updatePet = async (id: string, petData: Partial<Pet>) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No estás autenticado")
      }

      console.log("🔄 Actualizando mascota:", id)

      // ✨ TIEMPO REAL: Actualizar inmediatamente en el contexto (optimistic update)
      context.updatePet(id, petData)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(`/api/pets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(petData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        // Si falla, revertir el cambio optimista
        console.error("❌ Error actualizando, revirtiendo cambios")
        await context.fetchPets() // Recargar desde servidor
        throw new Error(data.error || "Error actualizando mascota")
      }

      // ✨ TIEMPO REAL: Confirmar actualización con datos del servidor
      context.updatePet(id, data.pet)

      console.log("✅ Mascota actualizada exitosamente")
      return { success: true, pet: data.pet }
    } catch (error: any) {
      console.error("❌ Update pet error:", error)
      if (error.name === "AbortError") {
        return { success: false, error: "Tiempo de espera agotado. Inténtalo de nuevo." }
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  const deletePet = async (id: string) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No estás autenticado")
      }

      console.log("🔄 Eliminando mascota:", id)

      // ✨ TIEMPO REAL: Eliminar inmediatamente del contexto (optimistic update)
      const petToDelete = context.pets.find((p) => p.id === id)
      context.deletePet(id)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`/api/pets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        // Si falla, restaurar la mascota
        if (petToDelete) {
          console.error("❌ Error eliminando, restaurando mascota")
          context.addPet(petToDelete)
        }
        throw new Error(data.error || "Error eliminando mascota")
      }

      console.log("✅ Mascota eliminada exitosamente")
      return { success: true }
    } catch (error: any) {
      console.error("❌ Delete pet error:", error)
      if (error.name === "AbortError") {
        return { success: false, error: "Tiempo de espera agotado. Inténtalo de nuevo." }
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  return {
    pets: context.pets,
    isLoading: context.isLoading,
    error: context.error,
    fetchPets: context.fetchPets,
    createPet,
    updatePet,
    deletePet,
    refetch: context.fetchPets,
  }
}
