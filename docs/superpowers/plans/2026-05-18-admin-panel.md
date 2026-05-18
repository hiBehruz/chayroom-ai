# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an owner-only admin panel at `/admin` for managing courses and guides, backed by Supabase, with Notion for guide content and Kinescope for course videos.

**Architecture:** All data mutations go through Nuxt server API routes using the Supabase service key. Public `/courses` and `/guides` pages fetch from these routes instead of hardcoded arrays. Admin pages are protected by a named middleware that checks the user's Telegram ID against `NUXT_PUBLIC_ADMIN_TELEGRAM_ID`. Notion guide content is fetched server-side per page load.

**Tech Stack:** Nuxt 4 (`app/` directory), @supabase/supabase-js, @notionhq/client, Kinescope iframe embed, Tailwind CSS v4, @nuxt/ui, Vitest

---

## File Map

```
server/
  utils/
    supabase.ts          ← Supabase service client factory
    admin.ts             ← isAdminRequest() + pure parseAdminFromCookie()
  api/
    courses/
      index.get.ts       ← GET /api/courses (public, published only)
      index.post.ts      ← POST /api/courses (admin)
      [id].get.ts        ← GET /api/courses/:id (public)
      [id].put.ts        ← PUT /api/courses/:id (admin)
      [id].delete.ts     ← DELETE /api/courses/:id (admin)
    guides/
      index.get.ts
      index.post.ts
      [id].get.ts
      [id].put.ts
      [id].delete.ts
    upload/
      image.post.ts      ← POST /api/upload/image → Supabase Storage
    notion/
      [pageId].get.ts    ← GET /api/notion/:pageId → Notion blocks

app/
  middleware/
    admin.ts             ← redirect non-admins to 404
  pages/
    admin/
      index.vue          ← list view with Курсы / Гайды tabs
      courses/
        new.vue
        [id]/
          edit.vue
      guides/
        new.vue
        [id]/
          edit.vue
    courses/
      [id].vue           ← course detail + Kinescope embed
    guides/
      [id].vue           ← guide detail + Notion content
  components/
    admin/
      CourseForm.vue     ← shared form for new + edit course
      GuideForm.vue      ← shared form for new + edit guide
      ImageUpload.vue    ← drag-drop → /api/upload/image
    NotionContent.vue    ← renders array of Notion blocks

docs/
  supabase-schema.sql    ← reference SQL to run in Supabase dashboard

Modified:
  nuxt.config.ts         ← runtimeConfig additions
  app/pages/courses.vue  ← replace hardcoded array with useFetch
  app/pages/guides.vue   ← replace hardcoded array with useFetch
```

---

### Task 1: Install Dependencies & Configure Environment

**Files:**
- Modify: `nuxt.config.ts`
- Create: `.env.example`
- Create: `docs/supabase-schema.sql`

- [ ] **Step 1: Install packages**

```bash
pnpm add @supabase/supabase-js @notionhq/client
pnpm add -D vitest
```

Expected: packages added, no errors.

- [ ] **Step 2: Add runtimeConfig to nuxt.config.ts**

Open `nuxt.config.ts` and replace the `runtimeConfig` block:

```typescript
runtimeConfig: {
  adminTelegramId: '',
  supabaseUrl: '',
  supabaseServiceKey: '',
  notionApiKey: '',
  public: {
    telegramBotUsername: '',
    adminTelegramId: '',
  }
},
```

- [ ] **Step 3: Create vitest.config.ts at project root**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', '.nuxt']
  }
})
```

- [ ] **Step 4: Create .env.example**

```bash
# Supabase
NUXT_SUPABASE_URL=https://your-project.supabase.co
NUXT_SUPABASE_SERVICE_KEY=your-service-role-key

# Notion
NUXT_NOTION_API_KEY=secret_xxx

# Admin (your Telegram ID — find it via @userinfobot on Telegram)
NUXT_ADMIN_TELEGRAM_ID=123456789
NUXT_PUBLIC_ADMIN_TELEGRAM_ID=123456789
```

- [ ] **Step 5: Create local .env with real values**

Copy `.env.example` to `.env` and fill in real values. Check `.gitignore` — `.env` must already be listed (it is by default in Nuxt).

- [ ] **Step 6: Commit**

```bash
git add nuxt.config.ts .env.example vitest.config.ts
git commit -m "feat: add supabase, notion, vitest dependencies and env config"
```

---

### Task 2: Supabase Tables & Storage Bucket

**Files:**
- Create: `docs/supabase-schema.sql`

- [ ] **Step 1: Create schema file**

Create `docs/supabase-schema.sql`:

```sql
-- Run this in Supabase Dashboard > SQL Editor

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default '',
  tags text[] not null default '{}',
  level text not null default 'Начинающий',
  level_color text not null default '#22c55e',
  modules_count int not null default 0,
  lessons_count int not null default 0,
  duration text not null default '',
  cover_url text not null default '',
  bg_color text not null default '#f0f4ff',
  is_dark boolean not null default false,
  kinescope_video_id text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default '',
  tags text[] not null default '{}',
  cover_url text not null default '',
  bg_color text not null default '#0d1117',
  accent_color text not null default '#60a5fa',
  badge text not null default 'гайд',
  is_free boolean not null default false,
  notion_page_id text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 2: Run SQL in Supabase dashboard**

Open Supabase Dashboard → SQL Editor → paste the SQL above → click Run.
Expected: "Success. No rows returned."

- [ ] **Step 3: Create Storage bucket**

In Supabase Dashboard → Storage → New bucket:
- Name: `covers`
- Public: ✅ enabled (cover images are public)
- Click Save.

Then go to Storage → Policies → covers bucket → New policy:
- Allow public read: `bucket_id = 'covers'` for SELECT
- Allow all operations for service role (already default)

- [ ] **Step 4: Commit**

```bash
git add docs/supabase-schema.sql
git commit -m "docs: add supabase schema and storage setup instructions"
```

---

### Task 3: Server Utilities (Supabase Client + Admin Check)

**Files:**
- Create: `server/utils/supabase.ts`
- Create: `server/utils/admin.ts`
- Create: `server/utils/admin.test.ts`

- [ ] **Step 1: Write failing tests for parseAdminFromCookie**

