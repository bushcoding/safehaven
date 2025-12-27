"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, installPWA } = usePWA()
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar móvil
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(isMobileDevice)
    }

    if (typeof window !== 'undefined') {
      checkMobile()
    }
  }, [])

  useEffect(() => {
    // No mostrar si ya está instalado
    if (isInstalled) {
      return
    }
    
    // Verificar si ya fue descartado
    const dismissed = localStorage.getItem('pwa-banner-dismissed') === 'true'
    setIsDismissed(dismissed)
    
    // Mostrar banner si es instalable O si es móvil (con diferentes criterios)
    if ((isInstallable || isMobile) && !dismissed) {
      // Mostrar después de 4 segundos
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 4000)
      
      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled, isMobile])

  const handleInstall = async () => {
    if (isInstallable) {
      // Usar método PWA estándar
      const success = await installPWA()
      if (success) {
        setShowBanner(false)
      }
    } else if (isMobile) {
      // Instrucciones para móvil
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        alert('Para instalar en iPhone/iPad:\n\n1. Toca el ícono de compartir (⬆️)\n2. Selecciona "Añadir a la pantalla de inicio"\n3. Confirma con "Añadir"')
      } else {
        alert('Para instalar en Android:\n\n1. Abre el menú del navegador (⋮)\n2. Busca "Instalar app" o "Añadir a pantalla de inicio"\n3. Confirma la instalación')
      }
      setShowBanner(false)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', 'true')
  }

  if (!showBanner || isInstalled || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white border border-orange-200 rounded-lg shadow-lg p-4 animate-slide-up">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              {isMobile ? (
                <Smartphone className="w-5 h-5 text-orange-600" />
              ) : (
                <Monitor className="w-5 h-5 text-orange-600" />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              ¡Instala Safe Haven!
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isMobile 
                ? "Úsala como app nativa en tu teléfono" 
                : "Accede más rápido y úsala sin conexión"
              }
            </p>
            
            <div className="flex space-x-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstall}
                className="bg-orange-500 hover:bg-orange-600 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                {isMobile ? "Ver cómo instalar" : "Instalar"}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs"
              >
                Ahora no
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function PWAInstallButton() {
  const { isInstallable, isInstalled, installPWA } = usePWA()
  const [isMobile, setIsMobile] = useState(false)
  const [canShowInstall, setCanShowInstall] = useState(false)

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(isMobileDevice)
      
      // En móvil, mostrar si no está instalado y no es iOS
      if (isMobileDevice) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
        
        if (!isIOS && !isStandalone) {
          setCanShowInstall(true)
        } else if (isIOS && !isStandalone) {
          // Para iOS, mostrar instrucciones manuales
          setCanShowInstall(true)
        }
      }
    }

    if (typeof window !== 'undefined') {
      checkMobile()
    }
  }, [])

  // No mostrar si ya está instalado
  if (isInstalled) {
    return null
  }

  // Mostrar si es instalable O si es móvil y puede mostrar install
  if (!isInstallable && !canShowInstall) {
    return null
  }

  const handleInstall = () => {
    if (isInstallable) {
      // Usar el método PWA estándar
      installPWA()
    } else if (isMobile) {
      // Mostrar instrucciones para móvil
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        alert('Para instalar en iOS:\n1. Toca el ícono de compartir\n2. Selecciona "Añadir a la pantalla de inicio"')
      } else {
        alert('Para instalar:\n1. Abre el menú del navegador\n2. Busca "Instalar app" o "Añadir a pantalla de inicio"')
      }
    }
  }

  return (
    <button
      onClick={handleInstall}
      className="inline-flex items-center px-3 py-2 text-sm text-orange-400 hover:text-orange-300 transition-colors border border-orange-600/30 hover:border-orange-500/50 rounded-lg hover:bg-orange-900/20"
    >
      <Download className="w-4 h-4 mr-2" />
      {isMobile ? 'Instalar App' : 'Instalar como App'}
    </button>
  )
}
