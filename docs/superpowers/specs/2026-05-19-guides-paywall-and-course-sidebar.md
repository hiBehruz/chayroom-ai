# Guides Paywall & Course Sidebar Design

**Date:** 2026-05-19
**Scope:** `app/pages/guides.vue` → `guides/index.vue`, new `app/pages/guides/[slug].vue`, `app/pages/courses/[slug].vue` sidebar

## Overview

Three connected changes:
1. Guide cards: badge reflects subscription state; cards become NuxtLinks to detail pages
2. Guide detail page: full page with paywall for non-subscribers, full content for subscribers
3. Course detail sidebar: replace "Chayroom AI Club" CTA with subscription-aware block

---

## Part 1: Guides Index (`app/pages/guides/index.vue`)

Rename `app/pages/guides.vue` → `app/pages/guides/index.vue` (no content change except below).

### Guide data changes

Add `slug` field to each guide object. Keep all existing fields.

Example:
```ts
{
  slug: 'claude-code-token-limit',
  title: "Claude Code'da tokenlarni birdan tugatib qo'ymaslik",
  // ... rest of existing fields
}
```

Full slug list:
- `'claude-code-token-limit'`
- `'codex-beginners'`
- `'claude-chatgpt-registration'`
- `'youtube-research-ai-agent'`
- `'vibe-coding-guide'`
- `'claude-beginners'`

### Card changes

1. Add `useAuthStore()` and `hasSubscription = computed(() => authStore.hasSubscription)`
2. Outer card `<div>` → `<NuxtLink :to="'/guides/' + guide.slug">` (keep all existing classes)
3. Remove `<button>Qo'llanmani o'qish</button>`
4. Replace badge block (currently shows "Bepul" or "Obuna orqali") with three-state logic:

```html
<!-- free -->
<span v-if="guide.free" class="flex items-center gap-1 text-[12px] font-medium text-green-600">
  <UIcon name="i-lucide-lock-keyhole-open" class="size-4" />
  Bepul
</span>
<!-- paid + subscribed -->
<span v-else-if="hasSubscription" class="flex items-center gap-1 text-[12px] font-medium text-green-600">
  <UIcon name="i-lucide-lock-keyhole-open" class="size-4" />
  Доступно по подписке
</span>
<!-- paid + not subscribed -->
<span v-else class="flex items-center gap-1 text-[12px] font-medium text-red-500">
  <UIcon name="i-lucide-lock-keyhole" class="size-4" />
  По подписке
</span>
```

---

## Part 2: Guide Detail Page (`app/pages/guides/[slug].vue`)

New file. Guide data is duplicated from `guides/index.vue` (both files are self-contained — no shared composable needed at this stage).

### Data

Each guide has all existing fields + `slug` + `content: string` (full HTML/text content for subscribed view).

### Layout

- Breadcrumb: Bosh sahifa / Qo'llanmalar / guide.title
- Tags row: badge chips (same style as cards) + access badge ("По подписке" or "Bepul")
- `<h1>` title
- Description paragraph

**Paywall block** (shown when `!guide.free && !hasSubscription`):
```
┌──────────────────────────────────────┐
│  🔒 (icon, centered, gray circle bg) │
│                                      │
│  Гайд доступен по подписке           │
│  Оформите подписку AI Room Club,     │
│  чтобы получить доступ к этому       │
│  и другим материалам                 │
│                                      │
│  [Оформить подписку]  ← btn-primary  │
│  Уже есть подписка? Войти  ← link    │
└──────────────────────────────────────┘
```
- "Оформить подписку" → opens `isAccessModalOpen = true` (AppAccessModal)
- "Войти" → NuxtLink to `/login`
- `<AppAccessModal v-model="isAccessModalOpen" />` mounted at template bottom

**Content block** (shown when `guide.free || hasSubscription`):
- Renders `guide.content` as `v-html` in a styled prose wrapper

### Error handling

If no guide found for slug → `createError({ statusCode: 404 })`

---

## Part 3: Course Detail Sidebar (`app/pages/courses/[slug].vue`)

The existing CTA card (`v-if="!hasSubscription"`) is replaced with a two-state block.

**Not subscribed — 1 oylik tarifi:**
```html
<div v-if="!hasSubscription" class="rounded-2xl border border-cx-line bg-white p-6 shadow-lift">
  <div class="text-[10px] font-bold text-cx-muted uppercase tracking-widest mb-1">1 oylik tarifi</div>
  <div class="text-[15px] font-bold text-cx-ink mb-4">Chayroom AI Club</div>
  <button class="btn-primary w-full text-[14px]! py-3! mb-5" @click="isAccessModalOpen = true">
    Kirish huquqini olish
  </button>
  <div class="text-[11px] font-bold text-cx-muted uppercase tracking-wide mb-3">Nima kiradi:</div>
  <ul class="flex flex-col gap-2.5">
    <!-- same 5 items as before -->
  </ul>
</div>
```

**Subscribed — Ваш прогресс:**
```html
<div v-else class="rounded-2xl border border-cx-line bg-[#f8f8fa] p-5">
  <div class="flex items-center justify-between mb-3">
    <span class="text-[13px] font-bold text-cx-ink">Ваш прогресс</span>
    <span class="text-[13px] font-bold text-cx-ink">0%</span>
  </div>
  <div class="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden mb-2">
    <div class="h-full bg-cx-blue rounded-full" style="width: 0%" />
  </div>
  <div class="text-[12px] text-cx-muted mb-4">0 из {{ course.lessons }} уроков</div>
  <NuxtLink
    :to="'/courses/' + course.slug + '/lesson/1'"
    class="btn-primary w-full text-[14px]! py-3! flex items-center justify-center gap-2"
  >
    <span>Начать обучение</span>
    <span class="btn-arrow">→</span>
  </NuxtLink>
</div>
```

Note: `course.slug` needs to be added to the `allCourses` data in `courses/[slug].vue` (currently missing).

---

## Files Changed

| File | Action |
|---|---|
| `app/pages/guides.vue` | Delete (renamed) |
| `app/pages/guides/index.vue` | Create (content from guides.vue + Part 1 changes) |
| `app/pages/guides/[slug].vue` | Create (new) |
| `app/pages/courses/[slug].vue` | Modify sidebar only |
