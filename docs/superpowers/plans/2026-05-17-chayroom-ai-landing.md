# Chayroom AI Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Chayroom AI landing page, login page, and dashboard in Nuxt 4 using only Tailwind CSS v4 utility classes.

**Architecture:** Replace the Nuxt UI starter template with a fully custom design. All styling via Tailwind v4 utilities in `class=""` — no `<style>` blocks. GSAP handles all animations (hero entrance, steam wisps, scroll reveals, skills slider). Pinia manages auth state and locale.

**Tech Stack:** Nuxt 4, @nuxt/ui v4 (infrastructure only), Tailwind CSS v4, GSAP 3 (npm), Pinia, TypeScript

---

## File Map

**Modify:**
- `nuxt.config.ts` — add @pinia/nuxt, force light mode
- `app/assets/css/main.css` — replace with Chayroom AI design tokens
- `app/app.config.ts` — update UI colors to neutral
- `app/app.vue` — replace default layout with AppNav + NuxtPage + AppFooter
- `app/pages/index.vue` — compose all landing sections

**Create:**
- `app/stores/auth.ts` — user auth state (Telegram user)
- `app/stores/locale.ts` — RU/UZ switcher
- `app/middleware/auth.ts` — redirect unauthenticated from /dashboard
- `app/components/app/Nav.vue` — sticky navbar
- `app/components/app/Footer.vue` — 4-col footer
- `app/components/ui/EyebrowPill.vue` — small-caps pill with blue dot
- `app/components/ui/SectionHeader.vue` — eyebrow + title + subtitle
- `app/components/landing/HeroSection.vue` — hero with teapot, steam, GSAP
- `app/components/landing/ClubForYouSection.vue` — 2×2 cards
- `app/components/landing/WhatInsideSection.vue` — 3-col feature cards
- `app/components/landing/AIUsageSection.vue` — interactive pills + AI quote
- `app/components/landing/PricingSection.vue` — 3-col pricing cards
- `app/components/landing/SkillsSection.vue` — paginated slider (2 per page, 9 skills)
- `app/components/landing/GuidesBannerSection.vue` — dark banner CTA
- `app/components/landing/FAQSection.vue` — accordion
- `app/components/landing/FinalCTASection.vue` — bottom CTA
- `app/pages/login.vue` — Telegram login widget
- `app/pages/dashboard.vue` — member dashboard

---

## Task 1: Install dependencies and configure project

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `app/assets/css/main.css`
- Modify: `app/app.config.ts`

- [ ] **Step 1: Install GSAP and Pinia**

```bash
cd /Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app
pnpm add gsap @pinia/nuxt
```

- [ ] **Step 2: Update nuxt.config.ts**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
```

- [ ] **Step 3: Replace main.css with Chayroom AI design tokens**

```css
/* app/assets/css/main.css */
@import "tailwindcss";
@import "@nuxt/ui";

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;

  --color-cx-ink: #0A0A0B;
  --color-cx-ink-soft: #1A1A1D;
  --color-cx-blue: #2962FF;
  --color-cx-blue-soft: #E8EEFF;
  --color-cx-paper: #FFFFFF;
  --color-cx-surface: #FFFFFF;
  --color-cx-line: #E8E8EB;
  --color-cx-muted: #6B6B72;
  --color-cx-faint: #9A9AA1;

  --shadow-card: 0 1px 2px rgba(10,10,11,.04), 0 8px 24px rgba(10,10,11,.04);
  --shadow-lift: 0 2px 4px rgba(10,10,11,.05), 0 16px 40px rgba(10,10,11,.08);
  --shadow-blue: 0 2px 4px rgba(41,98,255,.1), 0 16px 40px rgba(41,98,255,.1);

  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
}

@layer base {
  html { color-scheme: light; }
  body { -webkit-font-smoothing: antialiased; }
  * { box-sizing: border-box; }
  a { text-decoration: none; color: inherit; }
}
```

- [ ] **Step 4: Update app.config.ts**

```ts
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate'
    }
  }
})
```

- [ ] **Step 5: Run dev server to verify no errors**

```bash
pnpm dev
```

Expected: dev server starts at `http://localhost:3000`, no TypeScript or CSS errors in terminal.

- [ ] **Step 6: Commit**

```bash
git add nuxt.config.ts app/assets/css/main.css app/app.config.ts package.json pnpm-lock.yaml
git commit -m "feat: install gsap + pinia, configure chayroom ai design tokens"
```

---

## Task 2: Pinia stores — auth and locale

**Files:**
- Create: `app/stores/auth.ts`
- Create: `app/stores/locale.ts`
- Create: `app/middleware/auth.ts`

- [ ] **Step 1: Create auth store**

```ts
// app/stores/auth.ts
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  hash: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<TelegramUser | null>(null)

  function login(telegramUser: TelegramUser) {
    user.value = telegramUser
    if (import.meta.client) {
      localStorage.setItem('cx-user', JSON.stringify(telegramUser))
    }
  }

  function logout() {
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('cx-user')
    }
  }

  function restoreFromStorage() {
    if (!import.meta.client) return
    const stored = localStorage.getItem('cx-user')
    if (stored) {
      try { user.value = JSON.parse(stored) }
      catch { localStorage.removeItem('cx-user') }
    }
  }

  // Dev-only mock login
  function devLogin() {
    login({
      id: 123456789,
      first_name: 'Behruz',
      last_name: 'Zaripov',
      username: 'behruzz',
      photo_url: '',
      hash: 'dev'
    })
  }

  return { user, login, logout, restoreFromStorage, devLogin }
})
```

- [ ] **Step 2: Create locale store**

```ts
// app/stores/locale.ts
export type Locale = 'ru' | 'uz'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>('ru')

  function setLocale(l: Locale) {
    locale.value = l
    if (import.meta.client) {
      localStorage.setItem('cx-locale', l)
    }
  }

  function restoreFromStorage() {
    if (!import.meta.client) return
    const stored = localStorage.getItem('cx-locale') as Locale | null
    if (stored === 'ru' || stored === 'uz') locale.value = stored
  }

  return { locale, setLocale, restoreFromStorage }
})
```

- [ ] **Step 3: Create auth middleware**

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (!authStore.user) {
    return navigateTo('/login')
  }
})
```

- [ ] **Step 4: Verify TypeScript passes**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/stores/ app/middleware/
git commit -m "feat: add auth and locale pinia stores, auth middleware"
```

