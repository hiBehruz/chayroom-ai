import { createHmac, timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { users, subscriptions } from '#server/db/schema'
import { upsertUserFromTelegram, userToJwtPayload } from '#server/utils/upsertUserFromTelegram'
import { setSessionCookie } from '#server/utils/session-cookie'
import { sendTelegramMessage } from '#server/utils/telegram'
import { buildMiniAppLoginUrl, buildPlatformMenuButton, setTelegramChatMenuButton } from '#server/utils/telegram-bot.js'

interface TelegramJWTPayload {
  sub: string
  iss: string
  exp?: number
  [key: string]: unknown
}

interface TelegramOAuthUser {
  name?: string
  preferred_username?: string
  picture?: string
}

/**
 * Verify JWT token from Telegram Login Widget
 * Reference: https://core.telegram.org/bots/telegram-login
 */
function verifyTelegramJWT(idToken: string, clientSecret: string): TelegramJWTPayload | null {
  try {
    if (!clientSecret) {
      return null
    }

    // JWT format: header.payload.signature
    const parts = idToken.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [header, payloadPart, signature] = parts

    // Decode payload (base64url decode)
    if (!payloadPart) {
      return null
    }

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8')) as TelegramJWTPayload

    // Basic validation
    if (!payload.sub || !payload.iss || payload.iss !== 'https://oauth.telegram.org') {
      return null
    }

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    // Verify signature with client_secret (HMAC-SHA256)
    const data = `${header}.${payloadPart}`
    const expectedSignature = createHmac('sha256', clientSecret)
      .update(data)
      .digest('base64url')

    // Timing-safe comparison to prevent timing attacks
    if (!signature || signature.length !== expectedSignature.length) {
      return null
    }

    try {
      const signatureBuffer = Buffer.from(signature, 'base64url')
      const expectedBuffer = Buffer.from(expectedSignature, 'base64url')

      if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return null
      }
    } catch {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ id_token?: string, user?: TelegramOAuthUser }>(event)

  if (!body.id_token) {
    throw createError({ statusCode: 400, statusMessage: 'id_token is required' })
  }

  // Verify JWT token
  const payload = verifyTelegramJWT(body.id_token, config.telegramClientSecret || '')

  if (!payload || !payload.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  // Extract user info from token payload
  const telegramId = parseInt(payload.sub, 10)
  if (!telegramId) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid user ID in token' })
  }

  // Use user data from callback if available, otherwise from token
  const userData: TelegramOAuthUser = body.user || {}

  // Parse name with fallback
  const firstName = userData.name?.split(' ')[0] || `User${telegramId}`
  const lastNameParts = userData.name?.split(' ').slice(1).join(' ')

  const tgUser = {
    id: telegramId,
    first_name: firstName,
    last_name: lastNameParts || undefined,
    username: userData.preferred_username,
    photo_url: userData.picture
  }

  const [existing] = await db.select().from(users).where(eq(users.telegramId, String(tgUser.id))).limit(1)
  const isFirstLogin = !existing

  const dbUser = await upsertUserFromTelegram(tgUser)
  await setSessionCookie(event, userToJwtPayload(dbUser))

  // Telegram bot token (chayroomai_bot - 8921379022)
  const botToken = config.telegramBotToken

  if (!botToken) {
    // Return early if no bot token configured
    let hasSubscription = dbUser.role === 'ADMIN'
    if (!hasSubscription) {
      const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, dbUser.id)).limit(1)
      hasSubscription = sub?.status === 'ACTIVE' && sub.expiresAt > new Date()
    }

    return {
      user: {
        id: dbUser.id,
        telegramId: Number(dbUser.telegramId),
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        username: dbUser.username,
        photoUrl: dbUser.photoUrl,
        role: dbUser.role
      },
      hasSubscription
    }
  }

  const appUrl = config.public.appUrl || 'https://chayroom.uz'
  const platformUrl = buildMiniAppLoginUrl(appUrl)
  const supportUsername = config.public.supportUsername || 'hellobehruz'

  // Xabar mazmuni
  const successMessage = `✅ Kirish muvaffaqiyatli amalga oshirildi!\n\nChayroom.uz saytiga qayting va foydalanishda davom eting. 🚀`
  const welcomeMessage = `Salom, ${tgUser.first_name}! 👋\n\nChayroom AI Club'ga xush kelibsiz — bu yerda biz AI'ni hayot, ish va biznesga joriy qilamiz.\n\nIchida: AI-agentlar, vibe coding, neyrotarmoqlar va boshqa amaliy materiallar.\n\nBoshlaylikmi?`

  if (isFirstLogin) {
    // First login - welcome message
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Platformani ochish', web_app: { url: platformUrl } }],
          [{ text: '💳 Obunani boshqarish', url: `${appUrl}/profile` }],
          [{ text: '💬 Qo\'llab-quvvatlash', url: `https://t.me/${supportUsername}` }]
        ]
      }
    }

    await setTelegramChatMenuButton(botToken, buildPlatformMenuButton(appUrl))
    await sendTelegramMessage(botToken, tgUser.id, welcomeMessage, keyboard)
  } else {
    // Returning user - success message
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Panelni ochish', web_app: { url: platformUrl } }]
        ]
      }
    }

    await sendTelegramMessage(botToken, tgUser.id, successMessage, keyboard)
  }

  let hasSubscription = dbUser.role === 'ADMIN'
  if (!hasSubscription) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, dbUser.id)).limit(1)
    hasSubscription = sub?.status === 'ACTIVE' && sub.expiresAt > new Date()
  }

  return {
    user: {
      id: dbUser.id,
      telegramId: Number(dbUser.telegramId),
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      username: dbUser.username,
      photoUrl: dbUser.photoUrl,
      role: dbUser.role
    },
    hasSubscription
  }
})
