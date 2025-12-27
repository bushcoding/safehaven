"use client"

import { Heart, Mail, Phone, MapPin, ExternalLink, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { PWAInstallButton } from "./pwa-install"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white w-full mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Safe Haven Info */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2">
                <Image 
                  src="/logosf.png" 
                  alt="Safe Haven Logo" 
                  width={32} 
                  height={32} 
                  className="h-6 w-6 sm:h-8 sm:w-8 object-contain flex-shrink-0"
                />
                <span className="text-xl sm:text-2xl font-bold">Safe Haven</span>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Conectamos animales que necesitan hogar con familias que buscan amor incondicional. Cada vida importa,
                cada adopción cuenta.
              </p>
              <div className="pt-2">
                <PWAInstallButton />
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm sm:text-base">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-orange-500 transition-colors block py-1">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/map" className="text-gray-300 hover:text-orange-500 transition-colors block py-1">
                    Mapa de Animales
                  </Link>
                </li>
                <li>
                  <Link href="/add-pet" className="text-gray-300 hover:text-orange-500 transition-colors block py-1">
                    Publicar Animal
                  </Link>
                </li>
                {/* <li>
                  <Link href="/register" className="text-gray-300 hover:text-orange-500 transition-colors block py-1">
                    Únete a la Comunidad
                  </Link>
                </li> */}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Soporte</h3>
              <ul className="space-y-2 text-sm sm:text-base">
                <li className="flex items-start space-x-2 text-gray-300">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="break-all">contact@bushcoding.com</span>
                </li>
                {/* <li className="flex items-center space-x-2 text-gray-300">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+506 8888 5555</span>
                </li> */}
                <li className="flex items-start space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Talamanca, Limon, Costa Rica</span>
                </li>
              </ul>
              {/* <div className="pt-2">
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Disponible 24/7 para emergencias de rescate
                </p>
              </div> */}
            </div>

            {/* Bush Coding */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Desarrollado por</h3>
              <div>
                <div className="flex justify-start">
                  <div className="w-20 h-20 relative flex-shrink-0">
                    <Image
                      src="/bclw.png"
                      alt="Bush Coding Logo"
                      width={100}
                      height={100}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <a
                    href="https://bushcoding.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors text-sm sm:text-base"
                  >
                    <span className="break-all">bushcoding.com</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-1">
                    "Bring your ideas to life with Bush Coding"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                © {new Date().getFullYear()}{" "}
                  <a
                    href="https://bushcoding.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors font-medium"
                  >
                    Bush Coding
                  </a>
                . Todos los derechos reservados.
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-400">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:space-x-6">
                  <a href="https://bushcoding.com/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                    Política de Privacidad
                  </a>
                  <a href="https://bushcoding.com/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                    Términos y Condiciones
                  </a>
                  <Link href="/cookies" className="hover:text-orange-500 transition-colors">
                    Política de Cookies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}