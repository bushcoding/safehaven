const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@safehaven.com"

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.warn("⚠️ Mailgun no configurado, simulando envío de email")
    console.log("📧 Email simulado enviado a:", to)
    console.log("🔗 URL de recuperación:", resetUrl)
    return
  }

  const formData = new FormData()
  formData.append("from", `Safe Haven <${FROM_EMAIL}>`)
  formData.append("to", to)
  formData.append("subject", "Recupera tu contraseña - Safe Haven")
  formData.append(
    "html",
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recupera tu contraseña</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🐾 Safe Haven</h1>
                <p>Recupera tu contraseña</p>
            </div>
            <div class="content">
                <h2>Hola ${name},</h2>
                <p>Recibimos una solicitud para recuperar la contraseña de tu cuenta en Safe Haven.</p>
                <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">Recuperar Contraseña</a>
                </p>
                <p><strong>Este enlace expira en 1 hora por seguridad.</strong></p>
                <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña actual seguirá siendo válida.</p>
                <p>Si tienes problemas con el botón, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            </div>
            <div class="footer">
                <p>Safe Haven - Tu refugio seguro para adoptar, rescatar y amar</p>
                <p>Desarrollado con ❤️ por <a href="https://bushcoding.com">Bush Coding</a></p>
            </div>
        </div>
    </body>
    </html>
    `,
  )

  const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64")}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Mailgun error: ${error}`)
  }

  const result = await response.json()
  console.log("✅ Email enviado via Mailgun:", result.id)
  return result
}

export async function sendWelcomeEmail(to: string, name: string) {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.warn("⚠️ Mailgun no configurado, simulando envío de email")
    return
  }

  const formData = new FormData()
  formData.append("from", `Safe Haven <${FROM_EMAIL}>`)
  formData.append("to", to)
  formData.append("subject", "¡Bienvenido a Safe Haven! 🐾")
  formData.append(
    "html",
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Bienvenido a Safe Haven</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🐾 Safe Haven</h1>
                <p>¡Bienvenido a nuestra comunidad!</p>
            </div>
            <div class="content">
                <h2>¡Hola ${name}!</h2>
                <p>¡Gracias por unirte a Safe Haven! Ahora eres parte de una comunidad que se dedica a ayudar a los animales que más lo necesitan.</p>
                <h3>¿Qué puedes hacer ahora?</h3>
                <ul>
                    <li>🏠 <strong>Publicar animales</strong> que necesiten hogar</li>
                    <li>🗺️ <strong>Explorar el mapa</strong> para encontrar animales cerca de ti</li>
                    <li>❤️ <strong>Contactar</strong> con otros rescatistas</li>
                    <li>🚨 <strong>Reportar casos urgentes</strong> que requieran atención inmediata</li>
                </ul>
                <p style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" class="button">Comenzar Ahora</a>
                </p>
                <p>Recuerda que cada vida importa y cada adopción cuenta. ¡Juntos podemos hacer la diferencia!</p>
            </div>
            <div class="footer">
                <p>Safe Haven - Tu refugio seguro para adoptar, rescatar y amar</p>
                <p>Desarrollado con ❤️ por <a href="https://bushcoding.com">Bush Coding</a></p>
            </div>
        </div>
    </body>
    </html>
    `,
  )

  const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64")}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Mailgun error: ${error}`)
  }

  const result = await response.json()
  console.log("✅ Email de bienvenida enviado:", result.id)
  return result
}
