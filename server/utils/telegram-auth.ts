import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export interface TelegramLoginPayload {
  id: number | string
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number | string
  hash: string
  [key: string]: unknown
}

export function verifyTelegramLoginPayload(
  payload: TelegramLoginPayload,
  botToken: string,
  maxAgeSec = 86_400
): boolean {
  if (!payload?.hash || !botToken) return false

  const authDate = Number(payload.auth_date)
  if (!authDate || Number.isNaN(authDate)) return false
  const ageSec = Math.floor(Date.now() / 1000) - authDate
  if (ageSec < 0 || ageSec > maxAgeSec) return false

  const dataCheckString = Object.keys(payload)
    .filter(k => k !== 'hash')
    .sort()
    .map(k => `${k}=${payload[k]}`)
    .join('\n')

  const secretKey = createHash('sha256').update(botToken).digest()
  const computed = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  if (computed.length !== payload.hash.length) return false
  try {
    return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(payload.hash, 'hex'))
  } catch {
    return false
  }
}

export function parseAdminIds(raw: string | undefined | null): string[] {
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

export function isAdminId(id: string | number, raw: string | undefined | null): boolean {
  return parseAdminIds(raw).includes(String(id))
}
