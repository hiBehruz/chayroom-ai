export interface TelegramUser {
  id: number
  telegramId?: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  hash: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<TelegramUser | null>(null)
  const isRestored = ref(false)
  const userCookie = useCookie<TelegramUser | null>('cx-user', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })
  const hasSubscription = ref(false)
  const subCookie = useCookie<boolean | null>('cx-sub', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })

  const displayName = computed(() => {
    if (!user.value) return ''
    return [user.value.first_name, user.value.last_name].filter(Boolean).join(' ')
  })

  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
  })

  function login(telegramUser: TelegramUser) {
    user.value = {
      ...telegramUser,
      telegramId: telegramUser.telegramId ?? telegramUser.id
    }
    userCookie.value = user.value
    if (import.meta.client) {
      localStorage.setItem('cx-user', JSON.stringify(user.value))
    }
  }

  function activateSubscription() {
    hasSubscription.value = true
    subCookie.value = true
  }

  function logout() {
    user.value = null
    userCookie.value = null
    hasSubscription.value = false
    subCookie.value = null
    if (import.meta.client) {
      localStorage.removeItem('cx-user')
    }
  }

  function restoreFromStorage() {
    if (isRestored.value) return
    isRestored.value = true

    if (subCookie.value) {
      hasSubscription.value = true
    }

    if (userCookie.value) {
      user.value = {
        ...userCookie.value,
        telegramId: userCookie.value.telegramId ?? userCookie.value.id
      }
      return
    }

    if (!import.meta.client) return

    const stored = localStorage.getItem('cx-user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TelegramUser
        user.value = {
          ...parsed,
          telegramId: parsed.telegramId ?? parsed.id
        }
        userCookie.value = user.value
      } catch { localStorage.removeItem('cx-user') }
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

  return { user, hasSubscription, displayName, initials, login, activateSubscription, logout, restoreFromStorage, devLogin }
})
