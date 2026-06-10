import postgres from 'postgres'
import Redis from 'ioredis'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { fetch as nuxtFetch } from '@nuxt/test-utils/e2e'
import { integrationEnv, setupIntegrationServer } from './helpers/server'

await setupIntegrationServer()

const redis = new Redis(integrationEnv.REDIS_URL)
const sql = postgres(integrationEnv.DATABASE_URL, { max: 1 })
const TG_ID = 555000111

async function cleanup() {
  await sql`DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM users WHERE telegram_id = ${String(TG_ID)})`
  await sql`DELETE FROM users WHERE telegram_id = ${String(TG_ID)}`
}

beforeAll(async () => {
  await cleanup()
  await redis.flushdb()
})

afterAll(async () => {
  await cleanup()
  await sql.end()
  await redis.quit()
})

describe.sequential('bot login token callback', () => {
  it('mints a token on /start login and exchanges it for a session', async () => {
    const webhookRes = await nuxtFetch('/api/telegram/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': integrationEnv.NUXT_TELEGRAM_WEBHOOK_SECRET
      },
      body: JSON.stringify({
        update_id: 1,
        message: {
          text: '/start login',
          chat: { id: TG_ID },
          from: { id: TG_ID, first_name: 'BotLogin', username: 'botlogin_test' }
        }
      })
    })
    expect(webhookRes.status).toBe(200)

    const keys = await redis.keys('*bot-login:*')
    expect(keys.length).toBe(1)
    const token = keys[0].split('bot-login:')[1]

    const callbackRes = await nuxtFetch('/api/auth/bot-callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token })
    })
    expect(callbackRes.status).toBe(200)
    expect(callbackRes.headers.get('set-cookie')).toContain('chayroom_session=')

    const data = await callbackRes.json()
    expect(data.user.telegramId).toBe(TG_ID)

    const second = await nuxtFetch('/api/auth/bot-callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token })
    })
    expect(second.status).toBe(401)
  })

  it('rejects malformed and unknown tokens', async () => {
    const bad = await nuxtFetch('/api/auth/bot-callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'short' })
    })
    expect(bad.status).toBe(400)

    const unknown = await nuxtFetch('/api/auth/bot-callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'z'.repeat(43) })
    })
    expect(unknown.status).toBe(401)
  })

  it('does not mint a token for a plain /start', async () => {
    await redis.flushdb()
    const res = await nuxtFetch('/api/telegram/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': integrationEnv.NUXT_TELEGRAM_WEBHOOK_SECRET
      },
      body: JSON.stringify({
        update_id: 2,
        message: { text: '/start', chat: { id: TG_ID }, from: { id: TG_ID, first_name: 'BotLogin' } }
      })
    })
    expect(res.status).toBe(200)
    expect(await redis.keys('*bot-login:*')).toEqual([])
  })
})
