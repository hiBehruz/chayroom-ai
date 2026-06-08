import { db } from '#server/db'
import { guides, categories } from '#server/db/schema'
import { desc, isNotNull, eq } from 'drizzle-orm'
import { listCacheKey, publicApiCacheNames } from '#server/utils/cache'

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = query.limit ? Number(query.limit) : undefined

  const q = db
    .select({
      id: guides.id,
      slug: guides.slug,
      title: guides.title,
      description: guides.description,
      coverUrl: guides.coverUrl,
      tags: guides.tags,
      bg: guides.bg,
      accent: guides.accent,
      badge: guides.badge,
      level: guides.level,
      isFree: guides.isFree,
      accessLevel: guides.accessLevel,
      publishedAt: guides.publishedAt,
      createdAt: guides.createdAt,
      category: categories.name
    })
    .from(guides)
    .leftJoin(categories, eq(guides.categoryId, categories.id))
    .where(isNotNull(guides.publishedAt))
    .orderBy(desc(guides.createdAt))

  if (limit) return await q.limit(limit)
  return await q
}, {
  base: 'cache',
  name: publicApiCacheNames.guideList,
  maxAge: 300,
  getKey: event => listCacheKey(getQuery(event).limit as string | undefined)
})
