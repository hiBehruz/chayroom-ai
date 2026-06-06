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
const telegramBotUsername = computed(() => config.public.telegramBotUsername)
const widgetState = ref<'loading' | 'ready' | 'missing-bot' | 'mini-app' | 'mini-app-error'>('loading')
const selectedPlan = computed(() => typeof route.query.plan === 'string' ? route.query.plan : '')
const redirectPath = computed(() => typeof route.query.redirect === 'string' ? route.query.redirect : '')

function goAfterLogin() {
  if (redirectPath.value) return navigateTo(redirectPath.value)
  const query = selectedPlan.value ? { plan: selectedPlan.value } : undefined
  return navigateTo({ path: '/dashboard', query })
}

async function loginWithTelegram(user: TelegramUser) {
  await authStore.login(user)
  goAfterLogin()
}

const botLoginState = ref<'idle' | 'waiting'>('idle')
const botPollState = ref<'idle' | 'waiting'>('idle')
let botPollTimer: ReturnType<typeof setInterval> | null = null

function stopBotPoll() {
  if (botPollTimer) {
    clearInterval(botPollTimer)
    botPollTimer = null
  }
}

async function loginViaBot() {
  if (botLoginState.value === 'waiting') return
  botLoginState.value = 'waiting'
  try {
    const { botId, url } = await $fetch<{ token: string, botId: string, url: string }>('/api/auth/bot-login/start', { method: 'POST' })
    if (botId) {
      const origin = encodeURIComponent(window.location.origin)
      const returnTo = encodeURIComponent(window.location.href)
      window.location.href = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${origin}&embed=0&request_access=write&return_to=${returnTo}`
    }
    else {
      window.open(url, '_blank')
      botLoginState.value = 'idle'
    }
  }
  catch {
    botLoginState.value = 'idle'
  }
}

async function loginViaBotPolling() {
  if (botPollState.value === 'waiting') return
  try {
    const { token, url } = await $fetch<{ token: string, botId: string, url: string }>('/api/auth/bot-login/start', { method: 'POST' })
    window.open(url, '_blank')
    botPollState.value = 'waiting'
    const startedAt = Date.now()
    botPollTimer = setInterval(async () => {
      if (Date.now() - startedAt > 5 * 60 * 1000) {
        stopBotPoll()
        botPollState.value = 'idle'
        return
      }
      try {
        const res = await $fetch<{ status: string }>('/api/auth/bot-login/status', { params: { token } })
        if (res.status === 'authenticated') {
          stopBotPoll()
          await authStore.syncMe()
          goAfterLogin()
        }
        else if (res.status === 'expired') {
          stopBotPoll()
          botPollState.value = 'idle'
        }
      }
      catch { /* keep polling */ }
    }, 2000)
  }
  catch {
    botPollState.value = 'idle'
  }
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

  // Handle Telegram OAuth redirect callback (id + hash in URL params)
  const q = route.query
  if (q.id && q.hash) {
    await loginWithTelegram({
      id: Number(q.id),
      first_name: String(q.first_name || ''),
      last_name: q.last_name ? String(q.last_name) : undefined,
      username: q.username ? String(q.username) : undefined,
      photo_url: q.photo_url ? String(q.photo_url) : undefined,
      auth_date: Number(q.auth_date || 0),
      hash: String(q.hash),
    })
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
  stopBotPoll()
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
        <UIcon
          name="i-ph-brain-fill"
          class="size-[17px] text-white"
        />
      </span>
      <span class="text-[20px] font-extrabold tracking-tight text-[#14161f]">Chayroom AI Club</span>
    </NuxtLink>

    <!-- Card -->
    <div class="w-full max-w-100 rounded-[28px] border border-[#e8e8e6] bg-white shadow-[0_4px_24px_rgba(20,22,31,0.07)]">
      <div class="px-10 pt-10 pb-6 text-center max-md:px-7">
        <h1 class="text-[24px] font-extrabold tracking-tight text-[#14161f]">
          Kirish
        </h1>
      </div>

      <div class="px-10 max-md:px-7">
        <!-- Mini-app states -->
        <div
          v-if="widgetState === 'mini-app'"
          class="flex min-h-13 items-center justify-center gap-2 text-[14px] text-[#a0a0a8]"
        >
          <span class="size-4 rounded-full border-2 border-[#e0e0e4] border-t-[#3480f1] animate-spin" />
          Kirilmoqda...
        </div>
        <div
          v-else-if="widgetState === 'mini-app-error'"
          class="mb-4 w-full rounded-2xl bg-red-50 px-4 py-3 text-[13px] text-red-600"
        >
          Telegramni yangilang va qaytadan kirging.
        </div>

        <!-- Primary: Telegram OAuth (phone number flow) -->
        <button
          type="button"
          class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3480f1] px-5 py-3 text-[15px] font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
          :disabled="botLoginState === 'waiting'"
          @click="loginViaBot"
        >
          <UIcon
            :name="botLoginState === 'waiting' ? 'i-lucide-loader-circle' : 'i-lucide-send'"
            :class="['size-4.5', botLoginState === 'waiting' ? 'animate-spin' : '']"
          />
          {{ botLoginState === 'waiting' ? 'Yo\'naltirilmoqda…' : 'Telegram orqali kirish' }}
        </button>

        <!-- Secondary: Bot deep link + polling -->
        <button
          type="button"
          class="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8e8e6] bg-white px-5 py-3 text-[15px] font-semibold text-[#14161f] transition-all duration-200 hover:bg-[#f5f5f3] active:scale-[0.98] disabled:opacity-70"
          :disabled="botPollState === 'waiting'"
          @click="loginViaBotPolling"
        >
          <UIcon
            :name="botPollState === 'waiting' ? 'i-lucide-loader-circle' : 'i-lucide-bot'"
            :class="['size-4.5', botPollState === 'waiting' ? 'animate-spin' : '']"
          />
          {{ botPollState === 'waiting' ? 'Telegram\'da tasdiqlang…' : 'Войти через Telegram Бота' }}
        </button>

      </div>

      <div class="mt-8 pb-8" />
    </div>
  </div>
</template>
