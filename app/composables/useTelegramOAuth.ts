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

        // YECHIM: Oldin logout qilamiz - eski session o'chiriladi
        // Bu brauzer cookie'larini tozalaydi va yangi login flow'ni boshlaydi
        const logoutUrl = `https://oauth.telegram.org/auth/logout?bot_id=${botId}&origin=${encodeURIComponent(window.location.origin)}`

        // Yashirin iframe orqali logout qilamiz
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = logoutUrl
        document.body.appendChild(iframe)

        // Logout bajarilishini kutamiz (1 sekund yetarli)
        await new Promise(resolve => setTimeout(resolve, 1000))
        document.body.removeChild(iframe)

        TelegramLogin.auth({
          client_id: botId,
          lang: 'uz',
          redirect_uri: window.location.origin
          // NOTE: request_access o'chirilgan - OAuth bot xabar yubormasligi uchun
          // Xabarni faqat @chayroobai_bot (asosiy bot) yuboradi
        }, async (data: any) => {
          if (data.error) {
            isWaiting.value = false
            reject(new Error(data.error))
            return
          }

          if (!data.user || !data.id_token) {
            isWaiting.value = false
            reject(new Error('Kirish ma\'lumotlari topilmadi'))
            return
          }

          try {
            // Send JWT token to server for verification and session creation
            const response = await $fetch('/api/auth/telegram-jwt', {
              method: 'POST',
              body: {
                id_token: data.id_token,
                user: data.user
              }
            })

            isWaiting.value = false

            if (!response || !response.user) {
              reject(new Error('Server xatosi'))
              return
            }

            // Return user data in format expected by auth store
            const nameParts = data.user.name.split(' ')
            const user: TelegramUser = {
              id: response.user.telegramId,
              telegramId: response.user.telegramId,
              first_name: nameParts[0] || response.user.firstName,
              last_name: nameParts.slice(1).join(' ') || response.user.lastName || undefined,
              username: data.user.preferred_username || response.user.username || undefined,
              photo_url: data.user.picture || response.user.photoUrl || undefined,
              auth_date: Math.floor(Date.now() / 1000),
              hash: 'jwt-auth',
              role: response.user.role,
              hasSubscription: response.hasSubscription // Subscription holatini qo'shamiz
            }

            resolve(user)
          } catch (error) {
            isWaiting.value = false
            reject(error instanceof Error ? error : new Error('Server bilan bog\'lanishda xato'))
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
