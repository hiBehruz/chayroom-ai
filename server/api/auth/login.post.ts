import { eq } from 'drizzle-orm'
import { db } from '../../db/index'
import { users, subscriptions } from '../../db/schema'
import { sendTelegramMessage } from '../../utils/telegram'
import { isAdminId, verifyTelegramLoginPayload, verifyTelegramWebAppInitData, type TelegramLoginPayload } from '../../utils/telegram-auth'
import { useUserSession } from '../../utils/user-session'
import { buildMiniAppLoginUrl, buildPlatformMenuButton, setTelegramChatMenuButton } from '../../utils/telegram-bot.js'

interface LoginBody extends Partial<TelegramLoginPayload> {
  id?: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  initData?: string
}

interface VerifiedUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<LoginBody>(event)

  // Verify the Telegram identity before trusting any field. Three sources:
  //  - dev shortcut (mirrors client devLogin, tree-shaken in prod)
  //  - Mini App initData (verified with the WebAppData secret)
  //  - Login Widget payload (verified with the SHA256(botToken) secret)
  let tgUser: VerifiedUser | null = null

  if (import.meta.dev && body?.hash === 'dev' && body?.id) {
    tgUser = { id: Number(body.id), first_name: body.first_name || 'Dev', last_name: body.last_name, username: body.username, photo_url: body.photo_url }
  } else if (body?.initData) {
    const u = verifyTelegramWebAppInitData(body.initData, config.telegramBotToken)
    if (u) tgUser = { id: u.id, first_name: u.first_name || '', last_name: u.last_name, username: u.username, photo_url: u.photo_url }
  } else if (body?.id && body?.hash && verifyTelegramLoginPayload(body as TelegramLoginPayload, config.telegramBotToken)) {
    tgUser = { id: Number(body.id), first_name: body.first_name || '', last_name: body.last_name, username: body.username, photo_url: body.photo_url }
  }

  if (!tgUser) {
    throw createError({ statusCode: 401, statusMessage: 'Telegram verification failed' })
  }

  const telegramId = String(tgUser.id)
  const adminRole = isAdminId(tgUser.id, config.adminTelegramIds) ? { role: 'ADMIN' as const } : {}

  // Upsert user from the verified identity
  const existing = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  const isFirstLogin = existing.length === 0

  if (isFirstLogin) {
    await db.insert(users).values({
      telegramId,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name ?? null,
      username: tgUser.username ?? null,
      photoUrl: tgUser.photo_url ?? null,
      ...adminRole
    })
  } else {
    await db.update(users).set({
      firstName: tgUser.first_name,
      lastName: tgUser.last_name ?? null,
      username: tgUser.username ?? null,
      photoUrl: tgUser.photo_url ?? null,
      ...adminRole
    }).where(eq(users.telegramId, telegramId))
  }

  // Establish the signed server session (source of truth for auth, not the client cookie)
  const session = await useUserSession(event)
  await session.update({ telegramId })

  // Check subscription
  const [dbUser] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  let hasSubscription = dbUser?.role === 'ADMIN'

  if (dbUser && !hasSubscription) {
    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, dbUser.id))
      .limit(1)

    hasSubscription = sub?.status === 'ACTIVE' && sub.expiresAt > new Date()
  }

  const botToken = config.telegramBotToken
  if (botToken) {
    const appUrl = config.public.appUrl || 'https://chayroom.uz'
    const platformUrl = buildMiniAppLoginUrl(appUrl)

    await setTelegramChatMenuButton(botToken, buildPlatformMenuButton(appUrl))

    if (!isFirstLogin) {
      await sendTelegramMessage(botToken, tgUser.id, `✅ Вы успешно авторизовались на chayroom.uz\n\nВозвращайтесь на сайт — вход уже выполнен.`)
      return { hasSubscription }
    }

    const supportUsername = config.public.supportUsername || 'hellobehruz'

    const welcomeText = `Salom, ${tgUser.first_name}! 👋\n\nChayroom AI Club'ga xush kelibsiz — bu yerda biz AI'ni hayot, ish va biznesga joriy qilamiz.\n\nIchida: AI-agentlar, vibe coding, neyrotarmoqlar va boshqa amaliy materiallar.\n\nBoshlaylikmi?`

    await sendTelegramMessage(botToken, tgUser.id, welcomeText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Platformani ochish', web_app: { url: platformUrl } }],
          [{ text: '💳 Obunani boshqarish', url: `${appUrl}/profile` }],
          [{ text: '💬 Qo\'llab-quvvatlash', url: `https://t.me/${supportUsername}` }]
        ]
      }
    })
  }

  return { hasSubscription }
})
