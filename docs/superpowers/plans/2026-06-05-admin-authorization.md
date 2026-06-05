# Admin Authorization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real role-based admin access — only `ADMIN_TELEGRAM_IDS` accounts can log in at `admin.chayroom.uz` and mutate courses/guides, identity is cryptographically verified, and admins get full content access.

**Architecture:** A pure Telegram-hash verification util (unit-tested), an h3 sealed-session helper + `requireAdmin` guard applied to every mutation endpoint, three `/api/admin/*` endpoints for login/logout/me, role added to `/api/auth/me` with an admin paywall bypass, and a frontend `admin` middleware + admin login page. Infra (DNS, Caddy subdomain, BotFather) is documented as deploy-time steps.

**Tech Stack:** Nuxt 4 / Nitro (h3 `useSession`), Drizzle ORM (Postgres), Node `node:crypto`, `node:test` for unit tests.

**Reference specs:** `docs/superpowers/specs/2026-06-05-admin-authorization-design.md`

**Conventions discovered:**
- Tests: `*.test.mjs` using `node:test` + `node:assert/strict`, importing `.ts` directly. Run with `node --test --experimental-strip-types <file>` (local Node v24).
- Existing weak gate: `app/stores/auth.ts` has `isOwner` = `username === 'behruzzaripov'`. The new system supersedes it for enforcement; leave `isOwner` untouched.
- `useRuntimeConfig`, `createError`, `readBody`, `useSession`, `getRouterParam` are auto-imported in `server/`.

---

## File Structure

**Create:**
- `server/utils/telegram-auth.ts` — `verifyTelegramLoginPayload`, `parseAdminIds`, `isAdminId` (pure)
- `server/utils/telegram-auth.test.mjs` — unit tests
- `server/utils/admin-session.ts` — `useAdminSession`, `requireAdmin`
- `server/api/admin/login.post.ts` — verify + allowlist + open session
- `server/api/admin/logout.post.ts` — clear session
- `server/api/admin/me.get.ts` — session introspection
- `app/middleware/admin.ts` — frontend gate (server-verified)
- `app/pages/admin/login.vue` — Telegram widget admin login

**Modify:**
- `nuxt.config.ts` — runtimeConfig: `adminTelegramIds`, `adminSessionPassword`, `adminCookieDomain`
- `server/api/auth/me.get.ts` — add `role`, admin paywall bypass
- `server/api/auth/login.post.ts` — admin paywall bypass
- `server/api/courses/index.post.ts`, `server/api/courses/[slug].patch.ts` — `requireAdmin`
- `server/api/guides/index.post.ts`, `server/api/guides/[slug].patch.ts`, `server/api/guides/[slug].delete.ts` — `requireAdmin`
- `server/api/upload/image.post.ts`, `server/api/upload/presign.post.ts`, `server/api/translate.post.ts` — `requireAdmin`
- `app/stores/auth.ts` — `role` in `TelegramUser`, admin-aware `syncMe`, `isAdmin` computed
- `app/pages/admin/courses/new.vue`, `app/pages/admin/guides/new.vue` — `definePageMeta` admin middleware
- `.env` (local), `.env.production.example` (create) — new env vars
- `Caddyfile` — `admin.chayroom.uz` block (deploy-time)

---

## Task 1: Telegram hash verification util (TDD)

**Files:**
- Create: `server/utils/telegram-auth.ts`
- Test: `server/utils/telegram-auth.test.mjs`

- [ ] **Step 1: Write the failing test**

