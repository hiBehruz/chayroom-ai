# Telegram Login Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize Telegram login by removing the fragile bot deep-link + polling flow and fixing account-switch, keeping the Login Widget (browser) and Mini App (in-Telegram) as the two auth paths.

**Architecture:** Two server endpoints stay unchanged (`/api/auth/telegram` for the widget HMAC payload, `/api/auth/telegram-webapp` for Mini App `initData`), both setting an httpOnly JWT cookie. The login page chooses what to do on mount via a new pure function `resolveLoginMountAction` that processes a fresh URL auth payload **before** redirecting an already-logged-in session — this fixes account switching. All bot deep-link code (endpoints, route, client plugin, polling helpers, KV token logic) is deleted.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Pinia, Nitro server routes, Drizzle ORM, Vitest, ESLint, Tailwind v4. Spec: [docs/superpowers/specs/2026-06-10-telegram-login-stabilization-design.md](../specs/2026-06-10-telegram-login-stabilization-design.md). Branch: `telegram-login-stabilization`.

---

## File Structure

**New behavior (pure, unit-tested):**
- `app/utils/login-flow.mjs` — owns post-login routing helpers. Gains `resolveLoginMountAction`; loses all bot-token helpers. Final exports: `resolvePostLoginTarget`, `resolveLoginMountAction`.

**Rewritten:**
- `app/pages/login.vue` — login page. Widget mount + Mini App + mount-action switch. No polling/popup/bot UI.

**Trimmed:**
- `app/stores/auth.ts` — `logout()` drops dead `bot_login_token` cleanup.
- `server/utils/process-telegram-update.ts` — keeps plain `/start` welcome; drops `auth_` login branch + debug logs.
- `server/api/auth/telegram.post.ts` — inlines the login-success message constant (drops the `bot-login` import).

**Deleted:**
- `server/api/auth/bot-login/start.post.ts`, `server/api/auth/bot-login/status.get.ts`
- `server/api/auth/telegram/start.post.ts` (re-export shim)
- `server/routes/auth/bot-callback.get.ts`
- `server/utils/bot-login.ts`, `server/utils/bot-login.test.mjs`
- `app/plugins/bot-login.client.ts`

**Unchanged (verify still green):** `server/api/auth/telegram-webapp.post.ts`, `server/utils/session-cookie.ts`, `server/utils/upsertUserFromTelegram.ts`, `server/utils/telegram.ts`, `server/utils/telegram-bot.js`, `server/api/telegram/webhook.post.ts`, `server/plugins/telegram-polling.ts`.

---

## Task 1: Add `resolveLoginMountAction` (pure function, TDD)

**Files:**
- Modify: `app/utils/login-flow.mjs`
- Test: `app/utils/login-flow.test.mjs`

- [ ] **Step 1: Add the failing tests**

Append these tests to `app/utils/login-flow.test.mjs`, and add `resolveLoginMountAction` to the existing import from `./login-flow.mjs` (the import block at the top currently lists `resolvePostLoginTarget` among bot helpers — add the new name to it):

```js
test('resolveLoginMountAction prefers mini-app above everything', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: true, hasAuthPayload: true, hasSession: true }),
    'mini-app'
  )
})

test('resolveLoginMountAction processes a fresh auth payload before an existing session', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: false, hasAuthPayload: true, hasSession: true }),
    'process-auth'
  )
})

test('resolveLoginMountAction redirects when only a session exists', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: false, hasAuthPayload: false, hasSession: true }),
    'redirect'
  )
})

test('resolveLoginMountAction shows the widget when nothing is present', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: false, hasAuthPayload: false, hasSession: false }),
    'show-widget'
  )
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run app/utils/login-flow.test.mjs`
Expected: FAIL — the 4 new tests error because `resolveLoginMountAction` is not exported from `login-flow.mjs` (undefined / "No known export"). Existing tests still pass.

- [ ] **Step 3: Implement the function**

Append to `app/utils/login-flow.mjs`:

```js
/**
 * Decide what the login page should do on mount.
 * Order matters: a fresh Telegram auth payload in the URL must win over an
 * existing session so users can switch accounts (otherwise the old cookie
 * short-circuits to a redirect and the new id&hash is ignored).
 *
 * @param {{ isMiniApp: boolean, hasAuthPayload: boolean, hasSession: boolean }} input
 * @returns {'mini-app' | 'process-auth' | 'redirect' | 'show-widget'}
 */
export function resolveLoginMountAction({ isMiniApp, hasAuthPayload, hasSession }) {
  if (isMiniApp) return 'mini-app'
  if (hasAuthPayload) return 'process-auth'
  if (hasSession) return 'redirect'
  return 'show-widget'
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run app/utils/login-flow.test.mjs`
Expected: PASS — all tests green (new + existing).

