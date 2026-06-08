import { db } from '#server/db'
import { courses } from '#server/db/schema'
import { eq, desc } from 'drizzle-orm'
import { listCacheKey, publicApiCacheNames } from '#server/utils/cache'

export default defineCachedEventHandler(async (event) => {
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
      isFree: courses.isFree,
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
}, {
  base: 'cache',
  name: publicApiCacheNames.courseList,
  maxAge: 300,
  getKey: event => listCacheKey(getQuery(event).limit as string | undefined)
})
