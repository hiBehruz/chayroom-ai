import { db } from '../../db'
import { guides } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '../../utils/admin-session'
import { invalidateGuideCache } from '../../utils/cache'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const slug = getRouterParam(event, 'slug')!

  await db.delete(guides).where(eq(guides.slug, slug))
  await invalidateGuideCache(slug)

  return { ok: true }
})