- [ ] **Step 5: Commit**

```bash
git add app/utils/login-flow.mjs app/utils/login-flow.test.mjs
git commit -m "feat(login): add resolveLoginMountAction mount decision helper"
```

---

## Task 2: Rewrite `login.vue` to use the mount action and drop the bot flow

**Files:**
- Modify (full rewrite): `app/pages/login.vue`

- [ ] **Step 1: Replace the entire file contents**

Overwrite `app/pages/login.vue` with exactly:

```vue
<!-- app/pages/login.vue -->
<script setup lang="ts">
import type { TelegramUser } from '../stores/auth'
import { resolveLoginMountAction, resolvePostLoginTarget } from '../utils/login-flow.mjs'

const authStore = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()
const { isMiniApp } = useTelegramApp()
const telegramBotUsername = computed(() => config.public.telegramBotUsername)
const appHostname = computed(() => {
  try {
    return new URL(config.public.appUrl).hostname
  } catch {
    return ''
  }
})
const currentHostname = computed(() => import.meta.client ? window.location.hostname : '')
const canUseTelegramWidget = computed(() => {
  if (!import.meta.client) return false
  if (!appHostname.value) return true
  return currentHostname.value === appHostname.value
})
const widgetState = ref<'loading' | 'ready' | 'missing-bot' | 'mini-app' | 'mini-app-error'>('loading')
const authError = ref('')
const selectedPlan = computed(() => typeof route.query.plan === 'string' ? route.query.plan : '')
const redirectPath = computed(() => typeof route.query.redirect === 'string' ? route.query.redirect : '')

function goAfterLogin() {
  return navigateTo(resolvePostLoginTarget(selectedPlan.value, redirectPath.value))
}

async function loginWithTelegram(user: TelegramUser) {
  await authStore.login(user)
  if (authStore.user) {
    await goAfterLogin()
    return
  }
  authError.value = 'Kirish amalga oshmadi. Qaytadan urinib ko\'ring.'
}

function mountTelegramWidget() {
  const container = document.querySelector('#telegram-widget-container')
  if (!container) return

  if (!telegramBotUsername.value) {
    widgetState.value = 'missing-bot'
    authError.value = 'Telegram bot username topilmadi.'
    return
  }

  container.innerHTML = ''

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', telegramBotUsername.value)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-radius', '12')
  script.setAttribute('data-userpic', 'true')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-auth-url', window.location.href.split('?')[0] || window.location.href)
  container.appendChild(script)
  widgetState.value = 'ready'
}

async function handleMiniAppLogin() {
  widgetState.value = 'mini-app'
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (tgUser) {
    await authStore.loginFromMiniApp(tgUser)
    if (authStore.user) {
      await goAfterLogin()
      return
    }
  }
  widgetState.value = 'mini-app-error'
}

onMounted(async () => {
  authStore.restoreFromStorage()

  const q = route.query
  const hasAuthPayload = Boolean(q.id && q.hash)

  const action = resolveLoginMountAction({
    isMiniApp: isMiniApp.value,
    hasAuthPayload,
    hasSession: Boolean(authStore.user)
  })

  if (action === 'mini-app') {
    await handleMiniAppLogin()
    return
  }

  if (action === 'process-auth') {
    await loginWithTelegram({
      id: Number(q.id),
      first_name: String(q.first_name || ''),
      last_name: q.last_name ? String(q.last_name) : undefined,
      username: q.username ? String(q.username) : undefined,
      photo_url: q.photo_url ? String(q.photo_url) : undefined,
      auth_date: Number(q.auth_date || 0),
      hash: String(q.hash)
    })
    return
  }

  if (action === 'redirect') {
    await goAfterLogin()
    return
  }

  // action === 'show-widget'
  if (canUseTelegramWidget.value) {
    mountTelegramWidget()
  }
})

useSeoMeta({ title: 'Kirish — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen bg-[#fffdf9] flex flex-col items-center justify-center px-5 py-16">
    <!-- Logo -->
    <NuxtLink
      to="/"
      :prefetch="false"
      class="mb-10 flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-70"
    >
      <img
        src="/chayroom-favicon.ico"
        alt="Chayroom AI"
        class="size-8 rounded-xl object-cover"
      />
      <span class="text-[20px] font-extrabold tracking-tight text-[#14161f]">Chayroom AI Club</span>
    </NuxtLink>

    <!-- Card -->
    <div class="w-full max-w-100 rounded-[28px] border border-[#e8e8e6] bg-white shadow-[0_4px_24px_rgba(20,22,31,0.07)]">
      <div class="px-10 pt-10 pb-6 text-center max-md:px-7">
        <h1 class="text-[24px] font-extrabold tracking-tight text-[#14161f]">
          Kirish
        </h1>
      </div>

      <div class="px-10 max-md:px-7">
        <!-- Mini-app states -->
        <div
          v-if="widgetState === 'mini-app'"
          class="flex min-h-13 items-center justify-center gap-2 text-[14px] text-[#a0a0a8]"
        >
          <span class="size-4 rounded-full border-2 border-[#e0e0e4] border-t-[#3480f1] animate-spin" />
          Kirilmoqda...
        </div>
        <div
          v-else-if="widgetState === 'mini-app-error'"
          class="mb-4 w-full rounded-2xl bg-red-50 px-4 py-3 text-[13px] text-red-600"
        >
          Telegramni yangilang va qaytadan kirging.
        </div>

        <!-- Telegram Login Widget (auto-mounted) -->
        <div
          id="telegram-widget-container"
          class="mt-3 flex min-h-13 items-center justify-center"
        />

        <p
          v-if="authError"
          class="mt-3 text-center text-[13px] leading-5 text-red-600"
        >
          {{ authError }}
        </p>
      </div>

      <div class="mt-8 pb-8" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Lint the file**

Run: `npx eslint app/pages/login.vue`
Expected: PASS (no errors). Fix any reported issues.

- [ ] **Step 3: Commit**

```bash
git add app/pages/login.vue
git commit -m "refactor(login): widget + mini-app only, fix account switch via mount action"
```

---

## Task 3: Delete the bot-login client plugin and clean `auth.ts` logout

**Files:**
- Delete: `app/plugins/bot-login.client.ts`
- Modify: `app/stores/auth.ts` (`logout()`)

- [ ] **Step 1: Delete the client plugin**

```bash
git rm app/plugins/bot-login.client.ts
```

- [ ] **Step 2: Remove dead token cleanup from `logout()`**

In `app/stores/auth.ts`, inside `logout()`, delete these two lines:

```js
      sessionStorage.removeItem('bot_login_token')
      localStorage.removeItem('bot_login_token')
