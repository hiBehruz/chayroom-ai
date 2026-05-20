# Telegram Mini App Integration — Design Spec

**Date:** 2026-05-20  
**Status:** Approved

## Overview

Integrate the existing Chayroom AI Nuxt app as a Telegram Mini App. The app is opened via bot inline buttons. Only dashboard and course pages are shown inside the Mini App. Auth happens automatically via `initDataUnsafe` — no Telegram Login Widget needed inside Mini App context.

## Goals

- Auto-login from Telegram `initDataUnsafe.user` when opened as Mini App
- Dashboard and course pages render in a Mini App-specific layout (no Nav/Footer)
- `MainButton` and `BackButton` native Telegram UI elements wired up via composable
- No breaking changes to the existing web (non-Mini App) flow

## Non-Goals

- Server-side `initData` signature validation (out of scope for this iteration)
- Landing page inside Mini App
- HapticFeedback integration
- Payments via Telegram Stars

## Tech Stack Addition

- **`@twa-dev/sdk`** — TypeScript wrapper for `window.Telegram.WebApp`

## Architecture

### New Files

#### `app/plugins/telegram.client.ts`
Runs client-side on every page load. Checks `window.Telegram?.WebApp?.initData`:
- If present: sets `isMiniApp = true` in a Nuxt useState, calls `WebApp.ready()` and `WebApp.expand()`
- If absent: `isMiniApp = false`, no-op

#### `app/composables/useTelegramApp.ts`
Exposes:
- `isMiniApp: ComputedRef<boolean>`
- `mainButton: { show(text: string), hide(), onClick(fn), offClick(fn) }`
- `backButton: { show(), hide(), onClick(fn), offClick(fn) }`

Internally wraps `WebApp.MainButton` and `WebApp.BackButton` from `@twa-dev/sdk`. Returns no-op stubs when `isMiniApp === false` so the composable is safe to use on all pages.

#### `app/layouts/mini-app.vue`
- Renders `<NuxtPage />` with no `<AppNav>` or `<AppFooter>`
- On mount: shows `backButton` and wires it to `router.back()`
- On route change to `/dashboard`: hides `backButton` (root of Mini App, no back)
- On route change to anything else: shows `backButton`

### Modified Files

#### `app/stores/auth.ts`
Adds `loginFromMiniApp(tgUser: WebAppUser)` method:
- Maps `WebAppUser` (from `@twa-dev/sdk`) to existing `TelegramUser` interface
- Sets `hash: 'twa'` as a marker (distinguishes from widget-based login)
- Calls existing `login()` internally

#### `app/pages/login.vue`
Existing `widgetState === 'mini-app'` branch extended:
- Reads `window.Telegram.WebApp.initDataUnsafe.user`
- If user present: calls `authStore.loginFromMiniApp(user)` then navigates to dashboard/redirect
- If user absent (old Telegram client): shows error message "Telegramni yangilang"

#### `app/pages/dashboard.vue`
Adds `definePageMeta({ layout: 'mini-app' })` — but only when in Mini App context. Since `definePageMeta` is static, we use a conditional layout approach: the `mini-app.vue` layout checks `isMiniApp` and falls back to default nav if not in Mini App.

**Alternative (simpler):** `app/app.vue` checks `isMiniApp` and conditionally renders `<AppNav>` and `<AppFooter>`. This avoids needing a separate layout file.

> **Decision:** Use the `app.vue` conditional approach — fewer files, same result.

## Revised Architecture (simplified)

Instead of a new layout, `app/app.vue` conditionally hides Nav/Footer when `isMiniApp === true`:

```
app/
  plugins/telegram.client.ts     ← NEW
  composables/useTelegramApp.ts  ← NEW
  stores/auth.ts                 ← EXTEND: loginFromMiniApp()
  pages/login.vue                ← MODIFY: auto-login branch
  app.vue                        ← MODIFY: hide Nav/Footer when isMiniApp
```

## Auth Flow

```
Bot sends inline button → user taps → Mini App opens at /dashboard
↓
telegram.client.ts plugin fires
  window.Telegram.WebApp exists → isMiniApp = true
  WebApp.ready() + WebApp.expand()
↓
app.vue hides Nav, Footer
BackButton shown, wired to router.back()
↓
auth middleware fires → user not logged in → redirect to /login?redirect=/dashboard
↓
login.vue mounts
  isMiniApp === true → read initDataUnsafe.user
  user present → loginFromMiniApp(user) → navigate to /dashboard
  user absent → show "Telegramni yangilang" error
↓
dashboard renders, BackButton hidden (root page)
```

## MainButton Usage Pattern

Pages that need MainButton import `useTelegramApp()` and call:
```ts
const { mainButton } = useTelegramApp()
onMounted(() => mainButton.show('Kursni boshlash'))
onUnmounted(() => mainButton.hide())
```

No global MainButton state — each page manages its own.

## BackButton Logic

- `/dashboard` — hidden (no back from root)
- All other pages — shown, calls `router.back()`
- Managed in `app.vue` via `watch(route, ...)` when `isMiniApp === true`

## Data Mapping

`WebAppUser` (from `@twa-dev/sdk`) → `TelegramUser` (existing interface):

| WebAppUser field | TelegramUser field |
|---|---|
| `id` | `id` + `telegramId` |
| `first_name` | `first_name` |
| `last_name` | `last_name` |
| `username` | `username` |
| `photo_url` | `photo_url` |
| — | `hash: 'twa'` (marker) |

## Out of Scope

- `initData` HMAC verification on the server — the `hash: 'twa'` marker signals this login bypassed verification; can be addressed later with a server API route
- Telegram theme variables (`--tg-theme-bg-color`, etc.) applied to Tailwind tokens
