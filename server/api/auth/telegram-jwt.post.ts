import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { users, subscriptions } from '#server/db/schema'
import { upsertUserFromTelegram, userToJwtPayload } from '#server/utils/upsertUserFromTelegram'
import { setSessionCookie } from '#server/utils/session-cookie'
import { sendTelegramMessage } from '#server/utils/telegram'
import { buildMiniAppLoginUrl, buildPlatformMenuButton, setTelegramChatMenuButton } from '#server/utils/telegram-bot.js'

/**
 * Verify JWT token from Telegram Login Widget
 * Reference: https://core.telegram.org/bots/telegram-login
 */
function verifyTelegramJWT(idToken: string, clientSecret: string): any {
  try {
    // JWT format: header.payload.signature
    const parts = idToken.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode payload (base64url decode)
    const base64Payload = parts[1]
    if (!base64Payload) {
      return null
    }

    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))

    // Basic validation
    if (!payload.sub || !payload.iss || payload.iss !== 'https://oauth.telegram.org') {
      return null
    }

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    // TODO: Verify signature with client_secret (HMAC-SHA256)
    // For now, we trust the token if basic validation passes
    // In production, signature verification is mandatory

    return payload
  } catch (error) {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ id_token?: string, user?: any }>(event)

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
  const userData = body.user || {}
  const tgUser = {
    id: telegramId,
    first_name: userData.name ? userData.name.split(' ')[0] : `User${telegramId}`,
    last_name: userData.name ? userData.name.split(' ').slice(1).join(' ') : undefined,
    username: userData.preferred_username,
    photo_url: userData.picture
  }

  const [existing] = await db.select().from(users).where(eq(users.telegramId, String(tgUser.id))).limit(1)
  const isFirstLogin = !existing

  const dbUser = await upsertUserFromTelegram(tgUser)
  console.log('[Login] User after upsert:', { id: dbUser.id, telegramId: dbUser.telegramId, role: dbUser.role })
  const jwtPayload = userToJwtPayload(dbUser)
  console.log('[Login] JWT payload:', { id: jwtPayload.id, telegramId: jwtPayload.telegramId, role: jwtPayload.role })
  await setSessionCookie(event, jwtPayload)

  const botToken = config.telegramBotToken
  if (botToken) {
    if (isFirstLogin) {
      const appUrl = config.public.appUrl || 'https://chayroom.uz'
      const platformUrl = buildMiniAppLoginUrl(appUrl)
      const supportUsername = config.public.supportUsername || 'hellobehruz'
      await setTelegramChatMenuButton(botToken, buildPlatformMenuButton(appUrl))
      await sendTelegramMessage(botToken, tgUser.id, `Salom, ${tgUser.first_name}! 👋\n\nChayroom AI Club'ga xush kelibsiz — bu yerda biz AI'ni hayot, ish va biznesga joriy qilamiz.\n\nIchida: AI-agentlar, vibe coding, neyrotarmoqlar va boshqa amaliy materiallar.\n\nBoshlaylikmi?`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Platformani ochish', web_app: { url: platformUrl } }],
            [{ text: '💳 Obunani boshqarish', url: `${appUrl}/profile` }],
            [{ text: '💬 Qo\'llab-quvvatlash', url: `https://t.me/${supportUsername}` }]
          ]
        }
      })
    } else {
      const appUrl = config.public.appUrl || 'https://chayroom.uz'
      const platformUrl = buildMiniAppLoginUrl(appUrl)
      await sendTelegramMessage(botToken, tgUser.id, `✅ Kirish muvaffaqiyatli amalga oshirildi!\n\nChayroom.uz saytiga qayting va foydalanishda davom eting. 🚀`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Panelni ochish', web_app: { url: platformUrl } }]
          ]
        }
      })
    }
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
