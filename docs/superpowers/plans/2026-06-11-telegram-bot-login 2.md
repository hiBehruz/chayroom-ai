# Telegram Bot Login (token-callback) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bot orqali kirishni qo'shish — bot bir martalik token havola yuboradi, foydalanuvchi havolani bosgan tabda server httpOnly JWT sessiyani o'rnatadi. Polling yo'q.

**Architecture:** Bot server ichida ishlaydi (`telegram-polling.ts` → `processTelegramUpdate`). `/start login`da bot foydalanuvchini upsert qilib, qisqa muddatli bir martalik token (`useStorage('cache')`, TTL 10 daqiqa) yaratadi va "Saytga kirish" URL-tugmali xabar yuboradi (`/auth/callback?token=...`). Frontend sahifa tokenni `POST /api/auth/bot-callback`'ga yuboradi; server tokenni iste'mol qilib (bir martalik), httpOnly JWT cookie o'rnatadi va profilni qaytaradi. Sessiya widget/mini-app bilan bir xil.

**Tech Stack:** Nuxt 4, Nitro server routes, Drizzle (Postgres), unstorage (Redis cache), `jose` (JWT), Vitest (`@nuxt/test-utils/e2e`), Pinia.

**Spec:** `docs/superpowers/specs/2026-06-11-telegram-bot-login-design.md`

---

## Prerequisites

- Branch: `feat/telegram-bot-login` (allaqachon ochilgan).
- Integratsiya testlari uchun test Postgres/Redis/MinIO ishlab turishi kerak (CI ularni beradi; lokalda test servislari `55432`/`56379`/`59000` portlarida yoki `TEST_*` env orqali). Agar lokalda yo'q bo'lsa, integratsiya testini CI'da ishlatamiz; qolgan tekshiruvlar (unit, typecheck, build) lokalda o'tadi.

## File Structure

| Fayl | Mas'uliyat | Holat |
|------|-----------|-------|
| `server/utils/bot-login-token.ts` | Bir martalik login token: yaratish, iste'mol, format guard | Create |
| `server/utils/bot-login-token.test.mjs` | `isValidBotLoginToken` unit testi | Create |
| `server/api/auth/bot-callback.post.ts` | Tokenni almashtirib httpOnly sessiya o'rnatadi, profil qaytaradi | Create |
| `app/pages/auth/callback.vue` | Callback sahifasi: token → POST → store → `/` | Create |
| `tests/integration/bot-login.test.ts` | To'liq zanjir: `/start login` → token → callback | Create |
| `server/utils/process-telegram-update.ts` | `/start login` tarmog'i qo'shiladi | Modify |
| `app/pages/login.vue` | "Telegram bot orqali kirish" tugmasi + yo'l-yo'riq + xato matni | Modify |
| `server/utils/session-cookie.ts` | Sessiya umri 2 → 7 kun | Modify |
| `server/utils/jwt.ts` | JWT exp 2d → 7d | Modify |
| `tests/integration/helpers/server.ts` | `NUXT_TELEGRAM_WEBHOOK_SECRET` integratsiya env'iga | Modify |

---

## Task 1: Bir martalik login token helper

**Files:**
- Create: `server/utils/bot-login-token.ts`
- Test: `server/utils/bot-login-token.test.mjs`

- [ ] **Step 1: Write the failing unit test**

`server/utils/bot-login-token.test.mjs`:

```js
import { test } from 'vitest'
import assert from 'node:assert/strict'

import { isValidBotLoginToken } from './bot-login-token.ts'

test('isValidBotLoginToken accepts base64url tokens of allowed length', () => {
  assert.equal(isValidBotLoginToken('a'.repeat(43)), true)
  assert.equal(isValidBotLoginToken('A1_-b'.padEnd(32, 'x')), true)
  assert.equal(isValidBotLoginToken('a'.repeat(128)), true)
})

test('isValidBotLoginToken rejects short, long, or malformed tokens', () => {
  assert.equal(isValidBotLoginToken(''), false)
  assert.equal(isValidBotLoginToken('short'), false)
  assert.equal(isValidBotLoginToken('a'.repeat(31)), false)
  assert.equal(isValidBotLoginToken('a'.repeat(129)), false)
  assert.equal(isValidBotLoginToken('has spaces'), false)
  assert.equal(isValidBotLoginToken('has!@#chars'.padEnd(40, 'x')), false)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run --config vitest.config.ts --project unit server/utils/bot-login-token.test.mjs`
