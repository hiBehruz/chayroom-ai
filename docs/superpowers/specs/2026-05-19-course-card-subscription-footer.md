# Course Card Subscription Footer

**Date:** 2026-05-19  
**Scope:** `app/pages/courses/index.vue`

## Problem

Course cards currently show a generic "Kursni ko'rish" button that always navigates to the course detail page. There is no subscription awareness on the cards listing page.

## Design

### State management

Add to `courses/index.vue` script:
```ts
const hasSubscription = ref(false)
const isAccessModalOpen = ref(false)
```

Add `progress: 0` field to each course object in the `courses` array.

### Card click behavior

Replace the `<NuxtLink>` wrapper or "Kursni ko'rish" button with a `<div>` that has:
- `@click` → if `!hasSubscription`: open `isAccessModalOpen = true`; if `hasSubscription`: `navigateTo('/courses/' + course.slug)`
- `cursor-pointer` styling

### Conditional footer (replaces "Kursni ko'rish" button)

**Unsubscribed (`!hasSubscription`):**
- Label: "1 oylik tarifi" (small muted uppercase)
- Stats row: Modullar `N` · Darslar `N` · `duration`
- Button: "Kirish huquqini olish →" (btn-primary, full width) — clicking also opens modal

**Subscribed (`hasSubscription`):**
- Label: "Ваш прогресс" + percentage on right
- Progress bar (bg-cx-blue, height 1.5, rounded)
- Subtext: "0 из N уроков"
- Button: "Начать обучение →" (btn-primary, full width) — NuxtLink to `/courses/${course.slug}`

### AccessModal

Add `<AppAccessModal v-model="isAccessModalOpen" />` at the bottom of the template (already exists in other pages).

## Files changed

- `app/pages/courses/index.vue` — only file modified
