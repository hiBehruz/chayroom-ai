import { test } from 'vitest'
import assert from 'node:assert/strict'

import {
  buildBotLoginSuccessMessage,
  buildPendingBotLoginPage,
  buildAuthenticatedBotLoginEntry,
  buildBotLoginConfirmData,
  canCompleteBotLogin,
  getBotLoginRedirectTarget,
  isValidBotLoginToken,
  parseBotLoginConfirmData
} from './bot-login.ts'

test('buildBotLoginConfirmData creates stable callback payload', () => {
  assert.equal(buildBotLoginConfirmData('abc123'), 'confirm_login_abc123')
})

test('parseBotLoginConfirmData returns token only for confirm payloads', () => {
  assert.equal(parseBotLoginConfirmData('confirm_login_abc123'), 'abc123')
  assert.equal(parseBotLoginConfirmData('login_abc123'), null)
  assert.equal(parseBotLoginConfirmData('confirm_login_'), null)
  assert.equal(parseBotLoginConfirmData('other'), null)
})

test('buildBotLoginSuccessMessage returns confirmation with tokenized callback link', () => {
  const { text, options } = buildBotLoginSuccessMessage('https://chayroom.uz', 'abc123')
  assert.equal(text, '✅ Kirish muvaffaqiyatli amalga oshirildi!\n\n<a href="https://chayroom.uz/auth/bot-callback?token=abc123">Chayroom.uz</a> saytiga qayting va foydalanishda davom eting. 🚀')
  assert.deepEqual(options, {})
})

test('buildPendingBotLoginPage keeps polling the tokenized status endpoint', () => {
  const html = buildPendingBotLoginPage('abc123')
  assert.match(html, /\/api\/auth\/bot-login\/status\?token=abc123/)
  assert.match(html, /window\.location\.replace\('\/profile'\)/)
  assert.match(html, /window\.location\.replace\('\/login\?error=expired'\)/)
})

test('buildAuthenticatedBotLoginEntry returns authenticated storage payload', () => {
  assert.deepEqual(
    buildAuthenticatedBotLoginEntry({
      id: 42,
      first_name: 'Ali',
      last_name: 'Valiyev',
      username: 'ali'
    }),
    {
      status: 'authenticated',
      user: {
        id: 42,
        first_name: 'Ali',
        last_name: 'Valiyev',
        username: 'ali',
        photo_url: undefined
      }
    }
  )
})

test('canCompleteBotLogin allows the same Telegram user to retry an authenticated login', () => {
  const entry = buildAuthenticatedBotLoginEntry({ id: 42, first_name: 'Ali' })

  assert.equal(canCompleteBotLogin(entry, 42), true)
  assert.equal(canCompleteBotLogin(entry, 99), false)
})

test('getBotLoginRedirectTarget opens the profile page', () => {
  assert.equal(getBotLoginRedirectTarget(), '/profile')
})

test('isValidBotLoginToken accepts only sufficiently long base64url tokens', () => {
  assert.equal(isValidBotLoginToken('U8-pbu-9pgjdc_i-__azPmgdL36pHMhX'), true)
  assert.equal(isValidBotLoginToken('short'), false)
  assert.equal(isValidBotLoginToken('invalid token with spaces'), false)
})
