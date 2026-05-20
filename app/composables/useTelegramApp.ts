import type WebApp from '@twa-dev/sdk'

declare global {
  interface Window {
    Telegram?: { WebApp: typeof WebApp }
  }
}

export function useTelegramApp() {
  const devCookie = useCookie('miniapp_dev')
  const isMiniApp = useState<boolean>('isMiniApp', () => {
    if (import.meta.dev && devCookie.value === '1') return true
    if (import.meta.client) return Boolean(window.Telegram?.WebApp?.initData)
    return false
  })

  function wa() {
    return import.meta.client ? window.Telegram?.WebApp : undefined
  }

  return {
    isMiniApp,
    mainButton: {
      show(text: string) {
        if (!isMiniApp.value) return
        const btn = wa()?.MainButton
        if (!btn) return
        btn.setText(text)
        btn.show()
      },
      hide() {
        if (!isMiniApp.value) return
        wa()?.MainButton.hide()
      },
      onClick(fn: () => void) {
        if (!isMiniApp.value) return
        wa()?.MainButton.onClick(fn)
      },
      offClick(fn: () => void) {
        if (!isMiniApp.value) return
        wa()?.MainButton.offClick(fn)
      }
    },
    backButton: {
      show() {
        if (!isMiniApp.value) return
        wa()?.BackButton.show()
      },
      hide() {
        if (!isMiniApp.value) return
        wa()?.BackButton.hide()
      },
      onClick(fn: () => void) {
        if (!isMiniApp.value) return
        wa()?.BackButton.onClick(fn)
      },
      offClick(fn: () => void) {
        if (!isMiniApp.value) return
        wa()?.BackButton.offClick(fn)
      }
    }
  }
}
