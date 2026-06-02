import { db } from '../../db'
import { courses } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = query.limit ? Number(query.limit) : undefined

  const q = db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      coverUrl: courses.coverUrl,
      tags: courses.tags,
      level: courses.level,
      levelColor: courses.levelColor,
      rating: courses.rating,
      participants: courses.participants,
      duration: courses.duration,
      bg: courses.bg,
      dark: courses.dark,
      badge: courses.badge,
      accentTitle: courses.accentTitle,
      accentColor: courses.accentColor,
      order: courses.order,
      published: courses.published,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt
    })
    .from(courses)
    .where(eq(courses.published, true))
    .orderBy(desc(courses.createdAt))

  if (limit) return await q.limit(limit)
  return await q
})
