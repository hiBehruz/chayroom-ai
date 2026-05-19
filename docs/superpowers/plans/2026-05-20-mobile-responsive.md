# Mobile Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all Chayroom AI pages and components mobile-responsive using Tailwind CSS v4.x additive classes on top of existing desktop styles.

**Architecture:** Desktop-first additive approach — existing desktop classes are untouched, mobile overrides are added via `max-md:` (< 768px) and tablet breakpoints via `md:` / `lg:`. No new CSS files. Nav gets a hamburger drawer via a new `ref` and `Transition`. All changes are in `.vue` template class attributes.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS v4.x (`max-md:`, `md:`, `lg:` breakpoint modifiers supported)

---

## File Map

| File | Change Type |
|------|-------------|
| `app/components/app/Nav.vue` | Add hamburger state + drawer markup |
| `app/components/landing/HeroSection.vue` | Stack grid vertically, scale font |
| `app/components/landing/PricingSection.vue` | 3-col → 1-col, remove fixed widths |
| `app/components/landing/WhatInsideSection.vue` | 3-col grid → 1-col, font scale |
| `app/components/landing/ClubForYouSection.vue` | 2-col grid → 1-col |
| `app/components/landing/SkillsSection.vue` | Carousel item 2-col → 1-col |
| `app/components/landing/FinalCTASection.vue` | Fixed size banner → fluid, stack |
| `app/components/landing/GuidesBannerSection.vue` | Fixed size banner → fluid, stack |
| `app/components/landing/FAQSection.vue` | Padding only |
| `app/components/landing/AIUsageSection.vue` | Padding only |
| `app/pages/dashboard.vue` | Stats 4→1 col, main grid 2→1 col, paywall stack |
| `app/pages/guides/index.vue` | Category filter scrollable, cards 3→1 col |
| `app/pages/courses/index.vue` | Category filter scrollable, cards 3→1 col |
| `app/pages/courses/[slug]/index.vue` | Hero card stack, 2-col grid → 1-col |
| `app/pages/profile.vue` | Agent options grid 3→1 col |
| `app/pages/login.vue` | Card padding tighten on mobile |

---

## Task 1: Nav — Hamburger Drawer

**File:** `app/components/app/Nav.vue`

- [ ] **Step 1: Add `isMobileMenuOpen` ref to script**

In the `<script setup>` block, after `const isProfileOpen = ref(false)`, add:

```ts
const isMobileMenuOpen = ref(false)
```

Also add a watcher to close mobile menu on route change (alongside existing route watcher):

```ts
watch(route, () => {
  isProfileOpen.value = false
  isMobileMenuOpen.value = false
})
```

- [ ] **Step 2: Update nav pill to hide links on mobile**

Find the nav element opening tag and reduce padding on mobile:

```html
<!-- BEFORE -->
<nav :class="['max-w-295 mx-auto flex items-center h-13 px-10 gap-8 rounded-2xl border ...']">

<!-- AFTER -->
<nav :class="['max-w-295 mx-auto flex items-center h-13 px-4 md:px-10 gap-4 md:gap-8 rounded-2xl border ...']">
```

- [ ] **Step 3: Hide desktop nav links + dividers on mobile**

Find the divider after the logo (`<div class="w-px h-5 bg-cx-line shrink-0" />`). There are two — wrap the first one and the nav links div with `hidden md:flex` / `hidden md:block`:

```html
<!-- First divider: hide on mobile -->
<div class="hidden md:block w-px h-5 bg-cx-line shrink-0" />

<!-- Nav links: hide on mobile -->
<div class="relative hidden md:flex items-center gap-0.5 flex-1 justify-center">
  <!-- existing nav link buttons stay unchanged -->
</div>

<!-- Second divider: hide on mobile -->
<div class="hidden md:block w-px h-5 bg-cx-line shrink-0" />
```

- [ ] **Step 4: Hide desktop right section on mobile**

Wrap the existing right section `<div class="flex items-center gap-2.5 shrink-0">` with `hidden md:flex`:

