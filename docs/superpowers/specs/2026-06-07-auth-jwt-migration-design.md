# Auth JWT Migration Design

**Date:** 2026-06-07  
**Status:** Approved  
**Scope:** Replace sealed `useSession` with JWT + HTTP-only cookie; add materials access control

---

## Overview

Migrate the current Nuxt `useSession`-based auth to a JWT system stored in an HTTP-only cookie named `chayroom_session`. All Telegram auth flows (widget, mini app, bot-login) converge on shared helpers. Materials get an `access_level` field controlling visibility for non-subscribers.

---

## 1. Core Utilities

### `server/utils/jwt.ts`
- `signJwt(payload)` — signs with `NUXT_JWT_SECRET`, expires in `7d`
- `verifyJwt(token)` — returns payload or `null`

**JWT payload shape:**
```ts
{
  id: number          // DB users.id
  telegramId: string  // stored as string in DB (Telegram user ID)
  username: string | null
  fullName: string
  avatar: string | null
  role: 'USER' | 'ADMIN'
}
```

### `server/utils/verifyTelegramAuth.ts`
- `verifyWidgetAuth(data: Record<string, string>): boolean` — validates Login Widget `hash` using bot token
- `verifyWebAppAuth(initData: string): boolean` — validates Mini App `initData` HMAC

Both use `NUXT_TELEGRAM_BOT_TOKEN`.

### `server/utils/session-cookie.ts`
- `setSessionCookie(event, payload)` — signs JWT, writes `chayroom_session` HTTP-only cookie (`sameSite: lax`, `secure: true` in production, `maxAge: 7d`)
- `clearSessionCookie(event)` — deletes `chayroom_session`
- `readSessionUser(event)` — reads cookie, verifies JWT, returns payload or `null`

### `server/utils/upsertUserFromTelegram.ts`
Shared helper used by all auth flows:
```ts
upsertUserFromTelegram({ id, username, fullName, avatar })
```
- User not in DB → insert with `role = 'USER'`
- User exists → update `username`, `avatar`
- Returns DB user row

**Removed:** `server/utils/user-session.ts`

---

## 2. API Endpoints

### `POST /api/auth/telegram`
Replaces `login.post.ts`. Accepts Login Widget fields (`id`, `first_name`, `last_name`, `username`, `photo_url`, `auth_date`, `hash`).
1. `verifyWidgetAuth(data)` — throw 401 if invalid
2. `upsertUserFromTelegram(...)` 
3. `setSessionCookie(event, payload)`
4. Return `{ user }`

### `POST /api/auth/telegram-webapp`
New endpoint for Mini App `initData`.
1. `verifyWebAppAuth(initData)` — throw 401 if invalid
2. Parse user from initData
3. `upsertUserFromTelegram(...)`
4. `setSessionCookie(event, payload)`
5. Return `{ user }`

### `GET /api/auth/me`
1. `readSessionUser(event)` — return 401 if null
2. Fetch DB user + subscription state (`hasSubscription`)
3. Return `{ user, hasSubscription }`

### `POST /api/auth/logout`
1. `clearSessionCookie(event)`
2. Return `{ ok: true }`

### `POST /api/auth/bot-login/start`
Unchanged — generates token, returns `t.me/...?start=auth_<token>`.

### `GET /api/auth/bot-login/status`
Refactored — replaces `session.update({ telegramId })` with:
1. `upsertUserFromTelegram(...)` 
2. `setSessionCookie(event, payload)`

---

## 3. Route Middleware

### `app/middleware/auth.ts`
```
Protected routes: /dashboard, /profile (and any /panel/* future routes)
Public routes: /, /login, /materials (listing), /tariffs, /faq
```

Logic:
1. Check `authStore.user` (hydrated by app plugin on first load via `syncMe()`)
2. If no user and route is protected → `navigateTo('/login')`
3. If user exists and route is `/login` → `navigateTo('/dashboard')`

Note: `syncMe()` is called once on app init (plugin), not inside the middleware itself. Middleware only reads store state.

---

## 4. Client-Side Auth Store

**Removed:**
- `restoreFromStorage()` — localStorage no longer used for session
- `localStorage.setItem('cx-user', ...)` — removed from `setUserSession()`
- `cx-user` localStorage key

**Unchanged:**
- `syncMe()` — still calls `GET /api/auth/me`
- `logout()` — now calls `POST /api/auth/logout` then clears local state

**Updated:**
- `login()` (widget flow) → calls `POST /api/auth/telegram`
- `loginFromMiniApp()` → calls `POST /api/auth/telegram-webapp`
- Bot-login flow stays the same (`start` + `status` polling)

---

## 5. Materials Access Control

### DB schema addition (`materials` table)
New field: `access_level: 'public' | 'free' | 'member'`

| Level | Who sees full content |
|---|---|
| `public` | Everyone including guests |
| `free` | Logged-in users (any) |
| `member` | Logged-in users with `hasSubscription = true` |

### `GET /api/materials`
- Guest (no session) → return only `public` materials
- Logged-in, no subscription → all listings, `member` items get `{ locked: true, title, short_description }` only
- Logged-in + subscription → all full content

### `GET /api/materials/[slug]`
1. `readSessionUser(event)` 
2. Fetch material by slug
3. If `access_level === 'member'` and `hasSubscription === false`:
   - Return `{ locked: true, title, short_description, cta: "To'liq kirish uchun obuna oling" }`
4. Otherwise return full material (content, files, links)

---

## 6. Panel CTA

"To'liq kirish" button in `/dashboard` paywall links to:
```
t.me/ChayroomAiBot?start=subscribe
```
Telegram bot receives `/start subscribe` → processes payment → webhook sets `hasSubscription = true` in DB → frontend reflects on next `syncMe()`.

---

## 7. Environment Variables

| Key | Purpose |
|---|---|
| `NUXT_JWT_SECRET` | JWT signing secret (min 32 chars) |
| `NUXT_TELEGRAM_BOT_TOKEN` | Already exists |
| `NUXT_SESSION_PASSWORD` | **Removed** after migration |

---

## 8. Migration Steps (high-level)

1. Add `NUXT_JWT_SECRET` to `.env`
2. Create `jwt.ts`, `verifyTelegramAuth.ts`, `session-cookie.ts`, `upsertUserFromTelegram.ts`
3. Rewrite auth endpoints (`/api/auth/telegram`, `/api/auth/telegram-webapp`, `me`, `logout`, `bot-login/status`)
4. Add `app/middleware/auth.ts`
5. Update auth store (remove localStorage, update login/logout calls)
6. Add `access_level` to materials DB schema + migration
7. Add access control logic to `/api/materials` and `/api/materials/[slug]`
8. Update Panel CTA button URL
9. Remove `server/utils/user-session.ts`
