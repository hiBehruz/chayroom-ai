<script setup lang="ts">
import type { TelegramUser } from '~/stores/auth'

definePageMeta({ layout: false })

const config = useRuntimeConfig()
const botUsername = computed(() => config.public.telegramBotUsername)
const error = ref('')
const state = ref<'ready' | 'missing-bot' | 'submitting'>('ready')

async function onAuth(payload: TelegramUser) {
  state.value = 'submitting'
  error.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: payload })
    await navigateTo('/admin')
  } catch {
    error.value = 'Bu akkaunt admin emas yoki tasdiqlash muvaffaqiyatsiz.'
    state.value = 'ready'
  }
}

function mountWidget() {
  const container = document.querySelector('#admin-telegram-widget')
  if (!container) return
  if (!botUsername.value) {
    state.value = 'missing-bot'
    return
  }
  container.innerHTML = ''
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', botUsername.value)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-radius', '12')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', 'onAdminAuth(user)')
  container.appendChild(script)
}

onMounted(() => {
  ;(window as unknown as { onAdminAuth?: (u: TelegramUser) => void }).onAdminAuth = onAuth
  mountWidget()
})
onUnmounted(() => {
  delete (window as unknown as { onAdminAuth?: unknown }).onAdminAuth
})

useSeoMeta({ title: 'Admin — Kirish', robots: 'noindex' })
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#fffdf9] px-5">
    <div class="w-full max-w-100 rounded-[28px] border border-[#e8e8e6] bg-white p-10 text-center shadow-[0_4px_24px_rgba(20,22,31,0.07)]">
      <h1 class="text-[24px] font-extrabold tracking-tight text-[#14161f]">
        Admin panel
      </h1>
      <p class="mt-2 text-[15px] text-[#70707a]">
        Telegram orqali kiring
      </p>
      <div
        id="admin-telegram-widget"
        class="mt-6 flex min-h-13 items-center justify-center"
      />
      <p
        v-if="state === 'missing-bot'"
        class="mt-4 text-[13px] text-red-600"
      >
        NUXT_PUBLIC_TELEGRAM_BOT_USERNAME ko'rsatilmagan.
      </p>
      <p
        v-if="error"
        class="mt-4 text-[13px] text-red-600"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>
