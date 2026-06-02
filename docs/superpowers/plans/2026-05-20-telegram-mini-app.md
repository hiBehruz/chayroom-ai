# Telegram Mini App Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the Chayroom AI Nuxt app as a Telegram Mini App with auto-login via `initDataUnsafe`, hiding Nav/Footer in Mini App context, and wiring up Telegram's native BackButton.

**Architecture:** A `.client.ts` Nuxt plugin detects `window.Telegram.WebApp`, sets shared `isMiniApp` state via `useState`, and calls `WebApp.ready()` + `WebApp.expand()`. A composable wraps `MainButton`/`BackButton` with safe no-op stubs for non-Mini App contexts. `app.vue` hides Nav/Footer and manages BackButton visibility; `login.vue` auto-logs-in the user from `initDataUnsafe.user`.

**Tech Stack:** Nuxt 4, `@twa-dev/sdk`, Pinia, Vue 3 Composition API, TypeScript, pnpm

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `app/plugins/telegram.client.ts` | Detect Mini App, set `isMiniApp` state, call `ready()` + `expand()` |
| Create | `app/composables/useTelegramApp.ts` | Expose `isMiniApp`, `mainButton`, `backButton` (no-op stubs outside Mini App) |
| Modify | `app/stores/auth.ts` | Add `loginFromMiniApp(tgUser: WebAppUser)` method |
| Modify | `app/pages/login.vue` | Auto-login from `initDataUnsafe.user`; show error when user absent |
| Modify | `app/app.vue` | Extend `showNav` for Mini App; hide `AppFooter`; wire BackButton to `router.back()` |

---

## Task 1: Install `@twa-dev/sdk`

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install the package**

```bash
pnpm add @twa-dev/sdk
```

Expected: terminal prints `+ @twa-dev/sdk x.y.z` with no errors.

- [ ] **Step 2: Verify TypeScript types are available**

```bash
pnpm nuxt typecheck 2>&1 | grep -E '^.*error TS' | head -20
```

Expected: no new TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: install @twa-dev/sdk"
```

---

## Task 2: Create `app/plugins/telegram.client.ts`

**Files:**
- Create: `app/plugins/telegram.client.ts`

This plugin runs client-side only (`.client.ts` suffix ensures Nuxt skips it on SSR). It reads `WebApp.initData` to detect Mini App context, sets the shared `isMiniApp` state, and initializes the SDK.

- [ ] **Step 1: Create the plugin**

```ts
// app/plugins/telegram.client.ts
import WebApp from '@twa-dev/sdk'

export default defineNuxtPlugin(() => {
  const isMiniApp = useState<boolean>('isMiniApp', () => false)

  if (WebApp.initData) {
    isMiniApp.value = true
    WebApp.ready()
    WebApp.expand()
  }
})
```

- [ ] **Step 2: Typecheck**

```bash
pnpm nuxt typecheck 2>&1 | grep -E '^.*error TS' | head -20
```

Expected: no errors related to the new file.

- [ ] **Step 3: Commit**

```bash
git add app/plugins/telegram.client.ts
git commit -m "feat: detect Telegram Mini App context in client plugin"
```

---

## Task 3: Create `app/composables/useTelegramApp.ts`

**Files:**
- Create: `app/composables/useTelegramApp.ts`

The composable is safe to call on any page, during SSR or hydration. `isMiniApp` is `false` during SSR (set only by the client plugin), so all button methods are no-ops server-side and in regular browser context.

Note: `app/composables/` does not yet exist — Nuxt auto-scans it once created.

- [ ] **Step 1: Create the composable**

```ts
// app/composables/useTelegramApp.ts
import type {} from '@twa-dev/sdk'

