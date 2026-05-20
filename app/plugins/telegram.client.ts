import WebApp from '@twa-dev/sdk'

export default defineNuxtPlugin(() => {
  const isMiniApp = useState<boolean>('isMiniApp', () => false)

  if (WebApp.initData) {
    isMiniApp.value = true
    WebApp.ready()
    WebApp.expand()
  }
})
