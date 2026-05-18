# Course Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Foydalanuvchi kursni bosganda `/courses/[slug]` sahifasiga o'tadi — kurs header, modul accordion, sticky sidebar (stats + obuna CTA).

**Architecture:** `app/pages/courses.vue` → `app/pages/courses/index.vue` ga ko'chiriladi (Nuxt nested route muammosini oldini olish uchun). `app/pages/courses/[slug].vue` yangi fayl sifatida yaratiladi. `dashboard.vue` kurs kartalari NuxtLink ga o'zgartiriladi. Kurs ma'lumotlari (modulesList) detail sahifaning o'zida saqlanadi.

**Tech Stack:** Vue 3 (Composition API), Nuxt 4, Tailwind CSS v4, `useRoute`, `createError`

---

### Task 1: `courses.vue` → `courses/index.vue` ga ko'chirish va slug qo'shish

**Files:**
- Create: `app/pages/courses/index.vue` (courses.vue tarkibi + slug + NuxtLink)
- Delete: `app/pages/courses.vue`

- [ ] **Step 1: `app/pages/courses/` papkasini yaratish va faylni ko'chirish**

```bash
mkdir -p /Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/app/pages/courses
cp /Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/app/pages/courses.vue \
   /Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/app/pages/courses/index.vue
```

- [ ] **Step 2: `courses/index.vue` da har bir kursga `slug` maydoni qo'shish**

`courses/index.vue` script qismidagi `courses` array'ni quyidagicha yangilang (faqat `slug` maydoni qo'shiladi):

```ts
const courses = [
  {
    slug: 'hermes-ai-agent',
    title: 'Hermes asosida AI agent yaratish va sozlash',
    desc: "Bu kursda biz noldan agent yaratamiz, unga ko'nikmalar va yaxshilanishlar qo'shamiz.",
    tags: ['AI', 'AI agent', 'Hermes'],
    category: 'AI agentlar',
    level: "Boshlang'ich",
    levelColor: '#22c55e',
    modules: 3,
    lessons: 7,
    duration: '~2h',
    bg: '#f0f4ff',
    dark: false,
    badge: 'kurs',
    accentTitle: ['AI agent', 'Hermes'],
    accentColor: '#0075DE'
  },
  {
    slug: 'vibe-coding',
    title: 'Vibe coding noldan',
    desc: 'Kod bilmasdan turib AI yordamida kerakli digital yechimlar: saytlar, vositalar va ilovalar yaratish.',
    tags: ['Vibe coding'],
    category: 'Vibe coding',
    level: "Boshlang'ich",
    levelColor: '#22c55e',
    modules: 5,
    lessons: 31,
    duration: '~8h',
    bg: '#0d1117',
    dark: true,
    badge: 'kurs',
    accentTitle: [],
    accentColor: '#f97316'
  }
]
```

- [ ] **Step 3: Karta tugmasini `NuxtLink` ga almashtirish**

`courses/index.vue` template qismida kurs kartasidagi tugmani toping:

```html
<button class="btn-primary w-full text-[13px]! py-2.5!">
  <span>Kursni ko'rish</span>
  <span class="btn-arrow">→</span>
</button>
```

Uni quyidagicha almashtiring:

```html
<NuxtLink
  :to="`/courses/${course.slug}`"
  class="btn-primary w-full text-[13px]! py-2.5! flex items-center justify-center gap-2"
>
  <span>Kursni ko'rish</span>
  <span class="btn-arrow">→</span>
</NuxtLink>
```

- [ ] **Step 4: Eski `courses.vue` faylini o'chirish**

```bash
rm /Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/app/pages/courses.vue
```

- [ ] **Step 5: Vizual tekshirish**

`pnpm dev` ishga tushiring. `/courses` sahifasi avvalgidek ishlashi kerak. Kurs kartasidagi tugma endi link bo'ladi.

- [ ] **Step 6: Commit**

```bash
git add app/pages/courses/
git rm app/pages/courses.vue
git commit -m "refactor: move courses.vue to courses/index.vue, add slug field, update card to NuxtLink"
```

