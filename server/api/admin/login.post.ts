import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { users } from '#server/db/schema'
import { verifyTelegramLoginPayload, isAdminId, type TelegramLoginPayload } from '#server/utils/telegram-auth'
import { useAdminSession } from '#server/utils/admin-session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const payload = await readBody<TelegramLoginPayload>(event)

  // Dev-only shortcut mirrors the existing client devLogin (hash: 'dev'); tree-shaken in prod.
  const devOk = import.meta.dev && payload?.hash === 'dev'
  if (!devOk && !verifyTelegramLoginPayload(payload, config.telegramBotToken)) {
    throw createError({ statusCode: 401, statusMessage: 'Telegram verification failed' })
  }
  if (!isAdminId(payload.id, config.adminTelegramIds)) {
    throw createError({ statusCode: 403, statusMessage: 'Not an admin account' })
  }

  const telegramId = String(payload.id)
  const existing = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  if (existing.length === 0) {
    await db.insert(users).values({
      telegramId,
      firstName: payload.first_name ?? 'Admin',
      lastName: payload.last_name ?? null,
      username: payload.username ?? null,
      photoUrl: payload.photo_url ?? null,
      role: 'ADMIN'
    })
  } else {
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.telegramId, telegramId))
  }

  const session = await useAdminSession(event)
  await session.update({ telegramId })
  return { ok: true }
})
