import { db } from '../../db'
import { guides, categories, subscriptions, users } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { readSessionUser } from '../../utils/session-cookie'

// Not publicly cached: the body is gated per viewer (subscription/admin).
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const [guide] = await db
    .select({
      id: guides.id,
      slug: guides.slug,
      title: guides.title,
      description: guides.description,
      content: guides.content,
      coverUrl: guides.coverUrl,
      tags: guides.tags,
      bg: guides.bg,
      accent: guides.accent,
      badge: guides.badge,
      level: guides.level,
      isFree: guides.isFree,
      publishedAt: guides.publishedAt,
      createdAt: guides.createdAt,
      category: categories.name
    })
    .from(guides)
    .leftJoin(categories, eq(guides.categoryId, categories.id))
    .where(eq(guides.slug, slug))

  if (!guide) {
    throw createError({ statusCode: 404, statusMessage: 'Guide not found' })
  }

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
  const locked = !guide.isFree && !hasSubscription

  return locked ? { ...guide, content: null, locked: true } : { ...guide, locked: false }
})
