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
    published: true,
  }).returning({ id: courses.id, slug: courses.slug })

  for (let mi = 0; mi < (body.modulesList ?? []).length; mi++) {
    const mod = body.modulesList[mi]
    const [module] = await db.insert(modules).values({
      courseId: course.id,
      title: mod.title,
      subtitle: mod.subtitle ?? null,
      duration: mod.duration ?? null,
      order: mi,
    }).returning({ id: modules.id })

    for (let li = 0; li < (mod.lessons ?? []).length; li++) {
      const lesson = mod.lessons[li]
      await db.insert(lessons).values({
        moduleId: module.id,
        title: lesson.title,
        type: lesson.type ?? 'Nazariy',
        duration: lesson.duration ?? null,
        free: lesson.free ?? false,
        videoUrl: lesson.videoUrl ?? null,
        content: lesson.content ?? null,
        order: li,
        published: true,
      })
    }
  }

  return course
})
