<!-- app/pages/login.vue -->
<script setup lang="ts">
const authStore = useAuthStore()
const isDev = import.meta.dev

if (authStore.user) {
  await navigateTo('/dashboard')
}

onMounted(() => {
  (window as any).onTelegramAuth = (user: any) => {
    authStore.login(user)
    navigateTo('/dashboard')
  }
})

useSeoMeta({ title: 'Войти — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white px-4">
    <div class="w-full max-w-[400px]">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2.5 mb-4">
          <div class="w-10 h-10 bg-cx-ink rounded-[10px] flex items-center justify-center">
            <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <span class="font-extrabold text-xl tracking-tight">Chayroom <span class="text-cx-blue">AI</span></span>
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight mb-2">Войди через Telegram</h1>
        <p class="text-sm text-cx-muted max-w-[300px] mx-auto leading-relaxed">
          Мы получаем только имя, аватар и Telegram ID для входа на сайт.
        </p>
      </div>

      <!-- Auth options -->
      <div class="flex flex-col items-center gap-5">
        <!-- Telegram widget placeholder (replace data-telegram-login with real bot name) -->
        <div id="telegram-widget-container" class="flex items-center justify-center min-h-[48px]">
          <p class="text-xs text-cx-faint">Telegram виджет загружается...</p>
        </div>

        <!-- Dev-only bypass -->
        <div v-if="isDev" class="text-center">
          <div class="text-xs text-cx-faint mb-2">— dev only —</div>
          <button
            class="px-5 py-2 rounded-full bg-cx-blue text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            @click="authStore.devLogin(); navigateTo('/dashboard')"
          >
            Dev login (mock)
          </button>
        </div>

        <p class="text-xs text-cx-faint text-center mt-2">
          Не приходит подтверждение?
          <a href="https://t.me/" target="_blank" class="text-cx-blue hover:underline">Написать в поддержку</a>
        </p>
      </div>
    </div>
  </div>
</template>
