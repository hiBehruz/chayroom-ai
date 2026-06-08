import type { users } from '../db/schema'

const CLIENT_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

export function buildClientSessionUser(user: typeof users.$inferSelect) {
  return {
    id: Number(user.telegramId),
    telegramId: Number(user.telegramId),
    first_name: user.firstName || 'Foydalanuvchi',
    last_name: user.lastName ?? undefined,
    username: user.username ?? undefined,
    photo_url: user.photoUrl ?? undefined,
    role: user.role,
    hash: 'session'
  }
}

export function clientCookieOptions() {
  return {
    maxAge: CLIENT_COOKIE_MAX_AGE,
    sameSite: 'lax' as const,
    path: '/'
  }
}