---

## Task 3: App shell — app.vue, AppNav, AppFooter

**Files:**
- Modify: `app/app.vue`
- Create: `app/components/app/Nav.vue`
- Create: `app/components/app/Footer.vue`

- [ ] **Step 1: Replace app.vue**

```vue
<!-- app/app.vue -->
<script setup lang="ts">
const authStore = useAuthStore()
const localeStore = useLocaleStore()

onMounted(() => {
  authStore.restoreFromStorage()
  localeStore.restoreFromStorage()
})

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }
  ],
  htmlAttrs: { lang: 'ru' }
})

useSeoMeta({
  title: 'Chayroom AI — Освой ИИ и применяй его в жизни',
  description: 'Закрытое сообщество для тех, кто хочет внедрять ИИ в работу, жизнь и бизнес.'
})
</script>

<template>
  <UApp>
    <AppNav />
    <NuxtPage />
    <AppFooter />
  </UApp>
</template>
```

- [ ] **Step 2: Create AppNav**

```vue
<!-- app/components/app/Nav.vue -->
<script setup lang="ts">
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const navLinks = [
  { label: 'Курсы', href: '#features' },
  { label: 'Гайды', href: '#guides' },
  { label: 'Тарифы', href: '#pricing' },
  { label: 'FAQ', href: '#faq' }
]

function scrollTo(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-cx-line">
    <div class="max-w-[1180px] mx-auto px-10">
      <div class="flex items-center py-4 gap-10">
        <!-- Brand -->
        <div class="flex items-center gap-[10px] shrink-0">
          <div class="w-10 h-10 bg-cx-ink rounded-[10px] flex items-center justify-center">
            <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div>
            <div class="font-extrabold text-xl tracking-tight leading-none">
              Chayroom <span class="text-cx-blue">AI</span>
            </div>
            <div class="text-[9px] font-semibold tracking-[.08em] uppercase text-cx-muted mt-0.5">
              AI Room Club
            </div>
          </div>
        </div>

        <!-- Links -->
        <div class="flex gap-7 flex-1 justify-center">
          <button
            v-for="link in navLinks"
            :key="link.label"
            class="text-sm font-medium text-cx-ink hover:opacity-50 transition-opacity duration-200 cursor-pointer"
            @click="scrollTo(link.href)"
          >
            {{ link.label }}
          </button>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-[10px] shrink-0">
          <!-- Lang switcher -->
          <div class="flex gap-0.5 bg-white border border-cx-line rounded-lg p-[3px]">
            <button
              v-for="lang in (['ru', 'uz'] as const)"
              :key="lang"
              :class="[
                'px-2 py-1 rounded-md text-[11px] font-semibold uppercase transition-colors duration-200',
                localeStore.locale === lang
                  ? 'bg-cx-ink text-white'
                  : 'text-cx-muted hover:text-cx-ink'
              ]"
              @click="localeStore.setLocale(lang)"
            >
              {{ lang }}
            </button>
          </div>

          <!-- User or login -->
          <template v-if="authStore.user">
            <div class="flex items-center gap-2 px-3 py-1.5 pl-1.5 rounded-full border border-cx-line cursor-pointer">
              <div class="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-cx-blue to-[#1A4FE0] flex items-center justify-center text-[11px] font-extrabold text-white">
                {{ authStore.user.first_name[0] }}
              </div>
              <span class="text-[13px] font-semibold">{{ authStore.user.first_name }}</span>
              <span class="text-cx-muted text-xs">▾</span>
            </div>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="px-4 py-2 rounded-full bg-cx-ink text-white text-sm font-semibold hover:bg-cx-ink-soft transition-colors duration-200"
            >
              Войти
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
```

- [ ] **Step 3: Create AppFooter**

```vue
<!-- app/components/app/Footer.vue -->
<template>
  <footer class="border-t border-cx-line">
    <div class="max-w-[1180px] mx-auto px-10 py-12">
      <div class="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
        <div>
          <div class="font-extrabold text-lg tracking-tight mb-2">
            Chayroom <span class="text-cx-blue">AI</span>
          </div>
          <p class="text-sm text-cx-muted leading-relaxed max-w-[240px]">
            Закрытое сообщество для тех, кто хочет зарабатывать с помощью ИИ, внедрять его в работу и жизнь.
          </p>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-[.06em] uppercase text-cx-muted mb-3.5">Навигация</h4>
          <div class="flex flex-col gap-2">
            <a v-for="link in ['Курсы', 'Гайды', 'Тарифы', 'FAQ']" :key="link"
              class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">
              {{ link }}
            </a>
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-[.06em] uppercase text-cx-muted mb-3.5">Поддержка</h4>
          <div class="flex flex-col gap-2">
            <a class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">Написать в Telegram</a>
            <a class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">support@airoomclub.ru</a>
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-[.06em] uppercase text-cx-muted mb-3.5">Документы</h4>
          <div class="flex flex-col gap-2">
            <a v-for="doc in ['Политика конфиденциальности', 'Обработка персональных данных', 'Оферта']"
              :key="doc"
              class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">
              {{ doc }}
            </a>
          </div>
        </div>
      </div>
      <div class="border-t border-cx-line mt-10 pt-5 flex justify-between items-center">
        <span class="text-xs text-cx-faint">© 2026 Chayroom AI Club</span>
        <span class="text-xs text-cx-faint">Оплата через Tribute · Telegram</span>
      </div>
    </div>
  </footer>
</template>
```

- [ ] **Step 4: Open browser, check nav renders correctly**

```bash
pnpm dev
```

Open `http://localhost:3000`. Expected: white sticky navbar with brand, links, lang switcher, and "Войти" button. Footer at bottom.

- [ ] **Step 5: Commit**

```bash
git add app/app.vue app/components/app/
git commit -m "feat: add app shell — nav and footer with chayroom ai branding"
```

---

## Task 4: Shared UI components

**Files:**
- Create: `app/components/ui/EyebrowPill.vue`
- Create: `app/components/ui/SectionHeader.vue`

- [ ] **Step 1: Create EyebrowPill**

```vue
<!-- app/components/ui/EyebrowPill.vue -->
<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="inline-flex items-center gap-2 bg-white border border-cx-line px-3.5 py-2 rounded-full text-[11px] font-semibold tracking-[.07em] uppercase text-cx-ink">
    <span class="w-2 h-2 rounded-full bg-cx-blue shrink-0"></span>
    {{ label }}
  </div>
</template>
```

