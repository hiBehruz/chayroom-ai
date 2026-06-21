<!-- app/pages/login.vue -->
<script setup lang="ts">
import type { TelegramUser } from '~/stores/auth'
import { resolveLoginMountAction, resolvePostLoginTarget } from '~/utils/login-flow.mjs'

const authStore = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()
const { isMiniApp } = useTelegramApp()

// OAuth composable - client side only
const { openOAuthPopup, isWaiting } = import.meta.client
  ? useTelegramOAuth()
  : { openOAuthPopup: async () => ({} as TelegramUser), isWaiting: ref(false) }

const telegramBotUsername = computed(() => config.public.telegramBotUsername)
const widgetState = ref<'loading' | 'ready' | 'mini-app' | 'mini-app-error'>('loading')
const authError = ref('')
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

async function handleOAuthLogin() {
  authError.value = ''
  try {
    const user = await openOAuthPopup()
    await loginWithTelegram(user)
  } catch (error) {
    if (error instanceof Error) {
      authError.value = error.message
    } else {
      authError.value = 'Kirish amalga oshmadi. Qaytadan urinib ko\'ring.'
    }
  }
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
  widgetState.value = 'ready'
})

onUnmounted(() => {
  delete (window as unknown as { onTelegramLogin?: unknown }).onTelegramLogin
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
      <div class="px-10 pt-10 pb-8 text-center max-md:px-7 max-md:pt-8 max-md:pb-6">
        <!-- Telegram Icons -->
        <div class="flex items-center justify-center gap-2 mb-6">
          <svg
            class="size-10 text-[#54A9EB]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          <svg
            class="size-10 text-[#14161f]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
        </div>

        <h1 class="text-[24px] font-extrabold tracking-tight text-[#14161f] mb-2 max-md:text-[20px]">
          Telegram orqali kirish
        </h1>
        <p class="text-[14px] text-[#6b6b78] leading-relaxed max-md:text-[13px]">
          Sayt sizning ismingiz, foydalanuvchi nomingiz<br class="max-md:hidden"> va profil rasmingizni oladi
        </p>
      </div>

      <div class="px-10 pb-10 max-md:px-7 max-md:pb-8">
        <!-- Mini-app states -->
        <div
          v-if="widgetState === 'mini-app'"
          class="flex min-h-13 items-center justify-center gap-2 text-[14px] text-[#a0a0a8]"
        >
          <span class="size-4 rounded-full border-2 border-[#e0e0e4] border-t-[#54A9EB] animate-spin" />
          Kirilmoqda...
        </div>
        <div
          v-else-if="widgetState === 'mini-app-error'"
          class="mb-4 w-full rounded-2xl bg-red-50 px-4 py-3 text-[13px] text-red-600"
        >
          Telegramni yangilang va qaytadan kiring.
        </div>

        <!-- OAuth login button -->
        <div
          v-else-if="widgetState === 'ready'"
          class="flex flex-col items-center"
        >
          <button
            type="button"
            :disabled="isWaiting"
            class="w-full rounded-2xl bg-[#54A9EB] px-6 py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#4A9DD9] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            @click="handleOAuthLogin"
          >
            <svg
              v-if="isWaiting"
              class="size-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <svg
              v-else
              class="size-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <span>{{ isWaiting ? 'Ochilmoqda...' : 'Telegram orqali kirish' }}</span>
          </button>

          <p class="mt-5 text-[13px] text-[#54A9EB] text-center leading-relaxed hover:underline cursor-pointer max-md:text-[12px] max-md:mt-4">
            Yoki telefon raqam orqali kirish →
          </p>
        </div>

        <p
          v-if="authError"
          class="mt-4 text-center text-[13px] leading-5 text-red-600 max-md:text-[12px]"
        >
          {{ authError }}
        </p>
      </div>
    </div>
  </div>
</template>
