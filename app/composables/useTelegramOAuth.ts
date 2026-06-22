// app/composables/useTelegramOAuth.ts
import type { TelegramUser } from '~/stores/auth'

interface TelegramLoginSDK {
  auth: (params: {
    client_id: number
    request_access?: string[]
    lang?: string
  }, callback: (data: {
    id_token?: string
    user?: {
      id: number
      name: string
      preferred_username?: string
      picture?: string
      phone_number?: string
    }
    error?: string
  }) => void) => void
}

declare global {
  interface Window {
    TelegramLoginWidget?: TelegramLoginSDK
  }
}

export function useTelegramOAuth() {
  const isWaiting = ref(false)
  const scriptLoaded = ref(false)

  function loadTelegramScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (scriptLoaded.value) {
        resolve()
        return
      }

      // Check if script already loaded via other means
      const existingScript = document.querySelector('script[src*="telegram-login.js"]')
      if (existingScript) {
        scriptLoaded.value = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-login.js'
      script.async = true

      script.onload = () => {
        scriptLoaded.value = true
        // Wait a bit for SDK to initialize
        setTimeout(resolve, 100)
      }

      script.onerror = () => {
        reject(new Error('Telegram Login script yuklanmadi'))
      }

      document.head.appendChild(script)
    })
  }

  function openOAuthPopup(): Promise<TelegramUser> {
    return new Promise(async (resolve, reject) => {
      if (isWaiting.value) {
        reject(new Error('OAuth flow already in progress'))
        return
      }

      try {
        // Load Telegram Login script first
        await loadTelegramScript()

        // Access Telegram Login from window (SDK sets it globally)
        const TelegramLogin = (window as any).Telegram?.Login

        if (!TelegramLogin || typeof TelegramLogin.auth !== 'function') {
          reject(new Error('Telegram Login SDK yuklanmadi'))
          return
        }

        isWaiting.value = true

        // Bot ID from token: 8921379022:AAFXiyb03WLmXO2CeXS5SH-RnrNKZUDZvQQ
        const botId = 8921379022
        const redirectUri = window.location.origin + '/login'

        TelegramLogin.auth({
          client_id: botId,
          redirect_uri: redirectUri,
          request_access: ['write'],
          lang: 'uz'
        }, (data: any) => {
          isWaiting.value = false

          if (data.error) {
            reject(new Error(data.error))
            return
          }

          if (!data.user || !data.id_token) {
            reject(new Error('Kirish ma\'lumotlari topilmadi'))
            return
          }

          // Parse JWT token to get auth_date and hash
          // JWT format: header.payload.signature
          const parts = data.id_token.split('.')
          if (parts.length !== 3) {
            reject(new Error('Noto\'g\'ri token formati'))
            return
          }

          try {
            const payload = JSON.parse(atob(parts[1]))

            // Extract name parts
            const nameParts = data.user.name.split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || undefined

            const user: TelegramUser = {
              id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              username: data.user.preferred_username,
              photo_url: data.user.picture,
              auth_date: payload.iat || Math.floor(Date.now() / 1000),
              hash: parts[2] // Use signature as hash
            }

            resolve(user)
          } catch (parseError) {
            reject(new Error('Token tahlil qilinmadi'))
          }
        })
      } catch (error) {
        isWaiting.value = false
        reject(error instanceof Error ? error : new Error('Kirish xatosi'))
      }
    })
  }

  function cancel() {
    isWaiting.value = false
  }

  return {
    openOAuthPopup,
    cancel,
    isWaiting: readonly(isWaiting)
  }
}