```html
<div class="hidden md:flex items-center gap-2.5 shrink-0">
  <!-- existing profile/login content unchanged -->
</div>
```

- [ ] **Step 5: Add mobile right section (compact login + hamburger)**

After the desktop right section, add a mobile-only right section:

```html
<!-- Mobile right -->
<div class="flex md:hidden items-center gap-2 ml-auto shrink-0">
  <!-- Compact login or profile avatar -->
  <template v-if="authStore.user">
    <button
      class="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-[#f2f2f0] transition-colors duration-200 cursor-pointer focus:outline-none"
      @click="isMobileMenuOpen = true"
    >
      <AppPixelAgentAvatar :variant="authStore.resolvedAgentVariant" />
    </button>
  </template>
  <template v-else>
    <NuxtLink
      to="/login"
      class="btn-primary btn-primary-dark text-[13px]! px-3! py-1.5!"
    >
      Kirish
    </NuxtLink>
  </template>

  <!-- Hamburger -->
  <button
    class="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[#f2f2f0] transition-colors duration-200 focus:outline-none"
    aria-label="Menyuni ochish"
    @click="isMobileMenuOpen = !isMobileMenuOpen"
  >
    <UIcon
      :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
      class="size-5 text-[#1a1a1a]"
    />
  </button>
</div>
```

- [ ] **Step 6: Add mobile drawer below the nav**

After the closing `</nav>` tag but still inside the outer `.nav-scroll-shell` div, add the drawer:

```html
<!-- Mobile drawer -->
<Transition name="mobile-drawer">
  <div
    v-if="isMobileMenuOpen"
    class="md:hidden absolute left-0 right-0 top-full bg-white border-t border-cx-line shadow-[0_16px_40px_rgba(0,0,0,0.10)] px-5 py-4 flex flex-col gap-1 z-50"
  >
    <button
      v-for="link in navLinks"
      :key="link.label"
      :class="[
        'flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-colors duration-200 text-left w-full cursor-pointer focus:outline-none',
        isActive(link.href) ? 'bg-[#f2f2f0] text-[#0a0a0b] font-semibold' : 'text-cx-muted hover:bg-[#f7f7f5] hover:text-[#0a0a0b]'
      ]"
      @click="scrollToSection(link.href); isMobileMenuOpen = false"
    >
      {{ link.label }}
    </button>

    <div class="h-px bg-cx-line my-2" />

    <!-- Profile section or login -->
    <template v-if="authStore.user">
      <div class="flex items-center gap-3 px-4 py-2 mb-1">
        <AppPixelAgentAvatar :variant="authStore.resolvedAgentVariant" />
        <div>
          <div class="text-[14px] font-bold text-[#1a1a1a]">{{ authStore.displayName || authStore.user.first_name }}</div>
          <div v-if="authStore.user.username" class="text-[12px] text-cx-muted">@{{ authStore.user.username }}</div>
        </div>
      </div>
      <NuxtLink
        to="/profile"
        class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[14px] font-medium text-[#1a1a1a] hover:bg-[#f7f7f5] transition-colors"
        @click="isMobileMenuOpen = false"
      >
        <UIcon name="i-lucide-user-round" class="size-4 text-cx-muted" />
        Profil sozlamalari
      </NuxtLink>
      <button
        class="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors focus:outline-none"
        @click="logout"
      >
        <UIcon name="i-lucide-log-out" class="size-4" />
        Chiqish
      </button>
    </template>
    <template v-else>
      <NuxtLink
        to="/login"
        class="btn-primary btn-primary-dark text-[14px]! mx-2"
        @click="isMobileMenuOpen = false"
      >
        Kirish (Telegram)
      </NuxtLink>
    </template>
  </div>
</Transition>
```

- [ ] **Step 7: Add drawer transition CSS**

In `<style scoped>`, add:

```css
.mobile-drawer-enter-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-drawer-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.mobile-drawer-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.mobile-drawer-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
```

Also add `position: relative` awareness — the outer `.nav-scroll-shell` needs `relative` for the drawer positioning. Add `relative` to its class:

