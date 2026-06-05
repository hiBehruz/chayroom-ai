# Admin Authorization + Admin Subdomain Design

**Date:** 2026-06-05
**Status:** Draft — pending user review
**Related:** `2026-06-05-self-hosted-vps-deploy-caching-design.md` (this should ship **before** that production deploy)

## Goal

Add real role-based access control for the admin panel: only designated Telegram accounts can reach `admin.chayroom.uz` and create/edit courses & guides, identity is cryptographically verified, and admins also get full content access (paywall bypass).

## Context — current state (inspected)

- **`role` already exists** in the schema: `userRoleEnum = pgEnum('user_role', ['USER','ADMIN'])`, `users.role` default `'USER'`. It is currently **unused** for access control.
- **Admin API endpoints are completely unprotected.** `courses` POST/PATCH, `guides` POST/PATCH/DELETE, `upload/*`, `translate` have no auth check — anyone can call them.
- **Identity is forgeable.** Login (`auth/login.post.ts`) does **not** verify the Telegram payload, and `auth/me.get.ts` trusts an unsigned `cx-user` cookie (`{telegramId}`). Anyone can set that cookie to any id.
- **Login mechanism in place:** web uses the **Telegram Login Widget** (`telegram-widget.js`, `onTelegramAuth(user)`); Mini App uses `Telegram.WebApp.initDataUnsafe.user`. The widget payload includes a `hash` that can be verified server-side with the bot token.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Admin panel location | Separate subdomain `admin.chayroom.uz` |
| Admin designation | `ADMIN_TELEGRAM_IDS` env (numeric Telegram IDs) |
| Admin login | Telegram Login Widget + **server-side hash verification** |
| Session | h3 sealed `useSession` (HttpOnly, signed), cookie scoped to `.chayroom.uz` |
| Admin content access | `role === 'ADMIN'` ⇒ `hasSubscription = true` (paywall bypass) |

## Architecture

```
admin.chayroom.uz  (DNS A → 72.62.3.239, Caddy auto-HTTPS) ─┐
chayroom.uz        (DNS A → 72.62.3.239, Caddy auto-HTTPS) ─┴─→ same Nuxt app

Admin login (admin.chayroom.uz/admin/login)
  → Telegram Login Widget → POST /api/admin/login
      → verify hash (HMAC-SHA256, secret = SHA256(bot_token))
      → telegramId ∈ ADMIN_TELEGRAM_IDS ?  → yes: set role=ADMIN in DB, open sealed session
                                            → no:  403
Every admin action
  → requireAdmin(event): read sealed session → load user → role==='ADMIN' ? else 403
```

Access is enforced by middleware + server guard, **not by hostname** — the subdomain is an organizational/login host; the `.chayroom.uz`-scoped session cookie is shared across both hosts.

## Components

### 1. Telegram hash verification — `server/utils/telegram-auth.ts` (new)
- `verifyTelegramLoginPayload(payload, botToken): boolean`
- Algorithm (Telegram Login Widget): build `data_check_string` from all fields except `hash`, sorted by key, joined `key=value` with `\n`; `secret_key = SHA256(bot_token)`; `computed = HMAC_SHA256(data_check_string, secret_key)`; constant-time compare to `payload.hash`. Reject if `auth_date` older than e.g. 24h.
- Exact field handling confirmed against Telegram docs during implementation.

### 2. Admin session + guard
- **Session:** h3 `useSession(event, { password: config.adminSessionPassword, name: 'cx-admin', cookie: { domain: '.chayroom.uz', httpOnly: true, secure: true, sameSite: 'lax' } })`. `ADMIN_SESSION_PASSWORD` ≥ 32 chars.
- **`server/utils/require-admin.ts` (new):** `requireAdmin(event)` → read sealed session → if no `telegramId`, 401 → load user → if `role !== 'ADMIN'`, 403 → return user. Throws `createError` otherwise.

