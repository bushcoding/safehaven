"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Home, RefreshCw } from "lucide-react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="text-6xl mb-4">💥</div>
              <CardTitle className="text-2xl text-red-600">Error crítico</CardTitle>
              <CardDescription>
                Ha ocurrido un error crítico en la aplicación. Por favor, recarga la página.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Si el problema persiste, contacta al soporte técnico.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={reset} variant="default" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar página
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Ir al inicio
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