- [ ] **Step 2: Create SectionHeader**

```vue
<!-- app/components/ui/SectionHeader.vue -->
<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}>()
</script>

<template>
  <div :class="align === 'left' ? 'text-left' : 'text-center'">
    <div class="text-[11px] font-semibold tracking-[.08em] uppercase text-cx-muted mb-2.5">
      {{ eyebrow }}
    </div>
    <h2 class="text-[40px] font-extrabold tracking-[-0.025em] leading-[1.1] mb-3.5">{{ title }}</h2>
    <p v-if="subtitle" class="text-cx-muted text-base max-w-[520px]" :class="align === 'left' ? '' : 'mx-auto'">
      {{ subtitle }}
    </p>
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add app/components/ui/
git commit -m "feat: add EyebrowPill and SectionHeader shared components"
```

---

## Task 5: HeroSection

**Files:**
- Create: `app/components/landing/HeroSection.vue`

- [ ] **Step 1: Create HeroSection**

```vue
<!-- app/components/landing/HeroSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import teapotHero from '~/assets/images/24af7378-667c-4c7a-88d2-921d4008b6f3.png'

const titleRef = ref<HTMLElement>()
const subRef = ref<HTMLElement>()
const rotateRef = ref<HTMLElement>()
const ctaRef = ref<HTMLElement>()
const artRef = ref<HTMLElement>()
const keywordRef = ref<HTMLElement>()
const steamPaths = ref<SVGPathElement[]>([])

const keywords = ['AI-агенты', 'ChatGPT', 'Midjourney', 'Автоматизация', 'Sora', 'AI-инструменты']
const currentKeyword = ref(0)
let keywordInterval: ReturnType<typeof setInterval>

function nextKeyword() {
  if (!keywordRef.value) return
  gsap.to(keywordRef.value, {
    opacity: 0, y: -10, duration: 0.3,
    onComplete: () => {
      currentKeyword.value = (currentKeyword.value + 1) % keywords.length
      gsap.fromTo(keywordRef.value!, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 })
    }
  })
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  // Steam animation
  steamPaths.value.forEach((path, i) => {
    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 })
    function animateSteam() {
      const tl = gsap.timeline({ onComplete: animateSteam, delay: i * 0.55 })
      tl.to(path, { strokeDashoffset: -len * 0.1, opacity: 0.85, duration: 1.6 + i * 0.2, ease: 'power1.inOut' })
      tl.to(path, { opacity: 0, duration: 0.5, ease: 'power2.in' }, '-=0.3')
      tl.set(path, { strokeDashoffset: len, opacity: 0 })
      tl.to(path, { duration: 0.4 + i * 0.15 })
    }
    animateSteam()
  })

  // Hero entrance
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.from(titleRef.value!, { y: 40, opacity: 0, duration: 0.9 })
    .from(subRef.value!, { y: 24, opacity: 0, duration: 0.7 }, '-=.5')
    .from(rotateRef.value!, { y: 16, opacity: 0, duration: 0.5 }, '-=.4')
    .from(ctaRef.value!, { y: 16, opacity: 0, duration: 0.5 }, '-=.3')
    .from(artRef.value!, { x: 40, opacity: 0, duration: 0.9, ease: 'power2.out' }, '<-.6')

  // Rotating keyword
  keywordInterval = setInterval(nextKeyword, 2500)
})

onUnmounted(() => {
  clearInterval(keywordInterval)
})

function collectSteamPath(el: Element | null, i: number) {
  if (el) steamPaths.value[i] = el as SVGPathElement
}
</script>

<template>
  <div class="pt-8 overflow-x-hidden">
    <div class="max-w-[1180px] mx-auto px-10">
      <div class="grid grid-cols-[45%_1fr] items-center">
        <!-- Left: text -->
        <div ref="titleRef" class="flex flex-col gap-[22px] items-start pb-16 min-w-0">
          <UiEyebrowPill label="AI Room Club" />

          <h1 class="text-[clamp(48px,5vw,88px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            <span class="whitespace-nowrap">Chayroom <span class="text-cx-blue">AI</span></span>
          </h1>

          <p ref="subRef" class="text-[17px] leading-[1.6] text-cx-ink max-w-[420px]">
            Внедряй ИИ в работу и жизнь, создавай свои проекты и осваивай новые навыки вместе с сильным окружением.
          </p>

          <div ref="rotateRef" class="flex items-center gap-2.5 text-sm text-cx-muted min-h-[32px]">
            <span
              ref="keywordRef"
              class="bg-cx-blue-soft text-cx-blue px-3.5 py-[5px] rounded-full text-xs font-bold"
            >
              {{ keywords[currentKeyword] }}
            </span>
          </div>

          <div ref="ctaRef" class="flex gap-3 mt-1">
            <button
              class="px-[26px] py-3.5 rounded-full bg-cx-ink text-white font-semibold text-[15px] flex items-center gap-2 hover:bg-cx-ink-soft transition-colors duration-200 active:scale-[.98]"
              @click="$el.closest('main')?.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })"
            >
              Получить доступ →
            </button>
            <button class="px-[26px] py-3.5 rounded-full bg-white text-cx-ink font-semibold text-[15px] border border-cx-line flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200 active:scale-[.98]">
              ▶ Что меня ждёт
            </button>
          </div>
        </div>

        <!-- Right: art -->
        <div ref="artRef" class="flex items-end justify-start relative w-full overflow-visible">
          <!-- Radial glow -->
          <div class="absolute w-[85%] h-[85%] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style="background: radial-gradient(circle, #dde6ff 0%, rgba(220,230,255,0.18) 55%, transparent 72%)">
          </div>

          <!-- Image wrapper — overflows right edge -->
          <div class="relative z-10 w-[130%] mr-[-30%]">
            <img :src="teapotHero" alt="Chayroom AI teapot" class="w-full h-auto block relative z-10" />

            <!-- Steam SVG -->
            <svg
              viewBox="0 0 500 500"
              xmlns="http://www.w3.org/2000/svg"
              class="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
            >
              <defs>
                <filter id="blur1"><feGaussianBlur stdDeviation="2.5"/></filter>
                <filter id="blur2"><feGaussianBlur stdDeviation="1.8"/></filter>
              </defs>
              <path :ref="el => collectSteamPath(el as Element, 0)"
                d="M 118 320 C 110 295, 128 272, 116 248"
                fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="4" stroke-linecap="round" filter="url(#blur1)"/>
              <path :ref="el => collectSteamPath(el as Element, 1)"
                d="M 134 315 C 142 288, 124 264, 138 238"
                fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round" filter="url(#blur1)"/>
              <path :ref="el => collectSteamPath(el as Element, 2)"
                d="M 108 322 C 100 294, 114 268, 104 242"
                fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" stroke-linecap="round" filter="url(#blur2)"/>
              <path :ref="el => collectSteamPath(el as Element, 3)"
                d="M 146 318 C 154 290, 136 262, 150 234"
                fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-linecap="round" filter="url(#blur2)"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="max-w-[1180px] mx-auto px-10 pt-3 pb-9 flex justify-center">
      <div class="flex items-center gap-4 w-full max-w-[600px]">
        <div class="flex-1 h-px bg-cx-line"></div>
        <div class="w-2 h-2 rounded-full bg-cx-blue"></div>
        <span class="text-[22px] leading-none">✦</span>
        <div class="w-2 h-2 rounded-full bg-cx-blue"></div>
        <div class="flex-1 h-px bg-cx-line"></div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify hero renders in browser**

Open `http://localhost:3000`. Expected: large "Chayroom AI" title on one line (AI in blue), teapot image overflowing right, steam animation running, rotating keyword pill cycling.

