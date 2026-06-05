export default defineNuxtRouteMiddleware(async (to) => {
  const { data } = await useFetch('/api/admin/me', { key: `admin-me-${to.path}` })
  if (!data.value || data.value.admin !== true) {
    return navigateTo('/admin/login')
  }
})