---

### Task 2: `dashboard.vue` kurs kartalarini NuxtLink ga o'zgartirish

**Files:**
- Modify: `app/pages/dashboard.vue`

Dashboard'da `courses` array'da slug yo'q. Sluglarni qo'shib, kartalarni kliklanadigan qilamiz.

- [ ] **Step 1: `dashboard.vue` script qismidagi `courses` array'ga `slug` qo'shish**

```ts
const courses = [
  {
    title: 'Hermes asosida AI agent yaratish va sozlash',
    desc: "Bu kursda biz noldan agent yaratamiz, unga ko'nikmalar va yaxshilanishlar qo'shamiz.",
    tags: ['AI', 'AI agent', 'Hermes'],
    slug: 'hermes-ai-agent',
    free: true,
    progress: 0,
  },
  {
    title: 'Vibe coding noldan',
    desc: "Kod bilmasdan kerakli digital yechimlar: saytlar, vositalar va ilovalarni yaratish.",
    tags: ['Vibe coding'],
    slug: 'vibe-coding',
    free: true,
    progress: 100,
  },
]
```

- [ ] **Step 2: Kurs kartasini NuxtLink ga o'rash**

`dashboard.vue` template qismida kurs kartasini toping:

```html
<div
  v-for="course in courses"
  :key="course.title"
  class="group bg-[#f8f8fa] border border-cx-line rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] cursor-pointer"
>
```

Uni quyidagicha almashtiring:

```html
<NuxtLink
  v-for="course in courses"
  :key="course.title"
  :to="`/courses/${course.slug}`"
  class="group bg-[#f8f8fa] border border-cx-line rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] cursor-pointer block"
>
```

Yopuvchi `</div>` ni ham `</NuxtLink>` ga o'zgartiring.

- [ ] **Step 3: Vizual tekshirish**

`/dashboard` sahifasida kurs kartalariga bosish `/courses/hermes-ai-agent` ga yo'naltirishi kerak (hozircha 404 bo'ladi — Task 3 da sahifa yaratiladi).

- [ ] **Step 4: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat: make dashboard course cards link to course detail page"
```

---

### Task 3: `app/pages/courses/[slug].vue` — kurs detail sahifasi

**Files:**
- Create: `app/pages/courses/[slug].vue`

- [ ] **Step 1: Faylni yaratish — to'liq kod**

`app/pages/courses/[slug].vue` faylini quyidagi to'liq kod bilan yarating:

```vue
<script setup lang="ts">
const route = useRoute()
const hasSubscription = ref(false)

interface Lesson {
  title: string
  type: string
  duration: string
  free: boolean
}

interface CourseModule {
  title: string
  subtitle: string
  duration: string
  lessons: Lesson[]
}

interface CourseDetail {
  slug: string
  title: string
  desc: string
  tags: string[]
  level: string
  levelColor: string
  rating: number
  participants: number
  duration: string
  modules: number
  lessons: number
  modulesList: CourseModule[]
}