export function useTelegramApp() {
  const isMiniApp = useState<boolean>('isMiniApp', () => false)

  function wa() {
    return import.meta.client ? window.Telegram?.WebApp : undefined
  }

  return {
    isMiniApp,
    mainButton: {
      show(text: string) {
        if (!isMiniApp.value) return
        const btn = wa()?.MainButton
        if (!btn) return
        btn.setText(text)
        btn.show()
      },
      hide() {
        if (!isMiniApp.value) return
        wa()?.MainButton.hide()
      },
      onClick(fn: () => void) {
        if (!isMiniApp.value) return
        wa()?.MainButton.onClick(fn)
      },
      offClick(fn: () => void) {
        if (!isMiniApp.value) return
        wa()?.MainButton.offClick(fn)
      }
    },
    backButton: {
      show() {
        if (!isMiniApp.value) return
        wa()?.BackButton.show()
      },
      hide() {
        if (!isMiniApp.value) return
        wa()?.BackButton.hide()
      },
      onClick(fn: () => void) {
        if (!isMiniApp.value) return
        wa()?.BackButton.onClick(fn)
      },
      offClick(fn: () => void) {
        if (!isMiniApp.value) return
        wa()?.BackButton.offClick(fn)
      }
    }
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm nuxt typecheck 2>&1 | grep -E '^.*error TS' | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/composables/useTelegramApp.ts
git commit -m "feat: add useTelegramApp composable with MainButton/BackButton wrappers"
```

---

## Task 4: Extend `app/stores/auth.ts` with `loginFromMiniApp()`

**Files:**
- Modify: `app/stores/auth.ts`

Adds a method that maps a Telegram SDK `WebAppUser` object to the existing `TelegramUser` interface and calls `login()`. The `hash: 'twa'` marker distinguishes this login path from widget-based logins.

- [ ] **Step 1: Add the type import at the top of the file**

At the very top of `app/stores/auth.ts` (before the existing `export interface TelegramUser`), add:

```ts
import type { WebAppUser } from '@twa-dev/sdk'
```

- [ ] **Step 2: Add `loginFromMiniApp` inside the store, after `devLogin`**

After the `devLogin` function and before the `return` statement in `useAuthStore`, add:

```ts
  function loginFromMiniApp(tgUser: WebAppUser) {
    login({
      id: tgUser.id,
      telegramId: tgUser.id,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name,
      username: tgUser.username,
      photo_url: tgUser.photo_url,
      hash: 'twa'
    })
  }
```

- [ ] **Step 3: Add `loginFromMiniApp` to the return object**

In the `return` statement of `useAuthStore`, add `loginFromMiniApp` after `login`:

```ts
  return {
    user,
    hasSubscription,
    isOwner,
    agentVariant,
    resolvedAgentVariant,
    displayName,
    initials,
    login,
    loginFromMiniApp,
    activateSubscription,
    setAgentVariant,
    logout,
    restoreFromStorage,
    devLogin
  }
```

- [ ] **Step 4: Typecheck**

```bash
pnpm nuxt typecheck 2>&1 | grep -E '^.*error TS' | head -20
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/stores/auth.ts
git commit -m "feat(auth): add loginFromMiniApp for Telegram Mini App auto-login"
```

---

## Task 5: Update `app/pages/login.vue` for Mini App auto-login

**Files:**
- Modify: `app/pages/login.vue`

When `isMiniApp === true`, the plugin already called `ready()` and `expand()`, so `login.vue` only needs to read `initDataUnsafe.user` and call `loginFromMiniApp`. The existing widget flow is unchanged.

- [ ] **Step 1: Replace the `declare global` block**

The current `declare global` block (lines 3–14) manually declares `Window.Telegram.WebApp` with a narrow shape. Remove it and keep only the `onTelegramAuth` declaration, which the widget still needs.

Replace the entire `declare global` block with:

```ts
declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void
  }
}
```

`@twa-dev/sdk` (installed in Task 1) now provides the full `Window.Telegram.WebApp` type, including `initDataUnsafe`.

- [ ] **Step 2: Add `useTelegramApp` and extend `widgetState` type**

After the existing store/route declarations, add:

```ts
const { isMiniApp } = useTelegramApp()
```

Change the `widgetState` ref to include the new `'mini-app-error'` value:

```ts
const widgetState = ref<'loading' | 'ready' | 'missing-bot' | 'mini-app' | 'mini-app-error'>('loading')
```

- [ ] **Step 3: Update the `onMounted` handler**

Find and replace this block inside `onMounted`:

```ts
  const initData = window.Telegram?.WebApp?.initData
  if (initData) {
    window.Telegram?.WebApp?.ready?.()
    window.Telegram?.WebApp?.expand?.()
    widgetState.value = 'mini-app'
    return
  }
```

Replace with:

```ts
  if (isMiniApp.value) {
    widgetState.value = 'mini-app'
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (tgUser) {
      authStore.loginFromMiniApp(tgUser)
      goAfterLogin()
    } else {
      widgetState.value = 'mini-app-error'
    }
    return
  }
```

- [ ] **Step 4: Update the template Mini App branch**

Find and replace the `v-else-if="widgetState === 'mini-app'"` block:

```html
          <div
            v-else-if="widgetState === 'mini-app'"
            class="rounded-2xl bg-cx-blue-soft px-4 py-3 text-sm leading-relaxed text-cx-blue"
          >
            Telegram Mini App обнаружен. Для входа используется signed init data.
          </div>
