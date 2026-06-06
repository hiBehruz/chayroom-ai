import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { users, subscriptions } from '../../../db/schema'
import { isAdminId } from '../../../utils/telegram-auth'
import { useUserSession } from '../../../utils/user-session'
import { botLoginKey, type BotLoginEntry } from '../../../utils/bot-login'

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store')
  const config = useRuntimeConfig(event)
  const token = getQuery(event).token

  if (typeof token !== 'string' || !token) {
    throw createError({ statusCode: 400, statusMessage: 'token required' })
  }

  const storage = useStorage('cache')
  const key = botLoginKey(token)
  const entry = await storage.getItem<BotLoginEntry>(key)

  if (!entry || entry.exp < Date.now()) {
    return { status: 'expired' as const }
  }
  if (entry.status !== 'authenticated' || !entry.user) {
    return { status: 'pending' as const }
  }

  // Confirmed by the bot — upsert the verified user and open the signed session
  const u = entry.user
  const telegramId = String(u.id)
  const adminRole = isAdminId(u.id, config.adminTelegramIds) ? { role: 'ADMIN' as const } : {}

  const existing = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  if (existing.length === 0) {
    await db.insert(users).values({
      telegramId,
      firstName: u.first_name,
      lastName: u.last_name ?? null,
      username: u.username ?? null,
      photoUrl: u.photo_url ?? null,
      ...adminRole
    })
  } else {
    await db.update(users).set({
      firstName: u.first_name,
      lastName: u.last_name ?? null,
      username: u.username ?? null,
      ...adminRole
    }).where(eq(users.telegramId, telegramId))
  }

  const session = await useUserSession(event)
  await session.update({ telegramId })

  await storage.removeItem(key) // one-time use

  const [dbUser] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  let hasSubscription = dbUser?.role === 'ADMIN'
  if (dbUser && !hasSubscription) {
    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, dbUser.id))
      .limit(1)
    hasSubscription = sub?.status === 'ACTIVE' && sub.expiresAt > new Date()
  }

  return { status: 'authenticated' as const, hasSubscription }
})
