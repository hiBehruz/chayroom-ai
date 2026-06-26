import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '~/stores/auth'

const fetchMock = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
  useCookie('cx-user').value = null
  useCookie('cx-sub').value = null
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('auth store session restoration', () => {
  it('updates the visible profile immediately after the server session appears', async () => {
    fetchMock.mockResolvedValue({
      user: {
        id: 7,
        telegramId: 987654321,
        firstName: 'Behruz',
        lastName: 'Zaripov',
        username: 'hellobehruz',
        photoUrl: null,
        role: 'USER'
      },
      hasSubscription: false,
      subscription: null
    })
    const store = useAuthStore()

    await store.syncMe()

    expect(store.user).toMatchObject({
      id: 987654321,
      telegramId: 987654321,
      first_name: 'Behruz',
      last_name: 'Zaripov'
    })
    expect(store.displayName).toBe('Behruz Zaripov')
  })
})

describe('auth store OAuth login', () => {
  it('uses the already-verified JWT OAuth user without posting it to widget auth', async () => {
    fetchMock.mockResolvedValue({
      user: {
        id: 8,
        telegramId: 222333444,
        firstName: 'OAuth',
        lastName: 'User',
        username: 'oauth_user',
        photoUrl: null,
        role: 'USER'
      },
      hasSubscription: false,
      subscription: null
    })
    const store = useAuthStore()

    await store.login({
      id: 222333444,
      telegramId: 222333444,
      first_name: 'OAuth',
      last_name: 'User',
      username: 'oauth_user',
      photo_url: '',
      role: 'USER',
      hash: 'jwt-auth'
    })

    expect(fetchMock).not.toHaveBeenCalledWith('/api/auth/telegram', expect.anything())
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me')
    expect(store.user).toMatchObject({
      id: 222333444,
      telegramId: 222333444,
      first_name: 'OAuth',
      last_name: 'User'
    })
  })

  it('keeps the verified JWT OAuth user when the immediate session sync misses the cookie', async () => {
    fetchMock.mockResolvedValue({
      user: null,
      hasSubscription: false,
      subscription: null
    })
    const store = useAuthStore()

    await store.login({
      id: 333444555,
      telegramId: 333444555,
      first_name: 'Cookie',
      last_name: 'Race',
      username: 'cookie_race',
      photo_url: '',
      role: 'USER',
      hash: 'jwt-auth'
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me')
    expect(store.user).toMatchObject({
      id: 333444555,
      telegramId: 333444555,
      first_name: 'Cookie',
      last_name: 'Race'
    })
  })
})
