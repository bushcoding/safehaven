"use client"

import { useState, useEffect } from "react"
import type { Stats } from "@/types"

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/stats")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error obteniendo estadísticas")
      }

      setStats(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  }
}
