import { publicApiCacheNames } from '../utils/cache'

export default defineCachedEventHandler(async () => {
  const data = await $fetch<Array<{ Ccy: string, Rate: string }>>(
    'https://cbu.uz/en/arkhiv-kursov-valyut/json/'
  )
  const usd = data.find(item => item.Ccy === 'USD')
  return { rate: usd ? parseFloat(usd.Rate) : null }
}, {
  base: 'cache',
  name: publicApiCacheNames.exchangeRate,
  maxAge: 3600,
  getKey: () => 'usd'
})
