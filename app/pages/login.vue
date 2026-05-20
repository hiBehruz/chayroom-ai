<!-- app/pages/login.vue -->
<script setup lang="ts">
declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void
  }
}

const authStore = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()
const { isMiniApp } = useTelegramApp()
const isDev = import.meta.dev
const telegramBotUsername = computed(() => config.public.telegramBotUsername)
const widgetState = ref<'loading' | 'ready' | 'missing-bot' | 'mini-app' | 'mini-app-error'>('loading')
const selectedPlan = computed(() => typeof route.query.plan === 'string' ? route.query.plan : '')
const redirectPath = computed(() => typeof route.query.redirect === 'string' ? route.query.redirect : '')

if (authStore.user) {
  await navigateTo(redirectPath.value || '/dashboard')
}

function goAfterLogin() {
  if (redirectPath.value) return navigateTo(redirectPath.value)
  const query = selectedPlan.value ? { plan: selectedPlan.value } : undefined
  return navigateTo({ path: '/dashboard', query })
}

function loginWithTelegram(user: TelegramUser) {
  authStore.login(user)
  goAfterLogin()
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
    goAfterLogin()
    return
  }

  if (isMiniApp.value) {
    widgetState.value = 'mini-app'
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (tgUser) {
      authStore.loginFromMiniApp(tgUser)
      goAfterLogin()
    } else {
      widgetState.value = 'mini-app-error'
    }
    return
  }

  window.onTelegramAuth = loginWithTelegram
  mountTelegramWidget()
})

onUnmounted(() => {
  delete window.onTelegramAuth
})

useSeoMeta({ title: 'Kirish — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen bg-white px-4 py-10">
    <div class="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[440px] flex-col items-center justify-center">
      <NuxtLink
        to="/"
        class="mb-14 inline-flex items-center gap-3 text-[#1f1f22] transition-opacity duration-200 hover:opacity-75"
      >
        <div class="grid size-7 place-items-center border border-[#c9c9ce] bg-white text-[15px] font-extrabold leading-none text-[#1f1f22]">
          [
        </div>
        <span class="text-[22px] font-extrabold tracking-tight">AI Room Club</span>
      </NuxtLink>

      <div class="w-full rounded-[26px] border border-[#dedee2] bg-white px-10 py-11 max-md:px-6 max-md:py-8 text-center">
        <h1 class="mb-8 text-[25px] font-extrabold tracking-tight text-[#242428]">
          Войди через Telegram
        </h1>

        <div
          id="telegram-widget-container"
          class="flex min-h-[48px] items-center justify-center"
        >
          <p
            v-if="widgetState === 'loading'"
            class="text-sm text-cx-faint"
          >
            Telegram загружается...
          </p>
          <div
            v-else-if="widgetState === 'missing-bot'"
            class="rounded-2xl bg-cx-blue-soft px-4 py-3 text-sm leading-relaxed text-cx-blue"
          >
            Укажите <span class="font-semibold">NUXT_PUBLIC_TELEGRAM_BOT_USERNAME</span>, чтобы включить Telegram Login Widget.
          </div>
          <div
            v-else-if="widgetState === 'mini-app'"
            class="rounded-2xl bg-cx-blue-soft px-4 py-3 text-sm leading-relaxed text-cx-blue"
          >
            Kirilmoqda...
          </div>
          <div
            v-else-if="widgetState === 'mini-app-error'"
            class="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-600"
          >
            Telegramni yangilang
          </div>
        </div>

        <div
          v-if="isDev"
          class="mt-5 text-center"
        >
          <div class="mb-2 text-xs text-cx-faint">
            — dev only —
          </div>
          <button
            class="btn-primary btn-primary-dark px-5! py-2! text-sm"
            @click="authStore.devLogin(); goAfterLogin()"
          >
            Dev login (mock)
          </button>
        </div>

        <button
          class="mt-7 text-[14px] font-medium text-[#707078] transition-colors duration-200 hover:text-cx-ink"
          type="button"
          @click="mountTelegramWidget"
        >
          Войти через другой аккаунт
        </button>

        <p class="mx-auto mt-8 max-w-[330px] text-[15px] leading-7 text-[#707078]">
          Мы получаем только имя, аватар и Telegram ID
          <br>
          для входа на сайт.
        </p>

        <div class="mt-8 border-t border-[#e8e8eb] pt-8">
          <a
            href="https://t.me/hellobehruz"
            target="_blank"
            class="text-[15px] font-medium text-[#707078] transition-colors duration-200 hover:text-cx-blue"
          >
            Не приходит подтверждение?
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
