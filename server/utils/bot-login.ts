export interface BotLoginUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

export interface BotLoginEntry {
  status: 'pending' | 'authenticated'
  user?: BotLoginUser
}

export const BOT_LOGIN_SUCCESS_MESSAGE =
  '✅ Kirish muvaffaqiyatli amalga oshirildi!\n\n<a href="https://chayroom.uz">Chayroom.uz</a> saytiga qayting va foydalanishda davom eting. 🚀'

export function buildBotLoginSuccessMessage(): { text: string; options: Record<string, unknown> } {
  return { text: BOT_LOGIN_SUCCESS_MESSAGE, options: {} }
}

export function buildAuthenticatedBotLoginEntry(
  user: Pick<BotLoginUser, 'id' | 'first_name'> & Partial<Pick<BotLoginUser, 'last_name' | 'username' | 'photo_url'>>
): BotLoginEntry {
  return {
    status: 'authenticated',
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url
    }
  }
}

export function canCompleteBotLogin(entry: BotLoginEntry | null, telegramUserId: number): boolean {
  if (!entry) return false
  if (entry.status === 'pending') return true
  return entry.user?.id === telegramUserId
}

export function isValidBotLoginToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{24,128}$/.test(token)
}

export function getBotLoginRedirectTarget(): string {
  return '/profile'
}

export function botLoginKey(token: string) {
  return `botlogin:${token}`
}

export function buildBotLoginConfirmData(token: string) {
  return `confirm_login_${token}`
}

export function parseBotLoginConfirmData(data: string) {
  const prefix = 'confirm_login_'
  if (!data.startsWith(prefix)) return null
  const token = data.slice(prefix.length)
  return token || null
}
