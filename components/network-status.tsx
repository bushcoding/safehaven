"use client"

import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'

export function NetworkStatus() {
  const { isOnline } = usePWA()
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineBanner(true)
    } else {
      // Ocultar banner después de un delay cuando vuelve la conexión
      const timer = setTimeout(() => {
        setShowOfflineBanner(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showOfflineBanner) {
    return null
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      !isOnline ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className={`px-4 py-2 text-center text-sm font-medium ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        <div className="flex items-center justify-center space-x-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Conexión restablecida</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Sin conexión - Modo offline activo</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
