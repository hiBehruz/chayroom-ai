export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  authStore.restoreFromStorage()

  if (!authStore.user) {
    return navigateTo('/login')
  }
})
