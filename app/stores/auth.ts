export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  hash: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<TelegramUser | null>(null)

  function login(telegramUser: TelegramUser) {
    user.value = telegramUser
    if (import.meta.client) {
      localStorage.setItem('cx-user', JSON.stringify(telegramUser))
    }
  }

  function logout() {
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('cx-user')
    }
  }

  function restoreFromStorage() {
    if (!import.meta.client) return
    const stored = localStorage.getItem('cx-user')
    if (stored) {
      try { user.value = JSON.parse(stored) }
      catch { localStorage.removeItem('cx-user') }
    }
  }

  function devLogin() {
    if (!import.meta.dev) return
    login({
      id: 123456789,
      first_name: 'Behruz',
      last_name: 'Zaripov',
      username: 'behruzz',
      photo_url: '',
      hash: 'dev'
    })
  }

  return { user, login, logout, restoreFromStorage, devLogin }
})
