import { describe, expect, it } from 'vitest'
import { fetch as nuxtFetch } from '@nuxt/test-utils/e2e'
import { setupIntegrationServer } from './helpers/server'

await setupIntegrationServer()

describe('auth route middleware', () => {
  it('does not redirect profile when the user cookie exists', async () => {
    const user = {
      id: 987654321,
      telegramId: 987654321,
      first_name: 'Behruz',
      last_name: 'Zaripov',
      username: 'hellobehruz',
      hash: 'session',
      role: 'USER'
    }

    const response = await nuxtFetch('/profile', {
      redirect: 'manual',
      headers: {
        cookie: `cx-user=${encodeURIComponent(JSON.stringify(user))}`
      }
    })

    expect(response.status).toBe(200)
  })
})
