# Telegram Login and Tribute Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public `Kirish` action open Telegram's official login flow, create a server-verified user session, send an Uzbek confirmation message, and preserve Tribute subscriptions that arrive before first login.

**Architecture:** Use Telegram OpenID Connect Authorization Code Flow with PKCE for browser login, `jose` with Telegram's remote JWKS for ID-token verification, and H3 encrypted sessions for authenticated users. Keep the existing Tribute tables and UI, but make the webhook create a placeholder user when payment arrives before login. Validate Telegram Mini App `initData` server-side so the existing in-Telegram automatic login continues to work with the new server session.

**Tech Stack:** Nuxt 4, Nitro/H3 `useSession`, Telegram OIDC, `jose`, Drizzle ORM/Postgres, Pinia, Node `crypto`, `node:test`.

**Specs:**
- `docs/superpowers/specs/2026-06-06-telegram-login-tribute-design.md`
- `docs/superpowers/specs/2026-06-05-tribute-subscription-integration-design.md`

---

## File Map

**Create:**

- `server/utils/auth-redirect.ts` — allow only local post-login paths.
- `server/utils/auth-redirect.test.mjs` — redirect validation tests.
- `server/utils/telegram-oidc.ts` — PKCE, authorization URL, token exchange, ID-token verification.
- `server/utils/telegram-oidc.test.mjs` — OIDC helper tests with a local signing key.
- `server/utils/telegram-miniapp-auth.ts` — validate Telegram Mini App `initData`.
- `server/utils/telegram-miniapp-auth.test.mjs` — Mini App signature and expiry tests.
- `server/utils/user-session.ts` — encrypted user and transient login sessions.
- `server/services/user-access.ts` — user upsert and canonical subscription lookup.
- `server/services/user-access.test.mjs` — subscription-state behavior tests.
- `server/api/auth/telegram/start.get.ts` — start Telegram OIDC.
- `server/api/auth/telegram/callback.get.ts` — finish Telegram OIDC.
- `server/api/auth/telegram/miniapp.post.ts` — establish a session from verified Mini App data.
- `server/api/auth/dev-login.post.ts` — development-only server session bootstrap.
- `server/api/auth/logout.post.ts` — clear the user session.
- `app/pages/auth/error.vue` — Uzbek retry page for failed Telegram login.

**Modify:**

- `package.json`, `pnpm-lock.yaml` — add `jose`.
- `nuxt.config.ts` — private OIDC/session config and explicit Tribute env mapping.
- `.env.production.example` — document required OIDC/session values.
- `server/api/auth/me.get.ts` — read the encrypted server session.
- `server/api/auth/login.post.ts` — retire unsafe public login behavior after callers migrate.
- `server/api/tribute/webhook.post.ts` — create placeholder users and preserve early payments.
- `server/utils/telegram-bot.js` — point the menu button at dashboard Mini App bootstrap.
- `server/utils/telegram-bot.test.mjs` — update expected Mini App URL.
- `app/stores/auth.ts` — server-backed auth state, Mini App login, logout.
- `app/app.vue` — restore the server session and verify Mini App login.
- `app/pages/login.vue` — compatibility redirect plus development/Mini App bootstrap.
- `app/middleware/auth.ts` — external redirect to Telegram login.
- `app/components/app/Nav.vue` — direct Telegram login links.
- `app/pages/dashboard.vue` — direct Telegram login link.
- `app/pages/courses/[slug]/index.vue` — preserve lesson redirect through Telegram login.
- `app/pages/profile.vue` — await server logout.

---

## Task 1: Configuration and Dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `nuxt.config.ts`
- Modify: `.env.production.example`

- [ ] **Step 1: Add the JOSE dependency**

Run:

```bash
pnpm add jose
```

Expected: `jose` appears in `dependencies`, and `pnpm-lock.yaml` changes.

- [ ] **Step 2: Add private auth configuration**

In `nuxt.config.ts`, add:

```ts
runtimeConfig: {
  // existing private keys...
  telegramClientId: '',
  telegramClientSecret: '',
  userSessionPassword: '',
  telegramBotToken: '',
  tributeApiKey: '',
  public: {
    // existing public keys...
    telegramBotUsername: '',
    appUrl: 'https://chayroom.uz',
    supportUsername: 'hellobehruz',
    tributeTier1MonthUrl: '',
    tributeTier3MonthUrl: '',
    tributeTier6MonthUrl: ''
  }
}
```