Expected: FAIL — `Cannot find module './bot-login-token.ts'` (fayl hali yo'q).

- [ ] **Step 3: Implement the token helper**

`server/utils/bot-login-token.ts`:

```ts
import { randomBytes } from 'node:crypto'

const TOKEN_TTL_SECONDS = 600

export interface BotLoginTokenEntry {
  userId: number
  exp: number
}

export function botLoginTokenKey(token: string): string {
  return `bot-login:${token}`
}

export function isValidBotLoginToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,128}$/.test(token)
}

export async function createBotLoginToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  const entry: BotLoginTokenEntry = { userId, exp: Date.now() + TOKEN_TTL_SECONDS * 1000 }
  const storage = useStorage('cache')
  await storage.setItem(botLoginTokenKey(token), entry, { ttl: TOKEN_TTL_SECONDS })
  return token
}

export async function consumeBotLoginToken(token: string): Promise<number | null> {
  if (!isValidBotLoginToken(token)) return null
  const storage = useStorage('cache')
  const key = botLoginTokenKey(token)
  const entry = await storage.getItem<BotLoginTokenEntry>(key)
  if (!entry) return null
  await storage.removeItem(key)
  if (typeof entry.exp !== 'number' || entry.exp < Date.now()) return null
  return entry.userId
}
```

Eslatma: `useStorage` Nitro tomonidan avtomatik import qilinadi (server util'larida global) — `server/api/auth/bot-login/start.post.ts` (olib tashlangan) ham xuddi shunday ishlatgan.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run --config vitest.config.ts --project unit server/utils/bot-login-token.test.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add server/utils/bot-login-token.ts server/utils/bot-login-token.test.mjs
git commit -m "feat(auth): add one-time bot login token helper"
```

---

## Task 2: Bot handler + callback endpoint + integration test

Bu task serverdagi to'liq zanjirni quradi. Test ikkala tomonni (bot handler va callback) birga sinaydi, shuning uchun bir taskda.

**Files:**
- Modify: `tests/integration/helpers/server.ts`
- Create: `tests/integration/bot-login.test.ts`
- Modify: `server/utils/process-telegram-update.ts`
- Create: `server/api/auth/bot-callback.post.ts`

- [ ] **Step 1: Add the webhook secret to the integration env**

`tests/integration/helpers/server.ts` — `integrationEnv` obyektiga `NUXT_PUBLIC_APP_URL` qatoridan keyin qator qo'shing:

```ts
  NUXT_PUBLIC_APP_URL: 'http://127.0.0.1',
  NUXT_TELEGRAM_WEBHOOK_SECRET: 'integration-webhook-secret'
```

(Eslatma: `NUXT_PUBLIC_APP_URL` qatori oxiridagi vergulga e'tibor bering — obyekt `as const` bilan tugaydi.)

- [ ] **Step 2: Write the failing integration test**

`tests/integration/bot-login.test.ts`:

```ts
import postgres from 'postgres'
import Redis from 'ioredis'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { fetch as nuxtFetch } from '@nuxt/test-utils/e2e'
import { integrationEnv, setupIntegrationServer } from './helpers/server'

await setupIntegrationServer()

const redis = new Redis(integrationEnv.REDIS_URL)
const sql = postgres(integrationEnv.DATABASE_URL, { max: 1 })
const TG_ID = 555000111

async function cleanup() {
  await sql`DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM users WHERE telegram_id = ${String(TG_ID)})`
  await sql`DELETE FROM users WHERE telegram_id = ${String(TG_ID)}`
}

beforeAll(async () => {
  await cleanup()
  await redis.flushdb()
})

afterAll(async () => {
  await cleanup()
  await sql.end()
  await redis.quit()
})

describe.sequential('bot login token callback', () => {
  it('mints a token on /start login and exchanges it for a session', async () => {
    const webhookRes = await nuxtFetch('/api/telegram/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': integrationEnv.NUXT_TELEGRAM_WEBHOOK_SECRET
      },
      body: JSON.stringify({
        update_id: 1,
        message: {
          text: '/start login',
          chat: { id: TG_ID },
          from: { id: TG_ID, first_name: 'BotLogin', username: 'botlogin_test' }
        }
      })
    })
    expect(webhookRes.status).toBe(200)

    const keys = await redis.keys('*bot-login:*')
    expect(keys.length).toBe(1)
    const token = keys[0].split('bot-login:')[1]

    const callbackRes = await nuxtFetch('/api/auth/bot-callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token })
    })
    expect(callbackRes.status).toBe(200)
    expect(callbackRes.headers.get('set-cookie')).toContain('chayroom_session=')

    const data = await callbackRes.json()
    expect(data.user.telegramId).toBe(TG_ID)

    const second = await nuxtFetch('/api/auth/bot-callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token })
    })
    expect(second.status).toBe(401)
  })

  it('rejects malformed and unknown tokens', async () => {
    const bad = await nuxtFetch('/api/auth/bot-callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'short' })
    })
    expect(bad.status).toBe(400)

    const unknown = await nuxtFetch('/api/auth/bot-callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'z'.repeat(43) })
    })
    expect(unknown.status).toBe(401)
  })

  it('does not mint a token for a plain /start', async () => {
    await redis.flushdb()
    const res = await nuxtFetch('/api/telegram/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': integrationEnv.NUXT_TELEGRAM_WEBHOOK_SECRET
      },
      body: JSON.stringify({
        update_id: 2,
        message: { text: '/start', chat: { id: TG_ID }, from: { id: TG_ID, first_name: 'BotLogin' } }
      })
    })
    expect(res.status).toBe(200)
    expect(await redis.keys('*bot-login:*')).toEqual([])
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm exec vitest run --config vitest.config.ts --project integration tests/integration/bot-login.test.ts`
Expected: FAIL — `/api/auth/bot-callback` mavjud emas (404) va `/start login` token yaratmaydi (`keys.length` 0).

- [ ] **Step 4: Implement the `/start login` branch in the bot handler**

`server/utils/process-telegram-update.ts` — importlarni yangilang (mavjud ikkita importga qo'shimcha):

```ts
import { sendTelegramMessage } from './telegram'
import { buildMiniAppLoginUrl } from './telegram-bot.js'
import { upsertUserFromTelegram } from './upsertUserFromTelegram'
import { createBotLoginToken } from './bot-login-token'
```

So'ng `const payload = text.slice('/start'.length).trim()` qatoridan keyin, `if (payload) return` dan **oldin** quyidagini qo'shing:

```ts
  if (payload === 'login') {
    if (!botToken) return
    const appUrl = (config.public as Record<string, string>).appUrl || 'https://chayroom.uz'
    const dbUser = await upsertUserFromTelegram({
      id: from.id,
      first_name: from.first_name || 'Foydalanuvchi',
      last_name: from.last_name,
      username: from.username
    })
    const token = await createBotLoginToken(dbUser.id)
    await sendTelegramMessage(botToken, chatId, '✅ Tasdiqlandi! Saytga kirish uchun quyidagi tugmani bosing:', {
      reply_markup: {
        inline_keyboard: [[{ text: '🔓 Saytga kirish', url: `${appUrl}/auth/callback?token=${token}` }]]
      }
    })
    return
  }
