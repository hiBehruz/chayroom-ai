import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { users } from '#server/db/schema'
import { useAdminSession } from '#server/utils/admin-session'

export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event)
  const telegramId = session.data.telegramId
  if (!telegramId) return { admin: false as const }

  const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  if (!user || user.role !== 'ADMIN') return { admin: false as const }

  return {
    admin: true as const,
    user: {
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      username: user.username,
      role: user.role
    }
  }
})