const allCourses: CourseDetail[] = [
  {
    slug: 'hermes-ai-agent',
    title: 'Hermes asosida AI agent yaratish va sozlash',
    desc: "Bu kursda biz noldan agent yaratamiz, unga ko'nikmalar va yaxshilanishlar qo'shamiz.",
    tags: ['AI', 'AI agent', 'Hermes'],
    level: "Boshlang'ich",
    levelColor: '#22c55e',
    rating: 0,
    participants: 0,
    duration: '~2h',
    modules: 3,
    lessons: 7,
    modulesList: [
      {
        title: 'Agent yaratish',
        subtitle: 'Baza',
        duration: '~15m',
        lessons: [
          { title: 'Hermes asosida agent yaratish: tayyor assistant', type: 'Amaliy', duration: '15 min', free: false },
        ]
      },
      {
        title: 'Agentni yaxshilash va sozlash',
        subtitle: "Ko'nikmalar qo'shish",
        duration: '~40m',
        lessons: [
          { title: "Agentga yangi ko'nikma qo'shish", type: 'Amaliy', duration: '10 min', free: false },
          { title: 'Agentlar orasida muloqot', type: 'Nazariy', duration: '8 min', free: false },
          { title: "Ikkinchi agent qo'shish", type: 'Amaliy', duration: '12 min', free: false },
          { title: 'Agent xotirasini sozlash', type: 'Amaliy', duration: '10 min', free: false },
        ]
      },
      {
        title: 'AI Office',
        subtitle: 'Agentlar ofisi',
        duration: '~20m',
        lessons: [
          { title: 'Agentlar tizimini loyihalash', type: 'Nazariy', duration: '10 min', free: false },
          { title: 'AI Office yaratish', type: 'Amaliy', duration: '10 min', free: false },
        ]
      }
    ]
  },
  {
    slug: 'vibe-coding',
    title: 'Vibe coding noldan',
    desc: "Kod bilmasdan kerakli digital yechimlar: saytlar, vositalar va ilovalarni yaratish.",
    tags: ['Vibe coding'],
    level: "Boshlang'ich",
    levelColor: '#22c55e',
    rating: 0,
    participants: 0,
    duration: '~8h',
    modules: 5,
    lessons: 31,
    modulesList: [
      {
        title: 'Kirish va asoslar',
        subtitle: 'Baza',
        duration: '~45m',
        lessons: [
          { title: 'Vibe coding nima va u qanday ishlaydi', type: 'Nazariy', duration: '10 min', free: false },
          { title: "AI vositalarini tanlash va sozlash", type: 'Amaliy', duration: '15 min', free: false },
          { title: 'Birinchi loyihangizni boshlash', type: 'Amaliy', duration: '20 min', free: false },
        ]
      },
      {
        title: 'Sayt yaratish',
        subtitle: 'Landing page',
        duration: '~1h20m',
        lessons: [
          { title: 'Landing page strukturasi', type: 'Nazariy', duration: '10 min', free: false },
          { title: "AI yordamida dizayn yaratish", type: 'Amaliy', duration: '15 min', free: false },
          { title: "Saytga kontent qo'shish", type: 'Amaliy', duration: '12 min', free: false },
          { title: 'Mobilga moslash', type: 'Amaliy', duration: '10 min', free: false },
          { title: 'Saytni deploy qilish', type: 'Amaliy', duration: '15 min', free: false },
          { title: "Domain ulash", type: 'Amaliy', duration: '10 min', free: false },
        ]
      },
      {
        title: 'Web ilovalar',
        subtitle: 'App yaratish',
        duration: '~1h44m',
        lessons: [
          { title: 'Ilova arxitekturasi', type: 'Nazariy', duration: '12 min', free: false },
          { title: 'Frontend yaratish', type: 'Amaliy', duration: '20 min', free: false },
          { title: 'Backend logikasi', type: 'Amaliy', duration: '18 min', free: false },
          { title: "Ma'lumotlar bazasi", type: 'Amaliy', duration: '15 min', free: false },
          { title: 'Autentifikatsiya', type: 'Amaliy', duration: '12 min', free: false },
          { title: 'Ilovani deploy qilish', type: 'Amaliy', duration: '15 min', free: false },
          { title: "To'lov tizimini ulash", type: 'Amaliy', duration: '12 min', free: false },
        ]
      },
      {
        title: 'AI vositalar',
        subtitle: 'Avtomatlashtirish',
        duration: '~1h38m',
        lessons: [
          { title: "AI bilan avtomatlashtirish nima", type: 'Nazariy', duration: '8 min', free: false },
          { title: 'Telegram bot yaratish', type: 'Amaliy', duration: '20 min', free: false },
          { title: 'GPT API ulash', type: 'Amaliy', duration: '15 min', free: false },
          { title: 'n8n workflow yaratish', type: 'Amaliy', duration: '18 min', free: false },
          { title: 'Make.com bilan integratsiya', type: 'Amaliy', duration: '15 min', free: false },
          { title: "Airtable bilan ishlash", type: 'Amaliy', duration: '12 min', free: false },
          { title: 'Email avtomatlashtirish', type: 'Amaliy', duration: '10 min', free: false },
          { title: 'Notionni ulash', type: 'Amaliy', duration: '10 min', free: false },
        ]
      },
      {
        title: 'Real loyihalar',
        subtitle: 'Amaliyot',
        duration: '~2h8m',
        lessons: [
          { title: 'Portfolio sayt yaratish', type: 'Amaliy', duration: '25 min', free: false },
          { title: 'E-commerce MVP', type: 'Amaliy', duration: '30 min', free: false },
          { title: "SaaS dastur yaratish", type: 'Amaliy', duration: '30 min', free: false },
          { title: 'AI chatbot ulash', type: 'Amaliy', duration: '20 min', free: false },
          { title: "Loyihani pitchlash", type: 'Nazariy', duration: '10 min', free: false },
          { title: "Keyingi qadamlar", type: 'Nazariy', duration: '8 min', free: false },
          { title: 'Sertifikat olish', type: 'Amaliy', duration: '5 min', free: false },
        ]
      }
    ]
  }
]

