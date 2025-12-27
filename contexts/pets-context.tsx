"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"
import type { Pet } from "@/types"

interface PetsState {
  pets: Pet[]
  isLoading: boolean
  error: string | null
  lastUpdated: number
}

type PetsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PETS"; payload: Pet[] }
  | { type: "ADD_PET"; payload: Pet }
  | { type: "UPDATE_PET"; payload: { id: string; data: Partial<Pet> } }
  | { type: "DELETE_PET"; payload: string }
  | { type: "CLEAR_PETS" }

const initialState: PetsState = {
  pets: [],
  isLoading: false,
  error: null,
  lastUpdated: 0,
}

function petsReducer(state: PetsState, action: PetsAction): PetsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }

    case "SET_PETS":
      return {
        ...state,
        pets: action.payload,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      }

    case "ADD_PET":
      return {
        ...state,
        pets: [action.payload, ...state.pets],
        lastUpdated: Date.now(),
      }

    case "UPDATE_PET":
      return {
        ...state,
        pets: state.pets.map((pet) => (pet.id === action.payload.id ? { ...pet, ...action.payload.data } : pet)),
        lastUpdated: Date.now(),
      }

    case "DELETE_PET":
      return {
        ...state,
        pets: state.pets.filter((pet) => pet.id !== action.payload),
        lastUpdated: Date.now(),
      }

    case "CLEAR_PETS":
      return { ...initialState }

    default:
      return state
  }
}

interface PetsContextType extends PetsState {
  fetchPets: (query?: string, type?: string) => Promise<void>
  addPet: (pet: Pet) => void
  updatePet: (id: string, data: Partial<Pet>) => void
  deletePet: (id: string) => void
  clearPets: () => void
}

const PetsContext = createContext<PetsContextType | undefined>(undefined)

export function PetsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(petsReducer, initialState)

  const fetchPets = useCallback(async (query?: string, type?: string, limit?: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })

      const params = new URLSearchParams()
      if (query) params.append("q", query)
      if (type && type !== "all") params.append("type", type)
      params.append("limit", (limit || 12).toString()) // ✨ Limite más bajo por defecto

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // ✨ Timeout más agresivo

      // ✨ Usar endpoint optimizado para carga inicial
      const endpoint = (!query && type === "all") ? "/api/pets/optimized" : "/api/pets"
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error obteniendo mascotas")
      }

      const data = await response.json()
      dispatch({ type: "SET_PETS", payload: data.pets })

    } catch (error: any) {
      console.error("❌ Error fetching pets:", error)
      if (error.name === "AbortError") {
        dispatch({ type: "SET_ERROR", payload: "Tiempo de espera agotado" })
      } else {
        dispatch({ type: "SET_ERROR", payload: error.message })
      }
    }
  }, [])

  const addPet = useCallback((pet: Pet) => {
    dispatch({ type: "ADD_PET", payload: pet })
  }, [])

  const updatePet = useCallback((id: string, data: Partial<Pet>) => {
    dispatch({ type: "UPDATE_PET", payload: { id, data } })
  }, [])

  const deletePet = useCallback((id: string) => {
    dispatch({ type: "DELETE_PET", payload: id })
  }, [])

  const clearPets = useCallback(() => {
    dispatch({ type: "CLEAR_PETS" })
  }, [])

  const contextValue: PetsContextType = {
    ...state,
    fetchPets,
    addPet,
    updatePet,
    deletePet,
    clearPets,
  }

  return <PetsContext.Provider value={contextValue}>{children}</PetsContext.Provider>
}

export function usePetsContext() {
  const context = useContext(PetsContext)
  if (context === undefined) {
    throw new Error("usePetsContext must be used within a PetsProvider")
  }
  return context
}