`server/utils/telegram-auth.test.mjs`:
```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'

import { verifyTelegramLoginPayload, parseAdminIds, isAdminId } from './telegram-auth.ts'

const BOT_TOKEN = '123456:test-bot-token'

function signPayload(fields, botToken = BOT_TOKEN) {
  const dataCheckString = Object.keys(fields)
    .sort()
    .map(k => `${k}=${fields[k]}`)
    .join('\n')
  const secret = createHash('sha256').update(botToken).digest()
  const hash = createHmac('sha256', secret).update(dataCheckString).digest('hex')
  return { ...fields, hash }
}

const now = Math.floor(Date.now() / 1000)

test('accepts a valid, fresh payload', () => {
  const payload = signPayload({ id: 555, first_name: 'A', username: 'a', auth_date: now })
  assert.equal(verifyTelegramLoginPayload(payload, BOT_TOKEN), true)
})

test('rejects a tampered payload', () => {
  const payload = signPayload({ id: 555, first_name: 'A', auth_date: now })
  payload.id = 999
  assert.equal(verifyTelegramLoginPayload(payload, BOT_TOKEN), false)
})

test('rejects a stale payload', () => {
  const payload = signPayload({ id: 555, first_name: 'A', auth_date: now - 90000 })
  assert.equal(verifyTelegramLoginPayload(payload, BOT_TOKEN), false)
})

test('rejects when hash missing or token empty', () => {
  assert.equal(verifyTelegramLoginPayload({ id: 1, auth_date: now }, BOT_TOKEN), false)
  const payload = signPayload({ id: 1, auth_date: now })
  assert.equal(verifyTelegramLoginPayload(payload, ''), false)
})

test('parseAdminIds splits, trims, drops empties', () => {
  assert.deepEqual(parseAdminIds(' 1, 2 ,,3 '), ['1', '2', '3'])
  assert.deepEqual(parseAdminIds(''), [])
  assert.deepEqual(parseAdminIds(undefined), [])
})

test('isAdminId matches by string form', () => {
  assert.equal(isAdminId(2, '1,2,3'), true)
  assert.equal(isAdminId('2', '1,2,3'), true)
  assert.equal(isAdminId(9, '1,2,3'), false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types server/utils/telegram-auth.test.mjs`
Expected: FAIL — cannot find module `./telegram-auth.ts`.

- [ ] **Step 3: Write minimal implementation**

`server/utils/telegram-auth.ts`:
```ts
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export interface TelegramLoginPayload {
  id: number | string
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number | string
  hash: string
  [key: string]: unknown
}

export function verifyTelegramLoginPayload(
  payload: TelegramLoginPayload,
  botToken: string,
  maxAgeSec = 86_400
): boolean {
  if (!payload?.hash || !botToken) return false

  const authDate = Number(payload.auth_date)
  if (!authDate || Number.isNaN(authDate)) return false
  const ageSec = Math.floor(Date.now() / 1000) - authDate
  if (ageSec < 0 || ageSec > maxAgeSec) return false

  const dataCheckString = Object.keys(payload)
    .filter(k => k !== 'hash')
    .sort()
    .map(k => `${k}=${payload[k]}`)
    .join('\n')

  const secretKey = createHash('sha256').update(botToken).digest()
  const computed = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  if (computed.length !== payload.hash.length) return false
  try {
    return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(payload.hash, 'hex'))
  } catch {
    return false
  }
}

export function parseAdminIds(raw: string | undefined | null): string[] {
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

export function isAdminId(id: string | number, raw: string | undefined | null): boolean {
  return parseAdminIds(raw).includes(String(id))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types server/utils/telegram-auth.test.mjs`
Expected: PASS — `pass 6  fail 0`.

- [ ] **Step 5: Commit**

```bash
git add server/utils/telegram-auth.ts server/utils/telegram-auth.test.mjs
git commit -m "feat(admin): add verified Telegram login hash util"
```

---

## Task 2: Sealed admin session + requireAdmin guard

**Files:**
- Create: `server/utils/admin-session.ts`
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Add runtimeConfig keys**

In `nuxt.config.ts`, inside `runtimeConfig` (the private block, alongside `telegramBotToken`), add:
```ts
    adminTelegramIds: '',
    adminSessionPassword: '',
    adminCookieDomain: '',
```
(These map to `NUXT_ADMIN_TELEGRAM_IDS`, `NUXT_ADMIN_SESSION_PASSWORD`, `NUXT_ADMIN_COOKIE_DOMAIN`.)

- [ ] **Step 2: Implement the session helper + guard**