```html
<!-- BEFORE -->
<div :class="['nav-scroll-shell sticky top-0 z-50 bg-white/96 backdrop-blur-sm px-5 py-3', ...]">

<!-- AFTER -->
<div :class="['nav-scroll-shell sticky top-0 z-50 bg-white/96 backdrop-blur-sm px-5 py-3 relative', ...]">
```

- [ ] **Step 8: Verify visually**

Open the app at `localhost:3000`, resize browser to < 768px width. Check:
- Nav links hidden ✓
- Logo visible ✓
- Hamburger `☰` visible ✓
- Clicking hamburger opens drawer ✓
- Clicking a link closes drawer ✓
- On desktop (> 768px) drawer hidden, all links visible ✓

- [ ] **Step 9: Commit**

```bash
git add app/components/app/Nav.vue
git commit -m "feat(responsive): add mobile hamburger nav drawer"
```

---

## Task 2: HeroSection — Stack Vertically on Mobile

**File:** `app/components/landing/HeroSection.vue`

- [ ] **Step 1: Update container padding**

```html
<!-- BEFORE -->
<div class="relative z-10 max-w-295 mx-auto px-10">

<!-- AFTER -->
<div class="relative z-10 max-w-295 mx-auto px-10 max-md:px-5">
```

- [ ] **Step 2: Switch grid to flex-col on mobile**

```html
<!-- BEFORE -->
<div class="grid min-h-140 grid-cols-[46%_1fr] items-center gap-0">

<!-- AFTER -->
<div class="grid min-h-140 grid-cols-[46%_1fr] items-center gap-0 max-md:flex max-md:flex-col max-md:min-h-0 max-md:gap-6 max-md:pt-6 max-md:pb-4">
```

- [ ] **Step 3: Remove text translate on mobile**

```html
<!-- BEFORE -->
<div class="relative z-20 flex min-w-0 translate-x-22 flex-col items-start justify-center gap-5.5">

<!-- AFTER -->
<div class="relative z-20 flex min-w-0 translate-x-22 max-md:translate-x-0 flex-col items-start justify-center gap-5.5">
```

- [ ] **Step 4: Scale hero title font on mobile**

```html
<!-- BEFORE -->
<h1 class="text-[72px] font-extrabold leading-[1.05] tracking-[-0.03em]">

<!-- AFTER -->
<h1 class="text-[72px] max-md:text-[42px] font-extrabold leading-[1.05] tracking-[-0.03em]">
```

- [ ] **Step 5: Update hero description on mobile**

```html
<!-- BEFORE -->
<p class="hero-desc max-w-105">

<!-- AFTER -->
<p class="hero-desc max-w-105 max-md:max-w-none max-md:text-[15px]">
```

- [ ] **Step 6: Make keyword text smaller on mobile**

```html
<!-- BEFORE -->
<span ... class="text-[20px] font-bold leading-tight text-cx-blue inline-block">

<!-- AFTER -->
<span ... class="text-[20px] max-md:text-[17px] font-bold leading-tight text-cx-blue inline-block">
```

- [ ] **Step 7: Scale hero art on mobile**

```html
<!-- BEFORE -->
<div class="hero-art-stage relative w-[112%] translate-x-4" ...>

<!-- AFTER -->
<div class="hero-art-stage relative w-[112%] translate-x-4 max-md:w-4/5 max-md:translate-x-0 max-md:mx-auto" ...>
```

- [ ] **Step 8: Verify visually**

Resize to mobile. Check:
- Text stacks above teapot image ✓
- Title is ~42px on mobile ✓
- No horizontal overflow ✓
- Desktop layout unchanged ✓

- [ ] **Step 9: Commit**

```bash
git add app/components/landing/HeroSection.vue
git commit -m "feat(responsive): stack hero section vertically on mobile"
```

---

## Task 3: PricingSection — 1 Column on Mobile

**File:** `app/components/landing/PricingSection.vue`

- [ ] **Step 1: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-295 mx-auto px-10">

