import { eq, desc } from 'drizzle-orm'
import { db } from '../../db'
import { users, subscriptions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'cx-user')
  if (!cookie) {
    return { user: null, hasSubscription: false, subscription: null }
  }

  let parsed: { id?: number, telegramId?: number } | null = null
  try {
    parsed = JSON.parse(cookie)
  } catch {
    return { user: null, hasSubscription: false, subscription: null }
  }

  const telegramId = String(parsed?.telegramId ?? parsed?.id ?? '')
  if (!telegramId) {
    return { user: null, hasSubscription: false, subscription: null }
  }

  const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  if (!user) {
    return { user: null, hasSubscription: false, subscription: null }
  }

  const [sub] = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.expiresAt))
    .limit(1)

  const now = new Date()
  const hasSubscription = !!sub && sub.status === 'ACTIVE' && sub.expiresAt > now

  return {
    user: {
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl
    },
    hasSubscription,
    subscription: sub ? {
      period: sub.period,
      expiresAt: sub.expiresAt.toISOString(),
      cancelledAt: sub.cancelledAt ? sub.cancelledAt.toISOString() : null
    } : null
  }
})
