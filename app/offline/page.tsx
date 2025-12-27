"use client"

import { AlertTriangle, Wifi, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function OfflinePage() {
  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Wifi className="w-8 h-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sin conexión
          </CardTitle>
          <CardDescription>
            No se puede conectar a Safe Haven en este momento
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-sm">
              Verifica tu conexión a internet e intenta nuevamente
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRefresh}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Intentar de nuevo
            </Button>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Volver al inicio
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Sabías qué?
              </h3>
              <p className="text-sm text-gray-600">
                Safe Haven funciona offline para que puedas ver las mascotas guardadas 
                incluso sin conexión a internet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