<!-- AFTER -->
<div class="max-w-295 mx-auto px-10 max-md:px-5">
```

- [ ] **Step 2: Change grid to 1-col on mobile**

```html
<!-- BEFORE -->
<div class="grid grid-cols-3 gap-4 items-end">

<!-- AFTER -->
<div class="grid grid-cols-3 max-md:grid-cols-1 gap-4 max-md:gap-6 items-end">
```

- [ ] **Step 3: Remove fixed widths + heights on mobile**

The `:class` binding on the `.price-card` div has hardcoded pixel widths. Add `max-md:w-full max-md:h-auto`:

```html
<!-- BEFORE -->
:class="[
  'price-card bg-[#f7f7f5] rounded-3xl flex flex-col',
  plan.featured ? 'w-[331.84px] h-[530.4px] p-7 shadow-lift' : 'w-[325.33px] h-130 p-6'
]"

<!-- AFTER -->
:class="[
  'price-card bg-[#f7f7f5] rounded-3xl flex flex-col max-md:w-full max-md:h-auto',
  plan.featured ? 'w-[331.84px] h-[530.4px] p-7 shadow-lift' : 'w-[325.33px] h-130 p-6'
]"
```

- [ ] **Step 4: Center the wrapping div on mobile**

The outer wrapper per plan has `relative flex justify-center`:

```html
<!-- BEFORE -->
<div class="relative flex justify-center" :class="plan.badge ? 'pt-4' : ''">

<!-- AFTER -->
<div class="relative flex justify-center max-md:justify-stretch" :class="plan.badge ? 'pt-4' : ''">
```

- [ ] **Step 5: Verify visually**

On mobile: cards stack 1-per-row, full width, no overflow. Desktop: 3 columns unchanged.

- [ ] **Step 6: Commit**

```bash
git add app/components/landing/PricingSection.vue
git commit -m "feat(responsive): pricing section 1-col on mobile"
```

---

## Task 4: Dashboard — Responsive Grids

**File:** `app/pages/dashboard.vue`

- [ ] **Step 1: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-295 mx-auto px-10 py-8">

<!-- AFTER -->
<div class="max-w-295 mx-auto px-10 py-8 max-md:px-4">
```

- [ ] **Step 2: Paywall banner — stack and full-width on mobile**

```html
<!-- BEFORE -->
<div class="mb-8 rounded-2xl bg-[#f7f7f5] px-10 py-8 flex items-center justify-center gap-8 paywall-enter sticky top-20 z-10 mx-32">

<!-- AFTER -->
<div class="mb-8 rounded-2xl bg-[#f7f7f5] px-10 py-8 flex items-center justify-center gap-8 paywall-enter sticky top-20 z-10 mx-32 max-md:mx-0 max-md:flex-col max-md:px-6 max-md:py-6 max-md:text-center max-md:gap-4">
```

Also center the button inside the paywall on mobile. Find the `NuxtLink` button in the paywall and add `max-md:self-center`:

```html
<!-- BEFORE -->
<NuxtLink to="/login" class="btn-primary btn-primary-dark text-[15px]! py-3! px-6! flex items-center gap-2">

<!-- AFTER -->
<NuxtLink to="/login" class="btn-primary btn-primary-dark text-[15px]! py-3! px-6! flex items-center gap-2 max-md:self-center">
```

- [ ] **Step 3: Stats grid — 1 column on mobile**

```html
<!-- BEFORE -->
<div class="grid grid-cols-4 gap-4 mb-6">

<!-- AFTER -->
<div class="grid grid-cols-4 max-md:grid-cols-1 gap-4 mb-6">
```

- [ ] **Step 4: Main grid — 1 column on mobile**

```html
<!-- BEFORE -->
<div class="grid grid-cols-[1fr_380px] gap-6 mb-8">

<!-- AFTER -->
<div class="grid grid-cols-[1fr_380px] max-md:grid-cols-1 gap-6 mb-8">
```

- [ ] **Step 5: Verify visually**

Mobile: stats each in a row (1-col), main layout stacked. Paywall is centered card with flex-col. Desktop unchanged.

