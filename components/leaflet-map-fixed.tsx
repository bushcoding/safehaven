"use client"

import { useEffect, useRef } from "react"
import type { Pet } from "@/types"

// Leaflet types
declare global {
  interface Window {
    L: any
  }
}

interface LeafletMapProps {
  pets: Pet[]
  selectedPet: Pet | null
  onPetSelect: (pet: Pet) => void
}

export function LeafletMap({ pets, selectedPet, onPetSelect }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // ✨ Función para agregar marcadores de mascotas
  const addPetMarkers = () => {
    if (!mapInstanceRef.current) return

    // Limpiar marcadores existentes
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    pets.forEach((pet) => {
      // ✨ Validar que la mascota tenga coordenadas válidas
      if (!pet.lat || !pet.lng || pet.lat === 0 || pet.lng === 0) {
        console.log("⚠️ Mascota sin coordenadas válidas:", pet.name, pet.lat, pet.lng)
        return
      }

      const iconColor = pet.urgent ? "#ef4444" : pet.status === "adopcion" ? "#22c55e" : "#3b82f6"

      const customIcon = window.L.divIcon({
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background-color: ${iconColor}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            ${pet.urgent ? "animation: pulse 2s infinite;" : ""}
          ">
            <span style="font-size: 16px;">🐾</span>
          </div>
        `,
        className: "custom-pet-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      try {
        const marker = window.L.marker([pet.lat, pet.lng], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(
            `
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${pet.name}</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Tipo:</strong> ${pet.type}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Ubicación:</strong> ${pet.location}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Estado:</strong> 
                <span style="
                  background: ${iconColor}; 
                  color: white; 
                  padding: 2px 6px; 
                  border-radius: 4px; 
                  font-size: 12px;
                ">${pet.status}</span>
              </p>
              ${pet.urgent ? '<p style="color: #ef4444; font-weight: bold; margin: 4px 0;">⚠️ Caso Urgente</p>' : ""}
              <p style="margin: 8px 0 4px 0; font-size: 12px; color: #666;">Haz clic para ver más detalles</p>
            </div>
          `,
          )
          .on("click", () => {
            onPetSelect(pet)
          })

        markersRef.current.push(marker)

        if (selectedPet && selectedPet.id === pet.id) {
          marker.openPopup()
          mapInstanceRef.current.setView([pet.lat, pet.lng], 13)
        }
      } catch (error) {
        console.error("❌ Error agregando marcador para mascota:", pet.name, error)
      }
    })
  }

  // ✨ Efecto para inicializar el mapa (solo una vez)
  useEffect(() => {
    if (!mapRef.current) return

    const loadLeaflet = async () => {
      if (!window.L) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = initializeMap
        document.head.appendChild(script)
      } else {
        initializeMap()
      }
    }

    const initializeMap = () => {
      // ✨ Limpiar completamente la instancia anterior y el contenedor
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      
      // ✨ Asegurarse de que el contenedor DOM esté limpio
      if (mapRef.current) {
        mapRef.current.innerHTML = ""
        // ✨ Limpiar el ID interno de Leaflet
        delete (mapRef.current as any)._leaflet_id
      }

      // ✨ Coordenadas de Costa Rica por defecto
      let defaultLat = 9.9281 // San José, Costa Rica
      let defaultLng = -84.0907
      let defaultZoom = 8

      // ✨ Filtrar mascotas con coordenadas válidas para calcular centro
      const validPets = pets.filter(pet => pet.lat && pet.lng && pet.lat !== 0 && pet.lng !== 0)
      console.log("🗺️ Inicializando mapa - Total mascotas:", pets.length, "Con coordenadas:", validPets.length)

      // Si hay mascotas válidas, calcular el centro
      if (validPets.length > 0) {
        const avgLat = validPets.reduce((sum, pet) => sum + pet.lat, 0) / validPets.length
        const avgLng = validPets.reduce((sum, pet) => sum + pet.lng, 0) / validPets.length
        
        defaultLat = avgLat
        defaultLng = avgLng
        defaultZoom = validPets.length === 1 ? 12 : 9
      }

      const map = window.L.map(mapRef.current).setView([defaultLat, defaultLng], defaultZoom)

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
      
      // Agregar marcadores iniciales si hay mascotas
      if (pets.length > 0) {
        addPetMarkers()
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // ✨ Solo ejecutar una vez al montar el componente

  // ✨ Efecto separado para actualizar marcadores cuando cambien las mascotas
  useEffect(() => {
    if (mapInstanceRef.current && pets.length > 0) {
      addPetMarkers()
    }
  }, [pets])

  // ✨ Efecto para manejar mascota seleccionada
  useEffect(() => {
    if (selectedPet && mapInstanceRef.current) {
      const marker = markersRef.current.find((m, index) => pets[index].id === selectedPet.id)
      if (marker) {
        marker.openPopup()
        mapInstanceRef.current.setView([selectedPet.lat, selectedPet.lng], 13)
      }
    }
  }, [selectedPet, pets])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-semibold text-sm mb-2">Leyenda</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Adopción</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Rescate</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Urgente</span>
          </div>
        </div>
      </div>
    </div>
  )
}
