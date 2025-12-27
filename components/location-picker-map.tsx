"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Target, Navigation } from "lucide-react"

// Leaflet types
declare global {
  interface Window {
    L: any
  }
}

interface LocationPickerMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number }
  className?: string
}

export function LocationPickerMap({ onLocationSelect, initialLocation, className = "" }: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const loadLeaflet = async () => {
      if (!window.L) {
        // Cargar CSS de Leaflet
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        // Cargar JavaScript de Leaflet
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = initializeMap
        document.head.appendChild(script)
      } else {
        initializeMap()
      }
    }

    const initializeMap = () => {
      // Limpiar instancia anterior si existe
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (error) {
          console.log("Error limpiando mapa anterior:", error)
        }
      }

      if (!mapRef.current) return

      // Limpiar el contenedor del mapa
      mapRef.current.innerHTML = ''

      // Ubicación inicial: proporcionada o San José, Costa Rica por defecto
      const initialLat = initialLocation?.lat || 9.9281
      const initialLng = initialLocation?.lng || -84.0907

      try {
        const map = window.L.map(mapRef.current, {
          preferCanvas: true, // Usar canvas para mejor rendimiento
          zoomControl: true,
          attributionControl: true
        }).setView([initialLat, initialLng], 13)

        // Usar exactamente el mismo sistema de tiles que funciona en leaflet-map.tsx
        const primaryTileLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          crossOrigin: true,
          keepBuffer: 4, // Mantener tiles adicionales para navegación suave
          updateWhenIdle: false,
          updateWhenZooming: false
        })

        const fallbackTileLayer = window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          crossOrigin: true
        })

        // Intentar cargar el proveedor principal, si falla usar el fallback
        primaryTileLayer.addTo(map)
        
        primaryTileLayer.on('tileerror', () => {
          console.log("Error loading primary tiles, switching to fallback")
          map.removeLayer(primaryTileLayer)
          fallbackTileLayer.addTo(map)
        })

        mapInstanceRef.current = map

        // Añadir marker inicial si hay ubicación
        if (initialLocation) {
          addMarker(initialLocation.lat, initialLocation.lng)
        }

        // Event listener para clicks en el mapa
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng
          addMarker(lat, lng)
          reverseGeocode(lat, lng)
        })

        // Event listener para cuando termine una animación de movimiento
        map.on('moveend', () => {
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize()
            }
          }, 100)
        })

        // Forzar re-renderizado después de inicialización
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        }, 100)

        console.log("✅ Mapa inicializado correctamente")
      } catch (error) {
        console.error("❌ Error inicializando mapa:", error)
      }
    }

    // Solo cargar el mapa si no existe ya una instancia
    if (!mapInstanceRef.current) {
      loadLeaflet()
    }

    return () => {
      // Cleanup más robusto
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
          console.log("🧹 Mapa limpiado correctamente")
        } catch (error) {
          console.log("Error en cleanup:", error)
        }
      }
      
      // También limpiar el marker
      if (markerRef.current) {
        markerRef.current = null
      }
    }
  }, []) // Quitar initialLocation de las dependencias para evitar re-renders

  // Efecto separado para manejar cambios en initialLocation
  useEffect(() => {
    if (initialLocation && mapInstanceRef.current) {
      // Si ya existe el mapa y hay una ubicación inicial, centrar en ella
      mapInstanceRef.current.setView([initialLocation.lat, initialLocation.lng], 13)
      addMarker(initialLocation.lat, initialLocation.lng)
    }
  }, [initialLocation])

  const addMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return

    // Remover marker anterior si existe
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
    }

    // Crear nuevo marker
    const customIcon = window.L.divIcon({
      html: `
        <div style="
          width: 40px; 
          height: 40px; 
          background-color: #f97316; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 3px solid white;
          animation: bounce 0.6s ease-in-out;
        ">
          <span style="font-size: 20px;">📍</span>
        </div>
        <style>
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        </style>
      `,
      className: "custom-location-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    })

    const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current)

    marker.bindPopup(`
      <div style="text-align: center; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #f97316; font-weight: bold;">📍 Ubicación Seleccionada</h4>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Latitud:</strong> ${lat.toFixed(6)}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Longitud:</strong> ${lng.toFixed(6)}</p>
        <p style="margin: 8px 0 4px 0; font-size: 12px; color: #666;">Esta será la ubicación de tu mascota</p>
      </div>
    `).openPopup()

    markerRef.current = marker
    setCurrentLocation({ lat, lng })
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es`
      )
      const data = await response.json()
      
      let address = "Ubicación seleccionada"
      if (data.display_name) {
        // Extraer información relevante del address
        const parts = data.display_name.split(", ")
        const city = data.address?.city || data.address?.town || data.address?.village
        const country = data.address?.country
        
        if (city && country) {
          address = `${city}, ${country}`
        } else {
          address = parts.slice(0, 3).join(", ")
        }
      }

      onLocationSelect({ lat, lng, address })
    } catch (error) {
      console.error("Error en geocodificación inversa:", error)
      onLocationSelect({ lat, lng, address: "Ubicación seleccionada" })
    }
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    
    // Verificar si estamos en un contexto seguro (HTTPS o localhost)
    const isSecureContext = window.isSecureContext || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.protocol === 'https:'

    if (!isSecureContext) {
      alert("⚠️ La geolocalización solo funciona en conexiones seguras (HTTPS) o localhost. Por favor, haz clic directamente en el mapa para seleccionar la ubicación.")
      setIsLoadingLocation(false)
      return
    }
    
    if (!navigator.geolocation) {
      alert("❌ Tu navegador no soporta geolocalización. Por favor, haz clic en el mapa para seleccionar la ubicación.")
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log("✅ Ubicación obtenida:", latitude, longitude)
        console.log("📍 Estado del mapa antes de mover:", mapInstanceRef.current ? "existe" : "no existe")
        
        // Actualizar el estado de ubicación actual
        setCurrentLocation({ lat: latitude, lng: longitude })
        console.log("🎯 Estado actualizado, procediendo a mover mapa...")
        
        // Centrar mapa en la ubicación actual de forma más suave
        if (mapInstanceRef.current) {
          try {
            console.log("🚀 Iniciando flyTo...")
            // Usar flyTo para una transición más suave que puede evitar problemas de tiles
            mapInstanceRef.current.flyTo([latitude, longitude], 15, {
              duration: 1.5 // Duración de la animación en segundos
            })
            
            // Forzar invalidateSize después de que termine la animación
            setTimeout(() => {
              if (mapInstanceRef.current) {
                console.log("🔄 Ejecutando invalidateSize después de flyTo")
                mapInstanceRef.current.invalidateSize()
              }
            }, 2000) // Esperar que termine la animación
          } catch (error) {
            console.log("❌ FlyTo falló, usando setView como fallback:", error)
            // Fallback a setView si flyTo falla
            mapInstanceRef.current.setView([latitude, longitude], 15)
            setTimeout(() => {
              if (mapInstanceRef.current) {
                console.log("🔄 Ejecutando invalidateSize después de setView")
                mapInstanceRef.current.invalidateSize()
              }
            }, 100)
          }
        }
        
        // Añadir marker después de un pequeño delay
        setTimeout(() => {
          console.log("📌 Añadiendo marker...")
          addMarker(latitude, longitude)
          reverseGeocode(latitude, longitude)
        }, 500)
        
        setIsLoadingLocation(false)
        console.log("✅ Proceso de ubicación completado")
      },
      (error) => {
        console.error("❌ Error obteniendo ubicación:", error)
        let message = "No se pudo obtener tu ubicación. "
        let suggestion = "Haz clic en el mapa para seleccionar la ubicación manualmente."
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "🚫 Permiso de ubicación denegado. "
            suggestion = "Ve a la configuración de tu navegador y permite el acceso a la ubicación para este sitio, o haz clic en el mapa para seleccionar manualmente."
            break
          case error.POSITION_UNAVAILABLE:
            message = "📍 Información de ubicación no disponible. "
            suggestion = "Verifica tu conexión a internet o GPS, o selecciona la ubicación haciendo clic en el mapa."
            break
          case error.TIMEOUT:
            message = "⏱️ Tiempo de espera agotado. "
            suggestion = "Intenta de nuevo o selecciona la ubicación haciendo clic en el mapa."
            break
        }
        
        alert(message + suggestion)
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Aumentar timeout a 15 segundos
        maximumAge: 300000, // 5 minutos de cache
      }
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-lg">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              Seleccionar Ubicación
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Haz clic en el mapa para marcar donde está el animal. También puedes usar "Mi ubicación" para centrar el mapa en tu zona y luego ajustar la posición exacta.
            </CardDescription>
          </div>
          <Button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoadingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                <span>Ubicando...</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                <span>Mi ubicación</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[300px] w-full relative">
          <div 
            ref={mapRef} 
            className="w-full h-full" 
            style={{
              minHeight: '300px',
              backgroundColor: '#f0f0f0',
              position: 'relative',
              zIndex: 1
            }}
          />
          
          {!currentLocation && !isLoadingLocation && (
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center max-w-xs border-2 border-orange-200">
                <Navigation className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-sm font-medium text-gray-800 mb-1">
                  Selecciona la ubicación del animal
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Haz clic en cualquier punto del mapa
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-orange-600">
                  <span>💡</span>
                  <span>O usa "Mi ubicación" si tienes GPS</span>
                </div>
              </div>
            </div>
          )}
          
          {currentLocation && (
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-green-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">
                  📍 Ubicación detectada - Haz clic para ajustar
                </span>
              </div>
            </div>
          )}
          
          {isLoadingLocation && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center border-2 border-orange-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                <p className="text-sm font-medium text-gray-800 mb-1">
                  🛰️ Detectando ubicación...
                </p>
                <p className="text-xs text-gray-600">
                  Esto puede tomar unos segundos
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