- [ ] **Step 6: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat(responsive): dashboard responsive grids"
```

---

## Task 5: Guides Index — Scrollable Filter, 1-Col Cards

**File:** `app/pages/guides/index.vue`

- [ ] **Step 1: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-295 mx-auto px-10 py-8">

<!-- AFTER -->
<div class="max-w-295 mx-auto px-10 py-8 max-md:px-4">
```

- [ ] **Step 2: Stack header on mobile**

```html
<!-- BEFORE -->
<div class="flex items-center justify-between mb-6">

<!-- AFTER -->
<div class="flex items-center justify-between mb-6 max-md:flex-col max-md:items-start max-md:gap-3">
```

- [ ] **Step 3: Make category filter horizontally scrollable on mobile**

Wrap the existing `ref="categoryFilterRef"` div in a scroll container:

```html
<!-- BEFORE -->
<div ref="categoryFilterRef" class="relative inline-flex items-center bg-[#f0f0f0] rounded-2xl p-1.5 mb-8">

<!-- AFTER — wrap in scroll container -->
<div class="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-8 scrollbar-none">
  <div ref="categoryFilterRef" class="relative inline-flex items-center bg-[#f0f0f0] rounded-2xl p-1.5 whitespace-nowrap">
    <!-- existing buttons unchanged, remove mb-8 from inner div since outer has it -->
  </div>
</div>
```

> Note: `scrollbar-none` hides the scrollbar visually. Add to CSS if not in Tailwind config: `.scrollbar-none::-webkit-scrollbar { display: none; }` in `app/assets/css/main.css` or equivalent global CSS file.

- [ ] **Step 4: Add scrollbar-none CSS**

Check if there's a global CSS file. If yes, add there. If using `app/assets/css/main.css` or similar:

```css
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```

If no global CSS file exists, add a `<style>` block to `guides/index.vue`:

```html
<style>
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
```

- [ ] **Step 5: Update guide cards grid**

```html
<!-- BEFORE -->
<TransitionGroup ... class="grid grid-cols-3 gap-5">

<!-- AFTER -->
<TransitionGroup ... class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
```

- [ ] **Step 6: Verify visually**

Mobile: 1 card per row, category filter scrolls horizontally, header stacks. Tablet (768px): 2 cards. Desktop: 3 cards.

- [ ] **Step 7: Commit**

```bash
git add app/pages/guides/index.vue
git commit -m "feat(responsive): guides index responsive layout"
```

---

## Task 6: Courses Index — Scrollable Filter, 1-Col Cards

**File:** `app/pages/courses/index.vue`

- [ ] **Step 1: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-295 mx-auto px-10 py-8">

<!-- AFTER -->
<div class="max-w-295 mx-auto px-10 py-8 max-md:px-4">
```

- [ ] **Step 2: Stack header on mobile**

```html
<!-- BEFORE -->
<div class="flex items-center justify-between mb-6">

<!-- AFTER -->
<div class="flex items-center justify-between mb-6 max-md:flex-col max-md:items-start max-md:gap-3">
```

- [ ] **Step 3: Wrap category filter in scroll container**

Same pattern as Guides index:

```html
<div class="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-8 scrollbar-none">
  <div ref="categoryFilterRef" class="relative inline-flex items-center bg-[#f0f0f0] rounded-2xl p-1.5 whitespace-nowrap">
    <!-- existing span indicator and buttons unchanged -->
  </div>
</div>
```

- [ ] **Step 4: Update course cards grid**

```html
<!-- BEFORE -->
<div class="grid grid-cols-3 gap-5">

<!-- AFTER -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
```

- [ ] **Step 5: Add scrollbar-none if not already global**

If the CSS was added in Task 5 to a global file, skip. If added as scoped style in `guides/index.vue`, add the same `<style>` block to `courses/index.vue`.

- [ ] **Step 6: Verify visually**

Same checks as Guides index. Desktop unchanged.

- [ ] **Step 7: Commit**

```bash
git add app/pages/courses/index.vue
git commit -m "feat(responsive): courses index responsive layout"
```

---

## Task 7: Course Detail — Stack Hero Card + Grid

**File:** `app/pages/courses/[slug]/index.vue`

- [ ] **Step 1: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-295 mx-auto px-10 py-8">

<!-- AFTER -->
<div class="max-w-295 mx-auto px-10 py-8 max-md:px-4">
```