```

Natijada mantiq tartibi: bo'sh `/start` → welcome; `/start login` → login token; boshqa payload → `return` (o'zgarmaydi).

- [ ] **Step 5: Implement the callback endpoint**

`server/api/auth/bot-callback.post.ts`:

```ts
import { eq, desc } from 'drizzle-orm'
import { db } from '#server/db'
import { users, subscriptions } from '#server/db/schema'
import { consumeBotLoginToken, isValidBotLoginToken } from '#server/utils/bot-login-token'
import { userToJwtPayload } from '#server/utils/upsertUserFromTelegram'
import { setSessionCookie } from '#server/utils/session-cookie'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token?: string }>(event)
  const token = body?.token

  if (!token || typeof token !== 'string' || !isValidBotLoginToken(token)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid token' })
  }

  const userId = await consumeBotLoginToken(token)
  if (userId === null) {
    throw createError({ statusCode: 401, statusMessage: 'expired token' })
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'user not found' })
  }

  await setSessionCookie(event, userToJwtPayload(user))

  const [sub] = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.expiresAt))
    .limit(1)

  const now = new Date()
  const hasSubscription = user.role === 'ADMIN' || (!!sub && sub.status === 'ACTIVE' && sub.expiresAt > now)

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
})
```

- [ ] **Step 6: Run the integration test to verify it passes**

Run: `pnpm exec vitest run --config vitest.config.ts --project integration tests/integration/bot-login.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Typecheck & lint**

