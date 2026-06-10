import { createHash, createHmac } from 'node:crypto'
import Redis from 'ioredis'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { $fetch, fetch as nuxtFetch } from '@nuxt/test-utils/e2e'
import {
  cleanupIntegrationFixtures,
  closeIntegrationDatabase,
  seedIntegrationFixtures
} from './helpers/database'
import { integrationEnv, setupIntegrationServer } from './helpers/server'

await setupIntegrationServer()

const redis = new Redis(integrationEnv.REDIS_URL)

beforeAll(async () => {
  await cleanupIntegrationFixtures()
  await seedIntegrationFixtures()
  await redis.flushdb()
})

afterAll(async () => {
  await cleanupIntegrationFixtures()
  await closeIntegrationDatabase()
  await redis.quit()
})

describe.sequential('PostgreSQL and Redis integration', () => {
  it('returns an anonymous auth session safely', async () => {
    await expect($fetch('/api/auth/me')).resolves.toEqual({
      user: null,
      hasSubscription: false,
      subscription: null
    })
  })

  it('reads public course and guide fixtures from PostgreSQL and caches them', async () => {
    const courses = await $fetch<Array<{ slug: string }>>('/api/courses')
    const guides = await $fetch<Array<{ slug: string }>>('/api/guides')

    expect(courses.some(course => course.slug === 'integration-course')).toBe(true)
    expect(guides.some(guide => guide.slug === 'integration-guide')).toBe(true)

    await $fetch('/api/courses')
    await $fetch('/api/guides')

    const keys = await redis.keys('*')
    expect(keys.some(key => key.includes('courses:list'))).toBe(true)
    expect(keys.some(key => key.includes('guides:list'))).toBe(true)
  })

  it('invalidates course list cache after an admin mutation', async () => {
    await $fetch('/api/courses')
    expect((await redis.keys('*courses:list*')).length).toBeGreaterThan(0)

    const payload = createAdminLoginPayload()
    const loginResponse = await nuxtFetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    })
    expect(loginResponse.status).toBe(200)

    const cookie = loginResponse.headers.get('set-cookie')
    expect(cookie).toContain('cx-admin=')

    await $fetch('/api/courses/integration-course', {
      method: 'PATCH',
      headers: { cookie: cookie! },
      body: { isFree: true }
    })

    expect(await redis.keys('*courses:list*')).toEqual([])
  })
})

function createAdminLoginPayload() {
  const payload = {
    id: Number(integrationEnv.NUXT_ADMIN_TELEGRAM_IDS),
    first_name: 'Integration',
    last_name: 'Admin',
    username: 'integration_admin',
    auth_date: Math.floor(Date.now() / 1000)
  }
  const dataCheckString = Object.keys(payload)
    .sort()
    .map(key => `${key}=${payload[key as keyof typeof payload]}`)
    .join('\n')
  const secret = createHash('sha256')
    .update(integrationEnv.NUXT_TELEGRAM_BOT_TOKEN)
    .digest()
  const hash = createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex')

  return { ...payload, hash }
}
