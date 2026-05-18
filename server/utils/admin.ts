import type { H3Event } from 'h3'

export function parseAdminFromCookie(cookieValue: string | undefined, adminId: string): boolean {
  if (!cookieValue) return false
  try {
    const user = JSON.parse(cookieValue)
    return String(user.telegramId ?? user.id) === String(adminId)
  } catch {
    return false
  }
}

export function isAdminRequest(event: H3Event): boolean {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'cx-user')
  return parseAdminFromCookie(cookie, config.adminTelegramId)
}
