import { db } from '../../db'
import { guides, categories } from '../../db/schema'
import { desc, isNotNull, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
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
})
