import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildBotLoginSuccessMessage,
  buildAuthenticatedBotLoginEntry,
  buildBotLoginConfirmData,
  canCompleteBotLogin,
  getBotLoginRedirectTarget,
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

test('buildBotLoginSuccessMessage links through the login callback', () => {
  assert.equal(
    buildBotLoginSuccessMessage('https://chayroom.uz/', 'abc123'),
    '✅ Kirish muvaffaqiyatli amalga oshirildi!\n\n<a href="https://chayroom.uz/auth/bot-callback?token=abc123">Chayroom.uz</a> saytiga qayting va foydalanishda davom eting. 🚀'
  )
})

test('buildAuthenticatedBotLoginEntry returns authenticated storage payload', () => {
  assert.deepEqual(
    buildAuthenticatedBotLoginEntry({
      id: 42,
      first_name: 'Ali',
      last_name: 'Valiyev',
      username: 'ali'
    }, 123456),
    {
      status: 'authenticated',
      exp: 123456,
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
  const entry = buildAuthenticatedBotLoginEntry({ id: 42, first_name: 'Ali' }, 2000)

  assert.equal(canCompleteBotLogin(entry, 42, 1000), true)
  assert.equal(canCompleteBotLogin(entry, 99, 1000), false)
  assert.equal(canCompleteBotLogin(entry, 42, 2001), false)
})

test('getBotLoginRedirectTarget opens the authenticated profile', () => {
  assert.equal(getBotLoginRedirectTarget(), '/profile')
})
