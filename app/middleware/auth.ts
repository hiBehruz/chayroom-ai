export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  authStore.restoreFromStorage()

  if (!authStore.user) {
    const query: Record<string, string> = { redirect: to.path }
    if (to.query.miniapp === '1') query.miniapp = '1'
    return navigateTo({ path: '/login', query })
  }
})
