import { eq, desc } from 'drizzle-orm'
import { db } from '#server/db'
import { subscriptions } from '#server/db/schema'
import { isValidBotLoginToken, readBotLoginToken, consumeBotLoginToken } from '#server/utils/bot-login-token'
import { upsertUserFromTelegram, userToJwtPayload } from '#server/utils/upsertUserFromTelegram'
import { setSessionCookie } from '#server/utils/session-cookie'

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token
  if (typeof token !== 'string' || !isValidBotLoginToken(token)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid token' })
  }

  const entry = await readBotLoginToken(token)
  if (!entry) return { status: 'expired' as const }
  if (entry.status !== 'authenticated' || !entry.user) return { status: 'pending' as const }

  // Authenticated: establish the session in the polling browser, then consume.
  const dbUser = await upsertUserFromTelegram({
    id: entry.user.id,
    first_name: entry.user.first_name,
    last_name: entry.user.last_name,
    username: entry.user.username
  })
  await setSessionCookie(event, userToJwtPayload(dbUser))
  await consumeBotLoginToken(token)

  const [sub] = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, dbUser.id))
    .orderBy(desc(subscriptions.expiresAt))
    .limit(1)

  const now = new Date()
  const hasSubscription = dbUser.role === 'ADMIN' || (!!sub && sub.status === 'ACTIVE' && sub.expiresAt > now)

  return {
    status: 'authenticated' as const,
    user: {
      id: dbUser.id,
      telegramId: Number(dbUser.telegramId),
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      username: dbUser.username,
      photoUrl: dbUser.photoUrl,
      role: dbUser.role
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
