import postgres from 'postgres'
import { integrationEnv } from './server'

const sql = postgres(integrationEnv.DATABASE_URL, { max: 1 })

export async function seedIntegrationFixtures() {
  const [category] = await sql<Array<{ id: number }>>`
    INSERT INTO categories (name, slug, type)
    VALUES ('Integration', 'integration-category', 'COURSE')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `

  await sql`
    INSERT INTO courses (slug, title, category_id, published, is_free)
    VALUES ('integration-course', 'Integration Course', ${category!.id}, true, false)
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      published = EXCLUDED.published,
      is_free = EXCLUDED.is_free
  `

  await sql`
    INSERT INTO guides (slug, title, category_id, published_at, access_level)
    VALUES (
      'integration-guide',
      'Integration Guide',
      ${category!.id},
      NOW(),
      'public'
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      published_at = EXCLUDED.published_at,
      access_level = EXCLUDED.access_level
  `
}

export async function cleanupIntegrationFixtures() {
  await sql`DELETE FROM guides WHERE slug = 'integration-guide'`
  await sql`DELETE FROM courses WHERE slug = 'integration-course'`
  await sql`DELETE FROM categories WHERE slug = 'integration-category'`
  await sql`DELETE FROM users WHERE telegram_id = ${integrationEnv.NUXT_ADMIN_TELEGRAM_IDS}`
}

export async function closeIntegrationDatabase() {
  await sql.end()
}