`server/utils/admin-session.ts`:
```ts
import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'

interface AdminSessionData {
  telegramId?: string
}

export function useAdminSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  return useSession<AdminSessionData>(event, {
    name: 'cx-admin',
    password: config.adminSessionPassword,
    cookie: {
      domain: config.adminCookieDomain || undefined,
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax'
    }
  })
}

export async function requireAdmin(event: H3Event) {
  const session = await useAdminSession(event)
  const telegramId = session.data.telegramId
  if (!telegramId) {
    throw createError({ statusCode: 401, statusMessage: 'Admin auth required' })
  }
  const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  if (!user || user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  return user
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (no errors referencing `admin-session.ts`). If `useSession` typing complains about `cookie.domain` being `undefined`, it is allowed; the `|| undefined` is intentional for host-only cookies in dev.

- [ ] **Step 4: Commit**

```bash
git add server/utils/admin-session.ts nuxt.config.ts
git commit -m "feat(admin): add sealed admin session and requireAdmin guard"
```

---

## Task 3: Admin auth endpoints

**Files:**
- Create: `server/api/admin/login.post.ts`, `server/api/admin/logout.post.ts`, `server/api/admin/me.get.ts`

- [ ] **Step 1: Login endpoint**

`server/api/admin/login.post.ts`:
```ts
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import { verifyTelegramLoginPayload, isAdminId, type TelegramLoginPayload } from '../../utils/telegram-auth'
import { useAdminSession } from '../../utils/admin-session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const payload = await readBody<TelegramLoginPayload>(event)

  // Dev-only shortcut mirrors the existing client devLogin (hash: 'dev'); tree-shaken in prod.
  const devOk = import.meta.dev && payload?.hash === 'dev'
  if (!devOk && !verifyTelegramLoginPayload(payload, config.telegramBotToken)) {
    throw createError({ statusCode: 401, statusMessage: 'Telegram verification failed' })
  }
  if (!isAdminId(payload.id, config.adminTelegramIds)) {
    throw createError({ statusCode: 403, statusMessage: 'Not an admin account' })
  }

  const telegramId = String(payload.id)
  const existing = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  if (existing.length === 0) {
    await db.insert(users).values({
      telegramId,
      firstName: payload.first_name ?? 'Admin',
      lastName: payload.last_name ?? null,
      username: payload.username ?? null,
      photoUrl: payload.photo_url ?? null,
      role: 'ADMIN'
    })
  } else {
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.telegramId, telegramId))
  }

  const session = await useAdminSession(event)
  await session.update({ telegramId })
  return { ok: true }
})
```

- [ ] **Step 2: Logout endpoint**

`server/api/admin/logout.post.ts`:
```ts
import { useAdminSession } from '../../utils/admin-session'

export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event)
  await session.clear()
  return { ok: true }
})
```

- [ ] **Step 3: Session introspection endpoint**

`server/api/admin/me.get.ts`:
```ts
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import { useAdminSession } from '../../utils/admin-session'

export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event)
  const telegramId = session.data.telegramId
  if (!telegramId) return { admin: false as const }

  const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  if (!user || user.role !== 'ADMIN') return { admin: false as const }

  return {
    admin: true as const,
    user: {
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      username: user.username,
      role: user.role
    }
  }
})
```

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/api/admin/
git commit -m "feat(admin): add admin login/logout/me endpoints"
```

---

## Task 4: Protect all mutation endpoints

**Files (modify each):** the 8 endpoints listed below.

- [ ] **Step 1: Add the guard to each handler**

For each file, add the import at the top and `await requireAdmin(event)` as the **first line** inside the handler. The import path is relative to the file's depth:
- `server/api/courses/index.post.ts` → `import { requireAdmin } from '../../utils/admin-session'`
- `server/api/courses/[slug].patch.ts` → `import { requireAdmin } from '../../utils/admin-session'`
- `server/api/guides/index.post.ts` → `import { requireAdmin } from '../../utils/admin-session'`
- `server/api/guides/[slug].patch.ts` → `import { requireAdmin } from '../../utils/admin-session'`
- `server/api/guides/[slug].delete.ts` → `import { requireAdmin } from '../../utils/admin-session'`
- `server/api/upload/image.post.ts` → `import { requireAdmin } from '../../utils/admin-session'`
- `server/api/upload/presign.post.ts` → `import { requireAdmin } from '../../utils/admin-session'`
- `server/api/translate.post.ts` → `import { requireAdmin } from '../utils/admin-session'` (one level up)

