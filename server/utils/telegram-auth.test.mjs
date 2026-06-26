import { test } from 'vitest'
import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
import { SignJWT } from 'jose'

import { verifyTelegramLoginPayload, parseAdminIds, isAdminId, verifyTelegramWebAppInitData, verifyTelegramOAuthJwt } from './telegram-auth.ts'

const BOT_TOKEN = '123456:test-bot-token'

function signInitData(fields, botToken = BOT_TOKEN) {
  const params = new URLSearchParams(fields)
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const hash = createHmac('sha256', secret).update(dataCheckString).digest('hex')
  params.set('hash', hash)
  return params.toString()
}

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

test('verifyTelegramWebAppInitData accepts valid initData and returns user', () => {
  const initData = signInitData({
    auth_date: String(now),
    query_id: 'AAExample',
    user: JSON.stringify({ id: 6781623829, first_name: 'Behruz', username: 'behruzzaripov' })
  })
  const user = verifyTelegramWebAppInitData(initData, BOT_TOKEN)
  assert.ok(user)
  assert.equal(user.id, 6781623829)
  assert.equal(user.username, 'behruzzaripov')
})

test('verifyTelegramWebAppInitData rejects tampered user', () => {
  const initData = signInitData({ auth_date: String(now), user: JSON.stringify({ id: 1, first_name: 'A' }) })
  const params = new URLSearchParams(initData)
  params.set('user', JSON.stringify({ id: 999, first_name: 'A' }))
  assert.equal(verifyTelegramWebAppInitData(params.toString(), BOT_TOKEN), null)
})

test('verifyTelegramWebAppInitData rejects stale and wrong-token initData', () => {
  const stale = signInitData({ auth_date: String(now - 90000), user: JSON.stringify({ id: 1, first_name: 'A' }) })
  assert.equal(verifyTelegramWebAppInitData(stale, BOT_TOKEN), null)
  const fresh = signInitData({ auth_date: String(now), user: JSON.stringify({ id: 1, first_name: 'A' }) })
  assert.equal(verifyTelegramWebAppInitData(fresh, 'other-token'), null)
})

test('verifyTelegramOAuthJwt rejects tokens signed with the wrong secret', async () => {
  const token = await new SignJWT({ sub: '222333444', iss: 'https://oauth.telegram.org' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode('wrong-secret'))

  assert.equal(await verifyTelegramOAuthJwt(token, 'correct-secret'), null)
})

test('verifyTelegramOAuthJwt accepts a valid signed token', async () => {
  const token = await new SignJWT({ sub: '222333444', iss: 'https://oauth.telegram.org' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode('correct-secret'))

  const payload = await verifyTelegramOAuthJwt(token, 'correct-secret')
  assert.ok(payload)
  assert.equal(payload.sub, '222333444')
})

test('verifyTelegramOAuthJwt accepts any configured valid secret', async () => {
  const token = await new SignJWT({ sub: '222333444', iss: 'https://oauth.telegram.org' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode('bot-token-secret'))

  const payload = await verifyTelegramOAuthJwt(token, ['wrong-client-secret', 'bot-token-secret'])
  assert.ok(payload)
  assert.equal(payload.sub, '222333444')
})
