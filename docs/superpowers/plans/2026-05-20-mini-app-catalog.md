# Mini-App Catalog Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/catalog` route to the Telegram mini-app showing 6 content-format category cards in a 2×3 dark-themed grid, matching the existing `MiniAppDashboard` style.

**Architecture:** New `MiniAppCatalog.vue` component (mirrors `MiniAppDashboard.vue` structure) rendered by a thin `catalog.vue` page. Bottom nav in `MiniAppDashboard.vue` updated to point `/courses` → `/catalog`. No API calls — counts are static.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS v4, `@nuxt/ui` (UIcon / Lucide icons), inline styles for brand colors (project convention).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/pages/catalog.vue` | Thin route wrapper — renders `<MiniAppCatalog />` |
| Create | `app/components/MiniAppCatalog.vue` | Full catalog page: header, 2×3 grid, bottom nav |
| Modify | `app/components/MiniAppDashboard.vue:204` | Change `to="/courses"` → `to="/catalog"` on Каталог nav link |

---

### Task 1: Create `app/pages/catalog.vue`

**Files:**
- Create: `app/pages/catalog.vue`

- [ ] **Step 1: Create the page file**

```vue
<script setup lang="ts">
useSeoMeta({ title: 'Каталог — Chayroom AI' })
</script>

<template>
  <MiniAppCatalog />
</template>
```

- [ ] **Step 2: Verify the route exists**

Run the dev server (`pnpm dev`) and navigate to `http://localhost:3000/catalog`. You should see a blank page (no 404) — `MiniAppCatalog` doesn't exist yet so it will be empty or warn in console. That's expected.

- [ ] **Step 3: Commit**

```bash
git add app/pages/catalog.vue
git commit -m "feat(mini-app): add /catalog route"
```

---

### Task 2: Create `app/components/MiniAppCatalog.vue`

**Files:**
- Create: `app/components/MiniAppCatalog.vue`

- [ ] **Step 1: Write the component**

```vue
<script setup lang="ts">
const categories = [
  {
    id: 'guides',
    name: 'Гайды',
    icon: 'i-lucide-book-open',
    count: '13 материалов',
    soon: false,
    to: '/guides',
  },
  {
    id: 'courses',
    name: 'Курсы',
    icon: 'i-lucide-graduation-cap',
    count: '2 материала',
    soon: false,
    to: '/courses',
  },
  {
    id: 'skills',
    name: 'Скиллы',
    icon: 'i-lucide-sparkles',
    count: null,
    soon: true,
    to: null,
  },
  {
    id: 'usecases',
    name: 'Юзкейсы',
    icon: 'i-lucide-briefcase',
    count: null,
    soon: true,
    to: null,
  },
  {
    id: 'streams',
    name: 'Эфиры',
    icon: 'i-lucide-video',
    count: null,
    soon: true,
    to: null,
  },
  {
    id: 'workshops',
    name: 'Воркшопы',
    icon: 'i-lucide-users',
    count: null,
    soon: true,
    to: null,
  },
]
</script>

<template>
  <div class="flex justify-center items-start" style="background:#17212b; min-height:100vh">
    <div
      class="w-full relative overflow-x-hidden text-white"
      style="background:#17212b; max-width:390px; min-height:100vh; padding-bottom:80px"
    >
      <!-- Header -->
      <div class="px-4 pt-7 pb-6">
        <h1 class="text-[26px] font-black tracking-tight leading-tight text-white">Каталог</h1>
        <p class="text-[14px] mt-1" style="color:#708499">Форматы материалов на платформе.</p>
      </div>

      <!-- Category grid -->
      <div class="grid grid-cols-2 gap-3 px-4">
        <component
          :is="cat.to ? 'NuxtLink' : 'div'"
          v-for="cat in categories"
          :key="cat.id"
          v-bind="cat.to ? { to: cat.to } : {}"
          class="relative flex flex-col justify-between rounded-[20px] p-4"
          :class="cat.to ? 'active:opacity-75 transition-opacity' : ''"
          style="background:#232e3c; border:1px solid #2b3a4a; min-height:148px"
        >
          <!-- СКОРО badge -->
          <span
            v-if="cat.soon"
            class="absolute top-3 right-3 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
            style="color:#f0b429; background:rgba(240,180,41,0.15)"
          >СКОРО</span>

          <!-- Icon -->
          <div
            class="flex items-center justify-center rounded-[14px]"
            style="width:48px; height:48px; background:#1e2d3d"
          >
            <UIcon :name="cat.icon" class="size-[22px]" style="color:#5288c1" />
          </div>

          <!-- Label -->
          <div>
            <p class="text-[15px] font-bold text-white leading-snug">{{ cat.name }}</p>
            <p v-if="cat.count" class="text-[12px] font-medium mt-0.5" style="color:#708499">{{ cat.count }}</p>
          </div>
        </component>
      </div>

      <!-- Bottom Nav -->
      <div
        class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex items-center justify-around py-2 z-50"
        style="max-width:390px; background:rgba(23,33,43,0.96); border-top:1px solid #2b3a4a; backdrop-filter:blur(12px)"
      >
        <NuxtLink
          to="/dashboard"
          class="flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl active:opacity-60 transition-opacity"
          style="color:#708499"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span class="text-[10px] font-bold">Главная</span>
        </NuxtLink>

        <div
          class="flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl"
          style="color:#5288c1; background:rgba(82,136,193,0.12)"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span class="text-[10px] font-bold">Каталог</span>
        </div>

        <NuxtLink
          to="/profile"
          class="flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl active:opacity-60 transition-opacity"
          style="color:#708499"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span class="text-[10px] font-bold">Профиль</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Check in browser**

Navigate to `http://localhost:3000/catalog`. Verify:
- Dark `#17212b` background
- "Каталог" header + muted subtitle
- 2×3 grid of cards — Гайды and Курсы have material counts, others show "СКОРО" badge
- Icon renders for each card (if UIcon shows nothing, check the lucide icon name in `@nuxt/ui` docs)
- Bottom nav shows Каталог as active (blue pill highlight)

