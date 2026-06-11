<!-- app/pages/login.vue -->
<script setup lang="ts">
import type { TelegramUser } from '~/stores/auth'
import { resolveLoginMountAction, resolvePostLoginTarget } from '~/utils/login-flow.mjs'

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
const authError = ref('')
// Bot login (one-step polling flow):
// 1. POST /start creates a pending token + deep link (t.me/bot?start=auth_TOKEN)
// 2. user opens the bot and presses START -> bot authenticates the token
// 3. this tab polls /status and, once authenticated, the server sets the session
//    cookie in THIS browser and we advance. No second link to click, so the
//    session lands in the original browser (not a Telegram in-app webview).
const botState = ref<'idle' | 'waiting' | 'expired'>('idle')
const botLoginUrl = ref('')
let botToken = ''
let botPollTimer: ReturnType<typeof setInterval> | null = null

function stopBotPoll() {
  if (botPollTimer) {
    clearInterval(botPollTimer)
    botPollTimer = null
  }
}

async function pollBotStatus() {
  if (!botToken) return
  try {
    const res = await $fetch<{
      status: 'pending' | 'authenticated' | 'expired'
      user?: { telegramId: number, firstName: string, lastName: string | null, username: string | null, photoUrl: string | null, role: 'USER' | 'ADMIN' }
      hasSubscription?: boolean
      subscription?: { period: string | null, expiresAt: string, cancelledAt: string | null } | null
    }>('/api/auth/bot-login/status', { params: { token: botToken } })

    if (res.status === 'authenticated' && res.user) {
      stopBotPoll()
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
        authStore.activateSubscription(res.subscription ?? undefined)
      } else {
        authStore.clearSubscription()
      }
      await navigateTo('/')
    } else if (res.status === 'expired') {
      stopBotPoll()
      botState.value = 'expired'
    }
  } catch {
    // network hiccup — keep polling
  }
}

async function startBotLogin() {
  authError.value = ''
  // Open the tab synchronously (before the await) so mobile Safari does not block it.
  const popup = window.open('', '_blank')
  try {
    const { token, url } = await $fetch<{ token: string, url: string }>('/api/auth/bot-login/start', { method: 'POST' })
    botToken = token
    botLoginUrl.value = url
    botState.value = 'waiting'
    if (popup && !popup.closed) popup.location.href = url
    stopBotPoll()
    botPollTimer = setInterval(pollBotStatus, 2500)
  } catch {
    if (popup && !popup.closed) popup.close()
    authError.value = 'Kirishni boshlab bo\'lmadi. Qaytadan urinib ko\'ring.'
  }
}

function onVisibilityChange() {
  if (botState.value === 'waiting' && document.visibilityState === 'visible') {
    void pollBotStatus()
  }
}
const selectedPlan = computed(() => typeof route.query.plan === 'string' ? route.query.plan : '')
const redirectPath = computed(() => typeof route.query.redirect === 'string' ? route.query.redirect : '')

function goAfterLogin() {
  return navigateTo(resolvePostLoginTarget(selectedPlan.value, redirectPath.value))
}

async function loginWithTelegram(user: TelegramUser) {
  await authStore.login(user)
  if (authStore.user) {
    await goAfterLogin()
    return
  }
  authError.value = 'Kirish amalga oshmadi. Qaytadan urinib ko\'ring.'
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

async function handleMiniAppLogin() {
  widgetState.value = 'mini-app'
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (tgUser) {
    await authStore.loginFromMiniApp(tgUser)
    if (authStore.user) {
      await goAfterLogin()
      return
    }
  }
  widgetState.value = 'mini-app-error'
}

onMounted(async () => {
  authStore.restoreFromStorage()
  document.addEventListener('visibilitychange', onVisibilityChange)

  if (route.query.error === 'expired') {
    authError.value = 'Kirish havolasi muddati tugagan. Qaytadan urinib ko\'ring.'
  } else if (route.query.error === 'invalid') {
    authError.value = 'Kirish havolasi yaroqsiz. Qaytadan urinib ko\'ring.'
  }

  const q = route.query
  const hasAuthPayload = Boolean(q.id && q.hash)

  const action = resolveLoginMountAction({
    isMiniApp: isMiniApp.value,
    hasAuthPayload,
    hasSession: Boolean(authStore.user)
  })

  if (action === 'mini-app') {
    await handleMiniAppLogin()
    return
  }

  if (action === 'process-auth') {
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

  if (action === 'redirect') {
    await goAfterLogin()
    return
  }

  // action === 'show-widget'
  if (canUseTelegramWidget.value) {
    mountTelegramWidget()
  }
})

onUnmounted(() => {
  stopBotPoll()
  if (import.meta.client) document.removeEventListener('visibilitychange', onVisibilityChange)
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
      <img
        src="/chayroom-favicon.ico"
        alt="Chayroom AI"
        class="size-8 rounded-xl object-cover"
      >
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

        <!-- Telegram Login Widget (auto-mounted) -->
        <div
          id="telegram-widget-container"
          class="mt-3 flex min-h-13 items-center justify-center"
        />

        <!-- Bot login (one-step polling) -->
        <div
          v-if="telegramBotUsername"
          class="mt-4"
        >
          <div class="my-4 flex items-center gap-3">
            <span class="h-px flex-1 bg-[#e8e8e6]" />
            <span class="text-[12px] text-[#a0a0a8]">yoki</span>
            <span class="h-px flex-1 bg-[#e8e8e6]" />
          </div>

          <button
            v-if="botState === 'idle'"
            type="button"
            class="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#54A9EB] text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#3d8fc9] max-md:h-11 max-md:text-[13px]"
            @click="startBotLogin"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Telegram bot orqali kirish
          </button>

          <div
            v-else-if="botState === 'waiting'"
            class="flex flex-col items-center gap-2"
          >
            <div class="flex items-center justify-center gap-2 text-xs text-[#a0a0a8] max-md:text-[10px]">
              <svg
                class="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" opacity="0.2" />
                <path d="M22 12a10 10 0 0 1-10 10" />
              </svg>
              Botdan tasdiq kutilyapti…
            </div>
            <a
              :href="botLoginUrl"
              target="_blank"
              rel="noopener"
              class="text-[13px] font-medium text-[#3480f1] hover:underline max-md:text-[11px]"
            >
              Telegram ochilmadimi? Shu yerni bosing
            </a>
          </div>

          <div
            v-else
            class="flex justify-center"
          >
            <button
              type="button"
              class="w-[226px] rounded-[12px] bg-[#3480f1]/10 py-2 text-sm font-medium text-[#3480f1] transition-colors hover:bg-[#3480f1]/20 max-md:w-[190px] max-md:py-1.5 max-md:text-xs"
              @click="startBotLogin"
            >
              Havola muddati tugadi — yangilash
            </button>
          </div>
        </div>

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
