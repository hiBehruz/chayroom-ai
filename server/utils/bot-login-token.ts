import { randomBytes } from 'node:crypto'

const TOKEN_TTL_SECONDS = 300

export interface BotLoginUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

export interface BotLoginEntry {
  status: 'pending' | 'authenticated'
  user?: BotLoginUser
  exp: number
}

export function botLoginTokenKey(token: string): string {
  return `bot-login:${token}`
}

export function isValidBotLoginToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,128}$/.test(token)
}

// Frontend creates a pending token, embeds it in the bot deep link
// (?start=auth_<token>), then polls the status endpoint.
export async function createPendingBotLoginToken(): Promise<string> {
  const token = randomBytes(24).toString('base64url')
  const entry: BotLoginEntry = { status: 'pending', exp: Date.now() + TOKEN_TTL_SECONDS * 1000 }
  await useStorage('cache').setItem(botLoginTokenKey(token), entry, { ttl: TOKEN_TTL_SECONDS })
  return token
}

// Bot marks the token authenticated when the user runs /start auth_<token>.
export async function authenticateBotLoginToken(token: string, user: BotLoginUser): Promise<boolean> {
  if (!isValidBotLoginToken(token)) return false
  const storage = useStorage('cache')
  const key = botLoginTokenKey(token)
  const entry = await storage.getItem<BotLoginEntry>(key)
  if (!entry || entry.status !== 'pending' || entry.exp < Date.now()) return false
  const updated: BotLoginEntry = { status: 'authenticated', user, exp: entry.exp }
  await storage.setItem(key, updated, { ttl: TOKEN_TTL_SECONDS })
  return true
}

export async function readBotLoginToken(token: string): Promise<BotLoginEntry | null> {
  if (!isValidBotLoginToken(token)) return null
  const entry = await useStorage('cache').getItem<BotLoginEntry>(botLoginTokenKey(token))
  if (!entry || entry.exp < Date.now()) return null
  return entry
}

export async function consumeBotLoginToken(token: string): Promise<void> {
  await useStorage('cache').removeItem(botLoginTokenKey(token))
}