- [ ] **Step 2: Narrow breadcrumb max-width on mobile**

```html
<!-- BEFORE -->
<span class="text-cx-ink font-medium truncate max-w-80">

<!-- AFTER -->
<span class="text-cx-ink font-medium truncate max-w-80 max-md:max-w-[45vw]">
```

- [ ] **Step 3: Stack hero card on mobile**

```html
<!-- BEFORE -->
<div class="rounded-2xl border border-cx-line bg-[#f7f7f5] overflow-hidden mb-8 flex">

<!-- AFTER -->
<div class="rounded-2xl border border-cx-line bg-[#f7f7f5] overflow-hidden mb-8 flex max-md:flex-col">
```

- [ ] **Step 4: Make preview panel full-width on mobile**

```html
<!-- BEFORE -->
<div class="w-72 shrink-0 relative overflow-hidden" :style="{ backgroundColor: course.bg }">

<!-- AFTER -->
<div class="w-72 shrink-0 relative overflow-hidden max-md:w-full max-md:h-48" :style="{ backgroundColor: course.bg }">
```

- [ ] **Step 5: Convert main grid to 1-col on mobile**

```html
<!-- BEFORE -->
<div class="grid grid-cols-[1fr_340px] gap-8">

<!-- AFTER -->
<div class="grid grid-cols-[1fr_340px] max-md:grid-cols-1 gap-8">
```

- [ ] **Step 6: Remove sticky from sidebar on mobile**

```html
<!-- BEFORE -->
<div class="sticky top-24 flex flex-col gap-4">

<!-- AFTER -->
<div class="sticky top-24 max-md:static flex flex-col gap-4">
```

- [ ] **Step 7: Verify visually**

Mobile: hero card stacks (info → preview preview below), module list full width, sidebar card below. Desktop unchanged.

- [ ] **Step 8: Commit**

```bash
git add "app/pages/courses/[slug]/index.vue"
git commit -m "feat(responsive): course detail responsive layout"
```

---

## Task 8: Landing Sections — WhatInside, ClubForYou, Skills

**Files:**
- `app/components/landing/WhatInsideSection.vue`
- `app/components/landing/ClubForYouSection.vue`
- `app/components/landing/SkillsSection.vue`

### WhatInsideSection

- [ ] **Step 1: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-[1180px] mx-auto px-10">

<!-- AFTER -->
<div class="max-w-[1180px] mx-auto px-10 max-md:px-5">
```

- [ ] **Step 2: Scale heading fonts on mobile**

```html
<!-- BEFORE -->
<h2 class="text-[36px] font-extrabold tracking-tight leading-[1.1] text-[#1a1a1a]">
  Chayroom AI ichida nimalar bor?
</h2>
<p class="text-[36px] font-extrabold tracking-tight leading-[1.1] text-[#1a1a1a]">
  Va nega biz bilan rivojlanish<br>to'g'ri tanlov
</p>

<!-- AFTER -->
<h2 class="text-[36px] max-md:text-[24px] font-extrabold tracking-tight leading-[1.1] text-[#1a1a1a]">
  Chayroom AI ichida nimalar bor?
</h2>
<p class="text-[36px] max-md:text-[24px] font-extrabold tracking-tight leading-[1.1] text-[#1a1a1a]">
  Va nega biz bilan rivojlanish<br>to'g'ri tanlov
</p>
```

- [ ] **Step 3: Feature cards 3-col → 1-col on mobile**

```html
<!-- BEFORE -->
<div class="grid grid-cols-3 gap-4.5">

<!-- AFTER -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4.5">
```

### ClubForYouSection

- [ ] **Step 4: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-[1180px] mx-auto px-10">

<!-- AFTER -->
<div class="max-w-[1180px] mx-auto px-10 max-md:px-5">
```

