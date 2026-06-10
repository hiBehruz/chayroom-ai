<!-- app/pages/auth/callback.vue -->
<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    await navigateTo('/login?error=invalid')
    return
  }

  try {
    const res = await $fetch<{
      user: { id: number, telegramId: number, firstName: string, lastName: string | null, username: string | null, photoUrl: string | null, role: 'USER' | 'ADMIN' }
      hasSubscription: boolean
      subscription: { period: string | null, expiresAt: string, cancelledAt: string | null } | null
    }>('/api/auth/bot-callback', { method: 'POST', body: { token } })

    authStore.setUserSession({
      id: res.user.telegramId,
      telegramId: res.user.telegramId,
      first_name: res.user.firstName,
      last_name: res.user.lastName ?? undefined,
      username: res.user.username ?? undefined,
      photo_url: res.user.photoUrl ?? undefined,
      role: res.user.role,
      hash: 'session'
    })

    if (res.hasSubscription) {
      authStore.activateSubscription(res.subscription
        ? { period: res.subscription.period, expiresAt: res.subscription.expiresAt, cancelledAt: res.subscription.cancelledAt }
        : undefined)
    } else {
      authStore.clearSubscription()
    }

    await navigateTo('/')
  } catch {
    await navigateTo('/login?error=expired')
  }
})

useSeoMeta({ title: 'Kirish — Chayroom AI' })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#fffdf9] px-5">
    <div class="flex items-center gap-2 text-[14px] text-[#a0a0a8]">
      <span class="size-4 animate-spin rounded-full border-2 border-[#e0e0e4] border-t-[#3480f1]" />
      Kirilmoqda...
    </div>
  </div>
</template>
