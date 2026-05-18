# Admin Panel — Design Spec
Date: 2026-05-18

## Overview

Admin panel for managing courses and guides on Chayroom AI Club. Only the owner (identified by Telegram ID) can access it. Courses and guides are currently hardcoded in Vue files — this replaces that with Supabase-backed dynamic data.

## External Services

| Service | Purpose |
|---|---|
| Supabase (PostgreSQL) | Data storage for courses and guides metadata |
| Supabase Storage | Cover images / thumbnails |
| Notion API | Guide content (owner writes in Notion, site fetches automatically) |
| Kinescope | Course videos (DRM + domain restriction, fast CDN for RU/CIS) |

## Architecture

```
Notion (write guides here)     Kinescope (upload videos here)
        ↓                               ↓
   notion_page_id              kinescope_video_id
        ↓                               ↓
Admin Panel (/admin) → Supabase → /courses, /guides pages
                           ↓
                    Supabase Storage
                    (cover images)
```

## Database Schema

### `courses` table

| column | type | notes |
|---|---|---|
| id | uuid | auto, primary key |
| title | text | |
| description | text | |
| category | text | AI-агенты / Вайбкодинг / Нейросети / Контент |
| tags | text[] | e.g. ['AI', 'Hermes'] |
| level | text | Начинающий / Средний / Продвинутый |
| level_color | text | hex color for level badge |
| modules_count | int | |
| lessons_count | int | |
| duration | text | e.g. ~2h |
| cover_url | text | Supabase Storage URL |
| bg_color | text | card background color |
| is_dark | bool | true = white text on dark bg |
| kinescope_video_id | text | intro/promo video ID |
| is_published | bool | false = draft, not shown on site |
| created_at | timestamptz | auto |

### `guides` table

| column | type | notes |
|---|---|---|
| id | uuid | auto, primary key |
| title | text | |
| description | text | short teaser |
| category | text | |
| tags | text[] | |
| cover_url | text | Supabase Storage URL |
| bg_color | text | card background color |
| accent_color | text | gradient accent color |
| badge | text | start / гайд |
| is_free | bool | free or subscription required |
| notion_page_id | text | Notion page ID for full content |
| is_published | bool | |
| created_at | timestamptz | auto |

## Admin Access Control

**Frontend:** `middleware/admin.ts` checks `authStore.user.telegramId === config.public.adminTelegramId`. Non-admins see a generic 404 page (no hint that /admin exists).

**Server routes:** POST/PUT/DELETE endpoints read the `cx-user` cookie, parse the stored telegramId, and compare to `runtimeConfig.adminTelegramId` (private, server-only). Returns 403 if mismatch. This prevents direct API calls bypassing the frontend middleware.

**Env vars:**
```
ADMIN_TELEGRAM_ID=123456789        # private, server-only
NUXT_PUBLIC_ADMIN_TELEGRAM_ID=123456789  # public, for middleware
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...           # private, server-only (bypasses RLS)
NOTION_API_KEY=...                 # private, server-only
```

## Pages & Routes

### New pages
- `/admin` — dashboard with Курсы / Гайды tabs, list of items, publish toggles
- `/admin/courses/new` — create course form
- `/admin/courses/[id]/edit` — edit course form
- `/admin/guides/new` — create guide form
- `/admin/guides/[id]/edit` — edit guide form

### Updated pages
- `/courses` — fetch from Supabase instead of hardcoded array
- `/guides` — fetch from Supabase instead of hardcoded array

### New detail pages
- `/courses/[id]` — course detail with Kinescope video embed
- `/guides/[id]` — guide detail with Notion content rendered

## Admin Panel UI

**List view (`/admin`):**
- Two tabs: Курсы | Гайды
- Each item row: cover thumbnail, title, category, published toggle, Edit / Delete buttons
- "+ Добавить" button top right

**Course form:**
- Fields: title, description, category (select), tags (chip input), level (select), level color, modules count, lessons count, duration, bg color, is_dark toggle, Kinescope video ID, cover image upload
- Cover image: drag-drop upload → Supabase Storage → saves URL
- Save as draft (is_published=false) or Publish

**Guide form:**
- Fields: title, description, category (select), tags (chip input), cover image upload, bg color, accent color, badge (select: start/гайд), is_free toggle, Notion page ID
- Notion page ID: paste Notion public page URL → parsed to extract ID
- Save as draft or Publish

## Server API Routes (Nuxt server/)

```
server/api/
  courses/
    index.get.ts      — GET /api/courses (public, only published)
    index.post.ts     — POST /api/courses (admin only)
    [id].get.ts       — GET /api/courses/:id
    [id].put.ts       — PUT /api/courses/:id (admin only)
    [id].delete.ts    — DELETE /api/courses/:id (admin only)
  guides/
    index.get.ts
    index.post.ts
    [id].get.ts
    [id].put.ts
    [id].delete.ts
  notion/
    [pageId].get.ts   — GET /api/notion/:pageId → fetches Notion page blocks
  upload/
    image.post.ts     — POST /api/upload/image → uploads to Supabase Storage
```

## Notion Integration

- Guide content is stored in Notion as a public page
- `/api/notion/[pageId]` fetches page blocks via Notion API using `NOTION_API_KEY`
- Renders: headings, paragraphs, images, callouts, code blocks, dividers
- Kinescope video blocks rendered as embedded players
- No real-time sync needed — fetched on each page load (can add caching later)

## Kinescope Integration

- Videos uploaded directly to Kinescope dashboard by owner
- Only the video ID is stored in Supabase
- Embedded via `<iframe src="https://kinescope.io/embed/{id}">` with domain restriction configured in Kinescope settings

## Data Flow: /courses page

1. `useFetch('/api/courses')` on mount
2. Server route queries Supabase: `select * from courses where is_published = true order by created_at desc`
3. Returns JSON array
4. Page renders cards (same design as current hardcoded cards)

## Data Flow: /guides/[id] page

1. `useFetch('/api/guides/:id')` → gets guide metadata from Supabase
2. `useFetch('/api/notion/:pageId')` → gets content blocks from Notion API
3. Renders: cover, title, tags, then Notion blocks (paragraphs, headings, images, videos)

## Out of Scope (for now)

- User management in admin panel
- Subscription management
- Lesson-by-lesson course structure (just the course card + one intro video)
- Comments or progress tracking
- Search/filtering in admin panel