- [ ] **Step 5: Club cards 2-col → 1-col on mobile**

```html
<!-- BEFORE -->
<div class="grid grid-cols-2 gap-5">

<!-- AFTER -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
```

### SkillsSection

- [ ] **Step 6: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-[1180px] mx-auto px-10">

<!-- AFTER -->
<div class="max-w-[1180px] mx-auto px-10 max-md:px-5">
```

- [ ] **Step 7: Carousel page grid 2-col → 1-col on mobile**

The inner page grid inside the carousel track:

```html
<!-- BEFORE -->
<div class="grid grid-cols-2 gap-5" :style="{ width: `${100 / totalPages}%` }">

<!-- AFTER -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-5" :style="{ width: `${100 / totalPages}%` }">
```

- [ ] **Step 8: Commit all three**

```bash
git add app/components/landing/WhatInsideSection.vue app/components/landing/ClubForYouSection.vue app/components/landing/SkillsSection.vue
git commit -m "feat(responsive): landing feature sections responsive grids"
```

---

## Task 9: Landing Banners — FinalCTA and GuidesBanner

**Files:**
- `app/components/landing/FinalCTASection.vue`
- `app/components/landing/GuidesBannerSection.vue`

Both share the same problem: a hardcoded `w-209.25 h-73.75` fixed-size banner.

### FinalCTASection

- [ ] **Step 1: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-295 mx-auto px-10">

<!-- AFTER -->
<div class="max-w-295 mx-auto px-10 max-md:px-4">
```

- [ ] **Step 2: Override fixed banner dimensions and stack on mobile**

```html
<!-- BEFORE -->
<div ref="bannerRef" class="bg-[#dbeafe] rounded-3xl flex items-center gap-14 w-209.25 h-73.75 px-14 mx-auto">

<!-- AFTER -->
<div ref="bannerRef" class="bg-[#dbeafe] rounded-3xl flex items-center gap-14 w-209.25 h-73.75 px-14 mx-auto max-md:w-full max-md:h-auto max-md:flex-col max-md:px-6 max-md:py-8 max-md:gap-6 max-md:text-center">
```

- [ ] **Step 3: Scale lottie animation on mobile**

```html
<!-- BEFORE -->
<div class="shrink-0 w-56 h-56">

<!-- AFTER -->
<div class="shrink-0 w-56 h-56 max-md:w-36 max-md:h-36">
```

- [ ] **Step 4: Align CTA button on mobile**

```html
<!-- BEFORE -->
<button class="btn-primary btn-primary-dark self-start text-[13px]! px-5! py-2.5!" @click="scrollToPricing">

<!-- AFTER -->
<button class="btn-primary btn-primary-dark self-start text-[13px]! px-5! py-2.5! max-md:self-center" @click="scrollToPricing">
```

### GuidesBannerSection

- [ ] **Step 5: Update container padding**

```html
<div class="max-w-295 mx-auto px-10 max-md:px-4">
```

- [ ] **Step 6: Override fixed banner dimensions**

```html
<!-- BEFORE -->
<div ref="bannerRef" class="bg-[#f5e6c8] rounded-3xl flex items-center gap-14 w-209.25 h-73.75 px-14 mx-auto">

<!-- AFTER -->
<div ref="bannerRef" class="bg-[#f5e6c8] rounded-3xl flex items-center gap-14 w-209.25 h-73.75 px-14 mx-auto max-md:w-full max-md:h-auto max-md:flex-col max-md:px-6 max-md:py-8 max-md:gap-6 max-md:text-center">
```

- [ ] **Step 7: Scale lottie + sparkle container**

```html
<!-- BEFORE -->
<div class="relative shrink-0 w-56 h-56 flex items-center justify-center">

<!-- AFTER -->
<div class="relative shrink-0 w-56 h-56 flex items-center justify-center max-md:w-36 max-md:h-36">
```

- [ ] **Step 8: Align button**

```html
<!-- BEFORE -->
<button class="btn-primary btn-primary-dark self-start text-[13px]! px-5! py-2.5!">

<!-- AFTER -->
<button class="btn-primary btn-primary-dark self-start text-[13px]! px-5! py-2.5! max-md:self-center">
```

