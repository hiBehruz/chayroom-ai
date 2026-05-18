<!-- app/pages/login.vue -->
<script setup lang="ts">
declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void
    Telegram?: {
      WebApp?: {
        initData?: string
        ready?: () => void
        expand?: () => void
      }
    }
  }
}

const authStore = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()
const isDev = import.meta.dev
const telegramBotUsername = computed(() => config.public.telegramBotUsername)
const widgetState = ref<'loading' | 'ready' | 'missing-bot' | 'mini-app'>('loading')
const selectedPlan = computed(() => typeof route.query.plan === 'string' ? route.query.plan : '')

if (authStore.user) {
  await navigateTo('/dashboard')
}

function goToDashboard() {
  const query = selectedPlan.value ? { plan: selectedPlan.value } : undefined
  return navigateTo({ path: '/dashboard', query })
}

function loginWithTelegram(user: TelegramUser) {
  authStore.login(user)
  goToDashboard()
}

function mountTelegramWidget() {
  const container = document.querySelector('#telegram-widget-container')
  if (!container) return

  if (!telegramBotUsername.value) {
    widgetState.value = 'missing-bot'
    return
  }

  container.innerHTML = ''

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', telegramBotUsername.value)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-radius', '12')
  script.setAttribute('data-userpic', 'true')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', 'onTelegramAuth(user)')
  container.appendChild(script)
  widgetState.value = 'ready'
}

onMounted(() => {
  authStore.restoreFromStorage()

  if (authStore.user) {
    goToDashboard()
    return
  }

  const initData = window.Telegram?.WebApp?.initData
  if (initData) {
    window.Telegram?.WebApp?.ready?.()
    window.Telegram?.WebApp?.expand?.()
    widgetState.value = 'mini-app'
    return
  }

  window.onTelegramAuth = loginWithTelegram
  mountTelegramWidget()
})

onUnmounted(() => {
  delete window.onTelegramAuth
})

useSeoMeta({ title: 'Войти — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F8F8FA] px-4 py-10">
    <div class="w-full max-w-[420px] rounded-[28px] border border-cx-line bg-white px-7 py-8 shadow-card">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2.5 mb-4">
          <div class="w-10 h-10 bg-cx-ink rounded-[10px] flex items-center justify-center">
            <svg
              class="w-6 h-6 fill-white"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
              />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <span class="font-extrabold text-xl tracking-tight">Chayroom <span class="text-cx-blue">AI</span></span>
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight mb-2">
          Войди через Telegram
        </h1>
        <p class="text-sm text-cx-muted max-w-[300px] mx-auto leading-relaxed">
          Мы получаем только имя, аватар и Telegram ID для входа на сайт.
        </p>
      </div>

      <div class="flex flex-col items-center gap-5">
        <div
          id="telegram-widget-container"
          class="flex min-h-[48px] items-center justify-center"
        >
          <p
            v-if="widgetState === 'loading'"
            class="text-xs text-cx-faint"
          >
            Telegram виджет загружается...
          </p>
          <div
            v-else-if="widgetState === 'missing-bot'"
            class="rounded-2xl bg-cx-blue-soft px-4 py-3 text-center text-sm text-cx-blue"
          >
            Укажите <span class="font-semibold">NUXT_PUBLIC_TELEGRAM_BOT_USERNAME</span>, чтобы включить Telegram Login Widget.
          </div>
          <div
            v-else-if="widgetState === 'mini-app'"
            class="rounded-2xl bg-cx-blue-soft px-4 py-3 text-center text-sm text-cx-blue"
          >
            Telegram Mini App обнаружен. Подключение к backend-авторизации будет использовать signed init data.
          </div>
        </div>

        <div
          v-if="isDev"
          class="text-center"
        >
          <div class="text-xs text-cx-faint mb-2">
            — dev only —
          </div>
          <button
            class="px-5 py-2 rounded-full bg-cx-blue text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            @click="authStore.devLogin(); goToDashboard()"
          >
            Dev login (mock)
          </button>
        </div>

        <p class="text-xs text-cx-faint text-center mt-2">
          Не приходит подтверждение?
          <a
            href="https://t.me/"
            target="_blank"
            class="text-cx-blue hover:underline"
          >Написать в поддержку</a>
        </p>
      </div>
    </div>
  </div>
</template>
