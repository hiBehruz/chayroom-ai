import { pgTable, serial, text, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN'])
export const subscriptionStatusEnum = pgEnum('subscription_status', ['ACTIVE', 'EXPIRED', 'CANCELLED'])
export const categoryTypeEnum = pgEnum('category_type', ['COURSE', 'GUIDE'])

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  telegramId: text('telegram_id').notNull().unique(),
  username: text('username'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  photoUrl: text('photo_url'),
  role: userRoleEnum('role').notNull().default('USER'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
  progress: many(lessonProgress)
}))

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  status: subscriptionStatusEnum('status').notNull().default('ACTIVE'),
  expiresAt: timestamp('expires_at').notNull(),
  tributeSubscriptionId: integer('tribute_subscription_id').unique(),
  period: text('period'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] })
}))

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: categoryTypeEnum('type').notNull()
})

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
  guides: many(guides)
}))

// ─── Courses ──────────────────────────────────────────────────────────────────

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  categoryId: integer('category_id').references(() => categories.id),
  tags: text('tags').array().notNull().default([]),
  level: text('level'),
  levelColor: text('level_color'),
  rating: integer('rating').notNull().default(0),
  participants: integer('participants').notNull().default(0),
  duration: text('duration'),
  bg: text('bg'),
  dark: boolean('dark').notNull().default(false),
  badge: text('badge'),
  accentTitle: text('accent_title').array().notNull().default([]),
  accentColor: text('accent_color'),
  content: text('content'),
  isFree: boolean('is_free').notNull().default(false),
  order: integer('order').notNull().default(0),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, { fields: [courses.categoryId], references: [categories.id] }),
  modules: many(modules)
}))

// ─── Modules ──────────────────────────────────────────────────────────────────

export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  duration: text('duration'),
  order: integer('order').notNull().default(0)
})

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  lessons: many(lessons)
}))

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  moduleId: integer('module_id').notNull().references(() => modules.id),
  title: text('title').notNull(),
  type: text('type').notNull().default('Nazariy'),
  content: text('content'),
  videoUrl: text('video_url'),
  duration: text('duration'),
  free: boolean('free').notNull().default(false),
  order: integer('order').notNull().default(0),
  published: boolean('published').notNull().default(false)
})

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, { fields: [lessons.moduleId], references: [modules.id] }),
  progress: many(lessonProgress)
}))

// ─── Guides ───────────────────────────────────────────────────────────────────

export const guides = pgTable('guides', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  coverUrl: text('cover_url'),
  categoryId: integer('category_id').references(() => categories.id),
  tags: text('tags').array(),
  bg: text('bg'),
  accent: text('accent'),
  badge: text('badge'),
  level: text('level'),
  isFree: boolean('is_free').notNull().default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const guidesRelations = relations(guides, ({ one }) => ({
  category: one(categories, { fields: [guides.categoryId], references: [categories.id] })
}))

// ─── Lesson Progress ──────────────────────────────────────────────────────────

export const lessonProgress = pgTable('lesson_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id),
  completedAt: timestamp('completed_at').notNull().defaultNow()
})

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [lessonProgress.lessonId], references: [lessons.id] })
}))