Example for `server/api/courses/index.post.ts`:
```ts
import { db } from '../../db'
import { courses, modules, lessons } from '../../db/schema'
import { requireAdmin } from '../../utils/admin-session'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  // ...existing body unchanged...
})
```

Apply the same two-line change (import + first-line guard) to the other seven files. Do not change any other logic.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Manual verification (guard rejects anonymous)**

Run the dev server in one shell: `pnpm dev`
In another shell:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/courses -H 'content-type: application/json' -d '{}'
```
Expected: `401` (was previously an unauthenticated 200/500).

- [ ] **Step 4: Commit**

```bash
git add server/api/courses server/api/guides server/api/upload server/api/translate.post.ts
git commit -m "feat(admin): require admin on all mutation endpoints"
```

---

## Task 5: Role + admin paywall bypass in main auth

**Files:**
- Modify: `server/api/auth/me.get.ts`, `server/api/auth/login.post.ts`

- [ ] **Step 1: `me.get.ts` — return role + bypass**

In `server/api/auth/me.get.ts`, replace the `hasSubscription` computation and the returned `user` object:
```ts
  const now = new Date()
  const isAdmin = user.role === 'ADMIN'
  const hasSubscription = isAdmin || (!!sub && sub.status === 'ACTIVE' && sub.expiresAt > now)

  return {
    user: {
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      role: user.role
    },
    hasSubscription,
    subscription: sub
      ? {
          period: sub.period,
          expiresAt: sub.expiresAt.toISOString(),
          cancelledAt: sub.cancelledAt ? sub.cancelledAt.toISOString() : null
        }
      : null
  }
```

- [ ] **Step 2: `login.post.ts` — bypass for admins**

In `server/api/auth/login.post.ts`, change the subscription computation (around the `let hasSubscription = false` block) so admins are always subscribed:
```ts
  let hasSubscription = dbUser?.role === 'ADMIN'

  if (dbUser && !hasSubscription) {
    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, dbUser.id))
      .limit(1)

    hasSubscription = sub?.status === 'ACTIVE' && sub.expiresAt > new Date()
  }
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server/api/auth/me.get.ts server/api/auth/login.post.ts
git commit -m "feat(admin): expose role and grant admins full access"
```

---

## Task 6: Frontend — store role, admin middleware, admin login page

**Files:**
- Modify: `app/stores/auth.ts`, `app/pages/admin/courses/new.vue`, `app/pages/admin/guides/new.vue`
- Create: `app/middleware/admin.ts`, `app/pages/admin/login.vue`

- [ ] **Step 1: Store — add `role` and admin-aware subscription**

In `app/stores/auth.ts`:

Add `role` to the `TelegramUser` interface:
```ts
export interface TelegramUser {
  id: number
  telegramId?: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  role?: 'USER' | 'ADMIN'
  hash: string
}
```

Add an `isAdmin` computed (next to `isOwner`):
```ts
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
```

In `syncMe`, type the response with `user` carrying `role` and treat admins as subscribed even without a subscription object. Replace the `if (res.hasSubscription && res.subscription)` block:
```ts
      const res = await $fetch<{
        user: (TelegramUser & { role?: 'USER' | 'ADMIN' }) | null
        hasSubscription: boolean
        subscription: { period: string | null, expiresAt: string, cancelledAt: string | null } | null
      }>('/api/auth/me')

      if (!res.user) {
        logout()
        return
      }

      if (res.user.role) {
        user.value = { ...(user.value ?? res.user), role: res.user.role }
      }

      if (res.hasSubscription) {
        activateSubscription(res.subscription
          ? { period: res.subscription.period, expiresAt: res.subscription.expiresAt, cancelledAt: res.subscription.cancelledAt }
          : undefined)
      } else {
        clearSubscription()
      }
