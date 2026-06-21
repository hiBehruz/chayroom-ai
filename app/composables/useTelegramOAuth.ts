// app/composables/useTelegramOAuth.ts
import type { TelegramUser } from '~/stores/auth'

interface TelegramOAuthResult {
  event: 'auth_result' | 'auth_error'
  origin: string
  data?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
  }
  error?: string
}

export function useTelegramOAuth() {
  const config = useRuntimeConfig()
  const popup = ref<Window | null>(null)
  const isWaiting = ref(false)

  function buildOAuthUrl(): string {
    // Bot ID is the numeric part before the colon in the bot token
    // For @chayroomai_bot, the token starts with: 8921379022:AAF...
    const botId = '8921379022'

    // Use current origin for redirect_uri (works for both localhost and production)
    const redirectUri = import.meta.client
      ? window.location.origin + '/'
      : config.public.appUrl + '/'

    const origin = import.meta.client
      ? window.location.origin
      : config.public.appUrl

    const params = new URLSearchParams({
      client_id: botId,
      origin: origin,
      return_to: redirectUri,
      scope: 'openid profile telegram:bot_access',
      redirect_uri: redirectUri,
      response_type: 'post_message'
    })

    return `https://oauth.telegram.org/auth?${params.toString()}`
  }

  function openOAuthPopup(): Promise<TelegramUser> {
    return new Promise((resolve, reject) => {
      if (isWaiting.value) {
        reject(new Error('OAuth flow already in progress'))
        return
      }

      const oauthUrl = buildOAuthUrl()
      const width = 550
      const height = 650
      const left = (screen.width - width) / 2
      const top = (screen.height - height) / 2

      // Open popup IMMEDIATELY (synchronously) to avoid popup blocker
      popup.value = window.open(
        oauthUrl,
        'telegram-oauth',
        `width=${width},height=${height},left=${left},top=${top},popup=yes,scrollbars=yes`
      )

      if (!popup.value) {
        reject(new Error('Popup ochilmadi. Popup blocker o\'chirilganligini tekshiring.'))
        return
      }

      isWaiting.value = true

      function handleMessage(event: MessageEvent<TelegramOAuthResult>) {
        // Security: verify origin
        if (event.origin !== 'https://oauth.telegram.org') {
          return
        }

        const result = event.data

        if (result.event === 'auth_error') {
          cleanup()
          reject(new Error(result.error || 'Kirish bekor qilindi'))
          return
        }

        if (result.event === 'auth_result' && result.data) {
          cleanup()

          const user: TelegramUser = {
            id: result.data.id,
            first_name: result.data.first_name,
            last_name: result.data.last_name,
            username: result.data.username,
            photo_url: result.data.photo_url,
            auth_date: result.data.auth_date,
            hash: result.data.hash
          }

          resolve(user)
        }
      }

      function handlePopupClose() {
        const checkClosed = setInterval(() => {
          if (popup.value?.closed) {
            clearInterval(checkClosed)
            if (isWaiting.value) {
              cleanup()
              reject(new Error('Kirish oynasi yopildi'))
            }
          }
        }, 500)
      }

      function cleanup() {
        isWaiting.value = false
        window.removeEventListener('message', handleMessage)
        if (popup.value && !popup.value.closed) {
          popup.value.close()
        }
        popup.value = null
      }

      window.addEventListener('message', handleMessage)
      handlePopupClose()

      // Timeout after 5 minutes
      setTimeout(() => {
        if (isWaiting.value) {
          cleanup()
          reject(new Error('Kirish vaqti tugadi'))
        }
      }, 300000)
    })
  }

  function cancel() {
    if (popup.value && !popup.value.closed) {
      popup.value.close()
    }
    isWaiting.value = false
    popup.value = null
  }

  return {
    openOAuthPopup,
    cancel,
    isWaiting: readonly(isWaiting)
  }
}
