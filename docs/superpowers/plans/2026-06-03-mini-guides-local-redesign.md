# Mini Guides Local Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the local `/mini/guides` screen so it matches the approved reference more closely through a hero section, refined filter chips, and an editorial card layout without changing data flow or routes.

**Architecture:** Keep the work isolated to [app/pages/mini/guides.vue](/Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/app/pages/mini/guides.vue). Reuse the existing `/api/guides` payload and current chip state, but restyle the page into a more intentional mini-app composition.

**Tech Stack:** Nuxt 4, Vue 3 SFC, TypeScript, Nuxt UI icons, Tailwind utility classes plus existing inline mini-app styling pattern.

---

### Task 1: Redesign `/mini/guides` Layout Locally

**Files:**
- Modify: [app/pages/mini/guides.vue](/Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/app/pages/mini/guides.vue)

- [ ] **Step 1: Keep the existing guide data and filter state intact**

Confirm the page still uses:
- `useAsyncData('mini-guides', () => $fetch('/api/guides'))`
- `activeChip`
- `NuxtLink` to `/guides/${guide.slug}`

- [ ] **Step 2: Replace the simple top header with a reference-style hero**

Add:
- back button row
- large title block
- short subtitle
- local decorative illustration block built with inline SVG/CSS instead of introducing new assets

- [ ] **Step 3: Refine the chip filters**

Keep the current indicator behavior, but update spacing, pill sizes, and visual rhythm so the row feels closer to the reference.

- [ ] **Step 4: Convert the guide list into editorial cards**

Each card should include:
- large top preview area
- small metadata pills row
- title
- optional short description

Do not change route targets or guide source data.

- [ ] **Step 5: Preserve empty and pending states**

Restyle the skeleton/empty states only as needed so they still match the refreshed layout.

- [ ] **Step 6: Verify locally without deploying**

Run:
- `pnpm exec eslint app/pages/mini/guides.vue`
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm build`

Expected:
- no new errors from this page
- production build succeeds locally