Create `server/utils/admin.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseAdminFromCookie } from './admin'

describe('parseAdminFromCookie', () => {
  it('returns true when telegramId matches adminId', () => {
    const cookie = JSON.stringify({ telegramId: 123456789 })
    expect(parseAdminFromCookie(cookie, '123456789')).toBe(true)
  })

  it('returns true when id (not telegramId) matches', () => {
    const cookie = JSON.stringify({ id: 123456789 })
    expect(parseAdminFromCookie(cookie, '123456789')).toBe(true)
  })

  it('returns false when id does not match', () => {
    const cookie = JSON.stringify({ telegramId: 111 })
    expect(parseAdminFromCookie(cookie, '123456789')).toBe(false)
  })

  it('returns false when cookie is undefined', () => {
    expect(parseAdminFromCookie(undefined, '123456789')).toBe(false)
  })

  it('returns false when cookie is malformed JSON', () => {
    expect(parseAdminFromCookie('not-json', '123456789')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pnpm vitest run server/utils/admin.test.ts
```

Expected: FAIL — "Cannot find module './admin'"

- [ ] **Step 3: Create server/utils/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

export function useServerSupabase() {
  const config = useRuntimeConfig()
  return createClient(config.supabaseUrl, config.supabaseServiceKey)
}
```

- [ ] **Step 4: Create server/utils/admin.ts**

```typescript
import type { H3Event } from 'h3'

export function parseAdminFromCookie(cookieValue: string | undefined, adminId: string): boolean {
  if (!cookieValue) return false
  try {
    const user = JSON.parse(cookieValue)
    return String(user.telegramId ?? user.id) === String(adminId)
  } catch {
    return false
  }
}

export function isAdminRequest(event: H3Event): boolean {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'cx-user')
  return parseAdminFromCookie(cookie, config.adminTelegramId)
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
pnpm vitest run server/utils/admin.test.ts
```

Expected: PASS — 5 tests passing.

- [ ] **Step 6: Commit**

```bash
git add server/utils/supabase.ts server/utils/admin.ts server/utils/admin.test.ts
git commit -m "feat: add supabase server client and admin verification utility"
```

---

### Task 4: Courses Server API Routes

**Files:**
- Create: `server/api/courses/index.get.ts`
- Create: `server/api/courses/index.post.ts`
- Create: `server/api/courses/[id].get.ts`
- Create: `server/api/courses/[id].put.ts`
- Create: `server/api/courses/[id].delete.ts`

- [ ] **Step 1: Create server/api/courses/index.get.ts**

```typescript
export default defineEventHandler(async () => {
  const db = useServerSupabase()
  const { data, error } = await db
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

- [ ] **Step 2: Create server/api/courses/index.post.ts**

```typescript
export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })
  const db = useServerSupabase()
  const body = await readBody(event)
  const { data, error } = await db.from('courses').insert(body).select().single()
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

- [ ] **Step 3: Create server/api/courses/[id].get.ts**

```typescript
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = useServerSupabase()
  const { data, error } = await db.from('courses').select('*').eq('id', id).single()
  if (error) throw createError({ statusCode: 404, message: 'Course not found' })
  return data
})
```

- [ ] **Step 4: Create server/api/courses/[id].put.ts**

```typescript
export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })
  const id = getRouterParam(event, 'id')
  const db = useServerSupabase()
  const body = await readBody(event)
  const { data, error } = await db.from('courses').update(body).eq('id', id).select().single()
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

- [ ] **Step 5: Create server/api/courses/[id].delete.ts**

```typescript
export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })
  const id = getRouterParam(event, 'id')
  const db = useServerSupabase()
  const { error } = await db.from('courses').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { success: true }
})
```

- [ ] **Step 6: Test manually**

Start dev server: `pnpm dev`
In browser console or Postman:
- `GET http://localhost:3000/api/courses` → should return `[]` (empty, no courses yet)
- `POST http://localhost:3000/api/courses` without cookie → should return 403

- [ ] **Step 7: Commit**

```bash
git add server/api/courses/
git commit -m "feat: add courses CRUD server API routes"
```

---

### Task 5: Guides Server API Routes

**Files:**
- Create: `server/api/guides/index.get.ts`
- Create: `server/api/guides/index.post.ts`
- Create: `server/api/guides/[id].get.ts`
- Create: `server/api/guides/[id].put.ts`
- Create: `server/api/guides/[id].delete.ts`

- [ ] **Step 1: Create server/api/guides/index.get.ts**

```typescript
export default defineEventHandler(async () => {
  const db = useServerSupabase()
  const { data, error } = await db
    .from('guides')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

- [ ] **Step 2: Create server/api/guides/index.post.ts**

```typescript
export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })
  const db = useServerSupabase()
  const body = await readBody(event)
  const { data, error } = await db.from('guides').insert(body).select().single()
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

- [ ] **Step 3: Create server/api/guides/[id].get.ts**

```typescript
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = useServerSupabase()
  const { data, error } = await db.from('guides').select('*').eq('id', id).single()
  if (error) throw createError({ statusCode: 404, message: 'Guide not found' })
  return data
})
```

- [ ] **Step 4: Create server/api/guides/[id].put.ts**