Run: `pnpm typecheck && pnpm lint`
Expected: xato yo'q.

- [ ] **Step 8: Commit**

```bash
git add server/utils/process-telegram-update.ts server/api/auth/bot-callback.post.ts tests/integration/bot-login.test.ts tests/integration/helpers/server.ts
git commit -m "feat(auth): bot /start login mints token, add bot-callback exchange endpoint"
```

---

## Task 3: 7 kunlik sessiya umri

**Files:**
- Modify: `server/utils/session-cookie.ts:6`
- Modify: `server/utils/jwt.ts:20`

- [ ] **Step 1: Extend the session cookie lifetime**

`server/utils/session-cookie.ts` — `MAX_AGE`ni o'zgartiring:

```ts
const MAX_AGE = 7 * 24 * 60 * 60
```

- [ ] **Step 2: Extend the JWT expiration**

`server/utils/jwt.ts` — `signJwt` ichidagi muddatni o'zgartiring:

```ts
    .setExpirationTime('7d')
```

- [ ] **Step 3: Run the full test suite to confirm nothing breaks**

Run: `pnpm test:unit && pnpm test:nuxt`
Expected: PASS (mavjud testlarda 2 kunlik sessiya hardcode qilingan assertion yo'q).

- [ ] **Step 4: Commit**

```bash
git add server/utils/session-cookie.ts server/utils/jwt.ts
git commit -m "feat(auth): extend session lifetime to 7 days across all login methods"
```

---

## Task 4: Frontend — login tugmasi va callback sahifasi

**Files:**
- Modify: `app/pages/login.vue`
- Create: `app/pages/auth/callback.vue`

- [ ] **Step 1: Add the callback page**

`app/pages/auth/callback.vue`:

```vue
<!-- app/pages/auth/callback.vue -->
<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    await navigateTo('/login?error=invalid')
    return
  }

  try {
    const res = await $fetch<{
      user: { id: number, telegramId: number, firstName: string, lastName: string | null, username: string | null, photoUrl: string | null, role: 'USER' | 'ADMIN' }
      hasSubscription: boolean
      subscription: { period: string | null, expiresAt: string, cancelledAt: string | null } | null
    }>('/api/auth/bot-callback', { method: 'POST', body: { token } })

    authStore.setUserSession({
      id: res.user.telegramId,
      telegramId: res.user.telegramId,
      first_name: res.user.firstName,
      last_name: res.user.lastName ?? undefined,
      username: res.user.username ?? undefined,
      photo_url: res.user.photoUrl ?? undefined,
      role: res.user.role,
      hash: 'session'
    })

    if (res.hasSubscription) {
      authStore.activateSubscription(res.subscription
        ? { period: res.subscription.period, expiresAt: res.subscription.expiresAt, cancelledAt: res.subscription.cancelledAt }
        : undefined)
    } else {
      authStore.clearSubscription()
    }

    await navigateTo('/')
  } catch {
    await navigateTo('/login?error=expired')
  }
})

useSeoMeta({ title: 'Kirish — Chayroom AI' })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#fffdf9] px-5">
    <div class="flex items-center gap-2 text-[14px] text-[#a0a0a8]">
      <span class="size-4 animate-spin rounded-full border-2 border-[#e0e0e4] border-t-[#3480f1]" />
      Kirilmoqda...
    </div>
  </div>
</template>
```

- [ ] **Step 2: Add bot-login script state to `login.vue`**

`app/pages/login.vue` — `<script setup>` ichida, `const authError = ref('')` qatoridan keyin qo'shing:

```ts
const botInitiated = ref(false)
const botDeepLink = computed(() =>
  telegramBotUsername.value ? `https://t.me/${telegramBotUsername.value}?start=login` : ''
)
function onBotLoginClick() {
  botInitiated.value = true
}
```

- [ ] **Step 3: Show callback error messages in `login.vue`**

`app/pages/login.vue` — `onMounted` ichida, `authStore.restoreFromStorage()` qatoridan keyin qo'shing:

```ts
  if (route.query.error === 'expired') {
    authError.value = 'Kirish havolasi muddati tugagan. Qaytadan urinib ko\'ring.'
  } else if (route.query.error === 'invalid') {
    authError.value = 'Kirish havolasi yaroqsiz. Qaytadan urinib ko\'ring.'
  }
