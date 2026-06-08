import { db } from '#server/db'
import { guides } from '#server/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '#server/utils/admin-session'
import { invalidateGuideCache } from '#server/utils/cache'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const slug = getRouterParam(event, 'slug')!

  await db.delete(guides).where(eq(guides.slug, slug))
  await invalidateGuideCache(slug)

  return { ok: true }
})
