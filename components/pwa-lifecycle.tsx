"use client"

import { useEffect } from 'react'
import { usePWA } from '@/hooks/use-pwa'

export function PWALifecycle() {
  const { registerServiceWorker, requestNotificationPermission } = usePWA()

  useEffect(() => {
    // Registrar Service Worker al cargar la app
    const initPWA = async () => {
      await registerServiceWorker()
      
      // Solicitar permisos de notificación después de un tiempo
      setTimeout(async () => {
        await requestNotificationPermission()
      }, 10000) // 10 segundos después de cargar
    }

    initPWA()
  }, [registerServiceWorker, requestNotificationPermission])

  // Este componente no renderiza nada, solo maneja el ciclo de vida
  return null
}