```typescript
export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })
  const id = getRouterParam(event, 'id')
  const db = useServerSupabase()
  const body = await readBody(event)
  const { data, error } = await db.from('guides').update(body).eq('id', id).select().single()
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

- [ ] **Step 5: Create server/api/guides/[id].delete.ts**

```typescript
export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })
  const id = getRouterParam(event, 'id')
  const db = useServerSupabase()
  const { error } = await db.from('guides').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { success: true }
})
```

- [ ] **Step 6: Commit**

```bash
git add server/api/guides/
git commit -m "feat: add guides CRUD server API routes"
```

---

### Task 6: Image Upload & Notion API Routes

**Files:**
- Create: `server/api/upload/image.post.ts`
- Create: `server/api/notion/[pageId].get.ts`

- [ ] **Step 1: Create server/api/upload/image.post.ts**

```typescript
export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })

  const formData = await readFormData(event)
  const file = formData.get('file') as File
  if (!file) throw createError({ statusCode: 400, message: 'No file provided' })

  const db = useServerSupabase()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await db.storage.from('covers').upload(filename, buffer, {
    contentType: file.type,
    upsert: false
  })
  if (error) throw createError({ statusCode: 500, message: error.message })

  const { data } = db.storage.from('covers').getPublicUrl(filename)
  return { url: data.publicUrl }
})
```

- [ ] **Step 2: Create server/api/notion/[pageId].get.ts**

```typescript
import { Client } from '@notionhq/client'
import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const pageId = getRouterParam(event, 'pageId') as string

  const notion = new Client({ auth: config.notionApiKey })

  const { results } = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100
  })

  return results as BlockObjectResponse[]
})
```

- [ ] **Step 3: Commit**

```bash
git add server/api/upload/ server/api/notion/
git commit -m "feat: add image upload and notion content API routes"
```

---

### Task 7: Admin Middleware

**Files:**
- Create: `app/middleware/admin.ts`

- [ ] **Step 1: Create app/middleware/admin.ts**

```typescript
export default defineNuxtRouteMiddleware(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  if (!authStore.user) return navigateTo('/login')

  const userId = String(authStore.user.telegramId ?? authStore.user.id)
  const adminId = String(config.public.adminTelegramId)

  if (userId !== adminId) throw createError({ statusCode: 404, fatal: true })
})
```

- [ ] **Step 2: Test the middleware**

Start dev server (`pnpm dev`) and visit `http://localhost:3000/admin` while NOT logged in.
Expected: redirect to /login.

Log in as a non-admin user (or change your Telegram ID in .env temporarily).
Expected: 404 page.

Log in as the admin (your real Telegram ID matching `NUXT_PUBLIC_ADMIN_TELEGRAM_ID`).
Expected: page loads (will show 404 until we create the page in next task).

- [ ] **Step 3: Commit**

```bash
git add app/middleware/admin.ts
git commit -m "feat: add admin route middleware"
```

---

### Task 8: Admin List Page

**Files:**
- Create: `app/pages/admin/index.vue`

- [ ] **Step 1: Create app/pages/admin/index.vue**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const activeTab = ref<'courses' | 'guides'>('courses')

const { data: courses, refresh: refreshCourses } = await useFetch('/api/courses', {
  query: { all: true }
})
const { data: guides, refresh: refreshGuides } = await useFetch('/api/guides', {
  query: { all: true }
})

async function deleteCourse(id: string) {
  if (!confirm('Удалить этот курс?')) return
  await $fetch(`/api/courses/${id}`, { method: 'DELETE' })
  refreshCourses()
}

async function deleteGuide(id: string) {
  if (!confirm('Удалить этот гайд?')) return
  await $fetch(`/api/guides/${id}`, { method: 'DELETE' })
  refreshGuides()
}

