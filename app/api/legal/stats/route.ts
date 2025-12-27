import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentLegalVersion } from '@/lib/legal-versions'

export async function GET(request: NextRequest) {
  try {
    // Solo para administradores - verificar autenticación aquí en el futuro
    await connectDB()

    const totalUsers = await User.countDocuments()
    
    // Obtener versiones actuales
    const currentTermsVersion = getCurrentLegalVersion('TERMS')
    const currentPrivacyVersion = getCurrentLegalVersion('PRIVACY')
    const currentCookiesVersion = getCurrentLegalVersion('COOKIES')

    // Estadísticas de consentimientos
    const termsStats = await User.aggregate([
      {
        $group: {
          _id: "$consents.terms.version",
          count: { $sum: 1 },
          latestAcceptance: { $max: "$consents.terms.acceptedAt" }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const privacyStats = await User.aggregate([
      {
        $group: {
          _id: "$consents.privacy.version",
          count: { $sum: 1 },
          latestAcceptance: { $max: "$consents.privacy.acceptedAt" }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Estadísticas de consentimientos opcionales
    const marketingConsents = await User.countDocuments({
      "consents.marketing.accepted": true
    })

    const notificationConsents = await User.countDocuments({
      "consents.notifications.accepted": true
    })

    // Estadísticas de cookies
    const cookieStats = await User.aggregate([
      {
        $group: {
          _id: null,
          functional: { $sum: { $cond: ["$consents.cookies.functional", 1, 0] } },
          analytics: { $sum: { $cond: ["$consents.cookies.analytics", 1, 0] } },
          marketing: { $sum: { $cond: ["$consents.cookies.marketing", 1, 0] } }
        }
      }
    ])

    // Registros por versión actual
    const currentVersionUsers = {
      terms: await User.countDocuments({
        "consents.terms.version": currentTermsVersion,
        "consents.terms.accepted": true
      }),
      privacy: await User.countDocuments({
        "consents.privacy.version": currentPrivacyVersion,
        "consents.privacy.accepted": true
      })
    }

    // Usuarios que necesitan actualizar consentimientos
    const needsUpdate = {
      terms: await User.countDocuments({
        $or: [
          { "consents.terms.version": { $ne: currentTermsVersion } },
          { "consents.terms.accepted": { $ne: true } }
        ]
      }),
      privacy: await User.countDocuments({
        $or: [
          { "consents.privacy.version": { $ne: currentPrivacyVersion } },
          { "consents.privacy.accepted": { $ne: true } }
        ]
      })
    }

    const response = {
      totalUsers,
      currentVersions: {
        terms: currentTermsVersion,
        privacy: currentPrivacyVersion,
        cookies: currentCookiesVersion
      },
      versionStats: {
        terms: termsStats,
        privacy: privacyStats
      },
      currentVersionCompliance: {
        terms: {
          compliant: currentVersionUsers.terms,
          percentage: totalUsers > 0 ? (currentVersionUsers.terms / totalUsers * 100).toFixed(2) : "0"
        },
        privacy: {
          compliant: currentVersionUsers.privacy,
          percentage: totalUsers > 0 ? (currentVersionUsers.privacy / totalUsers * 100).toFixed(2) : "0"
        }
      },
      needsUpdate: {
        terms: {
          count: needsUpdate.terms,
          percentage: totalUsers > 0 ? (needsUpdate.terms / totalUsers * 100).toFixed(2) : "0"
        },
        privacy: {
          count: needsUpdate.privacy,
          percentage: totalUsers > 0 ? (needsUpdate.privacy / totalUsers * 100).toFixed(2) : "0"
        }
      },
      optionalConsents: {
        marketing: {
          count: marketingConsents,
          percentage: totalUsers > 0 ? (marketingConsents / totalUsers * 100).toFixed(2) : "0"
        },
        notifications: {
          count: notificationConsents,
          percentage: totalUsers > 0 ? (notificationConsents / totalUsers * 100).toFixed(2) : "0"
        }
      },
      cookiePreferences: cookieStats[0] || {
        functional: 0,
        analytics: 0,
        marketing: 0
      },
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error obteniendo estadísticas legales:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
