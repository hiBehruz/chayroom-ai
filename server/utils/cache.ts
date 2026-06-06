const CACHE_BASE = 'cache'
const CACHE_GROUP = 'nitro/handlers'

export const publicApiCacheNames = {
  courseList: 'courses:list',
  courseDetail: 'courses:detail',
  guideList: 'guides:list',
  guideDetail: 'guides:detail',
  exchangeRate: 'exchange-rate'
} as const

const normalizeCacheKey = (key: string | number | undefined | null) => String(key ?? 'all').replace(/\W/g, '')

export const listCacheKey = (limit?: string | number | null) => `limit${normalizeCacheKey(limit)}`

export const detailCacheKey = (slug: string) => normalizeCacheKey(slug)

const handlerCachePrefix = (name: string) => `${CACHE_BASE}:${CACHE_GROUP}:${name}:`

const handlerCacheKey = (name: string, key: string) => `${handlerCachePrefix(name)}${normalizeCacheKey(key)}.json`

async function invalidateCache(name: string, keys: string[] = []) {
  const storage = useStorage()
  const prefix = handlerCachePrefix(name)
  const storedKeys = await storage.getKeys().catch(() => [])
  const matchingKeys = storedKeys.filter(key => key.startsWith(prefix))
  const explicitKeys = keys.map(key => handlerCacheKey(name, key))
  const uniqueKeys = [...new Set([...matchingKeys, ...explicitKeys])]

  await Promise.all(uniqueKeys.map(key => storage.removeItem(key)))
}

export async function invalidateCourseCache(slug?: string) {
  await invalidateCache(publicApiCacheNames.courseList)
  if (slug) {
    await invalidateCache(publicApiCacheNames.courseDetail, [detailCacheKey(slug)])
  }
}

export async function invalidateGuideCache(slug?: string) {
  await invalidateCache(publicApiCacheNames.guideList)
  if (slug) {
    await invalidateCache(publicApiCacheNames.guideDetail, [detailCacheKey(slug)])
  }
}
