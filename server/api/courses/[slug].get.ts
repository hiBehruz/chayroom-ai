import { db } from '../../db'
import { courses, modules, lessons, subscriptions, users } from '../../db/schema'
import { eq, asc, desc } from 'drizzle-orm'
import { readSessionUser } from '../../utils/session-cookie'

// Not publicly cached: the response is gated per viewer (subscription/admin),
// so protected lesson content must never be served from a shared cache.
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const [course] = await db.select().from(courses).where(eq(courses.slug, slug))
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs topilmadi' })

  const jwtUser = await readSessionUser(event)
  let hasSubscription = false
  if (jwtUser) {
    const [user] = await db.select().from(users).where(eq(users.id, jwtUser.id)).limit(1)
    if (user) {
      hasSubscription = user.role === 'ADMIN'
      if (!hasSubscription) {
        const [sub] = await db.select().from(subscriptions)
          .where(eq(subscriptions.userId, user.id))
          .orderBy(desc(subscriptions.expiresAt))
          .limit(1)
        hasSubscription = !!sub && sub.status === 'ACTIVE' && sub.expiresAt > new Date()
      }
    }
  }
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