### 3. Admin auth endpoints (new)
- `server/api/admin/login.post.ts`: read widget payload → `verifyTelegramLoginPayload` (else 401) → `String(id) ∈ ADMIN_TELEGRAM_IDS` (else 403) → upsert user + set `role='ADMIN'` (pin to immutable id) → open sealed session with `{ telegramId }` → return `{ ok: true }`.
- `server/api/admin/logout.post.ts`: clear the sealed session.
- `server/api/admin/me.get.ts`: return `{ admin: true, user }` from the sealed session, or `{ admin: false }`.

### 4. Protect mutation endpoints (add `await requireAdmin(event)` as first line)
- `server/api/courses/index.post.ts`
- `server/api/courses/[slug].patch.ts`
- `server/api/guides/index.post.ts`
- `server/api/guides/[slug].patch.ts`
- `server/api/guides/[slug].delete.ts`
- `server/api/upload/image.post.ts`
- `server/api/upload/presign.post.ts`
- `server/api/translate.post.ts`

### 5. Role in main auth + paywall bypass
- `server/api/auth/me.get.ts`: include `role: user.role` in the returned `user`; compute `hasSubscription = user.role === 'ADMIN' ? true : (existing logic)`.
- `server/api/auth/login.post.ts`: same `hasSubscription` bypass for `role === 'ADMIN'`. (No fake subscription rows.)
- Verify no other server path gates paid content; from inspection, content GETs don't check subscription server-side (client gates via `hasSubscription`), so the bypass above is sufficient.

### 6. Frontend
- `app/middleware/admin.ts` (new): after auth, if `authStore.user?.role !== 'ADMIN'` → redirect to `/` (or `/admin/login`).
- Apply `admin` middleware to `app/pages/admin/**` (`definePageMeta({ middleware: ['auth','admin'] })`).
- `app/pages/admin/login.vue` (new): Telegram Login Widget → `POST /api/admin/login` → on success go to `/admin`.
- Auth store / `me` consumer: surface `role` so admin UI and the paywall bypass work.

### 7. Config / env
- `nuxt.config.ts` `runtimeConfig`: add `adminTelegramIds: ''`, `adminSessionPassword: ''` (private).
- Env: `NUXT_ADMIN_TELEGRAM_IDS` (comma-separated numeric ids), `NUXT_ADMIN_SESSION_PASSWORD` (≥32 chars random).

### 8. Infra (deploy-time)
- **DNS:** `admin.chayroom.uz` A → `72.62.3.239`.
- **Caddy:** add an `admin.chayroom.uz` site block (auto-HTTPS) reverse-proxying the same `nuxt:3000`. (Can share config with the apex block.)
- **BotFather:** the Telegram Login Widget domain must be authorized via `/setdomain`. Set to `chayroom.uz`; the widget runs on a `chayroom.uz`-family page and the sealed session cookie (`.chayroom.uz`) is read on `admin.chayroom.uz`. Exact widget/subdomain behavior verified against Telegram docs during implementation.

## Security notes / out of scope
- **Main-app cookie hardening (separate follow-up):** the regular `cx-user` cookie remains unsigned/forgeable. Admin security does **not** depend on it (admin uses the sealed session). Hardening the main app login (verify Telegram hash, sealed session for all users) is recommended but **out of scope** for this spec.
- Numeric Telegram IDs are immutable and non-reclaimable — chosen over usernames for that reason.

## Success Criteria
- A non-admin (or anonymous) request to any mutation endpoint returns 401/403; an admin's succeeds.
- `admin.chayroom.uz` requires Telegram login; only `ADMIN_TELEGRAM_IDS` accounts pass; the session cookie is signed/HttpOnly and forging it fails.
- `/admin/**` pages are inaccessible to non-admins (redirected); accessible to admins.
- An admin account has `hasSubscription === true` and full access to all paywalled content without a subscription row.
- `auth/me` returns `role`; the frontend can distinguish admins.
