export interface BotLoginUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

export interface BotLoginEntry {
  status: 'pending' | 'authenticated'
  exp: number
  user?: BotLoginUser
}

export const BOT_LOGIN_TTL_MS = 5 * 60 * 1000
export const BOT_LOGIN_SUCCESS_MESSAGE = '✅ Kirish muvaffaqiyatli amalga oshirildi!\n\nChayroom.uz saytiga qayting va foydalanishda davom eting. 🚀'

export function buildBotLoginSuccessMessage(appUrl: string, token?: string): string {
  const targetUrl = new URL('/', appUrl)
  if (token) {
    targetUrl.pathname = '/auth/bot-callback'
    targetUrl.searchParams.set('token', token)
  }

  return BOT_LOGIN_SUCCESS_MESSAGE.replace('Chayroom.uz', `<a href="${targetUrl.toString()}">Chayroom.uz</a>`)
}

export function buildAuthenticatedBotLoginEntry(
  user: Pick<BotLoginUser, 'id' | 'first_name'> & Partial<Pick<BotLoginUser, 'last_name' | 'username' | 'photo_url'>>,
  exp: number
): BotLoginEntry {
  return {
    status: 'authenticated',
    exp,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url
    }
  }
}

export function canCompleteBotLogin(entry: BotLoginEntry | null, telegramUserId: number, now = Date.now()): boolean {
  if (!entry || entry.exp <= now) return false
  if (entry.status === 'pending') return true
  return entry.user?.id === telegramUserId
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
