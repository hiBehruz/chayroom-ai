import { db } from '../../db'
import { guides, categories } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
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
      isFree: body.isFree ?? false,
      categoryId,
      publishedAt: new Date()
    })
    .returning({ slug: guides.slug })

  return guide
})
