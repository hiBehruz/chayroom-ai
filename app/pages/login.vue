<!-- app/pages/login.vue -->
<script setup lang="ts">
import {
  buildBotLoginStartRequest,
  clearPendingBotLoginToken,
  resolvePendingBotLoginToken,
  resolvePostLoginTarget,
  storePendingBotLoginToken
} from '../utils/login-flow.mjs'

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
const appHostname = computed(() => {
  try {
    return new URL(config.public.appUrl).hostname
  } catch {
    return ''
  }
})
const currentHostname = computed(() => import.meta.client ? window.location.hostname : '')
const canUseTelegramWidget = computed(() => {
  if (!import.meta.client) return false
  if (!appHostname.value) return true
  return currentHostname.value === appHostname.value
})
const widgetState = ref<'loading' | 'ready' | 'missing-bot' | 'mini-app' | 'mini-app-error'>('loading')
const botPollState = ref<'idle' | 'opening' | 'waiting'>('idle')
const botTelegramUrl = ref('')
const botLinkExpired = ref(false)
const authError = ref('')
const selectedPlan = computed(() => typeof route.query.plan === 'string' ? route.query.plan : '')
const redirectPath = computed(() => typeof route.query.redirect === 'string' ? route.query.redirect : '')
const queryBotToken = computed(() => typeof route.query.botToken === 'string' ? route.query.botToken : '')
let botPollTimer: number | null = null
let activePollToken = ''

function goAfterLogin() {
  return navigateTo(resolvePostLoginTarget(selectedPlan.value, redirectPath.value))
}

function stopBotPoll() {
  if (botPollTimer) {
    window.clearTimeout(botPollTimer)
    botPollTimer = null
  }
  botPollState.value = 'idle'
  botTelegramUrl.value = ''
  activePollToken = ''
}

function resetBotState() {
  botLinkExpired.value = false
  stopBotPoll()
}

async function loginWithTelegram(user: TelegramUser) {
  await authStore.login(user)
  if (authStore.user) {
    goAfterLogin()
    return
  }

  authError.value = 'Kirish amalga oshmadi. Qaytadan urinib ko\'ring.'
}

async function pollBotLoginStatus(token: string) {
  activePollToken = token
  try {
    const res = await $fetch<{ status: 'pending' | 'expired' | 'authenticated' }>('/api/auth/bot-login/status', {
      query: { token }
    })

    if (res.status === 'authenticated') {
      clearPendingBotLoginToken({ sessionStorage, localStorage })
      stopBotPoll()
      await authStore.syncMe()
      await goAfterLogin()
      return
    }

    if (res.status === 'expired') {
      clearPendingBotLoginToken({ sessionStorage, localStorage })
      botLinkExpired.value = true
      stopBotPoll()
      return
    }
  } catch {
    if (activePollToken !== token) return
  }

  botPollTimer = window.setTimeout(() => {
    void pollBotLoginStatus(token)
  }, 1500)
}

async function loginViaBot() {
  authError.value = ''
  clearPendingBotLoginToken({ sessionStorage, localStorage })
  resetBotState()
  botPollState.value = 'opening'

  try {
    const request = buildBotLoginStartRequest()
    const res = await $fetch<{ url: string, tgUrl: string, token: string }>(request.url, request.options)

    if (import.meta.client) {
      storePendingBotLoginToken({ sessionStorage, localStorage }, res.token)
      botTelegramUrl.value = res.url
      botPollState.value = 'waiting'
      void pollBotLoginStatus(res.token)
      // tg:// opens Telegram app without navigating the browser tab away
      window.location.href = res.tgUrl
    }
  } catch {
    stopBotPoll()
    authError.value = 'Bot orqali kirishda xatolik yuz berdi. Qaytadan urinib ko\'ring.'
  }
}

function mountTelegramWidget() {
  const container = document.querySelector('#telegram-widget-container')
  if (!container) return

  if (!telegramBotUsername.value) {
    widgetState.value = 'missing-bot'
    authError.value = 'Telegram bot username topilmadi.'
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
  script.setAttribute('data-auth-url', window.location.href.split('?')[0] || window.location.href)
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
      if (authStore.user) {
        goAfterLogin()
      } else {
        widgetState.value = 'mini-app-error'
      }
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
      hash: String(q.hash)
    })
    return
  }

  window.onTelegramAuth = loginWithTelegram

  // Auto-mount Telegram widget (no button click needed)
  if (canUseTelegramWidget.value) {
    mountTelegramWidget()
  }

  const resumePendingBotLogin = () => {
    const savedToken = resolvePendingBotLoginToken({
      queryToken: queryBotToken.value,
      sessionStorage,
      localStorage
    })
    if (savedToken && !authStore.user) {
      storePendingBotLoginToken({ sessionStorage, localStorage }, savedToken)
      botPollState.value = 'waiting'
      void pollBotLoginStatus(savedToken)
    }
  }

  // Fresh page load: check for pending token
  resumePendingBotLogin()

  // bfcache restore (iOS back button): onMounted doesn't re-run, pageshow does
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) resumePendingBotLogin()
  })

  // Switching back from Telegram app: resume suspended polling immediately
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    resumePendingBotLogin()
    if (botPollState.value === 'waiting' && activePollToken) {
      if (botPollTimer) {
        window.clearTimeout(botPollTimer)
        botPollTimer = null
      }
      void pollBotLoginStatus(activePollToken)
    }
  })
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
      :prefetch="false"
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

        <!-- Primary: Telegram widget (auto-mounted) -->
        <div
          id="telegram-widget-container"
          class="mt-3 flex min-h-13 items-center justify-center"
        />

        <!-- Expired: light-blue renew button -->
        <button
          v-if="botLinkExpired"
          type="button"
          class="mt-3 flex w-full items-center justify-center rounded-xl bg-[#e8f2fe] px-4 py-3 text-[14px] font-semibold text-[#3480f1] transition-colors hover:bg-[#dce9fd]"
          @click="loginViaBot"
        >
          Havola muddati tugadi — yangilash
        </button>

        <!-- Bot button -->
        <template v-else>
          <button
            type="button"
            class="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#229ED9] px-4 py-3 text-[14px] font-semibold text-white transition-all duration-150 hover:bg-[#1e90c4] active:scale-[0.98] disabled:opacity-60"
            :disabled="botPollState === 'opening'"
            @click="loginViaBot"
          >
            <UIcon
              name="i-simple-icons-telegram"
              class="size-4"
            />
            Telegram bot orqali kirish
          </button>

          <div
            v-if="botPollState === 'waiting'"
            class="mt-2.5 flex items-center justify-center gap-2 text-[13px] text-[#6f7480]"
          >
            <span class="size-3.5 shrink-0 rounded-full border-2 border-[#e0e0e4] border-t-[#229ED9] animate-spin" />
            Bot tasdig'ini kutmoqda...
          </div>
        </template>

        <p
          v-if="authError"
          class="mt-3 text-center text-[13px] leading-5 text-red-600"
        >
          {{ authError }}
        </p>
      </div>

      <div class="mt-8 pb-8" />
    </div>
  </div>
</template>