```

So the `if (import.meta.client)` block becomes:

```js
    if (import.meta.client) {
      await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    }
```

- [ ] **Step 3: Verify the auth store tests still pass**

Run: `npm run test:nuxt`
Expected: PASS — `tests/nuxt/auth-store.test.ts` green.

- [ ] **Step 4: Lint**

Run: `npx eslint app/stores/auth.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/plugins/bot-login.client.ts app/stores/auth.ts
git commit -m "chore(auth): remove bot-login client plugin and dead token cleanup"
```

---

## Task 4: Trim dead bot helpers from `login-flow.mjs` and its tests

**Files:**
- Modify (final state): `app/utils/login-flow.mjs`
- Modify (final state): `app/utils/login-flow.test.mjs`

- [ ] **Step 1: Replace `app/utils/login-flow.mjs` with the trimmed final version**

```js
export function resolvePostLoginTarget(selectedPlan, redirectPath) {
  if (redirectPath) {
    if (redirectPath === '/dashboard' && selectedPlan) {
      return { path: '/dashboard', query: { plan: selectedPlan } }
    }

    return { path: redirectPath }
  }

  return { path: '/dashboard' }
}

/**
 * Decide what the login page should do on mount.
 * Order matters: a fresh Telegram auth payload in the URL must win over an
 * existing session so users can switch accounts (otherwise the old cookie
 * short-circuits to a redirect and the new id&hash is ignored).
 *
 * @param {{ isMiniApp: boolean, hasAuthPayload: boolean, hasSession: boolean }} input
 * @returns {'mini-app' | 'process-auth' | 'redirect' | 'show-widget'}
 */