- [ ] **Step 3: Commit**

```bash
git add app/components/landing/HeroSection.vue
git commit -m "feat: add hero section with teapot art, steam animation, gsap entrance"
```

---

## Task 6: ClubForYouSection and WhatInsideSection

**Files:**
- Create: `app/components/landing/ClubForYouSection.vue`
- Create: `app/components/landing/WhatInsideSection.vue`

- [ ] **Step 1: Create ClubForYouSection**

```vue
<!-- app/components/landing/ClubForYouSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const cards = [
  { num: '01', title: 'Хочешь зарабатывать с помощью ИИ', body: 'Ищешь навык на годы вперёд, который будет приносить стабильный доход. Работая над своими проектами или выполняя заказы для других.' },
  { num: '02', title: 'Владеешь бизнесом, но тонешь в операционке', body: 'Хочешь сократить расходы с помощью ИИ, оптимизировать бизнес-процессы или создать свою команду AI-сотрудников.' },
  { num: '03', title: 'Чувствуешь, что теряешь актуальность на рынке', body: 'Видишь, как другие эксперты уже внедряют ИИ и получают преимущество. Хочешь освоить новые инструменты.' },
  { num: '04', title: 'Хочешь идти в ногу со временем', body: 'Чувствуешь, что пора внедрять ИИ в свою жизнь, но пока не понимаешь с чего начать и как это поможет вырасти в доходе.' }
]

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.club-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out'
  })
})
</script>

<template>
  <section ref="sectionRef" class="py-16">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="Для кого" title="Наш клуб для тебя, если ты..." subtitle="Мы создали пространство для людей, которые хотят использовать ИИ как настоящее преимущество." class="mb-10" />
      <div class="grid grid-cols-2 gap-5">
        <div
          v-for="card in cards"
          :key="card.num"
          class="club-card bg-white border border-cx-line rounded-3xl p-8 shadow-card hover:-translate-y-0.5 hover:shadow-lift transition-all duration-200"
        >
          <div class="text-xs font-bold text-cx-blue tracking-[.04em] mb-3.5">{{ card.num }}</div>
          <div class="text-lg font-bold mb-2.5 leading-[1.3]">{{ card.title }}</div>
          <div class="text-sm text-cx-muted leading-[1.6]">{{ card.body }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Create WhatInsideSection**

```vue
<!-- app/components/landing/WhatInsideSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const features = [
  { icon: '🔧', title: 'Практические инструменты', body: 'Разбор самых актуальных инструментов на рынке AI под разные цели и задачи, а также чек-листы по внедрению.' },
  { icon: '📚', title: 'Курсы и гайды', body: 'Пошаговые инструкции с 0 — для бизнеса, работы, контента и повседневной жизни. Не просто теория, а конкретные мануалы.' },
  { icon: '💬', title: 'Закрытый чат AI Room Club', body: 'Общение с единомышленниками, у которых есть одна общая цель — сделать ИИ своим преимуществом в жизни и бизнесе.' },
  { icon: '⚡', title: 'Готовые связки', body: 'Ежедневно тестируем различные решения и делимся ими внутри нашего комьюнити.' },
  { icon: '🎙️', title: 'Прямые эфиры и воркшопы', body: 'Живые созвоны, ответы на вопросы, практические воркшопы, на которых мы вместе пробуем что-то сделать.' },
  { icon: '🚀', title: 'Свежие тренды из мира AI', body: 'Одними из первых узнаёте последние новости и тестируете всё самое интересное в нише искусственного интеллекта.' }
]

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.feature-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out'
  })
})
</script>

