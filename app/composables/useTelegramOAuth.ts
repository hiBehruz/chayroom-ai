// app/composables/useTelegramOAuth.ts
import type { TelegramUser } from '~/stores/auth'

interface TelegramOAuthUser {
  id: number
  name: string
  preferred_username?: string
  picture?: string
  phone_number?: string
}

interface TelegramAuthData {
  id_token?: string
  user?: TelegramOAuthUser
  error?: string
}

interface TelegramLoginSDK {
  auth: (params: {
    client_id: number
    redirect_uri?: string
    request_access?: string[]
    lang?: string
  }, callback: (data: TelegramAuthData) => void) => void
}

interface TelegramJwtAuthResponse {
  user?: {
    telegramId: number
    firstName: string
    lastName: string | null
    username: string | null
    photoUrl: string | null
    role: 'USER' | 'ADMIN'
  }
  hasSubscription: boolean
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

  async function openOAuthPopup(): Promise<TelegramUser> {
    if (isWaiting.value) {
      throw new Error('OAuth flow already in progress')
    }

    try {
      // Load Telegram Login script first
      await loadTelegramScript()

      // Access Telegram Login from window (SDK sets it globally)
      const telegramWindow = window as Window & { Telegram?: { Login?: TelegramLoginSDK } }
      const TelegramLogin = telegramWindow.Telegram?.Login

      if (!TelegramLogin || typeof TelegramLogin.auth !== 'function') {
        throw new Error('Telegram Login SDK yuklanmadi')
      }

      isWaiting.value = true

      // Bot ID from token: 8921379022:AAFXiyb03WLmXO2CeXS5SH-RnrNKZUDZvQQ
      const botId = 8921379022

      // Eski Telegram OAuth sessionini tozalab, account switch oynasini majburlaymiz.
      const logoutUrl = `https://oauth.telegram.org/auth/logout?bot_id=${botId}&origin=${encodeURIComponent(window.location.origin)}`
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = logoutUrl
      document.body.appendChild(iframe)
      await new Promise(resolve => setTimeout(resolve, 1000))
      document.body.removeChild(iframe)

      return await new Promise<TelegramUser>((resolve, reject) => {
        TelegramLogin.auth({
          client_id: botId,
          lang: 'uz',
          redirect_uri: window.location.origin
        }, (data) => {
          void resolveOAuthData(data).then(resolve, reject)
        })
      })
    } catch (error) {
      throw error instanceof Error ? error : new Error('Kirish xatosi')
    } finally {
      isWaiting.value = false
    }
  }

  async function resolveOAuthData(data: TelegramAuthData): Promise<TelegramUser> {
    if (data.error) {
      throw new Error(data.error)
    }

    if (!data.user || !data.id_token) {
      throw new Error('Kirish ma\'lumotlari topilmadi')
    }

    // Send JWT token to server for verification and session creation
    const response = await $fetch<TelegramJwtAuthResponse>('/api/auth/telegram-jwt', {
      method: 'POST',
      credentials: 'include',
      body: {
        id_token: data.id_token,
        user: data.user
      }
    })

    if (!response?.user) {
      throw new Error('Server xatosi')
    }

    // Return user data in format expected by auth store
    const nameParts = data.user.name.split(' ')
    return {
      id: response.user.telegramId,
      telegramId: response.user.telegramId,
      first_name: nameParts[0] || response.user.firstName,
      last_name: nameParts.slice(1).join(' ') || response.user.lastName || undefined,
      username: data.user.preferred_username || response.user.username || undefined,
      photo_url: data.user.picture || response.user.photoUrl || undefined,
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'jwt-auth',
      role: response.user.role,
      hasSubscription: response.hasSubscription
    }
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
