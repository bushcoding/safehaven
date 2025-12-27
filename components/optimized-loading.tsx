"use client"

import { Card, CardContent } from "@/components/ui/card"

export function OptimizedPetSkeleton() {
  return (
    <Card className="animate-pulse border-0 shadow-sm">
      {/* Imagen placeholder */}
      <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg" />
      
      <CardContent className="p-4">
        {/* Header con título y ubicación */}
        <div className="space-y-2 mb-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        
        {/* Información de la mascota */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          
          {/* Descripción */}
          <div className="border-t pt-2 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-4/5" />
            <div className="h-3 bg-gray-200 rounded w-3/5" />
          </div>
          
          {/* Botón */}
          <div className="h-8 bg-gray-200 rounded w-full mt-4" />
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <OptimizedPetSkeleton key={i} />
      ))}
    </div>
  )
}