export function resolveLoginMountAction({ isMiniApp, hasAuthPayload, hasSession }) {
  if (isMiniApp) return 'mini-app'
  if (hasAuthPayload) return 'process-auth'
  if (hasSession) return 'redirect'
  return 'show-widget'
}
```

- [ ] **Step 2: Replace `app/utils/login-flow.test.mjs` with the trimmed final version**

```js
import { test } from 'vitest'
import assert from 'node:assert/strict'

import { resolveLoginMountAction, resolvePostLoginTarget } from './login-flow.mjs'

test('resolvePostLoginTarget sends users to dashboard by default', () => {
  assert.deepEqual(resolvePostLoginTarget('', ''), { path: '/dashboard' })
})

test('resolvePostLoginTarget preserves redirect query when provided', () => {
  assert.equal(resolvePostLoginTarget('', '/materials').path, '/materials')
})

test('resolvePostLoginTarget keeps selected plan only for dashboard redirects', () => {
  assert.deepEqual(resolvePostLoginTarget('pro', ''), { path: '/dashboard' })
  assert.deepEqual(resolvePostLoginTarget('pro', '/dashboard'), { path: '/dashboard', query: { plan: 'pro' } })
})

test('resolveLoginMountAction prefers mini-app above everything', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: true, hasAuthPayload: true, hasSession: true }),
    'mini-app'
  )
})

test('resolveLoginMountAction processes a fresh auth payload before an existing session', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: false, hasAuthPayload: true, hasSession: true }),
    'process-auth'
  )
})

test('resolveLoginMountAction redirects when only a session exists', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: false, hasAuthPayload: false, hasSession: true }),
    'redirect'
  )
})

test('resolveLoginMountAction shows the widget when nothing is present', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: false, hasAuthPayload: false, hasSession: false }),
    'show-widget'
  )
})
```

- [ ] **Step 3: Run the tests**

Run: `npx vitest run app/utils/login-flow.test.mjs`
Expected: PASS — 7 tests, no references to removed helpers.

- [ ] **Step 4: Lint**

Run: `npx eslint app/utils/login-flow.mjs app/utils/login-flow.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/utils/login-flow.mjs app/utils/login-flow.test.mjs
git commit -m "chore(login): drop dead bot-login token helpers"
```

---

## Task 5: Delete the server bot-login endpoints and route

**Files:**
- Delete: `server/api/auth/bot-login/start.post.ts`
- Delete: `server/api/auth/bot-login/status.get.ts`
- Delete: `server/api/auth/telegram/start.post.ts`
- Delete: `server/routes/auth/bot-callback.get.ts`

- [ ] **Step 1: Delete the files**

```bash
git rm server/api/auth/bot-login/start.post.ts \
       server/api/auth/bot-login/status.get.ts \
       server/api/auth/telegram/start.post.ts \
       server/routes/auth/bot-callback.get.ts
```

(The now-empty `server/api/auth/bot-login/` and `server/api/auth/telegram/` directories are removed automatically by git.)

- [ ] **Step 2: Verify nothing references the deleted endpoints**

Run: `grep -rn "bot-login/start\|bot-login/status\|telegram/start\|bot-callback" app server --include="*.ts" --include="*.vue" --include="*.mjs"`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(auth): remove bot deep-link login endpoints and callback route"
```

---

## Task 6: Trim `process-telegram-update.ts` to the plain `/start` welcome

**Files:**
- Modify (full rewrite): `server/utils/process-telegram-update.ts`

- [ ] **Step 1: Replace the entire file contents**

Overwrite `server/utils/process-telegram-update.ts` with exactly:

```ts
import { sendTelegramMessage } from './telegram'
import { buildMiniAppLoginUrl } from './telegram-bot.js'

interface TgFrom {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

export interface TgUpdate {
  update_id: number
  message?: {
    text?: string
    chat?: { id: number }
    from?: TgFrom
  }
  callback_query?: {
    id: string
    data?: string
    from?: TgFrom
    message?: { chat?: { id: number } }
  }
}

export async function processTelegramUpdate(update: TgUpdate): Promise<void> {
  const config = useRuntimeConfig()
  const message = update.message
  const text = message?.text?.trim()
  const from = message?.from
  const chatId = message?.chat?.id ?? from?.id
  const botToken = config.telegramBotToken as string | undefined

  if (!text || !from || !chatId || !text.startsWith('/start')) return

  const payload = text.slice('/start'.length).trim()
  if (payload) return

  if (botToken) {
    const appUrl = (config.public as Record<string, string>).appUrl || 'https://chayroom.uz'
    await sendTelegramMessage(botToken, chatId, 'Salom! 👋 Chayroom AI Club platformasini oching:', {
      reply_markup: {
        inline_keyboard: [[{ text: '🚀 Platformani ochish', web_app: { url: buildMiniAppLoginUrl(appUrl) } }]]
      }
    })
  }
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint server/utils/process-telegram-update.ts`
Expected: PASS (no unused imports — `answerTelegramCallbackQuery` and all `bot-login` imports are gone).

