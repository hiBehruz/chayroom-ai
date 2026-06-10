import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { users } from '#server/db/schema'

interface AdminSessionData {
  telegramId?: string
}

export function useAdminSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  return useSession<AdminSessionData>(event, {
    name: 'cx-admin',
    password: config.adminSessionPassword,
    cookie: {
      domain: config.adminCookieDomain || undefined,
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax'
    }
  })
}

export async function requireAdmin(event: H3Event) {
  const session = await useAdminSession(event)
  const telegramId = session.data.telegramId
  if (!telegramId) {
    throw createError({ statusCode: 401, statusMessage: 'Admin auth required' })
  }
  const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  if (!user || user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  return user
}
