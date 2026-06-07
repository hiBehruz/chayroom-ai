import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users, subscriptions } from '../../db/schema'
import { verifyTelegramLoginPayload, type TelegramLoginPayload } from '../../utils/telegram-auth'
import { upsertUserFromTelegram, userToJwtPayload } from '../../utils/upsertUserFromTelegram'
import { setSessionCookie } from '../../utils/session-cookie'
import { sendTelegramMessage } from '../../utils/telegram'
import { buildMiniAppLoginUrl, buildPlatformMenuButton, setTelegramChatMenuButton } from '../../utils/telegram-bot.js'
import { BOT_LOGIN_SUCCESS_MESSAGE } from '../../utils/bot-login'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<Partial<TelegramLoginPayload>>(event)

  let tgUser: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string } | null = null

  if (import.meta.dev && body?.hash === 'dev' && body?.id) {
    tgUser = { id: Number(body.id), first_name: body.first_name || 'Dev', last_name: body.last_name, username: body.username, photo_url: body.photo_url }
  } else if (body?.id && body?.hash && verifyTelegramLoginPayload(body as TelegramLoginPayload, config.telegramBotToken)) {
    tgUser = { id: Number(body.id), first_name: body.first_name || '', last_name: body.last_name, username: body.username, photo_url: body.photo_url }
  }

  if (!tgUser) {
    throw createError({ statusCode: 401, statusMessage: 'Telegram verification failed' })
  }

  const [existing] = await db.select().from(users).where(eq(users.telegramId, String(tgUser.id))).limit(1)
  const isFirstLogin = !existing

  const dbUser = await upsertUserFromTelegram(tgUser)
  await setSessionCookie(event, userToJwtPayload(dbUser))

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
      await sendTelegramMessage(botToken, tgUser.id, BOT_LOGIN_SUCCESS_MESSAGE, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Panelni ochish', web_app: { url: buildMiniAppLoginUrl(config.public.appUrl || 'https://chayroom.uz') } }]
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
