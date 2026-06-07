import { eq, desc } from 'drizzle-orm'
import { db } from '../../db'
import { users, subscriptions } from '../../db/schema'
import { readSessionUser } from '../../utils/session-cookie'

export default defineEventHandler(async (event) => {
  const jwtUser = await readSessionUser(event)
  if (!jwtUser) {
    return { user: null, hasSubscription: false, subscription: null }
  }

  const [user] = await db.select().from(users).where(eq(users.id, jwtUser.id)).limit(1)
  if (!user) {
    return { user: null, hasSubscription: false, subscription: null }
  }

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