async function togglePublish(type: 'courses' | 'guides', id: string, current: boolean) {
  await $fetch(`/api/${type}/${id}`, { method: 'PUT', body: { is_published: !current } })
  type === 'courses' ? refreshCourses() : refreshGuides()
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-[28px] font-extrabold tracking-tight text-[#1a1a1a]">Панель управления</h1>
        <NuxtLink
          :to="activeTab === 'courses' ? '/admin/courses/new' : '/admin/guides/new'"
          class="btn-primary text-[13px]! px-4! py-2!"
        >
          + Добавить
        </NuxtLink>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-cx-line mb-6">
        <button
          v-for="tab in (['courses', 'guides'] as const)"
          :key="tab"
          :class="[
            'px-5 py-2.5 text-[14px] font-semibold transition-colors -mb-px border-b-2',
            activeTab === tab
              ? 'text-cx-blue border-cx-blue'
              : 'text-cx-muted border-transparent hover:text-cx-ink'
          ]"
          @click="activeTab = tab"
        >
          {{ tab === 'courses' ? 'Курсы' : 'Гайды' }}
        </button>
      </div>

      <!-- Courses list -->
      <div v-if="activeTab === 'courses'" class="flex flex-col gap-3">
        <div
          v-for="course in courses"
          :key="course.id"
          class="flex items-center gap-4 p-4 rounded-xl border border-cx-line bg-[#fafafa]"
        >
          <div
            class="w-14 h-14 rounded-lg shrink-0 bg-cover bg-center"
            :style="course.cover_url ? `background-image: url(${course.cover_url})` : `background-color: ${course.bg_color}`"
          />
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-bold text-[#1a1a1a] truncate">{{ course.title }}</p>
            <p class="text-[12px] text-cx-muted">{{ course.category }}</p>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-[12px] text-cx-muted">{{ course.is_published ? 'Опубликован' : 'Черновик' }}</span>
            <input
              type="checkbox"
              :checked="course.is_published"
              class="cursor-pointer"
              @change="togglePublish('courses', course.id, course.is_published)"
            >
          </label>
          <NuxtLink
            :to="`/admin/courses/${course.id}/edit`"
            class="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-cx-line hover:border-cx-blue hover:text-cx-blue transition-colors"
          >
            Изменить
          </NuxtLink>
          <button
            class="px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            @click="deleteCourse(course.id)"
          >
            Удалить
          </button>
        </div>
        <p v-if="!courses?.length" class="text-cx-muted text-[14px] py-8 text-center">Курсов пока нет</p>
      </div>

      <!-- Guides list -->
      <div v-if="activeTab === 'guides'" class="flex flex-col gap-3">
        <div
          v-for="guide in guides"
          :key="guide.id"
          class="flex items-center gap-4 p-4 rounded-xl border border-cx-line bg-[#fafafa]"
        >
          <div
            class="w-14 h-14 rounded-lg shrink-0"
            :style="{ backgroundColor: guide.bg_color }"
          />
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-bold text-[#1a1a1a] truncate">{{ guide.title }}</p>
            <p class="text-[12px] text-cx-muted">{{ guide.category }} · {{ guide.is_free ? 'Бесплатно' : 'По подписке' }}</p>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-[12px] text-cx-muted">{{ guide.is_published ? 'Опубликован' : 'Черновик' }}</span>
            <input
              type="checkbox"
              :checked="guide.is_published"
              class="cursor-pointer"
              @change="togglePublish('guides', guide.id, guide.is_published)"
            >
          </label>
          <NuxtLink
            :to="`/admin/guides/${guide.id}/edit`"
            class="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-cx-line hover:border-cx-blue hover:text-cx-blue transition-colors"
          >
            Изменить
          </NuxtLink>
          <button
            class="px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            @click="deleteGuide(guide.id)"
          >
            Удалить
          </button>
        </div>
        <p v-if="!guides?.length" class="text-cx-muted text-[14px] py-8 text-center">Гайдов пока нет</p>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Update GET routes to support `all` query param for admin**

Admin needs to see unpublished items too. Update `server/api/courses/index.get.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const db = useServerSupabase()
  const query = getQuery(event)
  const showAll = query.all === 'true' && isAdminRequest(event)

  let req = db.from('courses').select('*').order('created_at', { ascending: false })
  if (!showAll) req = req.eq('is_published', true)

  const { data, error } = await req
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

Apply the same change to `server/api/guides/index.get.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const db = useServerSupabase()
  const query = getQuery(event)
  const showAll = query.all === 'true' && isAdminRequest(event)

  let req = db.from('guides').select('*').order('created_at', { ascending: false })
  if (!showAll) req = req.eq('is_published', true)

  const { data, error } = await req
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

- [ ] **Step 3: Test manually**

Log in as admin, visit `http://localhost:3000/admin`.
Expected: page loads, shows empty "Курсов пока нет" and "Гайдов пока нет" messages, tabs work.

- [ ] **Step 4: Commit**

```bash
git add app/pages/admin/index.vue server/api/courses/index.get.ts server/api/guides/index.get.ts
git commit -m "feat: add admin list page with courses and guides tabs"
```

---

### Task 9: Image Upload Component + Course Form

**Files:**
- Create: `app/components/admin/ImageUpload.vue`
- Create: `app/components/admin/CourseForm.vue`
- Create: `app/pages/admin/courses/new.vue`
- Create: `app/pages/admin/courses/[id]/edit.vue`

- [ ] **Step 1: Create app/components/admin/ImageUpload.vue**

```vue
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [url: string] }>()

const uploading = ref(false)
const error = ref('')

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  error.value = ''
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await $fetch<{ url: string }>('/api/upload/image', { method: 'POST', body: form })
    emit('update:modelValue', res.url)
  } catch {
    error.value = 'Ошибка загрузки'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div>
    <div
      class="relative w-full h-36 rounded-xl border-2 border-dashed border-cx-line flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cx-blue transition-colors overflow-hidden"
      :style="modelValue ? `background-image: url(${modelValue}); background-size: cover; background-position: center;` : ''"
    >
      <div v-if="!modelValue" class="flex flex-col items-center gap-1 text-cx-muted">
        <UIcon name="i-lucide-image-up" class="size-7" />
        <span class="text-[12px]">{{ uploading ? 'Загрузка...' : 'Нажмите или перетащите' }}</span>
      </div>
      <div v-else class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <span class="text-white text-[12px] font-medium">Изменить</span>
      </div>
      <input
        type="file"
        accept="image/*"
        class="absolute inset-0 opacity-0 cursor-pointer"
        :disabled="uploading"
        @change="onFile"
      >
    </div>
    <p v-if="error" class="text-red-500 text-[12px] mt-1">{{ error }}</p>
  </div>
</template>
```

- [ ] **Step 2: Create app/components/admin/CourseForm.vue**

```vue
<script setup lang="ts">
const props = defineProps<{
  initialData?: Record<string, unknown>
}>()
const emit = defineEmits<{ submit: [data: Record<string, unknown>] }>()

const categories = ['Вайбкодинг', 'AI-агенты', 'Нейросети', 'Контент']
const levels = [
  { label: 'Начинающий', color: '#22c55e' },
  { label: 'Средний', color: '#f97316' },
  { label: 'Продвинутый', color: '#ef4444' }
]

const form = reactive({
  title: '',
  description: '',
  category: 'AI-агенты',
  tags: [] as string[],
  level: 'Начинающий',
  level_color: '#22c55e',
  modules_count: 0,
  lessons_count: 0,
  duration: '',
  cover_url: '',
  bg_color: '#f0f4ff',
  is_dark: false,
  kinescope_video_id: '',
  is_published: false,
  ...props.initialData
})

const tagInput = ref('')

function addTag() {
  const t = tagInput.value.trim()
  if (t && !form.tags.includes(t)) form.tags.push(t)
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

function onLevelChange(label: string) {
  form.level = label
  form.level_color = levels.find(l => l.label === label)?.color ?? '#22c55e'
}

function onSubmit(publish: boolean) {
  emit('submit', { ...form, is_published: publish })
}
</script>

<template>
  <form class="flex flex-col gap-5 max-w-2xl" @submit.prevent>
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Название</label>
        <input v-model="form.title" type="text" required class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue" placeholder="Название курса">
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Описание</label>
        <textarea v-model="form.description" rows="3" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue resize-none" placeholder="Краткое описание курса" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Категория</label>
        <select v-model="form.category" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue bg-white">
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Уровень</label>
        <select :value="form.level" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue bg-white" @change="e => onLevelChange((e.target as HTMLSelectElement).value)">
          <option v-for="l in levels" :key="l.label">{{ l.label }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Модулей</label>
        <input v-model.number="form.modules_count" type="number" min="0" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Уроков</label>
        <input v-model.number="form.lessons_count" type="number" min="0" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Длительность</label>
        <input v-model="form.duration" type="text" placeholder="~2h" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">ID видео Kinescope</label>
        <input v-model="form.kinescope_video_id" type="text" placeholder="abc123def" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Фон карточки</label>
        <div class="flex items-center gap-2">
          <input v-model="form.bg_color" type="color" class="w-10 h-10 rounded-lg border border-cx-line cursor-pointer p-0.5">
          <input v-model="form.bg_color" type="text" class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <input id="isDark" v-model="form.is_dark" type="checkbox" class="cursor-pointer">
        <label for="isDark" class="text-[13px] font-semibold text-[#1a1a1a] cursor-pointer">Тёмный фон (белый текст)</label>
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Теги</label>
        <div class="flex flex-wrap gap-1.5 mb-1.5">
          <span
            v-for="tag in form.tags"
            :key="tag"
            class="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted bg-white"
          >
            {{ tag }}
            <button type="button" class="text-red-400 hover:text-red-600" @click="removeTag(tag)">×</button>
          </span>
        </div>
        <div class="flex gap-2">
          <input v-model="tagInput" type="text" placeholder="Новый тег" class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue" @keydown.enter.prevent="addTag">
          <button type="button" class="px-4 py-2 rounded-xl border border-cx-line text-[13px] font-medium hover:border-cx-blue transition-colors" @click="addTag">+</button>
        </div>
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Обложка</label>
        <AdminImageUpload v-model="form.cover_url" />
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <button type="button" class="flex-1 py-2.5 rounded-xl border border-cx-line text-[13px] font-semibold hover:bg-[#f7f7f7] transition-colors" @click="onSubmit(false)">
        Сохранить как черновик
      </button>
      <button type="button" class="flex-1 btn-primary text-[13px]! py-2.5!" @click="onSubmit(true)">
        Опубликовать
      </button>
    </div>
  </form>
</template>
```

- [ ] **Step 3: Create app/pages/admin/courses/new.vue**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const router = useRouter()
const saving = ref(false)
const error = ref('')

async function handleSubmit(data: Record<string, unknown>) {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/courses', { method: 'POST', body: data })
    router.push('/admin')
  } catch {
    error.value = 'Ошибка при сохранении'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <div class="flex items-center gap-3 mb-8">
        <NuxtLink to="/admin" class="text-cx-muted hover:text-cx-ink transition-colors">← Назад</NuxtLink>
        <h1 class="text-[24px] font-extrabold tracking-tight text-[#1a1a1a]">Новый курс</h1>
      </div>
      <p v-if="error" class="text-red-500 text-[13px] mb-4">{{ error }}</p>
      <AdminCourseForm @submit="handleSubmit" />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Create app/pages/admin/courses/[id]/edit.vue**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const error = ref('')

const { data: course } = await useFetch(`/api/courses/${route.params.id}`)

async function handleSubmit(data: Record<string, unknown>) {
  error.value = ''
  try {
    await $fetch(`/api/courses/${route.params.id}`, { method: 'PUT', body: data })
    router.push('/admin')
  } catch {
    error.value = 'Ошибка при сохранении'
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <div class="flex items-center gap-3 mb-8">
        <NuxtLink to="/admin" class="text-cx-muted hover:text-cx-ink transition-colors">← Назад</NuxtLink>
        <h1 class="text-[24px] font-extrabold tracking-tight text-[#1a1a1a]">Редактировать курс</h1>
      </div>
      <p v-if="error" class="text-red-500 text-[13px] mb-4">{{ error }}</p>
      <AdminCourseForm v-if="course" :initial-data="course" @submit="handleSubmit" />
    </div>
  </div>
</template>
```

- [ ] **Step 5: Test manually**

Visit `http://localhost:3000/admin/courses/new` (as admin).
Fill in the form, upload an image, click "Опубликовать".
Expected: redirected to /admin, course appears in the list.

- [ ] **Step 6: Commit**

```bash
git add app/components/admin/ app/pages/admin/courses/
git commit -m "feat: add course form and admin course pages"
```

---

### Task 10: Guide Form Pages

**Files:**
- Create: `app/components/admin/GuideForm.vue`
- Create: `app/pages/admin/guides/new.vue`
- Create: `app/pages/admin/guides/[id]/edit.vue`

- [ ] **Step 1: Create app/components/admin/GuideForm.vue**

```vue
<script setup lang="ts">
const props = defineProps<{ initialData?: Record<string, unknown> }>()
const emit = defineEmits<{ submit: [data: Record<string, unknown>] }>()

const categories = ['Вайбкодинг', 'AI-агенты', 'Нейросети', 'Контент']

const form = reactive({
  title: '',
  description: '',
  category: 'Нейросети',
  tags: [] as string[],
  cover_url: '',
  bg_color: '#0d1117',
  accent_color: '#60a5fa',
  badge: 'гайд',
  is_free: true,
  notion_page_id: '',
  is_published: false,
  ...props.initialData
})

const tagInput = ref('')
const notionUrlInput = ref('')

function addTag() {
  const t = tagInput.value.trim()
  if (t && !form.tags.includes(t)) form.tags.push(t)
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

function parseNotionUrl() {
  const url = notionUrlInput.value.trim()
  // Extract ID from URL like: https://notion.so/My-Page-abc123def456
  // or https://www.notion.so/workspace/Title-32charID
  const match = url.match(/([a-f0-9]{32})/)
  if (match) {
    form.notion_page_id = match[1]
    notionUrlInput.value = ''
  }
}

function onSubmit(publish: boolean) {
  emit('submit', { ...form, is_published: publish })
}
</script>

<template>
  <form class="flex flex-col gap-5 max-w-2xl" @submit.prevent>
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Название</label>
        <input v-model="form.title" type="text" required class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue" placeholder="Название гайда">
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Описание (тизер)</label>
        <textarea v-model="form.description" rows="2" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue resize-none" placeholder="Краткое описание" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Категория</label>
        <select v-model="form.category" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue bg-white">
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Значок</label>
        <select v-model="form.badge" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue bg-white">
          <option>гайд</option>
          <option>start</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Фон карточки</label>
        <div class="flex items-center gap-2">
          <input v-model="form.bg_color" type="color" class="w-10 h-10 rounded-lg border border-cx-line cursor-pointer p-0.5">
          <input v-model="form.bg_color" type="text" class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Акцентный цвет</label>
        <div class="flex items-center gap-2">
          <input v-model="form.accent_color" type="color" class="w-10 h-10 rounded-lg border border-cx-line cursor-pointer p-0.5">
          <input v-model="form.accent_color" type="text" class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
        </div>
      </div>

      <div class="col-span-2 flex items-center gap-3">
        <input id="isFree" v-model="form.is_free" type="checkbox" class="cursor-pointer">
        <label for="isFree" class="text-[13px] font-semibold text-[#1a1a1a] cursor-pointer">Бесплатный гайд</label>
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Теги</label>
        <div class="flex flex-wrap gap-1.5 mb-1.5">
          <span v-for="tag in form.tags" :key="tag" class="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted bg-white">
            {{ tag }}
            <button type="button" class="text-red-400 hover:text-red-600" @click="removeTag(tag)">×</button>
          </span>
        </div>
        <div class="flex gap-2">
          <input v-model="tagInput" type="text" placeholder="Новый тег" class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue" @keydown.enter.prevent="addTag">
          <button type="button" class="px-4 py-2 rounded-xl border border-cx-line text-[13px] font-medium hover:border-cx-blue transition-colors" @click="addTag">+</button>
        </div>
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Notion страница</label>
        <div class="flex gap-2">
          <input
            v-model="notionUrlInput"
            type="text"
            placeholder="Вставьте ссылку на Notion страницу"
            class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue"
          >
          <button type="button" class="px-4 py-2 rounded-xl border border-cx-line text-[13px] font-medium hover:border-cx-blue transition-colors" @click="parseNotionUrl">
            Применить
          </button>
        </div>
        <p v-if="form.notion_page_id" class="text-[12px] text-green-600 font-medium">
          ID: {{ form.notion_page_id }}
        </p>
        <p v-else class="text-[12px] text-cx-muted">
          Сделайте страницу Notion публичной перед публикацией
        </p>
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Обложка</label>
        <AdminImageUpload v-model="form.cover_url" />
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <button type="button" class="flex-1 py-2.5 rounded-xl border border-cx-line text-[13px] font-semibold hover:bg-[#f7f7f7] transition-colors" @click="onSubmit(false)">
        Сохранить как черновик
      </button>
      <button type="button" class="flex-1 btn-primary text-[13px]! py-2.5!" @click="onSubmit(true)">
        Опубликовать
      </button>
    </div>
  </form>
</template>
```

- [ ] **Step 2: Create app/pages/admin/guides/new.vue**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const router = useRouter()
const error = ref('')

async function handleSubmit(data: Record<string, unknown>) {
  error.value = ''
  try {
    await $fetch('/api/guides', { method: 'POST', body: data })
    router.push('/admin')
  } catch {
    error.value = 'Ошибка при сохранении'
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <div class="flex items-center gap-3 mb-8">
        <NuxtLink to="/admin" class="text-cx-muted hover:text-cx-ink transition-colors">← Назад</NuxtLink>
        <h1 class="text-[24px] font-extrabold tracking-tight text-[#1a1a1a]">Новый гайд</h1>
      </div>
      <p v-if="error" class="text-red-500 text-[13px] mb-4">{{ error }}</p>
      <AdminGuideForm @submit="handleSubmit" />
    </div>
  </div>
</template>
```

- [ ] **Step 3: Create app/pages/admin/guides/[id]/edit.vue**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const error = ref('')

const { data: guide } = await useFetch(`/api/guides/${route.params.id}`)

async function handleSubmit(data: Record<string, unknown>) {
  error.value = ''
  try {
    await $fetch(`/api/guides/${route.params.id}`, { method: 'PUT', body: data })
    router.push('/admin')
  } catch {
    error.value = 'Ошибка при сохранении'
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <div class="flex items-center gap-3 mb-8">
        <NuxtLink to="/admin" class="text-cx-muted hover:text-cx-ink transition-colors">← Назад</NuxtLink>
        <h1 class="text-[24px] font-extrabold tracking-tight text-[#1a1a1a]">Редактировать гайд</h1>
      </div>
      <p v-if="error" class="text-red-500 text-[13px] mb-4">{{ error }}</p>
      <AdminGuideForm v-if="guide" :initial-data="guide" @submit="handleSubmit" />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Test manually**

Visit `/admin/guides/new` (as admin). Fill form, paste a Notion URL, click "Применить".
Expected: Notion page ID extracted and shown in green below the input.

- [ ] **Step 5: Commit**

```bash
git add app/components/admin/GuideForm.vue app/pages/admin/guides/
git commit -m "feat: add guide form and admin guide pages"
```

---

### Task 11: Update Public Listing Pages

**Files:**
- Modify: `app/pages/courses.vue`
- Modify: `app/pages/guides.vue`

- [ ] **Step 1: Update app/pages/courses.vue — replace hardcoded array**

Remove the hardcoded `const courses = [...]` and `const filtered = computed(...)` blocks.
Replace with:

```typescript
const { data: allCourses } = await useFetch('/api/courses')

const filtered = computed(() =>
  activeCategory.value === 'Все'
    ? (allCourses.value ?? [])
    : (allCourses.value ?? []).filter((c: any) => c.category === activeCategory.value)
)
```

The `<script setup>` change is above. The template needs two changes:

**1. Replace the entire hardcoded card `#header` template** with a dynamic cover image version. Find the `<template #header>` block (lines ~116–164 in the current file) and replace it with:

```vue
<template #header>
  <div
    class="relative h-52 overflow-hidden bg-cover bg-center"
    :style="{
      backgroundColor: course.bg_color,
      backgroundImage: course.cover_url ? `url(${course.cover_url})` : undefined
    }"
  >
    <div class="absolute top-3 left-4">
      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-black/20 text-white">
        курс
      </span>
    </div>
    <div class="absolute top-3 right-4">
      <span
        class="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
        :style="{ backgroundColor: course.level_color + '22', color: course.level_color, border: `1px solid ${course.level_color}44` }"
      >
        {{ course.level }}
        <span class="text-[9px]">✦</span>
      </span>
    </div>
    <div v-if="!course.cover_url" class="absolute inset-0 flex items-center justify-center">
      <UIcon name="i-lucide-image" class="size-10 opacity-20" :class="course.is_dark ? 'text-white' : 'text-[#1a1a1a]'" />
    </div>
  </div>
</template>
```

**2. Update remaining field references** in the card body:
- `course.modules` → `course.modules_count`
- `course.lessons` → `course.lessons_count`

Also add a skeleton loading state. In the template, wrap the grid:

```vue
<!-- Skeleton while loading -->
<div v-if="!allCourses" class="grid grid-cols-3 gap-5">
  <div v-for="n in 3" :key="n" class="rounded-2xl bg-[#f7f7f7] overflow-hidden animate-pulse">
    <div class="h-52 bg-[#ebebeb]" />
    <div class="p-5 space-y-3">
      <div class="h-4 bg-[#ebebeb] rounded w-2/3" />
      <div class="h-4 bg-[#ebebeb] rounded w-full" />
    </div>
  </div>
</div>

<!-- Actual grid -->
<div v-else class="grid grid-cols-3 gap-5">
  <!-- existing UCard loop -->
</div>
```

- [ ] **Step 2: Update app/pages/guides.vue — replace hardcoded array**

Remove `const guides = [...]` and `const filtered = computed(...)`.
Replace with:

```typescript
const { data: allGuides } = await useFetch('/api/guides')

const filtered = computed(() =>
  activeCategory.value === 'Все'
    ? (allGuides.value ?? [])
    : (allGuides.value ?? []).filter((g: any) => g.category === activeCategory.value)
)
```

Update template references:
- `guide.accent` → `guide.accent_color`
- `guide.free` → `guide.is_free`

Add the same skeleton loading state as in Step 1 (3 skeleton cards).

- [ ] **Step 3: Test manually**

Visit `/courses` and `/guides`.
Expected: skeleton shown briefly, then actual data from Supabase (empty if no items added yet).

Add a course via admin panel, publish it, then visit `/courses`.
Expected: new course card appears.

- [ ] **Step 4: Commit**

```bash
git add app/pages/courses.vue app/pages/guides.vue
git commit -m "feat: connect courses and guides pages to Supabase"
```

---

### Task 12: Course Detail Page

**Files:**
- Create: `app/pages/courses/[id].vue`

- [ ] **Step 1: Create app/pages/courses/[id].vue**

```vue
<script setup lang="ts">
const route = useRoute()
const { data: course, error } = await useFetch(`/api/courses/${route.params.id}`)

if (error.value) throw createError({ statusCode: 404, fatal: true })

useSeoMeta({
  title: () => `${course.value?.title ?? 'Курс'} — Chayroom AI`
})
</script>

<template>
  <div v-if="course" class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Главная</NuxtLink>
        <span>/</span>
        <NuxtLink to="/courses" class="hover:text-cx-ink transition-colors">Курсы</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">{{ course.title }}</span>
      </div>

      <div class="grid grid-cols-3 gap-10">
        <!-- Main content -->
        <div class="col-span-2 flex flex-col gap-6">
          <!-- Kinescope video -->
          <div v-if="course.kinescope_video_id" class="relative w-full rounded-2xl overflow-hidden" style="aspect-ratio: 16/9">
            <iframe
              :src="`https://kinescope.io/embed/${course.kinescope_video_id}`"
              class="absolute inset-0 w-full h-full"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media;"
              allowfullscreen
            />
          </div>

          <div>
            <h1 class="text-[28px] font-extrabold tracking-tight text-[#1a1a1a] mb-3">{{ course.title }}</h1>
            <p class="text-[15px] text-cx-muted leading-relaxed">{{ course.description }}</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-4">
          <div class="rounded-2xl border border-cx-line p-5 flex flex-col gap-4 sticky top-20">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in course.tags"
                :key="tag"
                class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
              >
                {{ tag }}
              </span>
            </div>

            <div class="flex flex-col gap-2 text-[13px] text-cx-muted">
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-layout-list" class="size-4" />
                {{ course.modules_count }} модул{{ course.modules_count === 1 ? 'ь' : 'я' }}
              </span>
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-play-circle" class="size-4" />
                {{ course.lessons_count }} урок{{ course.lessons_count >= 5 ? 'ов' : 'а' }}
              </span>
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-clock" class="size-4" />
                {{ course.duration }}
              </span>
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-bar-chart-2" class="size-4" />
                <span :style="{ color: course.level_color }">{{ course.level }}</span>
              </span>
            </div>

            <button class="btn-primary w-full text-[13px]! py-2.5!">
              Получить доступ →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Add NuxtLink to course cards in courses.vue**

In `app/pages/courses.vue`, wrap the `UCard` with a `NuxtLink`:

```vue
<NuxtLink v-for="course in filtered" :key="course.id" :to="`/courses/${course.id}`">
  <UCard ...>
    ...
  </UCard>
</NuxtLink>
```

Or add `@click="navigateTo('/courses/' + course.id)"` to the UCard root if NuxtLink wrapping conflicts with UCard.

- [ ] **Step 3: Test manually**

Add a course with a Kinescope video ID via admin. Visit `/courses`, click the card.
Expected: detail page opens with Kinescope player embedded.

- [ ] **Step 4: Commit**

```bash
git add app/pages/courses/
git commit -m "feat: add course detail page with Kinescope video embed"
```

---

### Task 13: Notion Content Renderer + Guide Detail Page

**Files:**
- Create: `app/components/NotionContent.vue`
- Create: `app/pages/guides/[id].vue`

- [ ] **Step 1: Create app/components/NotionContent.vue**

```vue
<script setup lang="ts">
defineProps<{ blocks: any[] }>()

function getRichText(richText: any[]): string {
  return richText.map((r: any) => r.plain_text).join('')
}
</script>

<template>
  <div class="notion-content flex flex-col gap-3 text-[15px] leading-relaxed text-[#1a1a1a]">
    <template v-for="block in blocks" :key="block.id">
      <!-- Heading 1 -->
      <h1 v-if="block.type === 'heading_1'" class="text-[26px] font-extrabold tracking-tight mt-4">
        {{ getRichText(block.heading_1.rich_text) }}
      </h1>

      <!-- Heading 2 -->
      <h2 v-else-if="block.type === 'heading_2'" class="text-[20px] font-bold mt-3">
        {{ getRichText(block.heading_2.rich_text) }}
      </h2>

      <!-- Heading 3 -->
      <h3 v-else-if="block.type === 'heading_3'" class="text-[17px] font-semibold mt-2">
        {{ getRichText(block.heading_3.rich_text) }}
      </h3>

      <!-- Paragraph -->
      <p v-else-if="block.type === 'paragraph' && block.paragraph.rich_text.length" class="text-cx-muted">
        {{ getRichText(block.paragraph.rich_text) }}
      </p>

      <!-- Bulleted list -->
      <li v-else-if="block.type === 'bulleted_list_item'" class="ml-5 text-cx-muted list-disc">
        {{ getRichText(block.bulleted_list_item.rich_text) }}
      </li>

      <!-- Numbered list -->
      <li v-else-if="block.type === 'numbered_list_item'" class="ml-5 text-cx-muted list-decimal">
        {{ getRichText(block.numbered_list_item.rich_text) }}
      </li>

      <!-- Callout -->
      <div
        v-else-if="block.type === 'callout'"
        class="flex gap-3 p-4 rounded-xl bg-[#f0f4ff] border border-cx-blue/20"
      >
        <span>{{ block.callout.icon?.emoji ?? 'ℹ️' }}</span>
        <p class="text-[14px]">{{ getRichText(block.callout.rich_text) }}</p>
      </div>

      <!-- Code -->
      <pre
        v-else-if="block.type === 'code'"
        class="bg-[#0d1117] text-white rounded-xl p-4 text-[13px] overflow-x-auto"
      ><code>{{ getRichText(block.code.rich_text) }}</code></pre>

      <!-- Image -->
      <img
        v-else-if="block.type === 'image'"
        :src="block.image.type === 'external' ? block.image.external.url : block.image.file.url"
        class="rounded-xl w-full"
        alt=""
      >

      <!-- Embed (Kinescope) -->
      <div
        v-else-if="block.type === 'embed'"
        class="relative w-full rounded-2xl overflow-hidden"
        style="aspect-ratio: 16/9"
      >
        <iframe
          :src="block.embed.url.includes('kinescope') ? block.embed.url.replace('kinescope.io/', 'kinescope.io/embed/') : block.embed.url"
          class="absolute inset-0 w-full h-full"
          frameborder="0"
          allowfullscreen
        />
      </div>

      <!-- Divider -->
      <hr v-else-if="block.type === 'divider'" class="border-cx-line my-2">
    </template>
  </div>
</template>
```

- [ ] **Step 2: Create app/pages/guides/[id].vue**

```vue
<script setup lang="ts">
const route = useRoute()

const { data: guide, error } = await useFetch(`/api/guides/${route.params.id}`)
if (error.value) throw createError({ statusCode: 404, fatal: true })

const { data: blocks } = await useFetch(
  () => guide.value?.notion_page_id
    ? `/api/notion/${guide.value.notion_page_id}`
    : null
)

useSeoMeta({
  title: () => `${guide.value?.title ?? 'Гайд'} — Chayroom AI`
})
</script>

<template>
  <div v-if="guide" class="min-h-screen bg-white">
    <div class="max-w-180 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Главная</NuxtLink>
        <span>/</span>
        <NuxtLink to="/guides" class="hover:text-cx-ink transition-colors">Гайды</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium truncate max-w-60">{{ guide.title }}</span>
      </div>

      <!-- Cover -->
      <div
        class="relative h-60 rounded-2xl overflow-hidden flex items-center justify-center mb-8"
        :style="{ backgroundColor: guide.bg_color }"
      >
        <div
          class="absolute right-0 bottom-0 w-48 h-48 opacity-25"
          :style="{ background: `radial-gradient(circle at 80% 80%, ${guide.accent_color}, transparent 70%)` }"
        />
        <span
          class="absolute top-4 left-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
          :style="{ backgroundColor: guide.accent_color + '33', color: guide.accent_color }"
        >
          {{ guide.badge }}
        </span>
        <img
          v-if="guide.cover_url"
          :src="guide.cover_url"
          class="absolute inset-0 w-full h-full object-cover"
          alt=""
        >
      </div>

      <!-- Meta -->
      <div class="flex flex-wrap gap-1.5 mb-3">
        <span
          v-for="tag in guide.tags"
          :key="tag"
          class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
        >
          {{ tag }}
        </span>
      </div>

      <h1 class="text-[28px] font-extrabold tracking-tight text-[#1a1a1a] mb-2">{{ guide.title }}</h1>
      <p class="text-[15px] text-cx-muted mb-8">{{ guide.description }}</p>

      <!-- Access gate for paid content -->
      <div v-if="!guide.is_free" class="rounded-2xl border border-cx-line bg-[#f7f7f7] p-6 text-center mb-8">
        <p class="text-[15px] font-semibold text-[#1a1a1a] mb-1">Контент доступен по подписке</p>
        <p class="text-[13px] text-cx-muted mb-4">Оформите подписку, чтобы читать все гайды</p>
        <NuxtLink to="/#pricing" class="btn-primary text-[13px]! px-5! py-2!">
          Получить доступ →
        </NuxtLink>
      </div>

      <!-- Notion content -->
      <NotionContent v-if="blocks && (guide.is_free)" :blocks="blocks" />
    </div>
  </div>
</template>
```

- [ ] **Step 3: Add NuxtLink to guide cards in guides.vue**

In `app/pages/guides.vue`, make cards clickable:

```vue
<NuxtLink v-for="guide in filtered" :key="guide.id" :to="`/guides/${guide.id}`">
  <UCard ...>...</UCard>
</NuxtLink>
```

- [ ] **Step 4: Test manually**

1. In Notion, create a public page with some text, headings, and an image.
2. Add a guide via admin with that Notion page URL.
3. Visit `/guides`, click the card.
4. Expected: guide detail page opens, Notion content renders correctly.

For a paid guide: expected to see the access gate instead of content.

- [ ] **Step 5: Commit**

```bash
git add app/components/NotionContent.vue app/pages/guides/
git commit -m "feat: add guide detail page with Notion content renderer"
```

---

### Task 14: Final Polish & Verification

- [ ] **Step 1: Run all tests**

```bash
pnpm vitest run
```

Expected: 5 tests passing (admin.test.ts).

- [ ] **Step 2: Run type check**

```bash
pnpm vue-tsc --noEmit
```

Fix any type errors before continuing.

- [ ] **Step 3: End-to-end smoke test**

Walk through the full flow:
1. Log in as admin via Telegram
2. Visit `/admin` — see empty lists
3. Add a course with cover image and Kinescope ID — publish it
4. Visit `/courses` — new course card appears
5. Click course card — detail page opens with video
6. Add a free guide with Notion page ID — publish it
7. Visit `/guides` — new guide card appears
8. Click guide card — detail page opens with Notion content
9. Log out, visit `/admin` — redirected to /login

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete admin panel with Supabase, Notion, and Kinescope integration"
```
