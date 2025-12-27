"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, LogOut, Plus, Map, Menu, X, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface NavigationProps {
  isLoggedIn: boolean
  onLogout: () => void
}

export function Navigation({ isLoggedIn, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMobileMenu}>
            <Image 
              src="/logosf.png" 
              alt="Safe Haven Logo" 
              width={32} 
              height={32} 
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-800">Safe Haven</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/map">
              <Button variant="ghost" size="sm">
                <Map className="w-4 h-4 mr-2" />
                Mapa
              </Button>
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/add-pet">
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <Link href="/map" onClick={closeMobileMenu}>
              <Button variant="ghost" className="w-full justify-start">
                <Map className="w-4 h-4 mr-2" />
                Mapa
              </Button>
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/add-pet" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar Animal
                  </Button>
                </Link>
                <Link href="/profile" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    onLogout()
                    closeMobileMenu()
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMobileMenu}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
