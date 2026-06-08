import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { subscriptions } from '../../../db/schema'
import { botLoginKey, type BotLoginEntry } from '../../../utils/bot-login'
import { buildClientSessionUser, clientCookieOptions } from '../../../utils/client-session'
import { upsertUserFromTelegram, userToJwtPayload } from '../../../utils/upsertUserFromTelegram'
import { setSessionCookie } from '../../../utils/session-cookie'

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store')
  const token = getQuery(event).token

  if (typeof token !== 'string' || !token) {
    throw createError({ statusCode: 400, statusMessage: 'token required' })
  }

  const storage = useStorage('cache')
  const key = botLoginKey(token)
  const entry = await storage.getItem<BotLoginEntry>(key)

  if (!entry) {
    return { status: 'expired' as const }
  }
  if (entry.status !== 'authenticated' || !entry.user) {
    return { status: 'pending' as const }
  }

  const dbUser = await upsertUserFromTelegram(entry.user)
  await setSessionCookie(event, userToJwtPayload(dbUser))

  let hasSubscription = dbUser.role === 'ADMIN'
  if (!hasSubscription) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, dbUser.id)).limit(1)
    hasSubscription = sub?.status === 'ACTIVE' && sub.expiresAt > new Date()
  }

  setCookie(event, 'cx-user', JSON.stringify(buildClientSessionUser(dbUser)), clientCookieOptions())
  if (hasSubscription) {
    setCookie(event, 'cx-sub', 'true', clientCookieOptions())
  } else {
    deleteCookie(event, 'cx-sub', { path: '/' })
  }

  return { status: 'authenticated' as const, hasSubscription }
})
