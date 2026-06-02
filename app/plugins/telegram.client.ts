const DEV_MOCK: typeof window.Telegram = {
  WebApp: {
    initData: 'test',
    initDataUnsafe: {
      user: { id: 123456789, first_name: 'Behruz', last_name: 'Zaripov', username: 'behruzzaripov' }
    },
    ready: () => {},
    expand: () => {},
    BackButton: { show: () => {}, hide: () => {}, onClick: () => {}, offClick: () => {} },
    MainButton: { show: () => {}, hide: () => {}, setText: () => {}, onClick: () => {}, offClick: () => {} }
  } as any
}

export default defineNuxtPlugin(() => {
  const port = window.location.port
  const hasMiniAppQuery = new URLSearchParams(window.location.search).get('miniapp') === '1'

  if (import.meta.dev) {
    const cookieName = `miniapp_dev_${port}`
    const devCookie = useCookie(cookieName, { path: '/', maxAge: 86400 })

    if (hasMiniAppQuery && devCookie.value !== '1') {
      // Set cookie then reload so SSR picks it up correctly
      devCookie.value = '1'
      window.location.replace(window.location.pathname)
      return
    }

    if (devCookie.value === '1') {
      window.Telegram = DEV_MOCK
    }
  }

  const webApp = window.Telegram?.WebApp
  const isMiniApp = useState<boolean>('isMiniApp')

  if (webApp?.initData) {
    isMiniApp.value = true
    webApp.ready()
    webApp.expand()
  }
})
