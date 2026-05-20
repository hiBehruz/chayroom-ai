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
  if (import.meta.dev) {
    const devCookie = useCookie('miniapp_dev', { path: '/', maxAge: 86400 })
    if (new URLSearchParams(window.location.search).get('miniapp') === '1') {
      devCookie.value = '1'
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
