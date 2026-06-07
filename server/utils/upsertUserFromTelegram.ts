import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { isAdminId } from './telegram-auth'
import type { JwtPayload } from './jwt'

interface TelegramUserInput {
  id: number | string
  first_name: string
  last_name?: string | null
  username?: string | null
  photo_url?: string | null
}

export async function upsertUserFromTelegram(input: TelegramUserInput): Promise<typeof users.$inferSelect> {
  const config = useRuntimeConfig()
  const telegramId = String(input.id)
  const adminRole = isAdminId(input.id, config.adminTelegramIds) ? { role: 'ADMIN' as const } : {}

  const [existing] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)

  if (!existing) {
    const [inserted] = await db.insert(users).values({
      telegramId,
      firstName: input.first_name || 'Foydalanuvchi',
      lastName: input.last_name ?? null,
      username: input.username ?? null,
      photoUrl: input.photo_url ?? null,
      ...adminRole
    }).returning()
    return inserted!
  }

  const [updated] = await db.update(users).set({
    ...(input.first_name ? { firstName: input.first_name } : {}),
    ...(input.last_name !== undefined ? { lastName: input.last_name ?? null } : {}),
    ...(input.username !== undefined ? { username: input.username ?? null } : {}),
    ...(input.photo_url !== undefined ? { photoUrl: input.photo_url ?? null } : {}),
    ...adminRole
  }).where(eq(users.telegramId, telegramId)).returning()
  return updated!
}

export function userToJwtPayload(user: typeof users.$inferSelect): JwtPayload {
  return {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
    avatar: user.photoUrl,
    role: user.role
  }
}