```

Replace with:

```html
          <div
            v-else-if="widgetState === 'mini-app'"
            class="rounded-2xl bg-cx-blue-soft px-4 py-3 text-sm leading-relaxed text-cx-blue"
          >
            Kirilmoqda...
          </div>
          <div
            v-else-if="widgetState === 'mini-app-error'"
            class="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-600"
          >
            Telegramni yangilang
          </div>
```

- [ ] **Step 5: Typecheck**

```bash
pnpm nuxt typecheck 2>&1 | grep -E '^.*error TS' | head -20
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/pages/login.vue
git commit -m "feat(login): auto-login from Telegram initDataUnsafe in Mini App context"
```

---

## Task 6: Update `app/app.vue` for Mini App layout and BackButton

**Files:**
- Modify: `app/app.vue`

Three changes: (1) fold `isMiniApp` into the `showNav` computed so the nav animation logic stays correct without touching it; (2) add `v-if="!isMiniApp"` to `<AppFooter>`; (3) wire `BackButton` to `router.back()` and watch `route.path` to show/hide it.

- [ ] **Step 1: Add `useTelegramApp` and `router` to the script**

After the existing `const route = useRoute()` line, add:

```ts
const router = useRouter()
const { isMiniApp, backButton } = useTelegramApp()
```

- [ ] **Step 2: Extend `showNav` to return `false` when in Mini App**

Replace the existing `showNav` computed:

```ts
const showNav = computed(() =>
  ['/', '/dashboard', '/profile'].includes(route.path) || route.path.startsWith('/courses') || route.path.startsWith('/guides') || route.path.startsWith('/login')
)
```

With:

```ts
const showNav = computed(() =>
  !isMiniApp.value && (
    ['/', '/dashboard', '/profile'].includes(route.path) ||
    route.path.startsWith('/courses') ||
    route.path.startsWith('/guides') ||
    route.path.startsWith('/login')
  )
)
```

This keeps the existing animation logic in `onLoaderDone` intact — it already checks `showNav.value`, so when `isMiniApp === true`, `showNav` is `false` and no nav slide animation runs.

- [ ] **Step 3: Add BackButton setup after `authStore.restoreFromStorage()`**

After the `authStore.restoreFromStorage()` call (line 12 in current file), add:

```ts
const handleBack = () => router.back()

onMounted(() => {
  if (!isMiniApp.value) return
  backButton.onClick(handleBack)
})

onUnmounted(() => {
  backButton.offClick(handleBack)
})

watch(() => route.path, () => {
  if (!isMiniApp.value) return
  if (route.path === '/dashboard') {
    backButton.hide()
  } else {
    backButton.show()
  }
}, { immediate: true })
```

- [ ] **Step 4: Update the template to conditionally hide `AppFooter`**

Find `<AppFooter />` in the template and change it to:

```html
      <AppFooter v-if="!isMiniApp" />
```

`<AppNav>` is already guarded by `v-if="showNav"` which now returns `false` when `isMiniApp === true`, so no change needed there.

- [ ] **Step 5: Typecheck**

```bash
pnpm nuxt typecheck 2>&1 | grep -E '^.*error TS' | head -20
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/app.vue
git commit -m "feat(app): hide Nav/Footer and manage BackButton in Telegram Mini App context"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] `isMiniApp` state via `useState('isMiniApp')` — Tasks 2, 3
- [x] `WebApp.ready()` + `WebApp.expand()` in plugin — Task 2
- [x] No Nav in Mini App — Task 6 (`showNav` returns `false`)
- [x] No Footer in Mini App — Task 6 (`v-if="!isMiniApp"`)
- [x] `useTelegramApp` composable with `mainButton`/`backButton` stubs — Task 3
- [x] `loginFromMiniApp()` in auth store with `hash: 'twa'` — Task 4
- [x] Auto-login from `initDataUnsafe.user` in `login.vue` — Task 5
- [x] "Telegramni yangilang" error when user absent — Task 5
- [x] BackButton hidden on `/dashboard`, shown on all other routes — Task 6
- [x] BackButton wired to `router.back()` — Task 6
- [x] No breaking changes to non-Mini App flow — all changes guarded by `isMiniApp.value`

**Non-goals confirmed absent:**
- No `initData` HMAC verification
- No landing page changes
- No HapticFeedback
- No Telegram Stars payments
