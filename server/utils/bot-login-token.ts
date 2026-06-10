import { randomBytes } from 'node:crypto'

const TOKEN_TTL_SECONDS = 600

export interface BotLoginTokenEntry {
  userId: number
  exp: number
}

export function botLoginTokenKey(token: string): string {
  return `bot-login:${token}`
}

export function isValidBotLoginToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,128}$/.test(token)
}

export async function createBotLoginToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  const entry: BotLoginTokenEntry = { userId, exp: Date.now() + TOKEN_TTL_SECONDS * 1000 }
  const storage = useStorage('cache')
  await storage.setItem(botLoginTokenKey(token), entry, { ttl: TOKEN_TTL_SECONDS })
  return token
}

export async function consumeBotLoginToken(token: string): Promise<number | null> {
  if (!isValidBotLoginToken(token)) return null
  const storage = useStorage('cache')
  const key = botLoginTokenKey(token)
  const entry = await storage.getItem<BotLoginTokenEntry>(key)
  if (!entry) return null
  await storage.removeItem(key)
  if (typeof entry.exp !== 'number' || entry.exp < Date.now()) return null
  return entry.userId
}
