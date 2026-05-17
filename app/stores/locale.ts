export type Locale = 'ru' | 'uz'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>('ru')

  function setLocale(l: Locale) {
    locale.value = l
    if (import.meta.client) {
      localStorage.setItem('cx-locale', l)
    }
  }

  function restoreFromStorage() {
    if (!import.meta.client) return
    const stored = localStorage.getItem('cx-locale') as Locale | null
    if (stored === 'ru' || stored === 'uz') locale.value = stored
  }

  return { locale, setLocale, restoreFromStorage }
})