Do not read secrets through `config.public`.

- [ ] **Step 3: Map existing Tribute env names explicitly**

The deployed env uses `TIER_1_MONTH`, while Nuxt's automatic mapping for
`tributeTier1MonthUrl` expects `TIER1_MONTH`. Keep the documented env names by
using defaults from `process.env`:

```ts
tributeApiKey: process.env.NUXT_TRIBUTE_API_KEY || '',
public: {
  tributeTier1MonthUrl: process.env.NUXT_PUBLIC_TRIBUTE_TIER_1_MONTH_URL || '',
  tributeTier3MonthUrl: process.env.NUXT_PUBLIC_TRIBUTE_TIER_3_MONTH_URL || '',
  tributeTier6MonthUrl: process.env.NUXT_PUBLIC_TRIBUTE_TIER_6_MONTH_URL || ''
}
```

- [ ] **Step 4: Document production variables**

Add to `.env.production.example`:

```dotenv
NUXT_TELEGRAM_CLIENT_ID=
NUXT_TELEGRAM_CLIENT_SECRET=
# Random secret, >= 32 chars.
NUXT_USER_SESSION_PASSWORD=
```

Keep these existing values unchanged:

```dotenv
NUXT_TELEGRAM_BOT_TOKEN=
NUXT_TRIBUTE_API_KEY=
NUXT_PUBLIC_TRIBUTE_TIER_1_MONTH_URL=
NUXT_PUBLIC_TRIBUTE_TIER_3_MONTH_URL=
NUXT_PUBLIC_TRIBUTE_TIER_6_MONTH_URL=
```

- [ ] **Step 5: Verify generated Nuxt types**

Run:

```bash
pnpm postinstall
pnpm typecheck
```

Expected: Nuxt preparation succeeds. Typecheck may still expose pre-existing
errors, but no error may reference the new runtime config keys.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml nuxt.config.ts .env.production.example
git commit -m "chore(auth): configure Telegram OIDC and user sessions"
```

---

## Task 2: Redirect, OIDC, and Mini App Verification Helpers

**Files:**
- Create: `server/utils/auth-redirect.ts`
- Create: `server/utils/auth-redirect.test.mjs`
- Create: `server/utils/telegram-oidc.ts`
- Create: `server/utils/telegram-oidc.test.mjs`
- Create: `server/utils/telegram-miniapp-auth.ts`
- Create: `server/utils/telegram-miniapp-auth.test.mjs`

- [ ] **Step 1: Write failing redirect tests**

Create `server/utils/auth-redirect.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { safeRedirectPath } from './auth-redirect.ts'

test('safeRedirectPath accepts local application paths', () => {
  assert.equal(safeRedirectPath('/dashboard'), '/dashboard')
  assert.equal(safeRedirectPath('/courses/ai/lesson/1?tab=notes'), '/courses/ai/lesson/1?tab=notes')
})

test('safeRedirectPath rejects external and protocol-relative URLs', () => {
  assert.equal(safeRedirectPath('https://evil.example'), '/dashboard')
  assert.equal(safeRedirectPath('//evil.example'), '/dashboard')
  assert.equal(safeRedirectPath('javascript:alert(1)'), '/dashboard')
})

test('safeRedirectPath handles missing and array query values', () => {
  assert.equal(safeRedirectPath(undefined), '/dashboard')
  assert.equal(safeRedirectPath(['/profile']), '/dashboard')
})
```

- [ ] **Step 2: Run redirect tests and verify RED**

```bash
node --test --experimental-strip-types server/utils/auth-redirect.test.mjs
```

Expected: FAIL because `auth-redirect.ts` does not exist.

- [ ] **Step 3: Implement redirect validation**

Create `server/utils/auth-redirect.ts`:

```ts
export function safeRedirectPath(value: unknown, fallback = '/dashboard'): string {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}
```

- [ ] **Step 4: Write failing OIDC tests**

Create `server/utils/telegram-oidc.test.mjs`. Test these exported functions:

```ts
createPkcePair()
buildTelegramAuthorizationUrl(options)
verifyTelegramIdToken(idToken, options)
```

The tests must assert:

```js
test('authorization URL contains Telegram endpoint and required parameters', ...)
test('PKCE challenge is base64url SHA-256 of verifier', ...)
test('verified token returns Telegram profile claims', ...)
test('verification rejects wrong issuer', ...)
test('verification rejects wrong audience', ...)
test('verification rejects wrong nonce', ...)
test('verification rejects expired token', ...)
```

Use `jose.generateKeyPair`, `exportJWK`, `SignJWT`, and
`createLocalJWKSet` in tests so no network call is required.

- [ ] **Step 5: Run OIDC tests and verify RED**

```bash
node --test --experimental-strip-types server/utils/telegram-oidc.test.mjs
```

Expected: FAIL because `telegram-oidc.ts` does not exist.

- [ ] **Step 6: Implement OIDC helpers**

Create `server/utils/telegram-oidc.ts` with:

```ts
import { createHash, randomBytes } from 'node:crypto'
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose'