```

Export `isAdmin` in the store's return object (add `isAdmin,` alongside `isOwner,`).

- [ ] **Step 2: Admin middleware (server-verified)**

`app/middleware/admin.ts`:
```ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { data } = await useFetch('/api/admin/me', { key: `admin-me-${to.path}` })
  if (!data.value || data.value.admin !== true) {
    return navigateTo('/admin/login')
  }
})
```

- [ ] **Step 3: Gate the admin pages**

At the top of `<script setup>` in `app/pages/admin/courses/new.vue` and `app/pages/admin/guides/new.vue`, add:
```ts
definePageMeta({ middleware: ['admin'] })
```
(If a `definePageMeta` already exists, add `middleware: ['admin']` to it.)

- [ ] **Step 4: Admin login page**

`app/pages/admin/login.vue`:
```vue
<script setup lang="ts">
import type { TelegramUser } from '~/stores/auth'

definePageMeta({ layout: false })

const config = useRuntimeConfig()
const botUsername = computed(() => config.public.telegramBotUsername)
const error = ref('')
const state = ref<'ready' | 'missing-bot' | 'submitting'>('ready')

async function onAuth(payload: TelegramUser) {
  state.value = 'submitting'
  error.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: payload })
    await navigateTo('/admin')
  } catch {
    error.value = 'Bu akkaunt admin emas yoki tasdiqlash muvaffaqiyatsiz.'
    state.value = 'ready'
  }
}

function mountWidget() {
  const container = document.querySelector('#admin-telegram-widget')
  if (!container) return
  if (!botUsername.value) { state.value = 'missing-bot'; return }
  container.innerHTML = ''
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', botUsername.value)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-radius', '12')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', 'onAdminAuth(user)')
  container.appendChild(script)
}

onMounted(() => {
  ;(window as unknown as { onAdminAuth?: (u: TelegramUser) => void }).onAdminAuth = onAuth
  mountWidget()
})
onUnmounted(() => {
  delete (window as unknown as { onAdminAuth?: unknown }).onAdminAuth
})

useSeoMeta({ title: 'Admin — Kirish', robots: 'noindex' })
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#fffdf9] px-5">
    <div class="w-full max-w-100 rounded-[28px] border border-[#e8e8e6] bg-white p-10 text-center shadow-[0_4px_24px_rgba(20,22,31,0.07)]">
      <h1 class="text-[24px] font-extrabold tracking-tight text-[#14161f]">Admin panel</h1>
      <p class="mt-2 text-[15px] text-[#70707a]">Telegram orqali kiring</p>
      <div id="admin-telegram-widget" class="mt-6 flex min-h-13 items-center justify-center" />
      <p v-if="state === 'missing-bot'" class="mt-4 text-[13px] text-red-600">
        NUXT_PUBLIC_TELEGRAM_BOT_USERNAME ko'rsatilmagan.
      </p>
      <p v-if="error" class="mt-4 text-[13px] text-red-600">{{ error }}</p>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/stores/auth.ts app/middleware/admin.ts app/pages/admin/
git commit -m "feat(admin): admin middleware, login page, and role in store"
```

---

## Task 7: Environment variables

**Files:**
- Create: `.env.production.example`
- Modify: `.env` (local, untracked)

- [ ] **Step 1: Generate a session password**

Run: `node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))"`
Copy the output (32+ chars) for `NUXT_ADMIN_SESSION_PASSWORD`.

- [ ] **Step 2: Add to local `.env`**

Append to `.env` (replace the id with your own numeric Telegram id; for local dev the `devLogin` id is `123456789`):
```
NUXT_ADMIN_TELEGRAM_IDS=123456789
NUXT_ADMIN_SESSION_PASSWORD=<generated-from-step-1>
NUXT_ADMIN_COOKIE_DOMAIN=
```

- [ ] **Step 3: Create `.env.production.example`**

`.env.production.example` (documented template — placeholders, no secrets):
```
# --- Admin authorization ---
NUXT_ADMIN_TELEGRAM_IDS=          # comma-separated numeric Telegram ids
NUXT_ADMIN_SESSION_PASSWORD=      # random, >= 32 chars
NUXT_ADMIN_COOKIE_DOMAIN=.chayroom.uz   # share session across apex + admin subdomain
```

