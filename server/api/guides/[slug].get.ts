import { db } from '../../db'
import { guides, categories } from '../../db/schema'
import { eq, isNotNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const [guide] = await db
    .select({
      id: guides.id,
      slug: guides.slug,
      title: guides.title,
      description: guides.description,
      content: guides.content,
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
    .where(eq(guides.slug, slug))

  if (!guide) {
    throw createError({ statusCode: 404, statusMessage: 'Guide not found' })
  }

  return guide
})
