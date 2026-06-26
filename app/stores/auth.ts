interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

export interface TelegramUser {
  id: number
  telegramId?: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  role?: 'USER' | 'ADMIN'
  auth_date?: number
  hash: string
  hasSubscription?: boolean
}

export type AgentVariant = 'auto' | 'male' | 'female'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<TelegramUser | null>(null)
  const isRestored = ref(false)
  const userCookie = useCookie<TelegramUser | null>('cx-user', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })
  const hasSubscription = ref(false)
  const subscriptionPeriod = ref<string | null>(null)
  const subscriptionExpiresAt = ref<string | null>(null)
  const subscriptionCancelled = ref(false)
  const subCookie = useCookie<boolean | null>('cx-sub', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })
  const agentVariantCookie = useCookie<AgentVariant | null>('cx-agent-variant', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })
  const agentVariant = ref<AgentVariant>(agentVariantCookie.value ?? 'auto')
  const femaleNameHints = [
    'aziza', 'madina', 'malika', 'nigora', 'nargiza', 'dilnoza', 'shahnoza',
    'gulnora', 'guli', 'sevara', 'mohira', 'zebo', 'shahina', 'lola',
    'munisa', 'farida', 'dilfuza', 'mavluda', 'umida', 'nilufar'
  ]

  const OWNER_TELEGRAM_ID = 6781623829

  const isOwner = computed(() =>
    !!user.value && Number(user.value.telegramId ?? user.value.id) === OWNER_TELEGRAM_ID
  )

  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  const displayName = computed(() => {
    if (!user.value) return ''
    return [user.value.first_name, user.value.last_name].filter(Boolean).join(' ')
  })

  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
  })

  const resolvedAgentVariant = computed<'male' | 'female'>(() => {
    if (agentVariant.value !== 'auto') return agentVariant.value

    const name = user.value?.first_name?.toLowerCase() ?? ''
    return femaleNameHints.some(hint => name.includes(hint)) ? 'female' : 'male'
  })

  const daysLeft = computed(() => {
    if (!subscriptionExpiresAt.value) return null
    const ms = new Date(subscriptionExpiresAt.value).getTime() - Date.now()
    return Math.max(0, Math.ceil(ms / 86_400_000))
  })

  const tariffLabel = computed(() => {
    if (!subscriptionPeriod.value) return null
    const map: Record<string, string> = {
      'monthly': 'AI Room Club — 1 oy',
      '3month': 'AI Room Club — 3 oy',
      '6month': 'AI Room Club — 6 oy'
    }
    return map[subscriptionPeriod.value] ?? 'AI Room Club'
  })

  function setUserSession(telegramUser: TelegramUser) {
    user.value = {
      ...telegramUser,
      telegramId: telegramUser.telegramId ?? telegramUser.id
    }
    userCookie.value = user.value
  }

  async function syncMe(options: { clearOnMissing?: boolean } = {}) {
    if (!import.meta.client) return
    const clearOnMissing = options.clearOnMissing ?? true
    try {
      const res = await $fetch<{
        user: {
          id: number
          telegramId: number
          firstName: string
          lastName: string | null
          username: string | null
          photoUrl: string | null
          role: 'USER' | 'ADMIN'
        } | null
        hasSubscription: boolean
        subscription: { period: string | null, expiresAt: string, cancelledAt: string | null } | null
      }>('/api/auth/me')

      if (!res.user) {
        if (clearOnMissing) {
          logout()
        }
        return
      }

      setUserSession({
        id: res.user.telegramId,
        telegramId: res.user.telegramId,
        first_name: res.user.firstName || user.value?.first_name || '',
        last_name: res.user.lastName ?? undefined,
        username: res.user.username ?? undefined,
        photo_url: res.user.photoUrl ?? undefined,
        role: res.user.role,
        hash: user.value?.hash ?? 'session'
      })

      if (res.hasSubscription) {
        activateSubscription(res.subscription
          ? { period: res.subscription.period, expiresAt: res.subscription.expiresAt, cancelledAt: res.subscription.cancelledAt }
          : undefined)
      } else {
        clearSubscription()
      }
    } catch {
      // silent — leave existing state
    }
  }

  async function login(telegramUser: TelegramUser) {
    if (!import.meta.client) return

    // JWT OAuth login - user allaqachon server'da verify qilingan
    // Faqat client state'ni yangilaymiz, yana API so'rov yubormaymiz
    if (telegramUser.hash === 'jwt-auth') {
      setUserSession(telegramUser)
      // Subscription holatini user object'dan olamiz
      if (telegramUser.hasSubscription) {
        activateSubscription()
      } else {
        hasSubscription.value = false
        subCookie.value = null
      }
      await syncMe({ clearOnMissing: false })
      return
    }

    // Telegram Widget login - eski usul
    try {
      const res = await $fetch<{
        user: { id: number, telegramId: number, firstName: string, lastName: string | null, username: string | null, photoUrl: string | null, role: 'USER' | 'ADMIN' }
        hasSubscription: boolean
      }>('/api/auth/telegram', {
        method: 'POST',
        body: {
          id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          photo_url: telegramUser.photo_url,
          auth_date: telegramUser.auth_date,
          hash: telegramUser.hash
        }
      })
      if (res?.user) {
        setUserSession({
          id: res.user.telegramId,
          telegramId: res.user.telegramId,
          first_name: res.user.firstName,
          last_name: res.user.lastName ?? undefined,
          username: res.user.username ?? undefined,
          photo_url: res.user.photoUrl ?? undefined,
          role: res.user.role,
          hash: 'session'
        })
      }
      if (res?.hasSubscription) {
        activateSubscription()
      } else {
        hasSubscription.value = false
        subCookie.value = null
      }
    } catch {
      return
    }
  }

  function activateSubscription(data?: { period?: string | null, expiresAt?: string | null, cancelledAt?: string | null }) {
    hasSubscription.value = true
    subCookie.value = true
    if (data) {
      subscriptionPeriod.value = data.period ?? null
      subscriptionExpiresAt.value = data.expiresAt ?? null
      subscriptionCancelled.value = !!data.cancelledAt
    }
  }

  function setAgentVariant(variant: AgentVariant) {
    agentVariant.value = variant
    agentVariantCookie.value = variant
  }

  function clearSubscription() {
    hasSubscription.value = false
    subCookie.value = null
    subscriptionPeriod.value = null
    subscriptionExpiresAt.value = null
    subscriptionCancelled.value = false
  }

  async function logout() {
    user.value = null
    userCookie.value = null
    clearSubscription()
    if (import.meta.client) {
      await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
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
    }
  }

  function devLogin() {
    if (!import.meta.dev) return
    void login({
      id: 6781623829,
      first_name: 'Behruz',
      last_name: 'Zaripov',
      username: 'behruzzaripov',
      photo_url: '',
      hash: 'dev'
    })
  }

  async function loginFromMiniApp(tgUser: TelegramWebAppUser) {
    if (!import.meta.client) return

    if (import.meta.dev) {
      await login({
        id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        username: tgUser.username,
        photo_url: tgUser.photo_url,
        hash: 'dev'
      })
      return
    }

    const initData = window.Telegram?.WebApp?.initData
    if (!initData) return

    try {
      const res = await $fetch<{
        user: { id: number, telegramId: number, firstName: string, lastName: string | null, username: string | null, photoUrl: string | null, role: 'USER' | 'ADMIN' }
        hasSubscription: boolean
      }>('/api/auth/telegram-webapp', {
        method: 'POST',
        body: { initData }
      })
      if (res?.user) {
        setUserSession({
          id: res.user.telegramId,
          telegramId: res.user.telegramId,
          first_name: res.user.firstName,
          last_name: res.user.lastName ?? undefined,
          username: res.user.username ?? undefined,
          photo_url: res.user.photoUrl ?? undefined,
          role: res.user.role,
          hash: 'session'
        })
      }
      if (res?.hasSubscription) {
        activateSubscription()
      } else {
        hasSubscription.value = false
        subCookie.value = null
      }
    } catch {
      return
    }
  }

  return {
    user,
    hasSubscription,
    subscriptionPeriod,
    subscriptionExpiresAt,
    subscriptionCancelled,
    daysLeft,
    tariffLabel,
    isOwner,
    isAdmin,
    agentVariant,
    resolvedAgentVariant,
    displayName,
    initials,
    login,
    loginFromMiniApp,
    activateSubscription,
    clearSubscription,
    setUserSession,
    syncMe,
    setAgentVariant,
    logout,
    restoreFromStorage,
    devLogin
  }
})
