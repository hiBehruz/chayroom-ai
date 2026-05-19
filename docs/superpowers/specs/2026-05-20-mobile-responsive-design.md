# Mobile Responsive Design Spec
**Date:** 2026-05-20  
**Project:** Chayroom AI Nuxt App  
**Approach:** Desktop-first, additive responsive classes (Tailwind CSS v4.x)

---

## Scope

Make all pages and components mobile-responsive. No existing desktop styles are removed — only responsive overrides added.

**Breakpoints used:**
- `md` = 768px — primary mobile/desktop split
- `lg` = 1024px — tablet/desktop split for some grids

---

## 1. Nav (`app/components/app/Nav.vue`)

**Desktop:** Floating pill with all links visible inline.  
**Mobile (< md):**
- Show: logo (left) + "Kirish" button or profile avatar (right) + hamburger icon `☰`
- Hide: nav links, dividers
- Hamburger opens a full-width drawer from the top with all links stacked vertically
- Drawer closes on link click, outside click, or `✕` button
- Drawer includes profile info + logout if user is logged in

**Implementation:**
- Add `ref` for `isMobileMenuOpen`
- Wrap nav links in `div.hidden.md:flex`
- Add hamburger button `div.flex.md:hidden`
- Add Transition-animated drawer overlay

---

## 2. HeroSection (`app/components/landing/HeroSection.vue`)

**Desktop:** `grid-cols-[46%_1fr]` side-by-side.  
**Mobile:**
- Stack to `flex-col` (text top, image bottom)
- Remove `translate-x-22` from text column
- Font: `text-[72px]` → `text-[42px]` on mobile
- Hero desc: `text-[17px]` → `text-[15px]`
- Buttons: `flex-col` on very small screens if needed
- Image: show but at natural width (remove `w-[112%]` override)
- Padding: `px-10` → `px-5`

---

## 3. Landing Sections (general)

All landing sections use `max-w-295 mx-auto px-10`. On mobile: `px-5` (or `px-4`).

### SkillsSection
- Any multi-column grid → `grid-cols-1` on mobile

### AIUsageSection
- Pill wrap already works on mobile (flex-wrap). No change needed.

### WhatInsideSection
- Any grid → `grid-cols-1` on mobile

### ClubForYouSection
- Any multi-col → `grid-cols-1`

### FAQSection
- Already vertical list — check padding only

### FinalCTASection
- Check flex layout — may need flex-col on mobile

### GuidesBannerSection
- Any side-by-side → stacked on mobile

---

## 4. PricingSection (`app/components/landing/PricingSection.vue`)

**Desktop:** `grid grid-cols-3`  
**Mobile:** `grid-cols-1` — cards stacked, featured card shown naturally in order

Fixed pixel widths on `.price-card` (`w-[331.84px]`, `w-[325.33px]`) must become `w-full` on mobile.

---

## 5. Dashboard (`app/pages/dashboard.vue`)

**Stats grid:**
- Desktop: `grid-cols-4`
- Mobile: `grid-cols-1` (user confirmed)

**Main grid:**
- Desktop: `grid-cols-[1fr_380px]`
- Mobile: `grid-cols-1` (sidebar content below)

**Paywall banner:**
- Desktop: `mx-32 flex-row`
- Mobile: `mx-0 flex-col items-center text-center`

**Padding:** `px-10` → `px-4`

---

## 6. Courses Index (`app/pages/courses/index.vue`)

- Read the file to confirm current grid — likely `grid-cols-3`
- Mobile: `grid-cols-1`
- Padding: `px-10` → `px-4`

---

## 7. Course Detail (`app/pages/courses/[slug]/index.vue`)

**Hero card:**
- Desktop: `flex-row` (left info + right colored preview)
- Mobile: `flex-col` (info on top, preview below or hidden)
- Right preview (`w-72 shrink-0`) → `w-full h-48` on mobile

**Module/lesson grid:**
- Desktop: `grid-cols-[1fr_340px]`
- Mobile: `grid-cols-1` (sidebar `sticky` removed or repositioned)

**Sidebar CTA card** stays below lesson list on mobile.

**Breadcrumb:** `max-w-80` → `max-w-[45vw]`

**Padding:** `px-10` → `px-4`

---

## 8. Guides Index (`app/pages/guides/index.vue`)

**Category filter:**
- Desktop: inline pill group
- Mobile: `overflow-x-auto` horizontal scroll (no text wrapping)

**Guide cards:**
- Desktop: `grid-cols-3`
- Mobile: `grid-cols-1`

**Header:** `flex-col` on mobile (title + admin button stacked)

**Padding:** `px-10` → `px-4`

---

## 9. Guide Detail (`app/pages/guides/[slug].vue`)

- Check layout — likely has a reading column + optional sidebar
- Mobile: single column, full width content

---

## 10. Profile (`app/pages/profile.vue`)

- Already uses `max-w-155` centered — largely responsive
- Check: `grid-cols-3` for agent options → `grid-cols-1` on mobile

---

## 11. Login (`app/pages/login.vue`)

- Already uses `max-w-[440px]` centered — largely responsive
- Minor: `px-10 py-11` on card → `px-6 py-8` on mobile

---

## Out of Scope

- Admin pages (`/admin/*`) — internal tools
- Lesson player page (`/courses/[slug]/lesson/[id]`) — separate concern
- Error page

---

## Implementation Order

1. Nav (hamburger) — highest impact, affects all pages
2. HeroSection — landing page, most visible
3. PricingSection — landing page, complex fixed widths
4. Dashboard — authenticated users
5. Guides index + detail
6. Course index + detail
7. Remaining landing sections
8. Profile / Login (minor tweaks)
