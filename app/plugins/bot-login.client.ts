export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  if (authStore.user) return

  const token =
    localStorage.getItem('bot_login_token') ||
    sessionStorage.getItem('bot_login_token')
  if (!token) return

  const route = useRoute()
  if (route.path === '/login') return  // login page handles its own polling

  try {
    const res = await $fetch<{ status: string }>('/api/auth/bot-login/status', {
      query: { token }
    })

    if (res.status === 'authenticated') {
      localStorage.removeItem('bot_login_token')
      sessionStorage.removeItem('bot_login_token')
      await authStore.syncMe()
    } else if (res.status === 'expired') {
      localStorage.removeItem('bot_login_token')
      sessionStorage.removeItem('bot_login_token')
    }
  } catch {}
})
