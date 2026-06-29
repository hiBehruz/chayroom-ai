import { db } from '#server/db'
import { guides, categories } from '#server/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '#server/utils/admin-session'
import { invalidateGuideCache } from '#server/utils/cache'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)

  let categoryId: number | null = null
  if (body.category) {
    const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, body.category))
    categoryId = cat?.id ?? null
  }

  const [guide] = await db
    .insert(guides)
    .values({
      slug: body.slug,
      title: body.title,
      description: body.description ?? null,
      content: body.content ?? null,
      coverUrl: body.coverUrl ?? null,
      tags: body.tags ?? [],
      bg: body.bg ?? null,
      accent: body.accent ?? null,
      badge: body.badge ?? null,
      level: body.level ?? null,
      isFree: body.isFree ?? false,
      accessLevel: body.isFree ? 'free' : 'member',
      categoryId,
      publishedAt: new Date()
    })
    .returning({ slug: guides.slug })

  if (guide) {
    await invalidateGuideCache(guide.slug)
  }

  return guide
})