<template>
  <section ref="sectionRef" class="py-16 bg-white" id="features">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="Контент" title="Что внутри AI Room Club?" subtitle="И почему развиваться с нами — правильное решение" class="mb-12" />
      <div class="grid grid-cols-3 gap-[18px]">
        <div
          v-for="f in features"
          :key="f.title"
          class="feature-card bg-white border border-cx-line rounded-3xl p-7 px-6 flex flex-col gap-4 shadow-card hover:-translate-y-0.5 hover:shadow-lift transition-all duration-200"
        >
          <div class="w-11 h-11 rounded-xl bg-cx-blue-soft flex items-center justify-center text-xl">{{ f.icon }}</div>
          <div class="text-[17px] font-bold leading-[1.3]">{{ f.title }}</div>
          <div class="text-[13px] text-cx-muted leading-[1.6]">{{ f.body }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add app/components/landing/ClubForYouSection.vue app/components/landing/WhatInsideSection.vue
git commit -m "feat: add club-for-you and what's-inside sections"
```

---

## Task 7: AIUsageSection and PricingSection

**Files:**
- Create: `app/components/landing/AIUsageSection.vue`
- Create: `app/components/landing/PricingSection.vue`

- [ ] **Step 1: Create AIUsageSection**

```vue
<!-- app/components/landing/AIUsageSection.vue -->
<script setup lang="ts">
const usagePills = [
  { key: 'learning', label: 'Обучение', quote: 'ИИ превращает любую книгу в личного наставника — задавай вопросы, получай объяснения на своём уровне и учись в 10 раз быстрее.' },
  { key: 'content', label: 'Контент и блогинг', quote: 'Генерируй идеи, пиши черновики и создавай вирусный контент в разы быстрее с помощью AI-инструментов.' },
  { key: 'work', label: 'Работа и фриланс', quote: 'Автоматизируй рутинные задачи, пиши письма и отчёты за минуты — освободи время для важного.' },
  { key: 'business', label: 'Бизнес и команды', quote: 'Оптимизируй процессы, создавай AI-ассистентов для команды и снижай операционные расходы.' },
  { key: 'sales', label: 'Продажи и лиды', quote: 'Пиши продающие тексты, анализируй клиентов и автоматизируй воронку продаж с помощью ИИ.' },
  { key: 'sites', label: 'Сайты и сервисы', quote: 'Собирай полноценные веб-приложения и лендинги без глубокого знания кода.' },
  { key: 'agents', label: 'AI-агенты', quote: 'Создавай автономных AI-сотрудников, которые выполняют задачи без твоего участия.' },
  { key: 'travel', label: 'Путешествия', quote: 'Планируй маршруты, бронируй жильё и находи лучшие цены с персональным AI-ассистентом.' },
  { key: 'health', label: 'Здоровье', quote: 'Анализируй свои показатели, составляй планы питания и тренировок с поддержкой AI.' },
  { key: 'finance', label: 'Финансы', quote: 'Анализируй расходы, ищи инвестиционные возможности и планируй бюджет с помощью ИИ.' },
  { key: 'research', label: 'Исследования', quote: 'Обрабатывай большие объёмы информации, находи паттерны и делай выводы быстрее.' },
  { key: 'communication', label: 'Коммуникация', quote: 'Пиши чёткие и убедительные сообщения, переводи тексты и адаптируй стиль под аудиторию.' },
  { key: 'brand', label: 'Личный бренд', quote: 'Строй экспертный образ, создавай контент-стратегию и расти как эксперт в своей нише.' }
]

const active = ref(usagePills[0].key)
const activeQuote = computed(() => usagePills.find(p => p.key === active.value)?.quote ?? '')
</script>

<template>
  <section class="py-16 bg-cx-surface">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="Применение" title="Как и где применить AI" subtitle="Десятки способов упростить себе жизнь, улучшить проекты и открыть новые возможности." class="mb-12" />
      <div class="flex flex-wrap gap-2.5 justify-center max-w-full">
        <button
          v-for="pill in usagePills"
          :key="pill.key"
          :class="[
            'px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200',
            active === pill.key
              ? 'bg-cx-ink text-white border-cx-ink'
              : 'bg-white text-cx-ink border-cx-line hover:bg-cx-ink hover:text-white hover:border-cx-ink'
          ]"
          @click="active = pill.key"
        >
          {{ pill.label }}
        </button>
      </div>
      <div class="mt-8 text-center p-6 px-8 bg-white border border-cx-line rounded-[20px] max-w-full">
        <div class="text-[11px] font-semibold tracking-[.06em] uppercase text-cx-blue mb-2.5">
          AI о теме «{{ usagePills.find(p => p.key === active)?.label }}»
        </div>
        <p class="text-base leading-[1.6] text-cx-ink">«{{ activeQuote }}»</p>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Create PricingSection**

```vue
<!-- app/components/landing/PricingSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const plans = [
  {
    period: '1 Месяц',
    desc: 'Сможешь попробовать и протестировать',
    oldPrice: '1 990 ₽',
    price: '1 490 ₽',
    unit: '/мес',
    featured: false,
    badge: null,
    savings: null,
    telegramLink: 'https://t.me/'
  },
  {
    period: '3 Месяца',
    desc: 'Достаточно времени, чтобы увидеть результаты',
    oldPrice: '4 470 ₽',
    price: '3 790 ₽',
    unit: '/3 мес',
    featured: true,
    badge: 'Выгодный и Популярный',
    savings: 'Экономия 15%',
    telegramLink: 'https://t.me/'
  },
  {
    period: '6 Месяцев',
    desc: 'Максимальный фокус на внедрении AI',
    oldPrice: '8 940 ₽',
    price: '7 150 ₽',
    unit: '/6 мес',
    featured: false,
    badge: null,
    savings: 'Экономия 20%',
    telegramLink: 'https://t.me/'
  }
]

const features = ['Все курсы и гайды', 'Закрытый чат AI Room Club', 'Разборы AI-инструментов', 'Пошаговые инструкции', 'Доступ к новым материалам']

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.price-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out'
  })
})
</script>

<template>
  <section ref="sectionRef" class="py-16" id="pricing">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="Тарифы" title="Выбери свой формат" subtitle="Подписка — доступно, удобно и выгодно. Без скрытых условий." class="mb-12" />
      <div class="grid grid-cols-3 gap-5">
        <div
          v-for="plan in plans"
          :key="plan.period"
          :class="[
            'price-card relative bg-white border rounded-3xl p-8 shadow-card',
            plan.featured ? 'border-cx-blue shadow-blue' : 'border-cx-line'
          ]"
        >
          <div v-if="plan.badge" class="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-cx-blue text-white text-[11px] font-bold px-3.5 py-1 rounded-full tracking-[.04em] whitespace-nowrap">
            {{ plan.badge }}
          </div>
          <div class="text-[13px] font-semibold text-cx-muted uppercase tracking-[.04em] mb-2">{{ plan.period }}</div>
          <div class="text-[13px] text-cx-muted mb-5">{{ plan.desc }}</div>
          <div class="text-sm text-cx-faint line-through mb-0.5">{{ plan.oldPrice }}</div>
          <div class="text-[40px] font-extrabold tracking-[-0.03em] leading-none">{{ plan.price }}</div>
          <div class="text-sm text-cx-muted mt-1 mb-6 flex items-center gap-1.5">
            {{ plan.unit }}
            <span v-if="plan.savings" class="bg-cx-blue-soft text-cx-blue text-[11px] font-bold px-2.5 py-0.5 rounded-full">{{ plan.savings }}</span>
          </div>
          <ul class="flex flex-col gap-2.5 mb-7">
            <li v-for="feat in features" :key="feat" class="flex items-center gap-2.5 text-sm">
              <span class="w-[18px] h-[18px] rounded-full bg-cx-blue-soft flex items-center justify-center shrink-0">
                <svg class="w-3 h-3 text-cx-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </span>
              {{ feat }}
            </li>
          </ul>
          <a
            :href="plan.telegramLink"
            target="_blank"
            :class="[
              'w-full flex justify-center items-center px-6 py-3.5 rounded-full font-semibold text-[15px] transition-colors duration-200',
              plan.featured
                ? 'bg-cx-ink text-white hover:bg-cx-ink-soft'
                : 'bg-white text-cx-ink border border-cx-line hover:bg-gray-50'
            ]"
          >
            Купить в Telegram →
          </a>
        </div>
      </div>
      <p class="text-center mt-4 text-xs text-cx-faint">
        Оплата через Tribute в Telegram. Доступ активируется автоматически после оплаты.
      </p>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add app/components/landing/AIUsageSection.vue app/components/landing/PricingSection.vue
git commit -m "feat: add AI usage pills section and pricing section"
```