```

- [ ] **Step 4: Add the bot-login button to the `login.vue` template**

`app/pages/login.vue` — `#telegram-widget-container` div'idan **keyin** (va `authError` `<p>`'dan oldin) quyidagi blokni qo'shing:

```vue
        <div
          v-if="telegramBotUsername"
          class="mt-4"
        >
          <div class="my-4 flex items-center gap-3">
            <span class="h-px flex-1 bg-[#e8e8e6]" />
            <span class="text-[12px] text-[#a0a0a8]">yoki</span>
            <span class="h-px flex-1 bg-[#e8e8e6]" />
          </div>
          <a
            :href="botDeepLink"
            target="_blank"
            rel="noopener"
            class="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#3480f1] text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            @click="onBotLoginClick"
          >
            Telegram bot orqali kirish
          </a>
          <p
            v-if="botInitiated"
            class="mt-3 text-center text-[13px] leading-5 text-[#6f7480]"
          >
            Botga o'tdingiz. Bot yuborgan "Saytga kirish" tugmasini bosing.
          </p>
        </div>
```

- [ ] **Step 5: Typecheck, lint, and build**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: xato yo'q, build muvaffaqiyatli.

- [ ] **Step 6: Commit**

```bash
git add app/pages/auth/callback.vue app/pages/login.vue
git commit -m "feat(auth): add bot login button and /auth/callback page"
```

---

## Task 5: Yakuniy tekshiruv va qo'lda sinov

**Files:** (yo'q — faqat tekshiruv)

- [ ] **Step 1: Run the complete CI suite locally**

Run: `pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:nuxt && pnpm test:integration && pnpm build`
Expected: hammasi yashil. (Integratsiya uchun test Postgres/Redis ishlab turishi kerak — yo'q bo'lsa CI'da tekshiramiz.)

- [ ] **Step 2: Manual smoke test (dev)**

Run: `pnpm dev`, so'ng:
- `/login` — "Telegram bot orqali kirish" tugmasi ko'rinadi; bosilganda yo'l-yo'riq matni chiqadi va Telegram ochiladi.
- Dev'da token oqimini sinash uchun: `/start login`ni botga yuboring (yoki webhook'ga qo'lda POST), bot yuborgan `/auth/callback?token=...` havolasini oching → `/`ga kirган holatda o'tishi kerak.
- Eskirgan/yaroqsiz token → `/login?error=expired|invalid` xabari ko'rinadi.

- [ ] **Step 3: Note for deploy (alohida, foydalanuvchi tomonidan)**

- @BotFather sozlamasi **shart emas** — bot deep-link (`?start=login`) standart, hech qanday `/setdomain` talab qilmaydi (bu faqat Login Widget uchun edi).
- Merge'dan keyin deploy: `ssh root@72.62.3.239 '/app/deploy.sh'`.

---

## Self-Review Notes

- **Spec coverage:** §3 oqim → Task 2+4; §4 komponentlar → barcha task; §5 xavfsizlik (httpOnly, bir martalik token, faqat POST'da yemirilish) → Task 1+2; §7 edge-case (expired/invalid) → Task 2 (status) + Task 4 (xabar); §8 testlar → Task 1 (unit) + Task 2 (integ). 7 kun → Task 3. Redirect `/` → Task 4 callback.
- **Type consistency:** `consumeBotLoginToken` `number | null` qaytaradi (Task 1) va Task 2 endpoint shunga qarab `401` beradi; `BotLoginTokenEntry { userId, exp }` ikkala joyda bir xil; javob shakli `me.get.ts` bilan bir xil (`user/hasSubscription/subscription`), callback.vue ham shu shaklni kutadi.
- **No placeholders:** har bir qadamda to'liq kod va aniq buyruq bor.
