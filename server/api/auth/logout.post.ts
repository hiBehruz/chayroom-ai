import { clearSessionCookie } from '../../utils/session-cookie'

export default defineEventHandler((event) => {
  clearSessionCookie(event)
  return { ok: true }
})
