import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { users } from '#server/db/schema'
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
  const shouldBeAdmin = isAdminId(input.id, config.adminTelegramIds)
  const adminRole = shouldBeAdmin ? { role: 'ADMIN' as const } : {}

  console.log('[UpsertUser] Input:', { telegramId, shouldBeAdmin, adminTelegramIds: config.adminTelegramIds })

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
    console.log('[UpsertUser] Inserted new user:', { id: inserted!.id, telegramId: inserted!.telegramId, role: inserted!.role })
    return inserted!
  }

  // Always update role if admin status should be applied
  const [updated] = await db.update(users).set({
    ...(input.first_name ? { firstName: input.first_name } : {}),
    ...(input.last_name !== undefined ? { lastName: input.last_name ?? null } : {}),
    ...(input.username !== undefined ? { username: input.username ?? null } : {}),
    ...(input.photo_url !== undefined ? { photoUrl: input.photo_url ?? null } : {}),
    ...(shouldBeAdmin ? { role: 'ADMIN' as const } : {})
  }).where(eq(users.telegramId, telegramId)).returning()
  console.log('[UpsertUser] Updated existing user:', { id: updated!.id, telegramId: updated!.telegramId, role: updated!.role })
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
