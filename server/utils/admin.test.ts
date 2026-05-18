import { describe, it, expect } from 'vitest'
import { parseAdminFromCookie } from './admin'

describe('parseAdminFromCookie', () => {
  it('returns true when telegramId matches adminId', () => {
    const cookie = JSON.stringify({ telegramId: 123456789 })
    expect(parseAdminFromCookie(cookie, '123456789')).toBe(true)
  })

  it('returns true when id (not telegramId) matches', () => {
    const cookie = JSON.stringify({ id: 123456789 })
    expect(parseAdminFromCookie(cookie, '123456789')).toBe(true)
  })

  it('returns false when id does not match', () => {
    const cookie = JSON.stringify({ telegramId: 111 })
    expect(parseAdminFromCookie(cookie, '123456789')).toBe(false)
  })

  it('returns false when cookie is undefined', () => {
    expect(parseAdminFromCookie(undefined, '123456789')).toBe(false)
  })

  it('returns false when cookie is malformed JSON', () => {
    expect(parseAdminFromCookie('not-json', '123456789')).toBe(false)
  })
})
