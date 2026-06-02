# Feature-Based Components Refactor — Design Spec

**Date:** 2026-06-02  
**Status:** Approved

## Overview

Nuxt 4 loyihadagi komponent tuzilmasini sodda, feature-based arxitekturaga o'tkazish. Maqsad mavjud funksionallikni buzmasdan `app`, `mini-app`, `guides`, `landing`, `ui` ownership chegaralarini aniq qilish va kelajakdagi modullar uchun tayyor asos yaratish.

Bu refaktor UI dizaynini, business logic'ni, route semantikasini, store/composable oqimini yoki backend qatlamini o'zgartirmaydi. O'zgarishlar komponent joylashuvi, nomlash izchilligi va import/reference yangilanishlari bilan cheklanadi.

---

## Current Structure Audit

Hozirgi komponent tuzilmasi aralash holatda:

- `app/components/app/*` allaqachon global layout va shell komponentlari uchun ishlatilmoqda
- `app/components/landing/*` landing sahifa section'lari uchun ishlatilmoqda
- `app/components/ui/*` reusable UI primitives uchun ishlatilmoqda
- bir nechta feature komponentlari esa hali ham `app/components/` ildizida turibdi:
  - `AppLogo.vue`
  - `GuideEditor.vue`
  - `LandingHeroArt.vue`
  - `MiniAppBottomNav.vue`
  - `MiniAppCatalog.vue`
  - `MiniAppDashboard.vue`
  - `TemplateMenu.vue`

Audit davomida quyidagilar tasdiqlandi:

- mini-app dashboard UI `app/pages/dashboard.vue` ichida `isMiniApp` orqali alohida branch bilan ishlaydi
- `MiniAppBottomNav`, `MiniAppCatalog`, `MiniAppDashboard` allaqachon product boundary bo'yicha bitta guruhga kiradi
- `GuideEditor` public guide page va admin create page'larda shared editor sifatida ishlatiladi
- `pages/admin/*` mini-app emas; ular web-only admin create route'lar
- `TemplateMenu.vue` uchun ishonchli usage topilmadi, shuning uchun bu refaktor doirasida o'chirilmaydi

---

## Target Architecture

Target komponent tuzilmasi:

```text
app/components/
├─ app/
│  ├─ AccessModal.vue
│  ├─ Footer.vue
│  ├─ Logo.vue
│  ├─ Nav.vue
│  ├─ PageLoader.vue
│  └─ PixelAgentAvatar.vue
├─ mini-app/
│  ├─ BottomNav.vue
│  ├─ Catalog.vue
│  └─ Dashboard.vue
├─ guides/
│  └─ Editor.vue
├─ landing/
│  ├─ AIUsageSection.vue
│  ├─ ClubForYouSection.vue
│  ├─ FAQSection.vue
│  ├─ FinalCTASection.vue
│  ├─ GuidesBannerSection.vue
│  ├─ HeroArt.vue
│  ├─ HeroSection.vue
│  ├─ PricingSection.vue
│  ├─ SkillsSection.vue
│  └─ WhatInsideSection.vue
└─ ui/
   ├─ EyebrowPill.vue
   ├─ LevelDots.vue
   ├─ SectionDivider.vue
   ├─ SectionHeader.vue
   └─ VideoPlayer.vue
```

Arxitektura qoidalari:

- `app/` — global shell, layout, branding, navigation, modal, shared app chrome
- `mini-app/` — Telegram Mini App UI komponentlari va faqat shu experience'ga tegishli presentational bloklar
- `guides/` — guides domain'iga tegishli shared komponentlar
- `landing/` — marketing/landing page section va artwork'lar
- `ui/` — domain-agnostic, reusable presentational primitives

Hozircha alohida `admin/` komponent papkasi yaratilmaydi. Sabab: admin route'lar mavjud, lekin admin-only reusable component layer hali yetarli darajada shakllanmagan.

---

## Proposed File Moves

Quyidagi ko'chirishlar bajariladi:

```text
app/components/AppLogo.vue
  -> app/components/app/Logo.vue

app/components/MiniAppBottomNav.vue
  -> app/components/mini-app/BottomNav.vue

app/components/MiniAppCatalog.vue
  -> app/components/mini-app/Catalog.vue

app/components/MiniAppDashboard.vue
  -> app/components/mini-app/Dashboard.vue

app/components/GuideEditor.vue
  -> app/components/guides/Editor.vue

app/components/LandingHeroArt.vue
  -> app/components/landing/HeroArt.vue
```

Quyidagilar joyida qoladi:

- `app/components/app/*`
- `app/components/landing/*`
- `app/components/ui/*`
- `app/components/TemplateMenu.vue`

`TemplateMenu.vue` bo'yicha qaror: usage 100% isbotlanmaguncha o'chirilmaydi va ko'chirilmaydi.

---

## Component Naming Strategy

Bu refaktor explicit import'lar o'rniga Nuxt auto-import naming qoidalariga tayanadi. Maqsad qo'lda alias/import qatlamini yaratmasdan, path orqali ownership'ni ko'rinadigan qilish.

Natijadagi template nomlari:

- `app/components/mini-app/BottomNav.vue` -> `MiniAppBottomNav`
- `app/components/mini-app/Catalog.vue` -> `MiniAppCatalog`
- `app/components/mini-app/Dashboard.vue` -> `MiniAppDashboard`
- `app/components/guides/Editor.vue` -> `GuidesEditor`
- `app/components/app/Logo.vue` -> `AppLogo`
- `app/components/landing/HeroArt.vue` -> `LandingHeroArt`

