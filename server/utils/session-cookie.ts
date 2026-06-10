import type { H3Event } from 'h3'
import type { JwtPayload } from './jwt'
import { signJwt, verifyJwt } from './jwt'

const COOKIE_NAME = 'chayroom_session'
const MAX_AGE = 7 * 24 * 60 * 60

export async function setSessionCookie(event: H3Event, payload: JwtPayload): Promise<void> {
  const token = await signJwt(payload)
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/'
  })
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME)
}

export async function readSessionUser(event: H3Event): Promise<JwtPayload | null> {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null
  return verifyJwt(token)
}
