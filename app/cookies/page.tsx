import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies - Safe Haven',
  description: 'Información sobre el uso de cookies en Safe Haven. Conoce cómo utilizamos las cookies para mejorar tu experiencia.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Política de Cookies
            </h1>
            <p className="text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">¿Qué son las cookies?</h2>
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita 
                nuestro sitio web. Nos ayudan a mejorar su experiencia de navegación y a personalizar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tipos de cookies que utilizamos</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900">Cookies esenciales</h3>
                  <p>
                    Son necesarias para el funcionamiento básico del sitio web. Incluyen:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Cookies de autenticación para mantener su sesión activa</li>
                    <li>Cookies de seguridad para proteger contra ataques</li>
                    <li>Cookies de funcionalidad para recordar sus preferencias</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900">Cookies de rendimiento</h3>
                  <p>
                    Nos ayudan a entender cómo los usuarios interactúan con nuestro sitio web:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Google Analytics para estadísticas de uso</li>
                    <li>Cookies de velocidad de carga</li>
                    <li>Métricas de navegación</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900">Cookies funcionales</h3>
                  <p>
                    Mejoran la funcionalidad y personalización:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Preferencias de idioma</li>
                    <li>Configuraciones de usuario</li>
                    <li>Estado de instalación de PWA</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Gestión de cookies</h2>
              <p>
                Puede gestionar las cookies de las siguientes maneras:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Navegador:</strong> Configure su navegador para bloquear o eliminar cookies</li>
                <li><strong>Configuración de privacidad:</strong> Ajuste sus preferencias en la configuración del sitio</li>
                <li><strong>Cookies esenciales:</strong> No se pueden desactivar ya que son necesarias para el funcionamiento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Servicios de terceros</h2>
              <p>
                Utilizamos servicios de terceros que pueden establecer sus propias cookies:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Google Analytics:</strong> Para estadísticas de uso del sitio</li>
                <li><strong>Cloudinary:</strong> Para optimización de imágenes</li>
                <li><strong>MongoDB Atlas:</strong> Para almacenamiento de datos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sus derechos</h2>
              <p>
                En relación con las cookies, usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ser informado sobre el uso de cookies</li>
                <li>Dar o retirar su consentimiento</li>
                <li>Acceder a información sobre las cookies utilizadas</li>
                <li>Solicitar la eliminación de cookies no esenciales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contacto</h2>
              <p>
                Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Email:</strong> contact@bushcoding.com</li>
                <li><strong>Dirección:</strong> Talamanca, Limón, Costa Rica</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cambios en esta política</h2>
              <p>
                Podemos actualizar esta Política de Cookies ocasionalmente. Le notificaremos de cualquier 
                cambio importante publicando la nueva política en esta página y actualizando la fecha de 
                "última actualización".
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}