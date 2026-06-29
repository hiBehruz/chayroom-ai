import { db } from '#server/db'
import { guides, categories } from '#server/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '#server/utils/admin-session'
import { invalidateGuideCache } from '#server/utils/cache'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const slug = getRouterParam(event, 'slug')!
  const body = await readBody(event)

  const { category, ...rest } = body
  if (typeof rest.isFree === 'boolean') {
    rest.accessLevel = rest.isFree ? 'free' : 'member'
  }

  let categoryId: number | null | undefined
  if (category !== undefined) {
    if (category) {
      const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, category))
      categoryId = cat?.id ?? null
    } else {
      categoryId = null
    }
  }

  await db
    .update(guides)
    .set({
      ...rest,
      ...(categoryId !== undefined ? { categoryId } : {}),
      updatedAt: new Date()
    })
    .where(eq(guides.slug, slug))

  await invalidateGuideCache(slug)

  return { ok: true }
})
