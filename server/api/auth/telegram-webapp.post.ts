import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { subscriptions } from '#server/db/schema'
import { verifyTelegramWebAppInitData } from '#server/utils/telegram-auth'
import { upsertUserFromTelegram, userToJwtPayload } from '#server/utils/upsertUserFromTelegram'
import { setSessionCookie } from '#server/utils/session-cookie'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { initData } = await readBody<{ initData: string }>(event)

  const tgUser = verifyTelegramWebAppInitData(initData, config.telegramBotToken)
  if (!tgUser) {
    throw createError({ statusCode: 401, statusMessage: 'Telegram verification failed' })
  }

  const dbUser = await upsertUserFromTelegram({
    id: tgUser.id,
    first_name: tgUser.first_name || '',
    last_name: tgUser.last_name,
    username: tgUser.username,
    photo_url: tgUser.photo_url
  })

  await setSessionCookie(event, userToJwtPayload(dbUser))

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