const TELEGRAM_ISSUER = 'https://oauth.telegram.org'
const TELEGRAM_AUTH_URL = 'https://oauth.telegram.org/auth'
const TELEGRAM_TOKEN_URL = 'https://oauth.telegram.org/token'
const TELEGRAM_JWKS = createRemoteJWKSet(
  new URL('https://oauth.telegram.org/.well-known/jwks.json')
)

export function createPkcePair() {
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function buildTelegramAuthorizationUrl(options: {
  clientId: string
  redirectUri: string
  state: string
  nonce: string
  codeChallenge: string
}) {
  const url = new URL(TELEGRAM_AUTH_URL)
  url.searchParams.set('client_id', options.clientId)
  url.searchParams.set('redirect_uri', options.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid profile phone telegram:bot_access')
  url.searchParams.set('state', options.state)
  url.searchParams.set('nonce', options.nonce)
  url.searchParams.set('code_challenge', options.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}
```

Also implement:

```ts
export async function exchangeTelegramCode(options: {
  code: string
  codeVerifier: string
  clientId: string
  clientSecret: string
  redirectUri: string
  fetchImpl?: typeof fetch
}): Promise<{ id_token: string }>
```

Use HTTP Basic auth and
`application/x-www-form-urlencoded`. Throw when Telegram returns non-2xx or no
`id_token`.

Implement:

```ts
export async function verifyTelegramIdToken(
  idToken: string,
  options: {
    clientId: string
    nonce: string
    jwks?: JWTVerifyGetKey
  }
)
```

Call `jwtVerify` with:

```ts
{
  issuer: TELEGRAM_ISSUER,
  audience: options.clientId
}
```

Then require `payload.nonce === options.nonce`, numeric Telegram `id`, and a
non-empty `name`. Return normalized claims:

```ts
{
  id: Number(payload.id),
  firstName,
  lastName,
  username: payload.preferred_username,
  photoUrl: payload.picture,
  phoneNumber: payload.phone_number
}
```

- [ ] **Step 7: Write failing Mini App validation tests**

Create `server/utils/telegram-miniapp-auth.test.mjs` and generate the expected
Telegram Web App signature according to Telegram's HMAC rules. Test:

```js
test('accepts fresh correctly signed initData', ...)
test('rejects tampered user JSON', ...)
test('rejects stale auth_date', ...)
test('rejects missing hash or bot token', ...)
```

- [ ] **Step 8: Run Mini App tests and verify RED**

```bash
node --test --experimental-strip-types server/utils/telegram-miniapp-auth.test.mjs
```

Expected: FAIL because `telegram-miniapp-auth.ts` does not exist.

- [ ] **Step 9: Implement Mini App validation**

Create `server/utils/telegram-miniapp-auth.ts`:

```ts
export function verifyTelegramMiniAppData(
  initData: string,
  botToken: string,
  maxAgeSec = 3600
): { id: number, first_name: string, last_name?: string, username?: string, photo_url?: string } | null
```

Parse `URLSearchParams`, remove `hash`, sort the remaining `key=value` pairs,
derive the Web App secret with HMAC-SHA256 key `"WebAppData"`, compare hashes
with `timingSafeEqual`, enforce `auth_date`, then parse and validate `user`.

- [ ] **Step 10: Verify all helper tests GREEN**

```bash
node --test --experimental-strip-types \
  server/utils/auth-redirect.test.mjs \
  server/utils/telegram-oidc.test.mjs \
  server/utils/telegram-miniapp-auth.test.mjs
```

Expected: all tests pass.

- [ ] **Step 11: Commit**

```bash
git add server/utils/auth-redirect.ts server/utils/auth-redirect.test.mjs \
  server/utils/telegram-oidc.ts server/utils/telegram-oidc.test.mjs \
  server/utils/telegram-miniapp-auth.ts server/utils/telegram-miniapp-auth.test.mjs
git commit -m "feat(auth): add Telegram OIDC and Mini App verification"
```

---

## Task 3: Server Sessions and Canonical User Access Service

**Files:**
- Create: `server/utils/user-session.ts`
- Create: `server/services/user-access.ts`
- Create: `server/services/user-access.test.mjs`

- [ ] **Step 1: Write failing access-state tests**

Create `server/services/user-access.test.mjs` for the pure exports:

```ts
isSubscriptionActive(subscription, now)
subscriptionState(subscription, now)
placeholderTelegramUser(telegramId)
```

Cover:

```js
test('active unexpired subscription grants access', ...)
test('expired active subscription does not grant access', ...)
test('cancelled-at subscription keeps access until expiresAt', ...)
test('missing subscription is unsubscribed', ...)
test('placeholder user keeps Telegram id and neutral Uzbek name', ...)
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test --experimental-strip-types server/services/user-access.test.mjs
```

Expected: FAIL because `user-access.ts` does not exist.

- [ ] **Step 3: Implement the access service**

Create `server/services/user-access.ts` with pure functions tested above and
database functions:

```ts
export async function upsertTelegramUser(profile: {
  id: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
})

export async function ensurePlaceholderUser(telegramId: number)

export async function getUserAccessByTelegramId(telegramId: string)
```

`getUserAccessByTelegramId` must select the latest subscription by
`expiresAt DESC`, treat admins as subscribed, and return one canonical shape:

```ts
{
  user,
  hasSubscription,
  subscription: {
    period,
    expiresAt,
    cancelledAt
  } | null
}
```

`ensurePlaceholderUser` inserts:

```ts
{
  telegramId: String(telegramId),
  firstName: 'Telegram foydalanuvchisi'
}
```

and handles the unique Telegram ID by selecting the existing row when a
concurrent login/webhook already created it.

- [ ] **Step 4: Implement user and login transaction sessions**

Create `server/utils/user-session.ts`:

```ts
interface UserSessionData {
  telegramId?: string
}

interface TelegramLoginSessionData {
  state?: string
  nonce?: string
  codeVerifier?: string
  redirectPath?: string
}
```

Export:

```ts
useUserSession(event)
useTelegramLoginSession(event)
```

Both use `config.userSessionPassword`, `httpOnly: true`,
`secure: !import.meta.dev`, `sameSite: 'lax'`. Use cookie names
`cx-session` and `cx-telegram-login`. Give the transient login session a
10-minute max age.

- [ ] **Step 5: Verify tests GREEN**

```bash
node --test --experimental-strip-types server/services/user-access.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add server/services/user-access.ts server/services/user-access.test.mjs server/utils/user-session.ts
git commit -m "feat(auth): add server user sessions and access service"
```

---

## Task 4: Telegram Login Endpoints and Bot Confirmation

**Files:**
- Create: `server/api/auth/telegram/start.get.ts`
- Create: `server/api/auth/telegram/callback.get.ts`
- Create: `server/api/auth/telegram/miniapp.post.ts`
- Create: `server/api/auth/dev-login.post.ts`
- Create: `server/api/auth/logout.post.ts`
- Create: `app/pages/auth/error.vue`
- Modify: `server/api/auth/me.get.ts`

- [ ] **Step 1: Implement the OIDC start endpoint**

`server/api/auth/telegram/start.get.ts` must:

1. Require `telegramClientId`, `telegramClientSecret`, and
   `userSessionPassword`.
2. Normalize `redirect` with `safeRedirectPath`.
3. Generate `state`, `nonce`, and PKCE pair.
4. Store them in `useTelegramLoginSession(event)`.
5. Build callback URI from `config.public.appUrl`:
   `https://chayroom.uz/api/auth/telegram/callback`.
6. Return `sendRedirect(event, authorizationUrl, 302)`.

- [ ] **Step 2: Implement the callback endpoint**

`server/api/auth/telegram/callback.get.ts` must:

1. Handle Telegram `error` by clearing the transient session and redirecting
   to `/auth/error?reason=denied`.
2. Require `code` and matching `state`.
3. Exchange the code with the stored PKCE verifier.
4. Verify ID token issuer, audience, signature, expiry, and nonce.
5. Upsert the real Telegram profile.
6. Update `cx-session` with `telegramId`.
7. Clear `cx-telegram-login`.
8. Send the bot confirmation message without failing login when sending fails.
9. Redirect to the stored safe local path.

Use this exact bot text:

```text
✅ Siz chayroom.uz saytida muvaffaqiyatli avtorizatsiyadan o'tdingiz.
Saytga qayting, kirish allaqachon bajarildi.
```

- [ ] **Step 3: Implement verified Mini App session creation**

`server/api/auth/telegram/miniapp.post.ts` accepts:

```ts
{ initData: string }
```

Validate it with `verifyTelegramMiniAppData`, upsert the user, update
`cx-session`, and return the canonical `getUserAccessByTelegramId` result.
Reject invalid data with `401`.

- [ ] **Step 4: Replace `/api/auth/me` cookie trust**

Update `server/api/auth/me.get.ts` to read `telegramId` only from
`useUserSession(event)`. Do not parse `cx-user`. Return the same response
shape currently consumed by the store, using `getUserAccessByTelegramId`.

- [ ] **Step 5: Implement logout**

`server/api/auth/logout.post.ts` clears `cx-session` and returns `{ ok: true }`.

- [ ] **Step 6: Implement development-only login**

Create `server/api/auth/dev-login.post.ts`:

```ts
import { upsertTelegramUser, getUserAccessByTelegramId } from '../../services/user-access'
import { useUserSession } from '../../utils/user-session'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const user = await upsertTelegramUser({
    id: 123456789,
    firstName: 'Behruz',
    lastName: 'Zaripov',
    username: 'behruzzaripov'
  })
  const session = await useUserSession(event)
  await session.update({ telegramId: user.telegramId })
  return getUserAccessByTelegramId(user.telegramId)
})
```

This endpoint must not exist as a usable shortcut in production; the
`import.meta.dev` guard returns `404`.

- [ ] **Step 7: Add the Uzbek auth error page**

Create `app/pages/auth/error.vue` with:

- heading: `Telegram orqali kirib bo'lmadi`
- denied message: `Kirish tasdiqlanmadi. Qayta urinib ko'ring.`
- generic message: `Telegram javobini tekshirib bo'lmadi. Qayta urinib ko'ring.`
- retry link:
  `/api/auth/telegram/start?redirect=/dashboard`
- home link: `/`

Use existing Tailwind visual language and no component `<style>` block.

- [ ] **Step 8: Run focused verification**

```bash
pnpm typecheck
pnpm lint
```

Expected: no new errors in the auth endpoints, services, or error page.

- [ ] **Step 9: Commit**

```bash
git add server/api/auth/telegram server/api/auth/dev-login.post.ts server/api/auth/logout.post.ts \
  server/api/auth/me.get.ts app/pages/auth/error.vue
git commit -m "feat(auth): complete Telegram login with secure sessions"
```

---

## Task 5: Preserve Tribute Payments Before First Login

**Files:**
- Modify: `server/api/tribute/webhook.post.ts`
- Test: `server/services/user-access.test.mjs`

- [ ] **Step 1: Add a failing placeholder reconciliation test**

Extend `server/services/user-access.test.mjs` with a fake repository test for
the exported reconciliation function:

```ts
reconcileTributeEvent(repository, event)
```

Test:

```js
test('new subscription creates placeholder user before subscription', ...)
test('replayed new subscription updates existing subscription', ...)
test('renewal restores ACTIVE and clears cancelledAt', ...)
test('cancellation keeps status and expiresAt but sets cancelledAt', ...)
```

The fake repository records calls and returns deterministic IDs; no database is
required.

- [ ] **Step 2: Run and verify RED**

```bash
node --test --experimental-strip-types server/services/user-access.test.mjs
```

Expected: FAIL because reconciliation is not implemented.

- [ ] **Step 3: Implement reconciliation**

Add the repository-driven reconciliation function to
`server/services/user-access.ts`. The production repository must:

1. call `ensurePlaceholderUser(payload.telegram_user_id)`;
2. upsert `new_subscription` by `tributeSubscriptionId`;
3. update `renewed_subscription`;
4. mark `cancelledAt` without removing access before expiry.

Update `server/api/tribute/webhook.post.ts` to retain raw-body signature
verification and payload validation, then delegate event persistence to the
service.

Do not create nullable `subscriptions.userId`; the existing `NOT NULL` schema
stays unchanged.

- [ ] **Step 4: Verify GREEN**

```bash
node --test --experimental-strip-types \
  server/services/user-access.test.mjs \
  server/utils/tribute-signature.test.mjs
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add server/services/user-access.ts server/services/user-access.test.mjs server/api/tribute/webhook.post.ts
git commit -m "fix(tribute): retain subscriptions received before login"
```

---

## Task 6: Move the Client to Server-Backed Authentication

**Files:**
- Modify: `app/stores/auth.ts`
- Modify: `app/app.vue`
- Modify: `app/pages/login.vue`
- Modify: `app/middleware/auth.ts`
- Modify: `app/components/app/Nav.vue`
- Modify: `app/pages/dashboard.vue`
- Modify: `app/pages/courses/[slug]/index.vue`
- Modify: `app/pages/profile.vue`
- Modify: `server/utils/telegram-bot.js`
- Modify: `server/utils/telegram-bot.test.mjs`
- Modify: `server/api/auth/login.post.ts`

- [ ] **Step 1: Refactor the auth store**

In `app/stores/auth.ts`:

- Remove `cx-user` and `cx-sub` client cookies.
- Remove `localStorage` user persistence.
- Make `syncMe()` populate the full user from `/api/auth/me`.
- Normalize the returned database fields into the current `TelegramUser`
  shape (`first_name`, `last_name`, `photo_url`) so templates do not require a
  broad rewrite.
- Change Mini App login to:

```ts
async function loginFromMiniApp(initData: string) {
  const res = await $fetch('/api/auth/telegram/miniapp', {
    method: 'POST',
    body: { initData }
  })
  applyAuthResponse(res)
}
```

- Make logout asynchronous:

```ts
async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  clearLocalAuthState()
}
```

- Keep `devLogin()` development-only and POST to `/api/auth/dev-login`, then
  apply the returned canonical auth response. Do not restore an unsigned
  production login shortcut.

- [ ] **Step 2: Restore session in the app shell**

In `app/app.vue`, call `syncMe()` once on client mount. For Mini App login,
pass `window.Telegram.WebApp.initData`, not `initDataUnsafe.user`.

Remove the condition that only logs in when `!hasSubscription`; authentication
and subscription are separate states.

- [ ] **Step 3: Convert login entry points**

Use this URL:

```ts
/api/auth/telegram/start?redirect=<encoded local path>
```

Update:

- all three `Kirish` links in `app/components/app/Nav.vue`;
- dashboard login CTA;
- course lesson login CTA;
- `app/middleware/auth.ts` with `navigateTo(url, { external: true })`.

Use plain `<a>` for server endpoints rather than `NuxtLink`.

- [ ] **Step 4: Make `/login` a compatibility bootstrap**

Keep `app/pages/login.vue` because old bot links and bookmarks use it.

Behavior:

- Mini App: POST verified `initData`, then navigate to safe redirect.
- Development: show the existing dev login affordance.
- Normal browser production: immediately call
  `window.location.replace('/api/auth/telegram/start?...')`.

Do not mount the legacy Telegram widget in the public user login page.
Admin login remains unchanged.

- [ ] **Step 5: Update profile logout**

In `app/pages/profile.vue`:

```ts
async function logout() {
  await authStore.logout()
  await navigateTo('/')
}
```

- [ ] **Step 6: Update the bot platform URL**

Change `buildMiniAppLoginUrl` to produce:

```text
https://chayroom.uz/login?miniapp=1&redirect=%2Fdashboard
```

Update `server/utils/telegram-bot.test.mjs` first, run it to observe failure,
then change `server/utils/telegram-bot.js`.

- [ ] **Step 7: Disable the unsafe legacy public endpoint**

After all public and Mini App callers migrate, change
`server/api/auth/login.post.ts` to return `410 Gone` with:

```ts
throw createError({
  statusCode: 410,
  statusMessage: 'Use Telegram verified login'
})
```

The admin endpoint continues using its separately verified legacy Telegram
payload.

- [ ] **Step 8: Verify client and bot behavior**

```bash
node --test --experimental-strip-types server/utils/telegram-bot.test.mjs
pnpm typecheck
pnpm lint
```

Expected: bot tests pass and no new client auth errors.

- [ ] **Step 9: Commit**

```bash
git add app/stores/auth.ts app/app.vue app/pages/login.vue app/middleware/auth.ts \
  app/components/app/Nav.vue app/pages/dashboard.vue app/pages/courses/[slug]/index.vue \
  app/pages/profile.vue server/utils/telegram-bot.js server/utils/telegram-bot.test.mjs \
  server/api/auth/login.post.ts
git commit -m "feat(auth): route all user login through verified Telegram sessions"
```

---

## Task 7: Full Verification and Deployment Checklist

**Files:**
- Modify only if verification exposes defects.

- [ ] **Step 1: Run all focused unit tests**

```bash
node --test --experimental-strip-types \
  server/utils/auth-redirect.test.mjs \
  server/utils/telegram-oidc.test.mjs \
  server/utils/telegram-miniapp-auth.test.mjs \
  server/services/user-access.test.mjs \
  server/utils/telegram-auth.test.mjs \
  server/utils/telegram-bot.test.mjs \
  server/utils/tribute-signature.test.mjs
```

Expected: all tests pass.

- [ ] **Step 2: Run project verification**

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit `0`.

- [ ] **Step 3: Configure BotFather**

In `@BotFather → Bot Settings → Web Login`:

- Allowed origin: `https://chayroom.uz`
- Redirect URI: `https://chayroom.uz/api/auth/telegram/callback`
- Copy Client ID to `NUXT_TELEGRAM_CLIENT_ID`
- Copy Client Secret to `NUXT_TELEGRAM_CLIENT_SECRET`

Also set a strong `NUXT_USER_SESSION_PASSWORD`.

- [ ] **Step 4: Browser production smoke test**

On an HTTPS deployment:

1. Open `https://chayroom.uz`.
2. Press `Kirish`.
3. Confirm the Telegram phone/approval page opens immediately.
4. Approve access.
5. Confirm redirect to `/dashboard`.
6. Confirm the bot sends:

```text
✅ Siz chayroom.uz saytida muvaffaqiyatli avtorizatsiyadan o'tdingiz.
Saytga qayting, kirish allaqachon bajarildi.
```

7. Reload the site and confirm the session remains active.
8. Log out and confirm `/api/auth/me` returns no user.

- [ ] **Step 5: Tribute smoke tests**

Test two accounts:

1. Existing Tribute subscriber logs in:
   profile shows `Faol`, tariff, days, and expiry.
2. A new Telegram ID pays before first site login:
   webhook creates placeholder user and subscription; after first login the
   real profile replaces placeholder fields and profile shows `Faol`.
3. Non-subscriber logs in:
   profile shows `Obunasiz`, `Yo'q`, and no expiry.
4. Cancelled but unexpired subscriber:
   profile shows `Bekor qilingan` and access remains until expiry.

- [ ] **Step 6: Mini App smoke test**

Open the bot's `Platforma` button:

1. Mini App opens `/login?miniapp=1&redirect=/dashboard`.
2. `initData` is verified server-side.
3. Dashboard opens without browser OAuth.
4. Subscription state matches the same database result as browser login.

- [ ] **Step 7: Inspect final diff**

```bash
git status --short
git diff --check
git diff --stat HEAD~6..HEAD
```

Confirm unrelated dirty UI changes were not staged or reverted.

---

## Plan Self-Review

- Browser login uses Telegram OIDC, PKCE, state, nonce, issuer, audience,
  expiry, and JWKS signature verification.
- Mini App login validates signed `initData`; it does not trust
  `initDataUnsafe`.
- Public auth uses encrypted `httpOnly` server sessions.
- All public `Kirish` entry points open Telegram directly.
- Legacy `/login` remains compatible with old bot links.
- Bot confirmation is Uzbek and is sent only after verified login.
- Bot send failure does not invalidate login.
- Existing Tribute schema, pricing UI, and webhook signature logic remain.
- Payments before first login are retained through a placeholder user.
- Cancelled subscriptions retain access until `expiresAt`.
- Existing underscore-separated Tribute env names are mapped explicitly.
- Admin auth remains isolated and unchanged.
- No production phone/SMS form is implemented locally.