---

## Task 8: SkillsSection

**Files:**
- Create: `app/components/landing/SkillsSection.vue`

- [ ] **Step 1: Create SkillsSection**

```vue
<!-- app/components/landing/SkillsSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'

const skills = [
  { num: '01', title: 'Работать с AI-ассистентами', body: 'Эффективно общаться с ChatGPT, Claude и другими моделями, чтобы получать нужный результат с первого раза.' },
  { num: '02', title: 'Создавать AI-агентов', body: 'Строить автономных агентов, которые выполняют задачи самостоятельно: исследуют, пишут, публикуют.' },
  { num: '03', title: 'Автоматизировать рутину', body: 'Настраивать потоки автоматизации с Make, n8n и Zapier, чтобы освободить десятки часов в месяц.' },
  { num: '04', title: 'Генерировать контент', body: 'Создавать тексты, изображения, видео и голос с помощью AI-инструментов для любых платформ.' },
  { num: '05', title: 'Строить сайты без кода', body: 'Собирать полноценные веб-приложения, лендинги и сервисы с помощью vibe-coding подхода.' },
  { num: '06', title: 'Писать промпты профессионально', body: 'Создавать системные промпты и знать методологии, которые дают стабильный и предсказуемый результат.' },
  { num: '07', title: 'Монетизировать AI-навыки', body: 'Продавать услуги на основе ИИ: автоматизацию, контент, агентов, консалтинг.' },
  { num: '08', title: 'Внедрять ИИ в бизнес', body: 'Находить точки применения ИИ в бизнес-процессах и внедрять их системно.' },
  { num: '09', title: 'Создавать AI-воронки', body: 'Строить маркетинговые воронки с AI-персонализацией, от первого контакта до продажи.' }
]

const ITEMS_PER_PAGE = 2
const totalPages = computed(() => Math.ceil(skills.length / ITEMS_PER_PAGE))
const currentPage = ref(0)
const trackRef = ref<HTMLElement>()

function goToPage(page: number) {
  if (!trackRef.value) return
  const containerWidth = trackRef.value.parentElement!.offsetWidth
  gsap.to(trackRef.value, { x: -(containerWidth * page), duration: 0.5, ease: 'power2.out' })
  currentPage.value = page
}

function prev() { if (currentPage.value > 0) goToPage(currentPage.value - 1) }
function next() { if (currentPage.value < totalPages.value - 1) goToPage(currentPage.value + 1) }

function skillsForPage(page: number) {
  return skills.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE)
}
</script>

<template>
  <section class="py-16 bg-cx-surface">
    <div class="max-w-[1180px] mx-auto px-10">
      <div class="flex justify-between items-center mb-8">
        <UiSectionHeader eyebrow="Навыки" title="Чему ты научишься в нашем сообществе?" align="left" class="[&_h2]:text-[36px]" />
        <div class="flex gap-2 shrink-0">
          <button
            :class="['w-10 h-10 rounded-full bg-white border border-cx-line flex items-center justify-center text-base transition-colors duration-200', currentPage === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer']"
            :disabled="currentPage === 0"
            @click="prev"
          >←</button>
          <button
            :class="['w-10 h-10 rounded-full bg-white border border-cx-line flex items-center justify-center text-base transition-colors duration-200', currentPage === totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer']"
            :disabled="currentPage === totalPages - 1"
            @click="next"
          >→</button>
        </div>
      </div>

      <div class="overflow-hidden">
        <div ref="trackRef" class="flex" :style="{ width: `${totalPages * 100}%` }">
          <div
            v-for="page in totalPages"
            :key="page"
            class="grid grid-cols-2 gap-5"
            :style="{ width: `${100 / totalPages}%` }"
          >
            <div
              v-for="skill in skillsForPage(page - 1)"
              :key="skill.num"
              class="bg-white border border-cx-line rounded-3xl p-8 shadow-card"
            >
              <div class="text-[32px] font-extrabold text-cx-line mb-4">{{ skill.num }}</div>
              <div class="text-[19px] font-bold mb-2.5 leading-[1.3]">{{ skill.title }}</div>
              <div class="text-sm text-cx-muted leading-[1.6]">{{ skill.body }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dots -->
      <div class="flex gap-1.5 justify-center mt-5">
        <button
          v-for="i in totalPages"
          :key="i"
          :class="[
            'rounded-full transition-all duration-200',
            currentPage === i - 1 ? 'w-5 h-2 bg-cx-ink' : 'w-2 h-2 bg-cx-line hover:bg-cx-muted'
          ]"
          @click="goToPage(i - 1)"
        ></button>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/landing/SkillsSection.vue
git commit -m "feat: add skills slider section with gsap page transitions"
```

---

## Task 9: GuidesBannerSection, FAQSection, FinalCTASection

**Files:**
- Create: `app/components/landing/GuidesBannerSection.vue`
- Create: `app/components/landing/FAQSection.vue`
- Create: `app/components/landing/FinalCTASection.vue`

- [ ] **Step 1: Create GuidesBannerSection**

