import { db } from '../../db'
import { courses, modules, lessons } from '../../db/schema'
import { eq, asc } from 'drizzle-orm'
import { getSubscriptionState } from '../../utils/user-session'

// Not publicly cached: the response is gated per viewer (subscription/admin),
// so protected lesson content must never be served from a shared cache.
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const [course] = await db.select().from(courses).where(eq(courses.slug, slug))
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs topilmadi' })

  const { hasSubscription } = await getSubscriptionState(event)
  const entitled = course.isFree || hasSubscription

  const mods = await db.select().from(modules).where(eq(modules.courseId, course.id)).orderBy(asc(modules.order))

  const modulesList = await Promise.all(mods.map(async (mod) => {
    const lessonRows = await db.select().from(lessons).where(eq(lessons.moduleId, mod.id)).orderBy(asc(lessons.order))
    return {
      ...mod,
      lessons: lessonRows.map((lesson) => {
        if (entitled || lesson.free) return { ...lesson, locked: false }
        // Strip protected payload for non-entitled viewers
        return { ...lesson, content: null, videoUrl: null, locked: true }
      })
    }
  }))

  return { ...course, modulesList }
})