- [ ] **Step 3: Commit**

```bash
git add app/components/MiniAppCatalog.vue
git commit -m "feat(mini-app): add MiniAppCatalog component with 2x3 category grid"
```

---

### Task 3: Update bottom nav in `MiniAppDashboard.vue`

**Files:**
- Modify: `app/components/MiniAppDashboard.vue` (line ~203–212, the Каталог `NuxtLink`)

- [ ] **Step 1: Update the Каталог link `to` prop**

Find this block in `MiniAppDashboard.vue`:

```vue
<NuxtLink
  to="/courses"
  class="flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl active:opacity-60 transition-opacity"
  style="color:#708499"
>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
  <span class="text-[10px] font-bold">Каталог</span>
</NuxtLink>
```

Replace with (change `to` and SVG icon to match the grid icon used in MiniAppCatalog):

```vue
<NuxtLink
  to="/catalog"
  class="flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl active:opacity-60 transition-opacity"
  style="color:#708499"
>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
  <span class="text-[10px] font-bold">Каталог</span>
</NuxtLink>
```

- [ ] **Step 2: Verify in browser**

Go to `http://localhost:3000/dashboard`. Click "Каталог" in the bottom nav — it should navigate to `/catalog`. Go back to dashboard — Каталог icon should be inactive (gray), Главная active highlight is not shown (Главная also has no active state in the original, that's fine).

- [ ] **Step 3: Commit**

```bash
git add app/components/MiniAppDashboard.vue
git commit -m "feat(mini-app): update bottom nav Каталог link to /catalog"
```

---

## Done Criteria

- `/catalog` loads without 404 or console errors
- 6 category cards render in 2×3 grid on dark background
- Гайды and Курсы cards are tappable NuxtLinks; others are static divs
- "СКОРО" badge visible on 4 coming-soon cards
- Bottom nav: Каталог is highlighted blue on `/catalog`, gray on `/dashboard`
- Dashboard's Каталог nav item navigates to `/catalog`
