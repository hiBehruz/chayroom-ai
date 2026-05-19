# Subscription State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `hasSubscription` state through the auth store so that visiting `/profile` unlocks courses and activates the dashboard for the logged-in user.

**Architecture:** Add `hasSubscription` ref and `activateSubscription()` to the auth store with cookie persistence. Profile page calls `activateSubscription()` on mount. Dashboard and courses pages replace their local `ref(false)` with a computed reading from the store.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, Pinia (`defineStore`), `useCookie`

---

### Task 1: Add subscription state to auth store

**Files:**
- Modify: `app/stores/auth.ts`

Current `app/stores/auth.ts` full content for reference:
```ts
export interface TelegramUser {
  id: number
  telegramId?: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  hash: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<TelegramUser | null>(null)
  const isRestored = ref(false)
  const userCookie = useCookie<TelegramUser | null>('cx-user', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })

  const displayName = computed(() => {
    if (!user.value) return ''
    return [user.value.first_name, user.value.last_name].filter(Boolean).join(' ')
  })

  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
  })

  function login(telegramUser: TelegramUser) {
    user.value = {
      ...telegramUser,
      telegramId: telegramUser.telegramId ?? telegramUser.id
    }
    userCookie.value = user.value
    if (import.meta.client) {
      localStorage.setItem('cx-user', JSON.stringify(user.value))
    }
  }

  function logout() {
    user.value = null
    userCookie.value = null
    if (import.meta.client) {
      localStorage.removeItem('cx-user')
    }
  }

  function restoreFromStorage() {
    if (isRestored.value) return
    isRestored.value = true
    if (userCookie.value) {
      user.value = {
        ...userCookie.value,
        telegramId: userCookie.value.telegramId ?? userCookie.value.id
      }
      return
    }

    if (!import.meta.client) return

    const stored = localStorage.getItem('cx-user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TelegramUser
        user.value = {
          ...parsed,
          telegramId: parsed.telegramId ?? parsed.id
        }
        userCookie.value = user.value
      } catch { localStorage.removeItem('cx-user') }
    }
  }

  function devLogin() {
    if (!import.meta.dev) return
    login({
      id: 123456789,
      first_name: 'Behruz',
      last_name: 'Zaripov',
      username: 'behruzz',
      photo_url: '',
      hash: 'dev'
    })
  }

  return { user, displayName, initials, login, logout, restoreFromStorage, devLogin }
})
```

- [ ] **Step 1: Replace the entire file with the updated version**

Write `app/stores/auth.ts` with these changes:
- Add `hasSubscription` ref and `subCookie` after `userCookie`
- Add `activateSubscription()` function
- Update `logout()` to clear subscription
- Update `restoreFromStorage()` to restore subscription from cookie
- Export `hasSubscription` and `activateSubscription`

Full updated file:

```ts
export interface TelegramUser {
  id: number
  telegramId?: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  hash: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<TelegramUser | null>(null)
  const isRestored = ref(false)
  const userCookie = useCookie<TelegramUser | null>('cx-user', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })
  const hasSubscription = ref(false)
  const subCookie = useCookie<boolean>('cx-sub', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })

  const displayName = computed(() => {
    if (!user.value) return ''
    return [user.value.first_name, user.value.last_name].filter(Boolean).join(' ')
  })

  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
  })

  function login(telegramUser: TelegramUser) {
    user.value = {
      ...telegramUser,
      telegramId: telegramUser.telegramId ?? telegramUser.id
    }
    userCookie.value = user.value
    if (import.meta.client) {
      localStorage.setItem('cx-user', JSON.stringify(user.value))
    }
  }

  function activateSubscription() {
    hasSubscription.value = true
    subCookie.value = true
  }

  function logout() {
    user.value = null
    userCookie.value = null
    hasSubscription.value = false
    subCookie.value = false
    if (import.meta.client) {
      localStorage.removeItem('cx-user')
    }
  }

  function restoreFromStorage() {
    if (isRestored.value) return
    isRestored.value = true

    if (subCookie.value) {
      hasSubscription.value = true
    }

    if (userCookie.value) {
      user.value = {
        ...userCookie.value,
        telegramId: userCookie.value.telegramId ?? userCookie.value.id
      }
      return
    }

    if (!import.meta.client) return

    const stored = localStorage.getItem('cx-user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TelegramUser
        user.value = {
          ...parsed,
          telegramId: parsed.telegramId ?? parsed.id
        }
        userCookie.value = user.value
      } catch { localStorage.removeItem('cx-user') }
    }
  }

  function devLogin() {
    if (!import.meta.dev) return
    login({
      id: 123456789,
      first_name: 'Behruz',
      last_name: 'Zaripov',
      username: 'behruzz',
      photo_url: '',
      hash: 'dev'
    })
  }

  return { user, hasSubscription, displayName, initials, login, activateSubscription, logout, restoreFromStorage, devLogin }
})
```

