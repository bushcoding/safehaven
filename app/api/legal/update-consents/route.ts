import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentLegalVersion } from '@/lib/legal-versions'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      updateTerms, 
      updatePrivacy, 
      updateMarketing,
      updateNotifications,
      cookiesPreferences 
    } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    await connectDB()

    // Obtener información del request
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const xForwardedFor = request.headers.get('x-forwarded-for')
    const xRealIp = request.headers.get('x-real-ip')
    const clientIp = xForwardedFor?.split(',')[0] || xRealIp || request.ip || '127.0.0.1'
    
    const now = new Date()
    const updateData: any = {}

    // Actualizar términos si se solicita
    if (updateTerms) {
      const termsVersion = getCurrentLegalVersion('TERMS')
      updateData['consents.terms'] = {
        accepted: true,
        version: termsVersion,
        acceptedAt: now,
        ipAddress: clientIp,
        userAgent: userAgent
      }
      // Mantener compatibilidad legacy
      updateData.termsAccepted = true
      updateData.termsAcceptedAt = now
    }

    // Actualizar privacidad si se solicita
    if (updatePrivacy) {
      const privacyVersion = getCurrentLegalVersion('PRIVACY')
      updateData['consents.privacy'] = {
        accepted: true,
        version: privacyVersion,
        acceptedAt: now,
        ipAddress: clientIp,
        userAgent: userAgent
      }
      // Mantener compatibilidad legacy
      updateData.privacyAccepted = true
      updateData.privacyAcceptedAt = now
    }

    // Actualizar marketing si se especifica
    if (typeof updateMarketing === 'boolean') {
      updateData['consents.marketing'] = {
        accepted: updateMarketing,
        acceptedAt: updateMarketing ? now : null,
        ipAddress: updateMarketing ? clientIp : null,
        userAgent: updateMarketing ? userAgent : null
      }
      // Mantener compatibilidad legacy
      updateData.marketingAccepted = updateMarketing
      updateData.marketingAcceptedAt = updateMarketing ? now : null
    }

    // Actualizar notificaciones si se especifica
    if (typeof updateNotifications === 'boolean') {
      updateData['consents.notifications'] = {
        accepted: updateNotifications,
        acceptedAt: updateNotifications ? now : null,
        ipAddress: updateNotifications ? clientIp : null,
        userAgent: updateNotifications ? userAgent : null
      }
    }

    // Actualizar preferencias de cookies si se especifican
    if (cookiesPreferences) {
      const cookiesVersion = getCurrentLegalVersion('COOKIES')
      updateData['consents.cookies'] = {
        essential: true, // Siempre requeridas
        functional: cookiesPreferences.functional || false,
        analytics: cookiesPreferences.analytics || false,
        marketing: cookiesPreferences.marketing || false,
        lastUpdated: now,
        version: cookiesVersion,
        ipAddress: clientIp,
        userAgent: userAgent
      }
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Log de la actualización para auditoría
    console.log(`✅ Consentimientos actualizados para usuario ${userId}:`, {
      terms: !!updateTerms,
      privacy: !!updatePrivacy,
      marketing: updateMarketing,
      notifications: updateNotifications,
      cookies: !!cookiesPreferences,
      ip: clientIp,
      userAgent: userAgent.substring(0, 50) + '...',
      timestamp: now.toISOString()
    })

    return NextResponse.json({
      message: 'Consentimientos actualizados exitosamente',
      updatedFields: {
        terms: !!updateTerms,
        privacy: !!updatePrivacy,
        marketing: typeof updateMarketing !== 'undefined',
        notifications: typeof updateNotifications !== 'undefined',
        cookies: !!cookiesPreferences
      },
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Error actualizando consentimientos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
