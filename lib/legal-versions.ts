// Versiones de términos legales para Safe Haven
export const LEGAL_VERSIONS = {
  TERMS: "1.0", // Versión actual de Términos y Condiciones
  PRIVACY: "1.0", // Versión actual de Política de Privacidad
  COOKIES: "1.0", // Versión actual de Política de Cookies
} as const

// Fechas de entrada en vigor
export const LEGAL_EFFECTIVE_DATES = {
  TERMS: "2025-01-27", // Fecha de entrada en vigor de términos
  PRIVACY: "2025-01-27", // Fecha de entrada en vigor de privacidad
  COOKIES: "2025-01-27", // Fecha de entrada en vigor de cookies
} as const

// Metadatos de versiones (para futuras actualizaciones)
export const LEGAL_VERSION_HISTORY = {
  TERMS: [
    {
      version: "1.0",
      effectiveDate: "2025-01-27",
      description: "Versión inicial de Términos y Condiciones",
      majorChanges: [
        "Definición de servicios de adopción",
        "Responsabilidades de usuarios",
        "Política de uso aceptable",
        "Limitación de responsabilidad"
      ]
    }
  ],
  PRIVACY: [
    {
      version: "1.0",
      effectiveDate: "2025-01-27",
      description: "Versión inicial de Política de Privacidad",
      majorChanges: [
        "Recopilación de datos personales",
        "Uso de información de mascotas",
        "Compartir datos con refugios",
        "Derechos de los usuarios bajo GDPR"
      ]
    }
  ],
  COOKIES: [
    {
      version: "1.0",
      effectiveDate: "2025-01-27",
      description: "Versión inicial de Política de Cookies",
      majorChanges: [
        "Tipos de cookies utilizadas",
        "Cookies esenciales para PWA",
        "Gestión de preferencias",
        "Cookies de terceros"
      ]
    }
  ]
} as const

// Obtener versión actual de un documento legal
export function getCurrentLegalVersion(document: keyof typeof LEGAL_VERSIONS): string {
  return LEGAL_VERSIONS[document]
}

// Verificar si un usuario necesita aceptar nuevas versiones
export function needsLegalUpdate(userConsents: any, document: keyof typeof LEGAL_VERSIONS): boolean {
  const currentVersion = getCurrentLegalVersion(document)
  
  switch (document) {
    case 'TERMS':
      return !userConsents?.terms?.accepted || userConsents?.terms?.version !== currentVersion
    case 'PRIVACY':
      return !userConsents?.privacy?.accepted || userConsents?.privacy?.version !== currentVersion
    case 'COOKIES':
      return !userConsents?.cookies || userConsents?.cookies?.lastUpdated < new Date(LEGAL_EFFECTIVE_DATES.COOKIES)
    default:
      return true
  }
}

// Obtener información completa de una versión
export function getLegalVersionInfo(document: keyof typeof LEGAL_VERSION_HISTORY, version?: string) {
  const history = LEGAL_VERSION_HISTORY[document]
  const targetVersion = version || getCurrentLegalVersion(document as keyof typeof LEGAL_VERSIONS)
  
  return history.find(v => v.version === targetVersion) || history[history.length - 1]
}