- [ ] **Step 3: Commit**

```bash
git add server/utils/process-telegram-update.ts
git commit -m "refactor(bot): drop auth_ login branch, keep /start welcome"
```

---

## Task 7: Inline the success message and delete `bot-login.ts`

**Files:**
- Modify: `server/api/auth/telegram.post.ts`
- Delete: `server/utils/bot-login.ts`
- Delete: `server/utils/bot-login.test.mjs`

- [ ] **Step 1: Inline the constant in `telegram.post.ts`**

Remove this import line (currently line 9):

```ts
import { BOT_LOGIN_SUCCESS_MESSAGE } from '#server/utils/bot-login'
```

Add a module-level constant just below the existing imports (above `export default defineEventHandler`):

```ts
const LOGIN_SUCCESS_MESSAGE
  = '✅ Kirish muvaffaqiyatli amalga oshirildi!\n\nChayroom.uz saytiga qayting va foydalanishda davom eting. 🚀'
```

Then update the single usage (in the non-first-login branch) from `BOT_LOGIN_SUCCESS_MESSAGE` to `LOGIN_SUCCESS_MESSAGE`:

```ts
      await sendTelegramMessage(botToken, tgUser.id, LOGIN_SUCCESS_MESSAGE, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Panelni ochish', web_app: { url: buildMiniAppLoginUrl(config.public.appUrl || 'https://chayroom.uz') } }]
          ]
        }
      })
```

- [ ] **Step 2: Delete `bot-login.ts` and its test**

```bash
git rm server/utils/bot-login.ts server/utils/bot-login.test.mjs
```

- [ ] **Step 3: Verify nothing imports `bot-login`**

Run: `grep -rn "bot-login\|BotLogin\|BOT_LOGIN" app server --include="*.ts" --include="*.vue" --include="*.mjs"`
Expected: no output.

- [ ] **Step 4: Lint**

Run: `npx eslint server/api/auth/telegram.post.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/api/auth/telegram.post.ts server/utils/bot-login.ts server/utils/bot-login.test.mjs
git commit -m "chore(auth): inline login success message, delete bot-login util"
```

---

## Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm no bot deep-link remnants anywhere**

Run: `grep -rn "bot_login_token\|bot-login\|bot-callback\|pollBotLoginStatus\|buildBotLoginStartRequest" app server --include="*.ts" --include="*.vue" --include="*.mjs"`
Expected: no output.

- [ ] **Step 2: Lint the whole project**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Typecheck the whole project**

Run: `npm run typecheck`
Expected: PASS (catches any dangling import from deleted modules and the `login.vue` / server changes).

- [ ] **Step 4: Run the full test suite**

Run: `npm run test`
Expected: PASS — including `app/utils/login-flow.test.mjs` (7 tests) and `tests/nuxt/auth-store.test.ts`.

- [ ] **Step 5: Manual smoke test (note for the human)**

Run `npm run dev` and verify on the real app hostname:
1. Logged-out browser → blue widget appears → completing it lands on `/dashboard` (no polling, single tab).
2. Logged in as account A, visit `/login?id=<B>&hash=<valid B hash>` (or trigger the widget with account B) → session switches to B, redirects to dashboard.
3. Inside Telegram (Mini App) → auto-login via `initData`.
4. `/start` (no payload) in the bot → welcome message with "Platformani ochish" Mini App button.

- [ ] **Step 6: Final commit (if any fixes were made)**

```bash
git add -A
git commit -m "test(auth): verify Telegram login stabilization green"
```

---

## Notes / Out of Scope

- `server/api/telegram/webhook.post.ts` is left untouched. `server/plugins/telegram-polling.ts` deletes the webhook on startup and uses `getUpdates`, so the webhook handler is dead in production — a pre-existing inconsistency, not fixed here.
- No "switch account" button is added; deliberate switching uses `/profile` → logout. Telegram itself may cache the authorized account; the app only guarantees it honors whatever account Telegram returns (see spec §4).
- The widget does not work inside in-app webviews (e.g., Instagram); there is no fallback by design (spec §3).
