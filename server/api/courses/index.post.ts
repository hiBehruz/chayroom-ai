import { db } from '../../db'
import { courses, modules, lessons } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const [course] = await db.insert(courses).values({
    slug: body.slug,
    title: body.title,
    description: body.desc ?? null,
    coverUrl: body.image ?? null,
    tags: body.tags ?? [],
    level: body.level ?? null,
    levelColor: body.levelColor ?? null,
    duration: body.duration ?? null,
    bg: body.bg ?? null,
    dark: body.dark ?? false,
    badge: body.badge ?? null,
    accentTitle: body.accentTitle ?? [],
    accentColor: body.accentColor ?? null,
    content: body.content ?? null,
    published: true
  }).returning({ id: courses.id, slug: courses.slug })
  if (!course) {
    throw createError({ statusCode: 500, statusMessage: 'Kurs yaratilmadi' })
  }

  const modulesList = Array.isArray(body.modulesList) ? body.modulesList : []
  for (let mi = 0; mi < modulesList.length; mi++) {
    const mod = modulesList[mi]
    if (!mod) continue
    const [courseModule] = await db.insert(modules).values({
      courseId: course.id,
      title: mod.title,
      subtitle: mod.subtitle ?? null,
      duration: mod.duration ?? null,
      order: mi
    }).returning({ id: modules.id })
    if (!courseModule) {
      throw createError({ statusCode: 500, statusMessage: 'Modul yaratilmadi' })
    }

    const lessonsList = Array.isArray(mod.lessons) ? mod.lessons : []
    for (let li = 0; li < lessonsList.length; li++) {
      const lesson = lessonsList[li]
      if (!lesson) continue
      await db.insert(lessons).values({
        moduleId: courseModule.id,
        title: lesson.title,
        type: lesson.type ?? 'Nazariy',
        duration: lesson.duration ?? null,
        free: lesson.free ?? false,
        videoUrl: lesson.videoUrl ?? null,
        content: lesson.content ?? null,
        order: li,
        published: true
      })
    }
  }

  return course
})
