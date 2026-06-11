import { isValidBotLoginToken, readBotLoginToken, consumeBotLoginToken } from '#server/utils/bot-login-token'
import { upsertUserFromTelegram, userToJwtPayload } from '#server/utils/upsertUserFromTelegram'
import { setSessionCookie } from '#server/utils/session-cookie'

// Opened from the bot's "Chayroom.uz" link. Establishes the session in whatever
// browser opens it (e.g. the Telegram in-app webview), then redirects home — so
// the user sees their current profile, not a stale one cached in that browser.
export default defineEventHandler(async (event) => {
  const token = getQuery(event).token

  if (typeof token !== 'string' || !isValidBotLoginToken(token)) {
    return sendRedirect(event, '/login?error=invalid', 302)
  }

  const entry = await readBotLoginToken(token)
  if (!entry || entry.status !== 'authenticated' || !entry.user) {
    return sendRedirect(event, '/login?error=expired', 302)
  }

  const dbUser = await upsertUserFromTelegram({
    id: entry.user.id,
    first_name: entry.user.first_name,
    last_name: entry.user.last_name,
    username: entry.user.username
  })
  await setSessionCookie(event, userToJwtPayload(dbUser))
  await consumeBotLoginToken(token)

  return sendRedirect(event, '/', 302)
})