- [ ] **Step 4: Manual verification (end-to-end, dev)**

With `pnpm dev` running and `NUXT_ADMIN_TELEGRAM_IDS=123456789`:
```bash
# dev shortcut login (hash 'dev' only honored in dev)
curl -s -c /tmp/cx.txt -X POST http://localhost:3000/api/admin/login \
  -H 'content-type: application/json' \
  -d '{"id":123456789,"first_name":"Behruz","username":"behruzzaripov","auth_date":0,"hash":"dev"}'
# -> {"ok":true}

curl -s -b /tmp/cx.txt http://localhost:3000/api/admin/me
# -> {"admin":true,"user":{...,"role":"ADMIN"}}

# now an admin-only mutation succeeds with the session cookie:
curl -s -o /dev/null -w "%{http_code}\n" -b /tmp/cx.txt -X POST http://localhost:3000/api/courses \
  -H 'content-type: application/json' -d '{"slug":"t","title":"t"}'
# -> 200 (not 401)
```
Expected: login `{ok:true}`, me `admin:true`, mutation `200`. A non-admin id returns `403` at login.

- [ ] **Step 5: Commit (template only — never commit `.env`)**

```bash
git add .env.production.example
git commit -m "chore(admin): document admin env vars"
```

---

## Task 8: Infra (deploy-time — execute during the deploy task, not now)

These run on the server when the deploy spec is executed. Documented here for completeness; **do not run during local implementation.**

- [ ] **DNS:** add an `A` record `admin.chayroom.uz → 72.62.3.239` (and `www` not needed).
- [ ] **Caddyfile:** add a block so the subdomain serves the same app:
```caddyfile
admin.chayroom.uz {
	encode zstd gzip
	reverse_proxy nuxt:3000
}
```
- [ ] **Server `.env`:** set `NUXT_ADMIN_TELEGRAM_IDS`, `NUXT_ADMIN_SESSION_PASSWORD` (fresh value), `NUXT_ADMIN_COOKIE_DOMAIN=.chayroom.uz`.
- [ ] **BotFather:** ensure the Login Widget domain is authorized (`/setdomain` → `chayroom.uz`). Verify the widget renders on `admin.chayroom.uz`; if Telegram restricts the subdomain, host the admin login under `chayroom.uz/admin/login` instead — the `.chayroom.uz` session cookie still authorizes `admin.chayroom.uz`. Confirm against current Telegram Login Widget docs.
- [ ] **Verify:** load `https://admin.chayroom.uz/admin/login`, log in with an admin Telegram account, confirm `/admin` is reachable and a non-admin is redirected.

---

## Self-Review

**Spec coverage:**
- Telegram hash verification → Task 1 ✓
- `ADMIN_TELEGRAM_IDS` allowlist → Task 1 (`isAdminId`) + Task 3 ✓
- Sealed session `.chayroom.uz` → Task 2 + Task 7/8 (`adminCookieDomain`) ✓
- `requireAdmin` on all mutation endpoints → Task 4 (8 files) ✓
- `me` returns role + paywall bypass → Task 5 ✓
- Frontend admin middleware + login page → Task 6 ✓
- Subdomain / Caddy / DNS / BotFather → Task 8 ✓
- New env vars → Task 7 ✓

**Placeholder scan:** No TBD/TODO; every code step is complete. `<generated-from-step-1>` and `<your numeric id>` are explicit user-supplied values, not gaps.

**Type consistency:** `verifyTelegramLoginPayload`, `parseAdminIds`, `isAdminId`, `TelegramLoginPayload`, `useAdminSession`, `requireAdmin`, session name `cx-admin`, session field `telegramId`, store `isAdmin` — names used identically across tasks. Import paths checked per file depth (`translate.post.ts` uses `../utils/...`; nested routes use `../../utils/...`).

**Notes:** The dev-only login shortcut (`hash === 'dev'` behind `import.meta.dev`) is the only auth bypass and is compiled out of production. The existing `isOwner` gate is left intact and is superseded by server enforcement.
