import { eq } from 'drizzle-orm'
import { db } from '../../db/index'
import { users, subscriptions } from '../../db/schema'
import { sendTelegramMessage } from '../../utils/telegram'

interface LoginBody {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<LoginBody>(event)

  if (!body?.id || !body?.first_name) {
    throw createError({ statusCode: 400, message: 'Invalid body' })
  }

  const telegramId = String(body.id)

  // Upsert user
  const existing = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  const isFirstLogin = existing.length === 0

  if (isFirstLogin) {
    await db.insert(users).values({
      telegramId,
      firstName: body.first_name,
      lastName: body.last_name ?? null,
      username: body.username ?? null,
      photoUrl: body.photo_url ?? null,
    })
  } else {
    await db.update(users).set({
      firstName: body.first_name,
      lastName: body.last_name ?? null,
      username: body.username ?? null,
      photoUrl: body.photo_url ?? null,
    }).where(eq(users.telegramId, telegramId))
  }

  // Check subscription
  const [dbUser] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  let hasSubscription = false

  if (dbUser) {
    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, dbUser.id))
      .limit(1)

    hasSubscription = sub?.status === 'ACTIVE' && sub.expiresAt > new Date()
  }

  // Send welcome bot message on first login
  const botToken = config.telegramBotToken
  if (botToken && isFirstLogin) {
    const appUrl = config.public.appUrl || 'https://chayroom.uz'
    const supportUsername = config.public.supportUsername || 'hellobehruz'

    const welcomeText = `Salom, ${body.first_name}! 👋\n\nChayroom AI Club'ga xush kelibsiz — bu yerda biz AI'ni hayot, ish va biznesga joriy qilamiz.\n\nIchida: AI-agentlar, vibe coding, neyrotarmoqlar va boshqa amaliy materiallar.\n\nBoshlaylikmi?`

    await sendTelegramMessage(botToken, body.id, welcomeText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Platformani ochish', web_app: { url: `${appUrl}/dashboard` } }],
          [{ text: '💳 Obunani boshqarish', url: `${appUrl}/profile` }],
          [{ text: '💬 Qo\'llab-quvvatlash', url: `https://t.me/${supportUsername}` }],
        ]
      }
    })
  }

  return { hasSubscription }
})
