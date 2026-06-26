import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { jwtVerify, type JWTPayload } from 'jose'

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

export function parseAdminIds(raw: string | number | undefined | null): string[] {
  if (!raw && raw !== 0) return []
  return String(raw).split(',').map(s => s.trim()).filter(Boolean)
}

export function isAdminId(id: string | number, raw: string | number | undefined | null): boolean {
  return parseAdminIds(raw).includes(String(id))
}

export interface TelegramWebAppUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

/**
 * Verifies a Telegram Mini App `initData` string and returns the embedded user.
 * Mini App uses a different secret than the Login Widget:
 *   secret = HMAC_SHA256(key="WebAppData", message=botToken)
 * See https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramWebAppInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 86_400
): TelegramWebAppUser | null {
  if (!initData || !botToken) return null

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null

  const authDate = Number(params.get('auth_date'))
  if (!authDate || Number.isNaN(authDate)) return null
  const ageSec = Math.floor(Date.now() / 1000) - authDate
  if (ageSec < 0 || ageSec > maxAgeSec) return null

  const dataCheckString = [...params.entries()]
    .filter(([k]) => k !== 'hash')
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n')

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computed = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  if (computed.length !== hash.length) return null
  try {
    if (!timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'))) return null
  } catch {
    return null
  }

  const userRaw = params.get('user')
  if (!userRaw) return null
  try {
    const user = JSON.parse(userRaw) as TelegramWebAppUser
    return user?.id ? user : null
  } catch {
    return null
  }
}

export async function verifyTelegramOAuthJwt(
  idToken: string,
  clientSecret: string | string[]
): Promise<JWTPayload | null> {
  if (!idToken || !clientSecret) return null
  const secrets = Array.isArray(clientSecret) ? clientSecret : [clientSecret]

  for (const secret of secrets.map(value => value.trim()).filter(Boolean)) {
    try {
      const { payload } = await jwtVerify(idToken, new TextEncoder().encode(secret), {
        issuer: 'https://oauth.telegram.org',
        algorithms: ['HS256']
      })

      if (payload.sub) return payload
    } catch {
      // Try the next configured secret.
    }
  }

  return null
}
