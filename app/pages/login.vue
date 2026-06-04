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

onMounted(async () => {
  authStore.restoreFromStorage()

  if (isMiniApp.value) {
    widgetState.value = 'mini-app'
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (tgUser) {
      await authStore.loginFromMiniApp(tgUser)
      goAfterLogin()
    } else {
      widgetState.value = 'mini-app-error'
    }
    return
  }

  if (authStore.user) {
    goAfterLogin()
    return
  }

  if (isDev) {
    widgetState.value = 'ready'
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
  <div class="min-h-screen bg-[#fffdf9] flex flex-col items-center justify-center px-5 py-16">
    <!-- Logo -->
    <NuxtLink
      to="/"
      class="mb-10 flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-70"
    >
      <span class="grid size-8 place-items-center rounded-xl bg-[#14161f]">
        <UIcon name="i-ph-brain-fill" class="size-[17px] text-white" />
      </span>
      <span class="text-[20px] font-extrabold tracking-tight text-[#14161f]">Chayroom AI Club</span>
    </NuxtLink>

    <!-- Card -->
    <div class="w-full max-w-100 rounded-[28px] border border-[#e8e8e6] bg-white shadow-[0_4px_24px_rgba(20,22,31,0.07)]">
      <!-- Card header -->
      <div class="px-10 pt-11 pb-8 text-center max-md:px-7 max-md:pt-9">
        <div class="mb-6 grid size-14 place-items-center rounded-2xl bg-[#f0f5ff] mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-7"
            viewBox="0 0 24 24"
          >
            <path
              fill="#3480f1"
              d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-9.642-2.618q-1.458.607-5.831 2.513q-.711.282-.744.552c-.038.304.343.424.862.587l.218.07c.51.166 1.198.36 1.555.368q.486.01 1.084-.4q4.086-2.76 4.218-2.789c.063-.014.149-.032.207.02c.059.052.053.15.047.177c-.038.161-1.534 1.552-2.308 2.271q-.344.324-.683.653c-.474.457-.83.8.02 1.36c.861.568 1.73 1.134 2.57 1.733c.414.296.786.56 1.246.519c.267-.025.543-.276.683-1.026c.332-1.77.983-5.608 1.133-7.19a1.8 1.8 0 0 0-.017-.393a.42.42 0 0 0-.142-.27c-.12-.098-.305-.118-.387-.117c-.376.007-.953.207-3.73 1.362"
            />
          </svg>
        </div>

        <h1 class="text-[24px] font-extrabold tracking-tight text-[#14161f]">
          Telegram orqali kiring
        </h1>
        <p class="mt-2 text-[15px] leading-relaxed text-[#70707a]">
          Kurslar va qo'llanmalarga bir bosmada kirish
        </p>
      </div>

      <!-- Widget area -->
      <div class="px-10 max-md:px-7">
        <div
          id="telegram-widget-container"
          class="flex min-h-13 items-center justify-center"
        >
          <div
            v-if="widgetState === 'loading'"
            class="flex items-center gap-2 text-[14px] text-[#a0a0a8]"
          >
            <span class="size-4 rounded-full border-2 border-[#e0e0e4] border-t-[#3480f1] animate-spin" />
            Yuklanmoqda...
          </div>
          <div
            v-else-if="widgetState === 'missing-bot'"
            class="w-full rounded-2xl bg-[#f0f5ff] px-4 py-3 text-[13px] leading-relaxed text-[#3480f1]"
          >
            <span class="font-bold">NUXT_PUBLIC_TELEGRAM_BOT_USERNAME</span> ko'rsatilmagan.
          </div>
          <div
            v-else-if="widgetState === 'mini-app'"
            class="flex items-center gap-2 text-[14px] text-[#a0a0a8]"
          >
            <span class="size-4 rounded-full border-2 border-[#e0e0e4] border-t-[#3480f1] animate-spin" />
            Kirilmoqda...
          </div>
          <div
            v-else-if="widgetState === 'mini-app-error'"
            class="w-full rounded-2xl bg-red-50 px-4 py-3 text-[13px] text-red-600"
          >
            Telegramni yangilang va qaytadan kirging.
          </div>
        </div>

        <!-- Dev login -->
        <div v-if="isDev" class="mt-5 text-center">
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#c0c0c8]">
            dev only
          </p>
          <button
            class="w-full rounded-xl bg-[#14161f] px-5 py-3 text-[14px] font-bold text-white transition-opacity duration-200 hover:opacity-80"
            @click="authStore.devLogin(); goAfterLogin()"
          >
            Kirish (Dev)
          </button>
        </div>

        <!-- Switch account -->
        <div class="mt-5 text-center">
          <button
            class="text-[13px] text-[#a0a0a8] transition-colors duration-200 hover:text-[#14161f]"
            type="button"
            @click="mountTelegramWidget"
          >
            Boshqa akkaunt orqali kirish
          </button>
        </div>
      </div>

      <!-- Card footer -->
      <div class="mt-8 border-t border-[#f2f2f0] px-10 py-7 max-md:px-7">
        <p class="text-center text-[12px] leading-relaxed text-[#b8b8c0]">
          Faqat ism, rasm va Telegram ID olinadi. Boshqa ma'lumot so'ralmaydi.
        </p>
        <div class="mt-4 text-center">
          <a
            href="https://t.me/hellobehruz"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[13px] font-medium text-[#70707a] transition-colors duration-200 hover:text-[#3480f1]"
          >
            Tasdiqlash kelmayaptimi? Yozing
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
