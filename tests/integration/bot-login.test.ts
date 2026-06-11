import postgres from 'postgres'
import Redis from 'ioredis'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { $fetch, fetch as nuxtFetch } from '@nuxt/test-utils/e2e'
import { integrationEnv, setupIntegrationServer } from './helpers/server'

await setupIntegrationServer()

const redis = new Redis(integrationEnv.REDIS_URL)
const sql = postgres(integrationEnv.DATABASE_URL, { max: 1 })
const TG_ID = 555000111

async function cleanup() {
  await sql`DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM users WHERE telegram_id = ${String(TG_ID)})`
  await sql`DELETE FROM users WHERE telegram_id = ${String(TG_ID)}`
}

function startBotLogin() {
  return $fetch<{ token: string, url: string }>('/api/auth/bot-login/start', { method: 'POST' })
}

function sendStart(text: string) {
  return nuxtFetch('/api/telegram/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-telegram-bot-api-secret-token': integrationEnv.NUXT_TELEGRAM_WEBHOOK_SECRET
    },
    body: JSON.stringify({
      update_id: Math.floor(Math.random() * 1_000_000),
      message: { text, chat: { id: TG_ID }, from: { id: TG_ID, first_name: 'BotLogin', username: 'botlogin_test' } }
    })
  })
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

describe.sequential('bot login polling flow', () => {
  it('start -> bot authenticates -> status authenticated with a session', async () => {
    const { token, url } = await startBotLogin()
    expect(url).toContain(`start=auth_${token}`)

    const pending = await $fetch<{ status: string }>('/api/auth/bot-login/status', { params: { token } })
    expect(pending.status).toBe('pending')

    const wh = await sendStart(`/start auth_${token}`)
    expect(wh.status).toBe(200)

    const done = await nuxtFetch(`/api/auth/bot-login/status?token=${token}`)
    expect(done.status).toBe(200)
    expect(done.headers.get('set-cookie')).toContain('chayroom_session=')
    const data = await done.json()
    expect(data.status).toBe('authenticated')
    expect(data.user.telegramId).toBe(TG_ID)

    // token consumed: a second poll no longer authenticates
    const after = await $fetch<{ status: string }>('/api/auth/bot-login/status', { params: { token } })
    expect(after.status).toBe('expired')
  })

  it('bot link token signs in via /auth/enter', async () => {
    await redis.flushdb()
    const { token } = await startBotLogin()
    await sendStart(`/start auth_${token}`)

    // the bot created a separate authenticated token for the "return to site" link
    const keys = await redis.keys('*bot-login:*')
    const linkToken = keys
      .map(k => k.slice(k.indexOf('bot-login:') + 'bot-login:'.length))
      .find(t => t !== token)
    expect(linkToken).toBeTruthy()

    const res = await nuxtFetch(`/auth/enter?token=${linkToken}`, { redirect: 'manual' })
    expect([301, 302]).toContain(res.status)
    expect(res.headers.get('set-cookie')).toContain('chayroom_session=')
  })

  it('rejects malformed tokens', async () => {
    const bad = await nuxtFetch('/api/auth/bot-login/status?token=short')
    expect(bad.status).toBe(400)
  })

  it('does not authenticate a plain /start', async () => {
    const { token } = await startBotLogin()
    const wh = await sendStart('/start')
    expect(wh.status).toBe(200)
    const res = await $fetch<{ status: string }>('/api/auth/bot-login/status', { params: { token } })
    expect(res.status).toBe('pending')
  })
})
