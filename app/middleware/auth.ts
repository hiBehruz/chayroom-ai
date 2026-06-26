export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  authStore.restoreFromStorage()

  if (!authStore.user) {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    const me = await $fetch<{
      user: {
        telegramId: number
        firstName: string
        lastName: string | null
        username: string | null
        photoUrl: string | null
        role: 'USER' | 'ADMIN'
      } | null
      hasSubscription: boolean
      subscription: { period: string | null, expiresAt: string, cancelledAt: string | null } | null
    }>('/api/auth/me', { headers }).catch(() => null)

    if (me?.user) {
      authStore.setUserSession({
        id: me.user.telegramId,
        telegramId: me.user.telegramId,
        first_name: me.user.firstName,
        last_name: me.user.lastName ?? undefined,
        username: me.user.username ?? undefined,
        photo_url: me.user.photoUrl ?? undefined,
        role: me.user.role,
        hash: 'session'
      })
      if (me.hasSubscription) {
        authStore.activateSubscription(me.subscription ?? undefined)
      } else {
        authStore.clearSubscription()
      }
    }
  }

  if (!authStore.user) {
    const query: Record<string, string> = { redirect: to.path }
    if (to.query.miniapp === '1') query.miniapp = '1'
    return navigateTo({ path: '/login', query })
  }
})
