import type { H3Event } from 'h3'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db'
import { users, subscriptions } from '../db/schema'

interface UserSessionData {
  telegramId?: string
}

export function useUserSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  return useSession<UserSessionData>(event, {
    name: 'cx-session',
    password: config.sessionPassword,
    cookie: {
      domain: config.adminCookieDomain || undefined,
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax'
    }
  })
}

export async function getSessionUser(event: H3Event) {
  const session = await useUserSession(event)
  const telegramId = session.data.telegramId
  if (!telegramId) return null
  const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  return user ?? null
}

export async function getSubscriptionState(event: H3Event) {
  const user = await getSessionUser(event)
  if (!user) {
    return { user: null, hasSubscription: false, subscription: null as typeof subscriptions.$inferSelect | null }
  }

  const [sub] = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.expiresAt))
    .limit(1)

  const now = new Date()
  const isAdmin = user.role === 'ADMIN'
  const hasSubscription = isAdmin || (!!sub && sub.status === 'ACTIVE' && sub.expiresAt > now)

  return { user, hasSubscription, subscription: sub ?? null }
}
