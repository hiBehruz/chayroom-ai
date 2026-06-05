import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'

import { verifyTelegramLoginPayload, parseAdminIds, isAdminId } from './telegram-auth.ts'

const BOT_TOKEN = '123456:test-bot-token'

function signPayload(fields, botToken = BOT_TOKEN) {
  const dataCheckString = Object.keys(fields)
    .sort()
    .map(k => `${k}=${fields[k]}`)
    .join('\n')
  const secret = createHash('sha256').update(botToken).digest()
  const hash = createHmac('sha256', secret).update(dataCheckString).digest('hex')
  return { ...fields, hash }
}

const now = Math.floor(Date.now() / 1000)

test('accepts a valid, fresh payload', () => {
  const payload = signPayload({ id: 555, first_name: 'A', username: 'a', auth_date: now })
  assert.equal(verifyTelegramLoginPayload(payload, BOT_TOKEN), true)
})

test('rejects a tampered payload', () => {
  const payload = signPayload({ id: 555, first_name: 'A', auth_date: now })
  payload.id = 999
  assert.equal(verifyTelegramLoginPayload(payload, BOT_TOKEN), false)
})

test('rejects a stale payload', () => {
  const payload = signPayload({ id: 555, first_name: 'A', auth_date: now - 90000 })
  assert.equal(verifyTelegramLoginPayload(payload, BOT_TOKEN), false)
})

test('rejects when hash missing or token empty', () => {
  assert.equal(verifyTelegramLoginPayload({ id: 1, auth_date: now }, BOT_TOKEN), false)
  const payload = signPayload({ id: 1, auth_date: now })
  assert.equal(verifyTelegramLoginPayload(payload, ''), false)
})

test('parseAdminIds splits, trims, drops empties', () => {
  assert.deepEqual(parseAdminIds(' 1, 2 ,,3 '), ['1', '2', '3'])
  assert.deepEqual(parseAdminIds(''), [])
  assert.deepEqual(parseAdminIds(undefined), [])
})

test('isAdminId matches by string form', () => {
  assert.equal(isAdminId(2, '1,2,3'), true)
  assert.equal(isAdminId('2', '1,2,3'), true)
  assert.equal(isAdminId(9, '1,2,3'), false)
})