```vue
<!-- app/components/landing/GuidesBannerSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
const bannerRef = ref<HTMLElement>()
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(bannerRef.value!, {
    scrollTrigger: { trigger: bannerRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, ease: 'power2.out'
  })
})
</script>

<template>
  <section class="py-16" id="guides">
    <div class="max-w-[1180px] mx-auto px-10">
      <div ref="bannerRef" class="bg-cx-ink rounded-[28px] p-14 px-16 grid grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <h2 class="text-[36px] font-extrabold text-white tracking-[-0.02em] mb-2.5">Бесплатные гайды</h2>
          <p class="text-base text-white/60 max-w-[480px] leading-[1.5]">Практические руководства о том, как сделать AI частью своей жизни, работы и бизнеса.</p>
        </div>
        <button class="shrink-0 px-[26px] py-3.5 rounded-full bg-white text-cx-ink font-semibold text-[15px] hover:bg-gray-100 transition-colors duration-200 active:scale-[.98]">
          Открыть →
        </button>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Create FAQSection**

```vue
<!-- app/components/landing/FAQSection.vue -->
<script setup lang="ts">
const items = [
  { q: 'Это сообщество для новичков или для тех, кто уже в теме?', a: 'Для всех. Если ты новичок — получишь понятный путь с нуля. Если уже знаком с ИИ — найдёшь продвинутые инструменты, свежие тренды и сообщество единомышленников.' },
  { q: 'Нужно ли уметь программировать?', a: 'Нет. Большинство инструментов и подходов, которые мы разбираем, не требуют навыков программирования.' },
  { q: 'Что я получу внутри?', a: 'Курсы и гайды, закрытый чат, разборы AI-инструментов, готовые связки, прямые эфиры и воркшопы.' },
  { q: 'Подойдёт ли мне, если я предприниматель?', a: 'Да. Мы специально включаем материалы по автоматизации бизнес-процессов и созданию AI-команд.' },
  { q: 'Как устроена оплата?', a: 'Оплата через Tribute в Telegram. Доступ активируется автоматически сразу после оплаты.' }
]