- [ ] **Step 9: Commit**

```bash
git add app/components/landing/FinalCTASection.vue app/components/landing/GuidesBannerSection.vue
git commit -m "feat(responsive): banner sections fluid on mobile"
```

---

## Task 10: FAQ and AIUsage — Padding Only

**Files:**
- `app/components/landing/FAQSection.vue`
- `app/components/landing/AIUsageSection.vue`

### FAQSection

- [ ] **Step 1: Update container padding + narrow max-w override**

```html
<!-- BEFORE -->
<div class="max-w-295 mx-auto px-10">

<!-- AFTER -->
<div class="max-w-295 mx-auto px-10 max-md:px-5">
```

The `max-w-195 mx-auto` inner container for FAQ items is fine — it will naturally fit mobile.

The question buttons have `px-6 py-5` — reduce padding on mobile:

```html
<!-- BEFORE -->
<button class="w-full px-6 py-5 font-semibold text-[15px] flex justify-between items-center text-left cursor-pointer" ...>

<!-- AFTER -->
<button class="w-full px-6 py-5 max-md:px-4 max-md:py-4 font-semibold text-[15px] max-md:text-[14px] flex justify-between items-center text-left cursor-pointer" ...>
```

### AIUsageSection

- [ ] **Step 2: Update container padding**

```html
<!-- BEFORE -->
<div class="max-w-[1180px] mx-auto px-10">

<!-- AFTER -->
<div class="max-w-[1180px] mx-auto px-10 max-md:px-5">
```

(Pills already flex-wrap — they work on mobile without grid changes.)

- [ ] **Step 3: Commit**

```bash
git add app/components/landing/FAQSection.vue app/components/landing/AIUsageSection.vue
git commit -m "feat(responsive): faq and ai usage mobile padding"
```

---

## Task 11: Profile — Agent Options Grid

**File:** `app/pages/profile.vue`

- [ ] **Step 1: Agent options 3-col → 1-col on mobile**

```html
<!-- BEFORE -->
<div class="grid grid-cols-3 gap-2.5">

<!-- AFTER -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
```

- [ ] **Step 2: Container padding on mobile**

```html
<!-- BEFORE -->
<div class="mx-auto max-w-155 px-6 pb-14 pt-10">

<!-- AFTER -->
<div class="mx-auto max-w-155 px-6 pb-14 pt-10 max-md:px-4">
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/profile.vue
git commit -m "feat(responsive): profile agent options 1-col on mobile"
```

---

## Task 12: Login — Card Padding on Mobile

**File:** `app/pages/login.vue`

- [ ] **Step 1: Reduce card padding on small screens**

```html
<!-- BEFORE -->
<div class="w-full rounded-[26px] border border-[#dedee2] bg-white px-10 py-11 text-center">

<!-- AFTER -->
<div class="w-full rounded-[26px] border border-[#dedee2] bg-white px-10 py-11 max-md:px-6 max-md:py-8 text-center">
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/login.vue
git commit -m "feat(responsive): login card padding on mobile"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Test all pages on mobile (375px)**

Open each page in browser devtools at iPhone SE width (375px):
- `/` — landing page: hero, features, pricing, FAQ, banners all stack correctly
- `/courses` — 1-col cards, scrollable filter
- `/guides` — 1-col cards, scrollable filter
- `/courses/hermes-ai-agent` — hero stacks, sidebar below
- `/dashboard` — stats 1-col, main layout stacks
- `/profile` — agent options 1-col
- `/login` — centered card, good padding

- [ ] **Step 2: Test tablet (768px)**

Check transition breakpoints — should be 2-col cards on tablets for guides/courses.

- [ ] **Step 3: Test desktop (1280px)**

Confirm no regressions — all desktop layouts identical to before.

- [ ] **Step 4: Final commit if any tweaks needed**

```bash
git add -p  # stage only specific tweaks
git commit -m "feat(responsive): final mobile polish"
```
