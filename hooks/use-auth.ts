"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isLoggedIn: false,
  })

  // Función para verificar el estado de autenticación
  const checkAuthStatus = useCallback(() => {
    try {
      const savedUser = localStorage.getItem("user")
      const savedToken = localStorage.getItem("token")

      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser)

        setAuthState({
          user,
          isLoading: false,
          isLoggedIn: true,
        })
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isLoggedIn: false,
        })
      }
    } catch (error) {
      console.error("Error parsing saved user:", error)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      setAuthState({
        user: null,
        isLoading: false,
        isLoggedIn: false,
      })
    }
  }, [])

  useEffect(() => {
    // Verificar estado inicial
    checkAuthStatus()

    // Escuchar cambios en localStorage (para sincronizar entre pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") {
        checkAuthStatus()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [checkAuthStatus])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error en el login")
      }

      // Guardar en localStorage
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)

      // Actualizar estado
      setAuthState({
        user: data.user,
        isLoading: false,
        isLoggedIn: true,
      })

      return { success: true, user: data.user }
    } catch (error) {
      console.error("❌ Login error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  const register = async (userData: {
    name: string
    email: string
    phone?: string
    password: string
    acceptTerms: boolean
    acceptPrivacy: boolean
    acceptMarketing?: boolean
  }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error en el registro")
      }

      // Guardar en localStorage
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)

      // Actualizar estado
      setAuthState({
        user: data.user,
        isLoading: false,
        isLoggedIn: true,
      })

      return { success: true, user: data.user }
    } catch (error) {
      console.error("❌ Register error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("❌ Logout error:", error)
    } finally {
      // Limpiar localStorage
      localStorage.removeItem("user")
      localStorage.removeItem("token")

      // Actualizar estado
      setAuthState({
        user: null,
        isLoading: false,
        isLoggedIn: false,
      })
    }
  }

  return {
    ...authState,
    login,
    register,
    logout,
    checkAuthStatus, // Exponer para uso manual si es necesario
  }
}