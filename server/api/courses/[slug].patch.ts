import { db } from '#server/db'
import { courses } from '#server/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '#server/utils/admin-session'
import { invalidateCourseCache } from '#server/utils/cache'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const slug = getRouterParam(event, 'slug')!
  const body = await readBody(event)

  const [existing] = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, slug))
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kurs topilmadi' })

  const patch: Record<string, unknown> = {}
  if (typeof body.isFree === 'boolean') patch.isFree = body.isFree

  if (Object.keys(patch).length === 0) return { ok: true }

  await db.update(courses).set(patch).where(eq(courses.slug, slug))
  await invalidateCourseCache(slug)
  return { ok: true }
})
