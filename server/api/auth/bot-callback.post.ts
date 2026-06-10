import { eq, desc } from 'drizzle-orm'
import { db } from '#server/db'
import { users, subscriptions } from '#server/db/schema'
import { consumeBotLoginToken, isValidBotLoginToken } from '#server/utils/bot-login-token'
import { userToJwtPayload } from '#server/utils/upsertUserFromTelegram'
import { setSessionCookie } from '#server/utils/session-cookie'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token?: string }>(event)
  const token = body?.token

  if (!token || typeof token !== 'string' || !isValidBotLoginToken(token)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid token' })
  }

  const userId = await consumeBotLoginToken(token)
  if (userId === null) {
    throw createError({ statusCode: 401, statusMessage: 'expired token' })
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'user not found' })
  }

  await setSessionCookie(event, userToJwtPayload(user))

  const [sub] = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.expiresAt))
    .limit(1)

  const now = new Date()
  const hasSubscription = user.role === 'ADMIN' || (!!sub && sub.status === 'ACTIVE' && sub.expiresAt > now)

  return {
    user: {
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      role: user.role
    },
    hasSubscription,
    subscription: sub
      ? {
          period: sub.period,
          expiresAt: sub.expiresAt.toISOString(),
          cancelledAt: sub.cancelledAt ? sub.cancelledAt.toISOString() : null
        }
      : null
  }
})
