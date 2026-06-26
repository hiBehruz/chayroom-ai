import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { users, subscriptions } from '#server/db/schema'
import { verifyTelegramOAuthJwt } from '#server/utils/telegram-auth'
import { upsertUserFromTelegram, userToJwtPayload } from '#server/utils/upsertUserFromTelegram'
import { setSessionCookie } from '#server/utils/session-cookie'
import { sendTelegramMessage } from '#server/utils/telegram'
import { buildMiniAppLoginUrl, buildPlatformMenuButton, setTelegramChatMenuButton } from '#server/utils/telegram-bot.js'

interface TelegramOAuthUser {
  name?: string
  preferred_username?: string
  picture?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ id_token?: string, user?: TelegramOAuthUser }>(event)

  if (!body.id_token) {
    throw createError({ statusCode: 400, statusMessage: 'id_token is required' })
  }

  // Verify OIDC JWT token signed by Telegram.
  const clientId = config.telegramBotToken?.includes(':')
    ? config.telegramBotToken.split(':')[0]
    : ''
  const payload = await verifyTelegramOAuthJwt(body.id_token, clientId)

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
  const nameParts = userData.name?.trim().split(/\s+/).filter(Boolean) ?? []
  const tgUser = {
    id: telegramId,
    first_name: nameParts[0] || `User${telegramId}`,
    last_name: nameParts.slice(1).join(' ') || undefined,
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