Muhim oqibat:

- mini-app komponentlari template nomi bo'yicha o'zgarmaydi
- `GuideEditor` yagona istisno bo'lib, `GuidesEditor`ga o'zgaradi
- bu yondashuv feature ownership'ni template ichidayoq ko'rsatadi va kelajakdagi domain kengayishi uchun izchil naming beradi

---

## Files Affected By Reference Updates

`GuideEditor` -> `GuidesEditor` yangilanishi kutiladigan joylar:

- `app/pages/guides/[slug].vue`
- `app/pages/admin/guides/new.vue`
- `app/pages/admin/courses/new.vue`

Nomlash bo'yicha o'zgarish talab qilmaydigan, lekin ko'chirilgan fayllarga tayanadigan joylar:

- `app/app.vue` — `MiniAppBottomNav`, `AppNav`, `AppFooter`
- `app/pages/dashboard.vue` — `MiniAppDashboard`
- `app/pages/catalog.vue` — `MiniAppCatalog`
- mini-app route'lari orasida `MiniAppBottomNav` ishlatiladigan sahifalar

Import yangilash siyosati:

- template auto-import ishlayotgan joylarda manual import qo'shilmaydi
- faqat component tag nomi o'zgargan joylar edit qilinadi
- path import ishlatilsa, ular yangi fayl joyiga moslashtiriladi

---

## Admin And Mini-App Boundary

Refaktor davomida quyidagi product chegaralari saqlanadi:

- `mini-app/` faqat Telegram Mini App UI komponentlari uchun
- `pages/admin/*` web-only admin route'lar bo'lib qoladi
- admin create page'lar:
  - `app/pages/admin/courses/new.vue`
  - `app/pages/admin/guides/new.vue`
- `GuidesEditor` admin va public guide experience orasida shared component bo'lib qoladi

Shu sabab `GuideEditor`ni `guides/`ga ko'chirish to'g'ri, `mini-app/`ga ko'chirish esa noto'g'ri bo'ladi.

---

## Cleanup Policy

Bu refaktor konservativ clean-up siyosatiga amal qiladi:

- yangi ko'chirishlar natijasida keraksiz bo'lib qolgan importlar olib tashlanadi
- yangi referencelar bilan bog'liq aniq duplicate yoki dead qoldiqlar olib tashlanadi
- oldindan mavjud, lekin usage'i noaniq bo'lgan fayllar o'chirilmaydi

Shuning uchun:

- `TemplateMenu.vue` saqlab qolinadi
- oldindan mavjud bo'lgan biznes yoki UI kodga tegilmaydi
- store, composable, middleware, plugin, server, schema qatlamlari refaktor doirasidan tashqarida qoladi

---

## .gitignore Adjustments

`.gitignore` minimal va practical tarzda kuchaytiriladi. Maqsad local artifact, temp fayl va agent secret'larni repo'ga tushib ketishidan saqlash.

Qo'shilishi mumkin bo'lgan satrlar:

```gitignore
coverage/
pnpm-debug.log*
.pnpm-store/
.claude/*.lock
.claude/*.log
.claude/logs/
.ai/
.agent/
.secrets/
```

Qoida:

- `.claude/` yoki `.codex/` kataloglari to'liq ignore qilinmaydi
- faqat local temp, lock, log, secrets tipidagi fayllar nishonlanadi
- environment variable nomlari va mavjud config naming o'zgarmaydi

---

## Verification Plan

Refaktor tugagach quyidagi tekshiruvlar bajariladi yoki tavsiya qilinadi:

### 1. Reference audit

- `rg` orqali eski component nomlari qolmaganini tekshirish
- ayniqsa `GuideEditor` reference'lari to'liq yangilanganini tasdiqlash
- eski root component path'lar bo'yicha importlar qolmaganini tekshirish

### 2. Static validation

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

### 3. Smoke checks

Mini-app flow:

- `/dashboard`
- `/catalog`
- `/mini/about`

Guides/Admin flow:

- `app/pages/guides/[slug].vue` orqali guide ko'rish
- `app/pages/admin/guides/new.vue` orqali guide create
- `app/pages/admin/courses/new.vue` orqali course create

### 4. Non-goals confirmation

Tekshiruv davomida quyidagilar o'zgarmagan bo'lishi kerak:

- UI layout va styling
- business logic
- Telegram mini-app detection behavior
- route structure
- database schema
- environment variable names

---

## Out of Scope

Quyidagilar bu refaktor doirasiga kirmaydi:

- route yoki page structure'ni feature folder'ga ko'chirish
- store/composable'larni domain bo'yicha qayta tashkil qilish
- yangi admin component layer yaratish
- database schema yoki API contract o'zgartirish
- UI redesign
- copy/text yangilash
- business logic simplification yoki rewrite

---

## Recommended Execution Order

1. Komponentlar usage auditini yakunlash
2. Maqsadli feature papkalarni yaratish
3. Fayllarni yangi nom va joylarga ko'chirish
4. Template reference'larni yangilash
5. Yangi ko'chirishlar natijasida yuzaga kelgan unused importlarni olib tashlash
6. `.gitignore`ni minimal zarur satrlar bilan yangilash
7. `rg`, `lint`, `typecheck`, `build` orqali verifikatsiya qilish

Bu ketma-ketlik refaktorni kichik, kuzatiladigan va qaytarish oson bo'lgan bosqichlarga bo'ladi.
