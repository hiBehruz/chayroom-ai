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

export function botLoginKey(token: string) {
  return `botlogin:${token}`
}
