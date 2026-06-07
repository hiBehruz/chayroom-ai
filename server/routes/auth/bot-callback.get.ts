import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { subscriptions } from '../../db/schema'
import { botLoginKey, type BotLoginEntry } from '../../utils/bot-login'
import { upsertUserFromTelegram, userToJwtPayload } from '../../utils/upsertUserFromTelegram'
import { setSessionCookie } from '../../utils/session-cookie'

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token

  if (typeof token !== 'string' || !token) {
    throw createError({ statusCode: 400, statusMessage: 'token required' })
  }

  const storage = useStorage('cache')
  const key = botLoginKey(token)
  const entry = await storage.getItem<BotLoginEntry>(key)

  if (!entry || entry.exp < Date.now()) {
    return sendRedirect(event, '/login?error=expired', 302)
  }
  if (entry.status !== 'authenticated' || !entry.user) {
    return sendRedirect(event, '/login?error=pending', 302)
  }

  const dbUser = await upsertUserFromTelegram(entry.user)
  await setSessionCookie(event, userToJwtPayload(dbUser))
  await storage.removeItem(key)

  let hasSubscription = dbUser.role === 'ADMIN'
  if (!hasSubscription) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, dbUser.id)).limit(1)
    hasSubscription = sub?.status === 'ACTIVE' && sub.expiresAt > new Date()
  }

  return sendRedirect(event, '/profile', 302)
})
