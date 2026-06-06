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
export const BOT_LOGIN_SUCCESS_MESSAGE = '✅ Вы успешно авторизовались на chayroom.uz\n\nВозвращайтесь на сайт — вход уже выполнен.'

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
