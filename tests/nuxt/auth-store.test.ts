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
