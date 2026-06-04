import { db } from '../../db'
import { guides } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  await db.delete(guides).where(eq(guides.slug, slug))

  return { ok: true }
})