- [ ] **Step 2: Commit**

```bash
git add app/stores/auth.ts
git commit -m "feat: add hasSubscription state and activateSubscription to auth store"
```

---

### Task 2: Activate subscription on profile mount

**Files:**
- Modify: `app/pages/profile.vue`

- [ ] **Step 1: Add `onMounted` call to profile script**

In `app/pages/profile.vue`, the current `<script setup>` block is:

```ts
const authStore = useAuthStore()

authStore.restoreFromStorage()

const user = computed(() => authStore.user)
const displayName = computed(() => authStore.displayName || user.value?.first_name || 'Behruz Zaripov')
const username = computed(() => user.value?.username || 'hellobehruz')

function logout() {
  authStore.logout()
  navigateTo('/')
}

useSeoMeta({ title: 'Profil — Chayroom AI' })
```

Replace with:

```ts
const authStore = useAuthStore()

authStore.restoreFromStorage()

const user = computed(() => authStore.user)
const displayName = computed(() => authStore.displayName || user.value?.first_name || 'Behruz Zaripov')
const username = computed(() => user.value?.username || 'hellobehruz')

onMounted(() => {
  authStore.activateSubscription()
})

function logout() {
  authStore.logout()
  navigateTo('/')
}

useSeoMeta({ title: 'Profil — Chayroom AI' })
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/profile.vue
git commit -m "feat: activate subscription when user visits profile page"
```

---

### Task 3: Use store subscription state in dashboard

**Files:**
- Modify: `app/pages/dashboard.vue`

- [ ] **Step 1: Replace local `hasSubscription` ref with store computed**

In `app/pages/dashboard.vue`, find and replace these two lines:

```ts
const hasSubscription = ref(false)
const isAccessModalOpen = ref(false)
```

With:

```ts
const hasSubscription = computed(() => authStore.hasSubscription)
const isAccessModalOpen = ref(false)
```

Also ensure `useAuthStore()` is called at the top — it already is (`const authStore = useAuthStore()`), so no change needed there.

- [ ] **Step 2: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat: read hasSubscription from auth store in dashboard"
```

---

### Task 4: Use store subscription state in courses index

**Files:**
- Modify: `app/pages/courses/index.vue`

- [ ] **Step 1: Add auth store and replace local `hasSubscription` ref**

In `app/pages/courses/index.vue`, the script currently starts with:

```ts
const categories = ['Hammasi', 'Vibe coding', 'AI agentlar', 'Neyrotarmoqlar', 'Kontent']
const activeCategory = ref('Hammasi')
const hasSubscription = ref(false)
const isAccessModalOpen = ref(false)
```

Replace with:

```ts
const authStore = useAuthStore()
const categories = ['Hammasi', 'Vibe coding', 'AI agentlar', 'Neyrotarmoqlar', 'Kontent']
const activeCategory = ref('Hammasi')
const hasSubscription = computed(() => authStore.hasSubscription)
const isAccessModalOpen = ref(false)
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/courses/index.vue
git commit -m "feat: read hasSubscription from auth store in courses index"
```

---

### Task 5: Manual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify unsubscribed state**

Navigate to `http://localhost:3000/courses`

Expected:
- Course cards show "1 oylik tarifi" footer
- Clicking a card opens AccessModal

Navigate to `http://localhost:3000/dashboard`

Expected:
- Paywall CTA banner visible at top
- Dashboard content greyed out (`opacity-40 grayscale pointer-events-none`)

- [ ] **Step 3: Login and activate subscription**

Click the "Dev login (mock)" button on `http://localhost:3000/login`

Navigate to `http://localhost:3000/profile`

Expected:
- Profile page loads showing subscription as "Активна"

- [ ] **Step 4: Verify subscribed state**

Navigate to `http://localhost:3000/courses`

Expected:
- Course cards show "Ваш прогресс 0% · 0 из N уроков · Начать обучение" footer
- Clicking a card navigates to `/courses/[slug]`

Navigate to `http://localhost:3000/dashboard`

Expected:
- Paywall CTA banner is gone
- Dashboard content is fully visible (no grayscale)

- [ ] **Step 5: Verify persistence**

Hard refresh the browser (`Cmd+Shift+R`)

Navigate to `http://localhost:3000/courses` and `http://localhost:3000/dashboard`

Expected: subscribed state persists (cookie `cx-sub` is set)

- [ ] **Step 6: Verify logout clears subscription**

Navigate to `http://localhost:3000/profile` and click "Выйти"

Navigate to `http://localhost:3000/courses`

Expected: course cards show locked state again ("1 oylik tarifi" footer)

- [ ] **Step 7: Commit (if any fixes were needed)**

```bash
git add -p
git commit -m "fix: subscription state verification fixes"
```
