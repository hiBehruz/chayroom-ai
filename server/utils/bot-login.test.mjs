import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BOT_LOGIN_SUCCESS_MESSAGE,
  buildAuthenticatedBotLoginEntry,
  buildBotLoginConfirmData,
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

test('BOT_LOGIN_SUCCESS_MESSAGE matches the website auth confirmation copy', () => {
  assert.equal(
    BOT_LOGIN_SUCCESS_MESSAGE,
    '✅ Kirish muvaffaqiyatli amalga oshirildi!\n\nChayroom AI paneliga qayting va foydalanishda davom eting. 🚀'
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
