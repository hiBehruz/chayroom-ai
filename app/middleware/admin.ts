export default defineNuxtRouteMiddleware(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  if (!authStore.user) return navigateTo('/login')

  const userId = String(authStore.user.telegramId ?? authStore.user.id)
  const adminId = String(config.public.adminTelegramId)

  if (userId !== adminId) throw createError({ statusCode: 404, fatal: true })
})
