import { publicApiCacheNames } from '../utils/cache'
import { fetchUsdRate } from '../utils/exchange-rate'

export default defineCachedEventHandler(async () => {
  return { rate: await fetchUsdRate() }
}, {
  base: 'cache',
  name: publicApiCacheNames.exchangeRate,
  maxAge: 3600,
  getKey: () => 'usd'
})
