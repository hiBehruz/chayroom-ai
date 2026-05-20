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
  const isMiniApp = useState<boolean>('isMiniApp', () => false)

  if (import.meta.dev) {
    if (new URLSearchParams(window.location.search).get('miniapp') === '1') {
      sessionStorage.setItem('miniapp_dev', '1')
    }
    if (sessionStorage.getItem('miniapp_dev') === '1') {
      window.Telegram = DEV_MOCK
    }
  }

  const webApp = window.Telegram?.WebApp
  if (webApp?.initData) {
    isMiniApp.value = true
    webApp.ready()
    webApp.expand()
  }
})
