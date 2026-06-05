import { db } from '../../db'
import { courses, modules, lessons } from '../../db/schema'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const [course] = await db.select().from(courses).where(eq(courses.slug, slug))
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs topilmadi' })

  const mods = await db.select().from(modules).where(eq(modules.courseId, course.id)).orderBy(asc(modules.order))

  const modulesList = await Promise.all(mods.map(async (mod) => {
    const lessonRows = await db.select().from(lessons).where(eq(lessons.moduleId, mod.id)).orderBy(asc(lessons.order))
    return {
      ...mod,
      lessons: lessonRows
    }
  }))

  return { ...course, modulesList }
})
