import { db } from '../../db'
import { courses } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return await db
    .select()
    .from(courses)
    .where(eq(courses.published, true))
    .orderBy(desc(courses.createdAt))
})
