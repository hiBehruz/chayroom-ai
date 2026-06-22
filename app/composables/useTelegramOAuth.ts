// app/composables/useTelegramOAuth.ts
import type { TelegramUser } from '~/stores/auth'

export function useTelegramOAuth() {
  const config = useRuntimeConfig()
  const popup = ref<Window | null>(null)
  const isWaiting = ref(false)
  const checkInterval = ref<number | null>(null)

  function buildLoginUrl(): string {
    const botUsername = config.public.telegramBotUsername
    if (!botUsername) {
      throw new Error('Telegram bot username is not configured')
    }

    // Use current origin for auth callback
    const origin = import.meta.client
      ? window.location.origin
      : config.public.appUrl

    const authUrl = `https://oauth.telegram.org/auth?bot_id=8921379022&origin=${encodeURIComponent(origin)}&request_access=write&return_to=${encodeURIComponent(origin + '/login')}`

    return authUrl
  }

  function openOAuthPopup(): Promise<TelegramUser> {
    return new Promise((resolve, reject) => {
      if (isWaiting.value) {
        reject(new Error('OAuth flow already in progress'))
        return
      }

      try {
        const loginUrl = buildLoginUrl()
        const width = 550
        const height = 650
        const left = (screen.width - width) / 2
        const top = (screen.height - height) / 2

        // Open popup IMMEDIATELY (synchronously) to avoid popup blocker
        popup.value = window.open(
          loginUrl,
          'telegram-login',
          `width=${width},height=${height},left=${left},top=${top},popup=yes,scrollbars=yes`
        )

        if (!popup.value) {
          reject(new Error('Popup ochilmadi. Popup blocker o\'chirilganligini tekshiring.'))
          return
        }

        isWaiting.value = true

        // Poll the popup URL to detect when it returns to our domain with auth data
        checkInterval.value = window.setInterval(() => {
          try {
            if (!popup.value || popup.value.closed) {
              cleanup()
              reject(new Error('Kirish oynasi yopildi'))
              return
            }

            // Check if popup has returned to our domain
            const popupUrl = popup.value.location.href
            if (popupUrl.includes(window.location.origin)) {
              const url = new URL(popupUrl)
              const id = url.searchParams.get('id')
              const hash = url.searchParams.get('hash')

              if (id && hash) {
                cleanup()
                popup.value.close()

                const user: TelegramUser = {
                  id: Number(id),
                  first_name: url.searchParams.get('first_name') || '',
                  last_name: url.searchParams.get('last_name') || undefined,
                  username: url.searchParams.get('username') || undefined,
                  photo_url: url.searchParams.get('photo_url') || undefined,
                  auth_date: Number(url.searchParams.get('auth_date') || 0),
                  hash: hash
                }

                resolve(user)
              }
            }
          } catch (e) {
            // Cross-origin error - popup is still on telegram.org, continue polling
          }
        }, 500)

        // Timeout after 5 minutes
        setTimeout(() => {
          if (isWaiting.value) {
            cleanup()
            reject(new Error('Kirish vaqti tugadi'))
          }
        }, 300000)
      } catch (error) {
        cleanup()
        reject(error instanceof Error ? error : new Error('Kirish xatosi'))
      }

      function cleanup() {
        isWaiting.value = false
        if (checkInterval.value) {
          clearInterval(checkInterval.value)
          checkInterval.value = null
        }
        if (popup.value && !popup.value.closed) {
          popup.value.close()
        }
        popup.value = null
      }
    })
  }

  function cancel() {
    if (popup.value && !popup.value.closed) {
      popup.value.close()
    }
    if (checkInterval.value) {
      clearInterval(checkInterval.value)
      checkInterval.value = null
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
