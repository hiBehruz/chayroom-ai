# Subscription State Design

**Date:** 2026-05-19  
**Scope:** `app/stores/auth.ts`, `app/pages/profile.vue`, `app/pages/dashboard.vue`, `app/pages/courses/index.vue`

## Problem

`hasSubscription` is hardcoded as `ref(false)` locally in `dashboard.vue` and `courses/index.vue`. After login, courses remain locked and dashboard content stays greyed out regardless of the user's subscription status.

## Design

### Auth Store (`app/stores/auth.ts`)

Add subscription state alongside existing auth state:

```ts
const hasSubscription = ref(false)
const subCookie = useCookie<boolean>('cx-sub', { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })

function activateSubscription() {
  hasSubscription.value = true
  subCookie.value = true
}
```

Update `logout()` to clear subscription:
```ts
hasSubscription.value = false
subCookie.value = false
```

Update `restoreFromStorage()` to restore subscription:
```ts
if (subCookie.value) hasSubscription.value = true
```

Export `hasSubscription` and `activateSubscription` from the store.

### Profile Page (`app/pages/profile.vue`)

Call `activateSubscription()` on mount — profile page shows subscription as "Активна", so visiting it means the user has an active subscription:

```ts
onMounted(() => {
  authStore.activateSubscription()
})
```

### Dashboard (`app/pages/dashboard.vue`)

Replace local `const hasSubscription = ref(false)` with a computed from the store:

```ts
const hasSubscription = computed(() => authStore.hasSubscription)
```

### Courses Index (`app/pages/courses/index.vue`)

Replace local `const hasSubscription = ref(false)` with a computed from the store:

```ts
const hasSubscription = computed(() => authStore.hasSubscription)
```

## User Flow

1. User logs in (Telegram or devLogin) → redirected to `/dashboard`
2. User navigates to `/profile` → `activateSubscription()` called on mount
3. `hasSubscription = true` persisted in `cx-sub` cookie
4. User navigates to `/courses` → cards show progress footer (subscribed state)
5. User navigates to `/dashboard` → content is active (no grayscale/pointer-events-none)
6. On next page load, `restoreFromStorage()` restores both user and subscription from cookies
7. On logout, both user and subscription state cleared

## Notes

- Subscription is separate from login: login alone does not activate subscription
- `cx-sub` cookie has 30-day expiry matching `cx-user` cookie
- Future: `activateSubscription()` will be called after backend confirms active subscription instead of on profile mount
