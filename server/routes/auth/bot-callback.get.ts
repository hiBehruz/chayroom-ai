import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { subscriptions } from '#server/db/schema'
import { botLoginKey, buildPendingBotLoginPage, getBotLoginRedirectTarget, type BotLoginEntry } from '#server/utils/bot-login'
import { buildClientSessionUser, clientCookieOptions } from '#server/utils/client-session'
import { upsertUserFromTelegram, userToJwtPayload } from '#server/utils/upsertUserFromTelegram'
import { setSessionCookie } from '#server/utils/session-cookie'

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token

  if (typeof token !== 'string' || !token) {
    throw createError({ statusCode: 400, statusMessage: 'token required' })
  }

  const storage = useStorage('cache')
  const key = botLoginKey(token)
  const entry = await storage.getItem<BotLoginEntry>(key)

  if (!entry) {
    return sendRedirect(event, '/login?error=expired', 302)
  }
  if (entry.status !== 'authenticated' || !entry.user) {
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    setHeader(event, 'cache-control', 'no-store')
    return buildPendingBotLoginPage(token)
  }

  const dbUser = await upsertUserFromTelegram(entry.user)
  await setSessionCookie(event, userToJwtPayload(dbUser))
  await storage.removeItem(key)

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

  return sendRedirect(event, getBotLoginRedirectTarget(), 302)
})
