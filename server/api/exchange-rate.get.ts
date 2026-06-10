import { publicApiCacheNames } from '#server/utils/cache'
import { fetchUsdRate } from '#server/utils/exchange-rate'

export default defineCachedEventHandler(async () => {
  return { rate: await fetchUsdRate() }
}, {
  base: 'cache',
  name: publicApiCacheNames.exchangeRate,
  maxAge: 3600,
  getKey: () => 'usd'
})