const course = allCourses.find(c => c.slug === (route.params.slug as string))

if (!course) {
  throw createError({ statusCode: 404, statusMessage: 'Kurs topilmadi' })
}

const openModules = ref<Set<number>>(new Set([0]))

function toggleModule(index: number) {
  const next = new Set(openModules.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  openModules.value = next
}

useSeoMeta({ title: `${course.title} — Chayroom AI` })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <NuxtLink to="/courses" class="hover:text-cx-ink transition-colors">Kurslar</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium truncate max-w-80">{{ course.title }}</span>
      </div>

      <div class="grid grid-cols-[1fr_340px] gap-8 items-start">
        <!-- LEFT COLUMN -->
        <div>
          <!-- Course header card -->
          <div class="rounded-2xl border border-cx-line bg-[#f8f8fa] p-6 mb-8">
            <h1 class="text-[24px] font-extrabold tracking-tight text-[#1a1a1a] leading-[1.25] mb-2">
              {{ course.title }}
            </h1>
            <p class="text-[14px] text-cx-muted leading-[1.6] mb-4">{{ course.desc }}</p>

            <!-- Stats row -->
            <div class="flex items-center gap-5 text-[13px] text-cx-muted mb-4">
              <span class="flex items-center gap-1">
                <span class="text-yellow-400 text-[14px]">★</span>
                {{ course.rating }} (0 sharh)
              </span>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-users" class="size-3.5" />
                {{ course.participants }}+ ishtirokchi
              </span>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-clock" class="size-3.5" />
                {{ course.duration }}
              </span>
            </div>

            <!-- Tags + level -->
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="tag in course.tags"
                :key="tag"
                class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
              >{{ tag }}</span>
              <span
                class="px-3 py-0.5 rounded-full text-[11px] font-bold"
                :style="{ backgroundColor: course.levelColor + '22', color: course.levelColor, border: `1px solid ${course.levelColor}44` }"
              >{{ course.level }}</span>
            </div>
          </div>

          <!-- Course content -->
          <h2 class="text-[18px] font-extrabold text-[#1a1a1a] mb-4">Kurs tarkibi</h2>

          <div class="flex flex-col gap-3">
            <div
              v-for="(mod, modIndex) in course.modulesList"
              :key="modIndex"
              class="rounded-2xl border border-cx-line overflow-hidden"
            >
              <!-- Module header -->
              <button
                class="w-full flex items-center gap-3 px-5 py-4 bg-[#f8f8fa] hover:bg-[#f0f0f4] transition-colors duration-150 text-left cursor-pointer focus:outline-none"
                @click="toggleModule(modIndex)"
              >
                <span class="text-[12px] font-semibold text-cx-muted shrink-0">Modul {{ modIndex + 1 }}</span>
                <UIcon name="i-lucide-lock" class="size-3.5 text-cx-muted shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="text-[14px] font-bold text-[#1a1a1a]">{{ mod.title }}</div>
                  <div class="text-[12px] text-cx-muted">{{ mod.subtitle }}</div>
                </div>
                <div class="flex items-center gap-3 text-[12px] text-cx-muted shrink-0">
                  <span>{{ mod.lessons.length }} dars</span>
                  <span>{{ mod.duration }}</span>
                </div>
                <UIcon
                  :name="openModules.has(modIndex) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="size-4 text-cx-muted shrink-0"
                />
              </button>

              <!-- Lessons list -->
              <div v-if="openModules.has(modIndex)">
                <div
                  v-for="(lesson, lessonIndex) in mod.lessons"
                  :key="lessonIndex"
                  class="flex items-center gap-3 px-5 py-3 border-t border-cx-line"
                >
                  <UIcon
                    :name="(!lesson.free && !hasSubscription) ? 'i-lucide-lock' : 'i-lucide-play-circle'"
                    class="size-4 shrink-0"
                    :class="(!lesson.free && !hasSubscription) ? 'text-cx-muted' : 'text-cx-blue'"
                  />
                  <span class="flex-1 text-[13px] text-[#1a1a1a]">
                    {{ lessonIndex + 1 }}. {{ lesson.title }}
                  </span>
                  <span class="text-[12px] text-cx-muted shrink-0 mr-3">{{ lesson.type }}</span>
                  <span class="flex items-center gap-1 text-[12px] text-cx-muted shrink-0">
                    <UIcon name="i-lucide-clock" class="size-3" />
                    {{ lesson.duration }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT SIDEBAR -->
        <div class="sticky top-24 flex flex-col gap-4">
          <!-- Stats card -->
          <div class="rounded-2xl border border-cx-line bg-[#f8f8fa] p-5">
            <div class="grid grid-cols-3 gap-3 text-center divide-x divide-cx-line">
              <div>
                <div class="text-[22px] font-extrabold text-[#1a1a1a]">{{ course.modules }}</div>
                <div class="text-[12px] text-cx-muted mt-0.5">Modullar</div>
              </div>
              <div>
                <div class="text-[22px] font-extrabold text-[#1a1a1a]">{{ course.lessons }}</div>
                <div class="text-[12px] text-cx-muted mt-0.5">Darslar</div>
              </div>
              <div>
                <div class="text-[22px] font-extrabold text-[#1a1a1a]">{{ course.duration }}</div>
                <div class="text-[12px] text-cx-muted mt-0.5">Vaqt</div>
              </div>
            </div>
          </div>

          <!-- CTA card -->
          <div v-if="!hasSubscription" class="rounded-2xl border border-cx-line bg-white p-6 shadow-lift">
            <div class="text-[15px] font-bold text-[#1a1a1a] mb-1">
              Chayroom AI Club'ga to'liq kirish
            </div>
            <div class="text-[13px] text-cx-muted mb-4">
              Barcha kurslarga bitta obuna bilan kirish
            </div>
            <button
              class="btn-primary w-full text-[14px]! py-3! mb-5"
              @click="navigateTo('/#pricing')"
            >
              Kirish huquqini olish
            </button>
            <div class="text-[11px] font-bold text-cx-muted uppercase tracking-wide mb-3">
              Nima kiradi:
            </div>
            <ul class="flex flex-col gap-2.5">
              <li
                v-for="item in [
                  'Barcha joriy va kelajakdagi kurslar',
                  \"Bepul qo'llanmalar va materiallar\",
                  'Prompt va vositalar bazasi',
                  'Yopiq Telegram guruh',
                  'Efirlar va tahlillarga kirish'
                ]"
                :key="item"
                class="flex items-start gap-2 text-[13px] text-[#1a1a1a]"
              >
                <UIcon name="i-lucide-check" class="size-3.5 text-green-500 shrink-0 mt-0.5" />
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Vizual tekshirish — Hermes kursi**

Brauzerda `/courses/hermes-ai-agent` sahifasini oching:
- Breadcrumb: `Bosh sahifa / Kurslar / Hermes...` ko'rinishi kerak
- Header karta: sarlavha, tavsif, rating/participants/duration, teglar ko'rinishi kerak
- Modul 1 accordion ochiq (3 ta modul ko'rinadi, 1-si kengaytirilgan)
- Darslar qulflangan: lock icon
- O'ng sidebar: 3 stat + CTA karta

- [ ] **Step 3: Vizual tekshirish — Vibe coding kursi**

`/courses/vibe-coding` sahifasini oching:
- 5 modul, 31 dars, ~8h ko'rinishi kerak
- Birinchi modul ochiq, 3 dars ko'rinishi kerak

- [ ] **Step 4: 404 tekshirish**

`/courses/noto-g-ri-slug` ga o'ting — Nuxt 404 sahifasi ko'rinishi kerak.

- [ ] **Step 5: Commit**

```bash
git add app/pages/courses/
git commit -m "feat: add course detail page with module accordion and subscription sidebar"
```

---

### Task 4: Obuna holati — sahifalar bo'yicha behavior tekshirish

**Files:**
- Verify: `app/pages/dashboard.vue`
- Verify: `app/pages/courses/[slug].vue`

`hasSubscription = ref(false)` hozir har bir sahifada alohida. Bu task ikki faylda `true` qilib, barcha kutilgan o'zgarishlarni tekshiradi.

- [ ] **Step 1: `dashboard.vue` da vaqtincha `hasSubscription = ref(true)` qilib tekshirish**

`dashboard.vue` script qismida:

```ts
const hasSubscription = ref(true)  // vaqtincha test uchun
```

`/dashboard` sahifasida quyidagilar bo'lishi kerak:

- "O'quv dashboardingni och" banner YO'Q (`v-if="!user || !hasSubscription"` → `false`)
- Dashboard kontenti to'liq rangli, deactive emas
- Telegram bo'limida "Obuna bo'lgandan keyin kirish ochiladi." YO'Q — uning o'rnida **"Telegramga kirish"** tugmasi bor
- Kurs badge'lari: `free: true` → "Bepul", `free: false` → "Mavjud" (yashil)

- [ ] **Step 2: `courses/[slug].vue` da vaqtincha `hasSubscription = ref(true)` qilib tekshirish**

`courses/[slug].vue` script qismida:

```ts
const hasSubscription = ref(true)  // vaqtincha test uchun
```

`/courses/hermes-ai-agent` sahifasida:

- O'ng sidebar'da CTA karta YO'Q (`v-if="!hasSubscription"` → `false`)
- Dars ikonkalari: lock `i-lucide-lock` o'rnida play `i-lucide-play-circle` (ko'k)

- [ ] **Step 3: Har ikkala faylni `ref(false)` ga qaytarish**

```ts
// dashboard.vue
const hasSubscription = ref(false)

// courses/[slug].vue
const hasSubscription = ref(false)
```

- [ ] **Step 4: Commit**

```bash
git add app/pages/dashboard.vue app/pages/courses/
git commit -m "test: verify subscription state behavior across dashboard and course detail"
```

---

## Self-Review Natijasi

- `/courses/[slug].vue` → Task 3 ✓
- `courses/index.vue` rename + slug + NuxtLink → Task 1 ✓
- `dashboard.vue` NuxtLink → Task 2 ✓
- Header (title, desc, rating, tags, level) → Task 3 template ✓
- Modul accordion (openModules Set, toggleModule) → Task 3 ✓
- Dars lock logikasi (`!lesson.free && !hasSubscription`) → Task 3 ✓
- Sticky sidebar: stats + CTA → Task 3 ✓
- 404 (`createError`) → Task 3 ✓
- Placeholder yo'q ✓
- Type consistency: `CourseDetail`, `CourseModule`, `Lesson` — barcha tasklarda bir xil ✓
