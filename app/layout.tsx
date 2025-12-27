import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { PetsProvider } from "@/contexts/pets-context"
import { PWAInstallBanner } from "@/components/pwa-install"
import { NetworkStatus } from "@/components/network-status"
import { PWALifecycle } from "@/components/pwa-lifecycle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Safe Haven - Adopción de Mascotas | Rescate Animal",
    template: "%s | Safe Haven"
  },
  description:
    "Plataforma líder en adopción responsable de mascotas. Conectamos animales rescatados con familias amorosas. Adopta perros, gatos y otros animales. ¡Dale una segunda oportunidad!",
  keywords: [
    "adopción mascotas",
    "rescate animal", 
    "adopción perros",
    "adopción gatos",
    "refugio animales",
    "mascotas en adopción",
    "animales perdidos",
    "adopción responsable",
    "Safe Haven",
    "adopción gratuita mascotas",
    "fundación animales"
  ],
  authors: [{ name: "Safe Haven", url: "https://safehaven.cr" }],
  creator: "Bush Coding",
  publisher: "Safe Haven",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://safehaven.cr"),
  alternates: {
    canonical: "/",
    languages: {
      "es": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es",
    url: "https://safehaven.cr",
    title: "Safe Haven - Adopción de Mascotas",
    description: "Plataforma para adopción responsable de mascotas. Conectamos animales rescatados con familias amorosas.",
    siteName: "Safe Haven",
    images: [
      {
        url: "/logosf.png",
        width: 1200,
        height: 630,
        alt: "Safe Haven - Adopción de Mascotas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Safe Haven - Adopción de Mascotas",
    description: "Conectamos animales rescatados con familias amorosas. Adopta responsablemente.",
    images: ["/logosf.png"],
    creator: "@safehavencr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Reemplazar con código real
    yandex: "yandex-verification-code", // Reemplazar con código real
    yahoo: "yahoo-verification-code", // Reemplazar con código real
  },
  category: "pets",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Safe Haven",
    "description": "Plataforma de adopción responsable de mascotas.",
    "url": "https://safehaven.cr",
    "logo": "https://safehaven.cr/logosf.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+506-8888-5555",
      "contactType": "customer service",
      "email": "contact@bushcoding.com",
      "availableLanguage": "Spanish"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Talamanca",
      "addressRegion": "Limón",
      "addressCountry": "CR"
    },
    "sameAs": [
      "https://bushcoding.com"
    ],
    "foundingDate": "2024",
    "nonprofitStatus": "NonprofitType",
    "seeks": {
      "@type": "PetAdoption",
      "description": "Conectamos animales rescatados con familias responsables"
    }
  }

  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="theme-color" content="#f97316" />
        <meta name="color-scheme" content="light" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <PWALifecycle />
        <NetworkStatus />
        <PetsProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </PetsProvider>
        <PWAInstallBanner />
      </body>
    </html>
  )
}