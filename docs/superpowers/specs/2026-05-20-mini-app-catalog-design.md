# Mini-App Catalog Page — Design Spec

**Date:** 2026-05-20  
**Status:** Approved

## Overview

Add a `/catalog` page to the Telegram mini-app that shows content format categories in a 2×3 grid, styled in the existing dark theme (`#17212b`). Reference: screenshot provided by user showing light-theme version from another app.

## Files

| File | Action |
|------|--------|
| `app/pages/catalog.vue` | Create — thin wrapper that renders `MiniAppCatalog` |
| `app/components/MiniAppCatalog.vue` | Create — full catalog page component |
| `app/components/MiniAppDashboard.vue` | Edit — update bottom nav `/courses` → `/catalog` |

## Component: MiniAppCatalog.vue

### Layout
- Same outer shell as `MiniAppDashboard.vue`: `flex justify-center`, `max-width:390px`, `background:#17212b`, `min-height:100vh`, `padding-bottom:80px`

### Header
- Padding: `px-4 pt-7 pb-6`
- Title: `"Каталог"` — white, 26px, font-black, tracking-tight
- Subtitle: `"Форматы материалов на платформе."` — `#708499`, 14px

### Category Grid
- `grid grid-cols-2 gap-3 px-4`
- 6 cards total (2 active, 4 coming soon)

### Card Anatomy
```
┌─────────────────────┐  ← border-radius: 20px
│ [icon circle]  СКОРО│  ← badge top-right (if coming soon)
│                     │
│ Название            │
│ N материалов        │  ← only if active
└─────────────────────┘
```

- **Card bg:** `#232e3c`
- **Card border:** `1px solid #2b3a4a`
- **Card padding:** `p-4`, `min-height: 148px`, `flex flex-col justify-between`
- **Icon container:** `width:48px height:48px`, `border-radius:14px`, `background:#1e2d3d`, icon color `#5288c1`, icon size 22px
- **СКОРО badge:** text `#f0b429`, background `rgba(240,180,41,0.15)`, font-size 9px, font-black, tracking-widest, uppercase, `px-2 py-0.5 rounded-full`
- **Category name:** white, 15px, font-bold
- **Material count:** `#708499`, 12px, font-medium

### Category Data

| Name | Lucide Icon | Status | Count |
|------|-------------|--------|-------|
| Гайды | `i-lucide-book-open` | active | 13 материалов |
| Курсы | `i-lucide-graduation-cap` | active | 2 материала |
| Скиллы | `i-lucide-sparkles` | скоро | — |
| Юзкейсы | `i-lucide-briefcase` | скоро | — |
| Эфиры | `i-lucide-video` | скоро | — |
| Воркшопы | `i-lucide-users` | скоро | — |

Active cards link to `/guides` and `/courses` respectively. Coming-soon cards are not clickable (no `NuxtLink`, no tap action).

### Bottom Navigation
Same markup as `MiniAppDashboard.vue` with one difference: `Каталог` tab is **active** (color `#5288c1`) and has a pill highlight background (`rgba(82,136,193,0.12)` rounded-xl).

Links:
- `Главная` → `/dashboard`
- `Каталог` → `/catalog` (active on this page)
- `Профиль` → `/profile`

## MiniAppDashboard.vue Change
In the bottom nav, update the `Каталог` link `to` prop from `/courses` to `/catalog`.

## Constraints
- Tailwind-only styling (no `<style>` blocks); custom utilities in `app/assets/css/main.css` if needed
- No new API calls — counts are hardcoded static values for now
- All UI text already in Russian (matches existing dashboard language)
- Coming-soon cards must not be tappable