const openIndex = ref<number | null>(0)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section class="py-16" id="faq">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="" title="Частые вопросы" subtitle="Отвечаем на самые популярные вопросы" class="mb-10" />
      <div class="flex flex-col gap-1 max-w-[780px] mx-auto">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="border border-cx-line rounded-2xl overflow-hidden bg-white"
        >
          <button
            class="w-full px-6 py-5 font-semibold text-[15px] flex justify-between items-center text-left cursor-pointer"
            @click="toggle(i)"
          >
            {{ item.q }}
            <span :class="['text-lg text-cx-muted transition-transform duration-200', openIndex === i ? 'rotate-180' : '']">▾</span>
          </button>
          <div
            :class="[
              'overflow-hidden transition-all duration-300',
              openIndex === i ? 'max-h-40' : 'max-h-0'
            ]"
          >
            <div class="px-6 pb-5 text-sm text-cx-muted leading-[1.6]">{{ item.a }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Create FinalCTASection**

```vue
<!-- app/components/landing/FinalCTASection.vue -->
<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
const sectionRef = ref<HTMLElement>()
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!, {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, ease: 'power2.out'
  })
})
</script>

<template>
  <section ref="sectionRef" class="bg-cx-surface">
    <div class="max-w-[1180px] mx-auto px-10 py-20 text-center">
      <h2 class="text-[48px] font-extrabold tracking-[-0.03em] mb-4 leading-[1.1]">Готовы начать?</h2>
      <p class="text-[17px] text-cx-muted max-w-[480px] mx-auto mb-9 leading-[1.6]">Вступай в сообщество и начни внедрять ИИ в свою жизнь, работу и бизнес уже сегодня.</p>
      <button
        class="px-8 py-4 rounded-full bg-cx-ink text-white font-semibold text-base hover:bg-cx-ink-soft transition-colors duration-200 active:scale-[.98]"
        @click="document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })"
      >
        Получить доступ →
      </button>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add app/components/landing/GuidesBannerSection.vue app/components/landing/FAQSection.vue app/components/landing/FinalCTASection.vue
git commit -m "feat: add guides banner, faq accordion, final cta sections"
```

---

## Task 10: Landing page index.vue

**Files:**
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Replace index.vue with composed landing page**

```vue
<!-- app/pages/index.vue -->
<template>
  <main>
    <LandingHeroSection />
    <LandingClubForYouSection />
    <LandingWhatInsideSection />
    <LandingAIUsageSection />
    <LandingPricingSection />
    <LandingSkillsSection />
    <LandingGuidesBannerSection />
    <LandingFAQSection />
    <LandingFinalCTASection />
  </main>
</template>
```

- [ ] **Step 2: Open browser and verify full landing page renders**

```bash
pnpm dev
```

Open `http://localhost:3000`. Scroll through all sections. Expected:
- Hero with teapot art and steam animation
- 4 club cards, 6 feature cards
- Interactive pills updating the AI quote
- 3 pricing cards (middle one highlighted in blue)
- Skills slider with prev/next buttons and dots
- Dark guides banner
- FAQ accordion (first item open)
- Final CTA

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat: compose full landing page from all sections"
```

---

## Task 11: Login page

**Files:**
- Create: `app/pages/login.vue`

- [ ] **Step 1: Create login.vue**

```vue
<!-- app/pages/login.vue -->
<script setup lang="ts">
const authStore = useAuthStore()

// Redirect if already logged in
if (authStore.user) {
  navigateTo('/dashboard')
}

// Telegram widget callback (must be on window)
onMounted(() => {
  (window as any).onTelegramAuth = (user: any) => {
    authStore.login(user)
    navigateTo('/dashboard')
  }
})

useSeoMeta({ title: 'Войти — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white px-4">
    <div class="w-full max-w-[400px]">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2.5 mb-4">
          <div class="w-10 h-10 bg-cx-ink rounded-[10px] flex items-center justify-center">
            <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <span class="font-extrabold text-xl tracking-tight">Chayroom <span class="text-cx-blue">AI</span></span>
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight mb-2">Войди через Telegram</h1>
        <p class="text-sm text-cx-muted max-w-[300px] mx-auto leading-relaxed">
          Мы получаем только имя, аватар и Telegram ID для входа на сайт.
        </p>
      </div>

      <!-- Telegram widget container -->
      <div class="flex flex-col items-center gap-5">
        <div id="telegram-widget-container">
          <!-- Production: Telegram Login Widget script loads here -->
          <script
            async
            src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login="ChayroomAIBot"
            data-size="large"
            data-onauth="onTelegramAuth(user)"
            data-request-access="write"
          ></script>
        </div>

        <!-- Dev-only bypass -->
        <div v-if="$dev" class="text-center">
          <div class="text-xs text-cx-faint mb-2">— dev only —</div>
          <button
            class="px-5 py-2 rounded-full bg-cx-blue text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            @click="authStore.devLogin(); navigateTo('/dashboard')"
          >
            Dev login (mock)
          </button>
        </div>

        <p class="text-xs text-cx-faint text-center mt-2">
          Не приходит подтверждение?
          <a href="https://t.me/ChayroomAI" target="_blank" class="text-cx-blue hover:underline">Написать в поддержку</a>
        </p>
      </div>
    </div>
  </div>
</template>
```

> **Note:** Replace `ChayroomAIBot` with the actual registered bot username. The `$dev` flag comes from Nuxt's runtime and is `true` only in development mode.

- [ ] **Step 2: Verify login page renders**

Open `http://localhost:3000/login`. Expected: centered card with Chayroom AI logo, Telegram widget button, and dev login button in development.

- [ ] **Step 3: Commit**

```bash
git add app/pages/login.vue
git commit -m "feat: add login page with telegram widget and dev mock auth"
```

---

## Task 12: Dashboard page

**Files:**
- Create: `app/pages/dashboard.vue`

- [ ] **Step 1: Create dashboard.vue**

```vue
<!-- app/pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const user = computed(() => authStore.user!)

const stats = [
  { label: 'Курсов пройдено', value: '3', icon: '📚' },
  { label: 'Дней в клубе', value: '14', icon: '🗓️' },
  { label: 'Гайдов прочитано', value: '12', icon: '📖' }
]

const courses = [
  { title: 'ChatGPT с нуля до профи', progress: 75, tag: 'AI-ассистенты', color: 'bg-cx-blue-soft text-cx-blue' },
  { title: 'Автоматизация с Make', progress: 40, tag: 'Автоматизация', color: 'bg-green-100 text-green-700' },
  { title: 'Создание AI-агентов', progress: 10, tag: 'AI-агенты', color: 'bg-purple-100 text-purple-700' },
  { title: 'Midjourney: генерация изображений', progress: 0, tag: 'Контент', color: 'bg-orange-100 text-orange-700' }
]

useSeoMeta({ title: 'Панель — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen bg-[#F8F8FA]">
    <div class="max-w-[1180px] mx-auto px-10 py-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">
            Привет, {{ user.first_name }} 👋
          </h1>
          <p class="text-cx-muted mt-1">Добро пожаловать в AI Room Club</p>
        </div>
        <button
          class="px-4 py-2 rounded-full text-sm font-semibold border border-cx-line text-cx-muted hover:text-cx-ink transition-colors duration-200"
          @click="authStore.logout(); navigateTo('/')"
        >
          Выйти
        </button>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-5 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white border border-cx-line rounded-3xl p-6 shadow-card flex items-center gap-4"
        >
          <div class="w-12 h-12 rounded-2xl bg-cx-blue-soft flex items-center justify-center text-2xl">{{ stat.icon }}</div>
          <div>
            <div class="text-[28px] font-extrabold tracking-tight leading-none">{{ stat.value }}</div>
            <div class="text-sm text-cx-muted mt-0.5">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-[1fr_360px] gap-6">
        <!-- Courses -->
        <div class="bg-white border border-cx-line rounded-3xl p-7 shadow-card">
          <h2 class="text-xl font-bold mb-5">Мои курсы</h2>
          <div class="flex flex-col gap-5">
            <div
              v-for="course in courses"
              :key="course.title"
              class="flex flex-col gap-2.5"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full', course.color]">{{ course.tag }}</span>
                  <span class="text-sm font-semibold">{{ course.title }}</span>
                </div>
                <span class="text-sm font-semibold text-cx-muted">{{ course.progress }}%</span>
              </div>
              <div class="h-2 bg-[#F0F0F3] rounded-full overflow-hidden">
                <div
                  class="h-full bg-cx-blue rounded-full transition-all duration-500"
                  :style="{ width: `${course.progress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Telegram community card -->
        <div class="bg-cx-ink rounded-3xl p-7 flex flex-col justify-between text-white">
          <div>
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl mb-4">💬</div>
            <h3 class="text-xl font-bold mb-2">AI Room Club</h3>
            <p class="text-sm text-white/60 leading-relaxed">Закрытый Telegram-чат сообщества. Общайся с единомышленниками, задавай вопросы и делись результатами.</p>
          </div>
          <a
            href="https://t.me/airoomclub"
            target="_blank"
            class="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white text-cx-ink font-semibold text-sm hover:bg-gray-100 transition-colors duration-200"
          >
            Открыть в Telegram →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Test protected route**

1. Go to `http://localhost:3000/dashboard` — should redirect to `/login`
2. Click "Dev login (mock)" on login page — should redirect to `/dashboard` and show Behruz's name
3. Verify stats, courses grid, and Telegram card render correctly

- [ ] **Step 3: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat: add dashboard page with stats, courses, and telegram community card"
```

---

## Task 13: Final wiring — delete starter components, typecheck, build

**Files:**
- Delete: `app/components/AppLogo.vue` (starter template)
- Delete: `app/components/TemplateMenu.vue` (starter template)

- [ ] **Step 1: Remove starter template components**

```bash
rm app/components/AppLogo.vue app/components/TemplateMenu.vue
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Run build to catch any SSR issues**

```bash
pnpm build
```

Expected: build completes successfully.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete chayroom ai landing page, login, and dashboard"
```

---

## Notes for implementer

- **Tailwind v4 arbitrary values:** Use `w-[130%]`, `mr-[-30%]`, `text-[clamp(48px,5vw,88px)]` for values not in the default scale.
- **`$dev` in templates:** Use `import.meta.dev` in `<script setup>` and expose it — `const isDev = import.meta.dev` — then use `v-if="isDev"` in templates. The `$dev` shorthand may not auto-inject.
- **Telegram bot name:** Replace `ChayroomAIBot` in `login.vue` with the actual registered bot username before going to production.
- **GSAP `from()` and opacity:** GSAP sets `opacity: 0` inline before animating. Do not set `opacity-0` in Tailwind on the same elements or they'll conflict on completion.
- **Nuxt auto-imports:** `ref`, `computed`, `onMounted`, `onUnmounted`, `defineStore`, `navigateTo`, `useHead`, `useSeoMeta`, `definePageMeta`, `useAuthStore`, `useLocaleStore` are all auto-imported. No explicit imports needed in `<script setup>` except for GSAP and image assets.
