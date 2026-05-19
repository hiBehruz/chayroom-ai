# Guides Paywall & Course Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add guide detail pages with subscription paywall, update guide card badges for subscription state, and replace the course detail sidebar CTA with a subscription-aware block.

**Architecture:** Rename `guides.vue` → `guides/index.vue` and create `guides/[slug].vue` for detail pages. Guide data is self-contained in each file. Course detail sidebar replaces the existing CTA card with a two-state block driven by `authStore.hasSubscription`.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, Tailwind CSS v4, `@nuxt/ui` (UIcon), Pinia auth store

---

### Task 1: Rename guides.vue → guides/index.vue with slug fields and updated cards

**Files:**
- Delete: `app/pages/guides.vue`
- Create: `app/pages/guides/index.vue`

- [ ] **Step 1: Delete `app/pages/guides.vue` and create the guides directory**

```bash
rm app/pages/guides.vue
mkdir -p app/pages/guides
```

- [ ] **Step 2: Create `app/pages/guides/index.vue` with the full updated content**

Create `app/pages/guides/index.vue` with this exact content:

```vue
<script setup lang="ts">
const authStore = useAuthStore()
const hasSubscription = computed(() => authStore.hasSubscription)

const categories = ['Hammasi', 'Vibe coding', 'AI agentlar', 'Neyrotarmoqlar', 'Kontent']
const activeCategory = ref('Hammasi')
const categoryFilterRef = ref<HTMLElement | null>(null)
const categoryRefs = ref<HTMLElement[]>([])
const categoryIndicatorStyle = ref({ left: '6px', width: '0px', opacity: '0' })

function updateCategoryIndicator() {
  const index = categories.indexOf(activeCategory.value)
  const activeButton = categoryRefs.value[index]
  const filter = categoryFilterRef.value
  if (!activeButton || !filter) return

  const activeRect = activeButton.getBoundingClientRect()
  const filterRect = filter.getBoundingClientRect()
  categoryIndicatorStyle.value = {
    left: (activeRect.left - filterRect.left) + 'px',
    width: activeRect.width + 'px',
    opacity: '1'
  }
}

function scheduleCategoryIndicatorUpdate() {
  nextTick(() => {
    updateCategoryIndicator()
    requestAnimationFrame(updateCategoryIndicator)
  })
}

function selectCategory(cat: string) {
  activeCategory.value = cat
  scheduleCategoryIndicatorUpdate()
}

let categoryResizeHandler: () => void = () => {}
onMounted(() => {
  categoryResizeHandler = updateCategoryIndicator
  window.addEventListener('resize', categoryResizeHandler, { passive: true })
  scheduleCategoryIndicatorUpdate()
  document.fonts?.ready.then(updateCategoryIndicator)
})
onUnmounted(() => {
  window.removeEventListener('resize', categoryResizeHandler)
})

const guides = [
  {
    slug: 'claude-code-token-limit',
    title: "Claude Code'da tokenlarni birdan tugatib qo'ymaslik",
    desc: "Claude bilan ishlaganda tokenlarni behuda sarflamaslik bo'yicha amaliy tahlil.",
    tags: ['Claude', 'Limits', 'Claude Code'],
    category: 'Neyrotarmoqlar',
    free: true,
    bg: '#f5ede0',
    accent: '#e8b97a',
    badge: 'start'
  },
  {
    slug: 'codex-beginners',
    title: 'Yangi boshlovchilar uchun Codex',
    desc: "Codex bilan tanishish va noldan sozlash bo'yicha qo'llanma.",
    tags: ['Codex', 'ChatGPT'],
    category: 'Neyrotarmoqlar',
    free: true,
    bg: '#0d1f1a',
    accent: '#22c55e',
    badge: "qo'llanma"
  },
  {
    slug: 'claude-chatgpt-registration',
    title: "Claude / ChatGPT ro'yxatdan o'tish va to'lov yo'llari",
    desc: "Claude va ChatGPT'da akkaunt ochish hamda obunani to'lash bo'yicha amaliy yo'riqnoma.",
    tags: ['Claude', 'ChatGPT'],
    category: 'Neyrotarmoqlar',
    free: true,
    bg: '#111',
    accent: '#a78bfa',
    badge: 'start'
  },
  {
    slug: 'youtube-research-ai-agent',
    title: 'YouTube research uchun AI agent',
    desc: 'Claude ichida 10 daqiqada YouTube research qiladigan AI agent yarat.',
    tags: ['AI agent', 'Claude'],
    category: 'AI agentlar',
    free: false,
    bg: '#0d1117',
    accent: '#f97316',
    badge: 'start'
  },
  {
    slug: 'vibe-coding-guide',
    title: "Vibe coding noldan: qadam-baqadam qo'llanma",
    desc: "G'oyadan ishchi saytga qadar AI yordamida web loyiha yaratish.",
    tags: ['Vibe coding', 'AI'],
    category: 'Vibe coding',
    free: false,
    bg: '#0d1117',
    accent: '#60a5fa',
    badge: "qo'llanma"
  },
  {
    slug: 'claude-beginners',
    title: 'Yangi boshlovchilar uchun Claude',
    desc: 'Tajriba va kodsiz tez start.',
    tags: ['Claude', 'Neyrotarmoqlar'],
    category: 'Neyrotarmoqlar',
    free: false,
    bg: '#111',
    accent: '#e879f9',
    badge: 'start'
  }
]

const filtered = computed(() =>
  activeCategory.value === 'Hammasi'
    ? guides
    : guides.filter(g => g.category === activeCategory.value)
)

useSeoMeta({ title: "Qo'llanmalar — Chayroom AI" })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">Qo'llanmalar</span>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-[32px] font-extrabold tracking-tight text-[#1a1a1a]">
          Qo'llanmalar
        </h1>
        <p class="text-cx-muted mt-1 text-[15px]">
          AI bo'yicha amaliy qo'llanmalar.
        </p>
      </div>

      <!-- Category filter -->
      <div
        ref="categoryFilterRef"
        class="relative inline-flex items-center bg-[#f0f0f0] rounded-2xl p-1.5 mb-8"
      >
        <span
          class="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-sm transition-[left,width,opacity] duration-250 ease-out pointer-events-none"
          :style="categoryIndicatorStyle"
        />
        <button
          v-for="(cat, i) in categories"
          :key="cat"
          :ref="el => { if (el) categoryRefs[i] = el as HTMLElement }"
          :class="[
            'relative z-10 px-5 py-2 rounded-xl text-[13px] font-semibold transition-colors duration-200',
            activeCategory === cat ? 'text-[#1a1a1a]' : 'text-cx-muted hover:text-cx-ink'
          ]"
          @click="selectCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Guide cards -->
      <TransitionGroup
        v-if="filtered.length"
        tag="div"
        enter-active-class="transition-[opacity,transform] duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-5"
        class="grid grid-cols-3 gap-5"
      >
        <NuxtLink
          v-for="guide in filtered"
          :key="guide.slug"
          :to="'/guides/' + guide.slug"
          class="group flex flex-col overflow-hidden rounded-2xl border border-cx-line bg-[#fafafa] cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] hover:border-cx-line/60"
        >
          <!-- Preview -->
          <div class="relative h-44 overflow-hidden shrink-0" :style="{ backgroundColor: guide.bg }">
            <span
              class="absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
              :style="{ backgroundColor: guide.accent + '33', color: guide.accent }"
            >{{ guide.badge }}</span>
            <div class="absolute inset-0 opacity-35 transition-opacity duration-300 group-hover:opacity-50" :style="{ background: `radial-gradient(ellipse at 95% 105%, ${guide.accent} 0%, transparent 60%)` }" />
            <div class="absolute inset-0 opacity-15" :style="{ background: `radial-gradient(ellipse at 5% -5%, ${guide.accent} 0%, transparent 55%)` }" />
            <p
              class="absolute inset-0 z-10 flex items-center justify-center px-5 text-[15px] font-bold leading-[1.3] text-center line-clamp-3 transition-transform duration-300 group-hover:scale-[1.03]"
              :style="{ color: guide.bg === '#f5ede0' ? '#1a1a1a' : 'white' }"
            >{{ guide.title }}</p>
          </div>

          <!-- Body -->
          <div class="flex flex-col flex-1 p-4 gap-3">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in guide.tags"
                :key="tag"
                class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
              >{{ tag }}</span>
            </div>

            <p class="text-[14px] font-bold text-[#1a1a1a] leading-[1.4] line-clamp-2 transition-colors duration-200 group-hover:text-cx-blue">
              {{ guide.title }}
            </p>

            <p class="text-[12px] text-cx-muted leading-[1.6] line-clamp-2 flex-1">
              {{ guide.desc }}
            </p>

            <div class="flex items-center gap-1.5">
              <span v-if="guide.free" class="flex items-center gap-1 text-[12px] font-medium text-green-600">
                <UIcon name="i-lucide-lock-keyhole-open" class="size-4" />
                Bepul
              </span>
              <span v-else-if="hasSubscription" class="flex items-center gap-1 text-[12px] font-medium text-green-600">
                <UIcon name="i-lucide-lock-keyhole-open" class="size-4" />
                Доступно по подписке
              </span>
              <span v-else class="flex items-center gap-1 text-[12px] font-medium text-red-500">
                <UIcon name="i-lucide-lock-keyhole" class="size-4" />
                По подписке
              </span>
            </div>
          </div>
        </NuxtLink>
      </TransitionGroup>

      <div
        v-else
        class="flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-cx-line bg-[#fafafa] px-6 text-center"
      >
        <p class="text-[15px] font-semibold text-cx-muted">
          Bu kategoriyada hozircha qo'llanmalar yo'q
        </p>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/guides/index.vue
git commit -m "feat: migrate guides to index route with slugs and subscription-aware badges"
```

---

### Task 2: Create guide detail page `app/pages/guides/[slug].vue`

**Files:**
- Create: `app/pages/guides/[slug].vue`

- [ ] **Step 1: Create the file with this exact content**

```vue
<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const hasSubscription = computed(() => authStore.hasSubscription)
const isAccessModalOpen = ref(false)

interface Guide {
  slug: string
  title: string
  desc: string
  tags: string[]
  free: boolean
  bg: string
  accent: string
  badge: string
  content: string
}

const allGuides: Guide[] = [
  {
    slug: 'claude-code-token-limit',
    title: "Claude Code'da tokenlarni birdan tugatib qo'ymaslik",
    desc: "Claude bilan ishlaganda tokenlarni behuda sarflamaslik bo'yicha amaliy tahlil.",
    tags: ['Claude', 'Limits', 'Claude Code'],
    free: true,
    bg: '#f5ede0',
    accent: '#e8b97a',
    badge: 'start',
    content: `<h2>Tokenlarni tejash asoslari</h2>
<p>Claude Code bilan ishlashda token sarfini kamaytirish uchun bir nechta asosiy qoidalar mavjud.</p>
<h3>1. Kontekstni tozalab turing</h3>
<p>Har bir yangi vazifa uchun <code>/clear</code> buyrug'ini ishlating. Bu joriy suhbat tarixini tozalab, yangi sessiya boshlaydi.</p>
<h3>2. Faqat kerakli fayllarni oching</h3>
<p>Katta loyihalarda butun reponi o'qitish o'rniga faqat zarur fayllarni ko'rsating. Masalan: "faqat src/components/Nav.vue ni ko'r".</p>
<h3>3. Qisqa va aniq so'rovlar yozing</h3>
<p>Uzun tavsiflar o'rniga qisqa, konkret ko'rsatmalar bering. Claude qisqa promptlarda ham yaxshi ishlaydi.</p>
<h3>4. Compact rejimidan foydalaning</h3>
<p><code>/compact</code> buyrug'i uzun suhbatni qisqartiradi va kontekstni saqlab qoladi.</p>`
  },
  {
    slug: 'codex-beginners',
    title: 'Yangi boshlovchilar uchun Codex',
    desc: "Codex bilan tanishish va noldan sozlash bo'yicha qo'llanma.",
    tags: ['Codex', 'ChatGPT'],
    free: true,
    bg: '#0d1f1a',
    accent: '#22c55e',
    badge: "qo'llanma",
    content: `<h2>OpenAI Codex nima?</h2>
<p>Codex — OpenAI'ning kod yozishga ixtisoslashgan sun'iy intellekt modeli. U tabiiy til buyruqlarini ishlaydigan kodga aylantiradi.</p>
<h3>Boshlash uchun kerakli narsalar</h3>
<ul>
  <li>OpenAI akkaunti</li>
  <li>API kalit (platform.openai.com dan)</li>
  <li>Python yoki JavaScript bilimi (ixtiyoriy)</li>
</ul>
<h3>Birinchi so'rovni yuborish</h3>
<p>ChatGPT interfeysida "Menga Python da oddiy kalkulyator yoz" deb yozing. Codex avtomatik ravishda ishlashga tayyor kod generatsiya qiladi.</p>
<h3>Foydali maslahatlar</h3>
<p>Tilni aniq belgilang: "Python 3 da", "JavaScript ES6 da". Bu aniqroq natija beradi.</p>`
  },
  {
    slug: 'claude-chatgpt-registration',
    title: "Claude / ChatGPT ro'yxatdan o'tish va to'lov yo'llari",
    desc: "Claude va ChatGPT'da akkaunt ochish hamda obunani to'lash bo'yicha amaliy yo'riqnoma.",
    tags: ['Claude', 'ChatGPT'],
    free: true,
    bg: '#111',
    accent: '#a78bfa',
    badge: 'start',
    content: `<h2>Claude va ChatGPT: akkount ochish</h2>
<h3>Claude (claude.ai)</h3>
<ol>
  <li>claude.ai saytiga kiring</li>
  <li>"Sign up" tugmasini bosing</li>
  <li>Email yoki Google akkount orqali ro'yxatdan o'ting</li>
  <li>Telefon raqamingizni tasdiqlang</li>
</ol>
<h3>ChatGPT (chat.openai.com)</h3>
<ol>
  <li>chat.openai.com ga kiring</li>
  <li>"Sign up" orqali akkount yarating</li>
  <li>Email tasdiqlang</li>
</ol>
<h3>To'lov usullari (O'zbekistondan)</h3>
<p>To'g'ridan-to'g'ri to'lov imkonsiz bo'lganda:</p>
<ul>
  <li>Virtual karta xizmatlari (Privacy.com, Revolut)</li>
  <li>Kripto orqali to'lov</li>
  <li>Do'stlar orqali to'lov</li>
</ul>`
  },
  {
    slug: 'youtube-research-ai-agent',
    title: 'YouTube research uchun AI agent',
    desc: 'Claude ichida 10 daqiqada YouTube research qiladigan AI agent yarat.',
    tags: ['AI agent', 'Claude'],
    free: false,
    bg: '#0d1117',
    accent: '#f97316',
    badge: 'start',
    content: `<h2>YouTube Research AI Agent yaratish</h2>
<p>Bu qo'llanmada biz Claude ichida YouTube kanallarini tahlil qiladigan va research qiladigan agent yaratamiz.</p>
<h3>Agent arxitekturasi</h3>
<p>Agent quyidagi qadamlarni bajaradi:</p>
<ol>
  <li>YouTube URL yoki kanal nomini qabul qiladi</li>
  <li>Video metadata va transkriptlarni tahlil qiladi</li>
  <li>Muhim fikrlarni ajratib oladi</li>
  <li>Hisobot tuzadi</li>
</ol>
<h3>Prompt strukturasi</h3>
<pre><code>Siz YouTube research agentisiz. Berilgan kanal/videoni tahlil qiling va:
1. Asosiy mavzularni aniqlang
2. Eng yaxshi kontentni ajrating
3. Raqobatchilar bilan solishtiring
4. Hisobot tayyorlang</code></pre>
<h3>Amaliyot</h3>
<p>Hermes yoki Claude Projects da yangi agent yarating va yuqoridagi promptni system message sifatida kiriting.</p>`
  },
  {
    slug: 'vibe-coding-guide',
    title: "Vibe coding noldan: qadam-baqadam qo'llanma",
    desc: "G'oyadan ishchi saytga qadar AI yordamida web loyiha yaratish.",
    tags: ['Vibe coding', 'AI'],
    free: false,
    bg: '#0d1117',
    accent: '#60a5fa',
    badge: "qo'llanma",
    content: `<h2>Vibe Coding: G'oyadan saytgacha</h2>
<p>Vibe coding — kod bilmasdan AI yordamida to'liq ishchi web ilovalar yaratish usuli.</p>
<h3>1-qadam: G'oyani aniqlashtirish</h3>
<p>Nima yaratmoqchi ekanligingizni bir gapda ifodalang: "Ovqat retseptlari saqlovchi sayt yaratmoqchiman".</p>
<h3>2-qadam: AI bilan loyihalash</h3>
<p>Claude yoki ChatGPT ga aytasiz: "Menga React va Tailwind bilan ovqat retseptlari saytini yarat. Foydalanuvchilar retsept qo'sha olsin va izlasa bo'lsin."</p>
<h3>3-qadam: Kod generatsiya</h3>
<p>AI kod generatsiya qiladi. Siz uni Cursor yoki Claude Code da ishga tushirasiz.</p>
<h3>4-qadam: Iteratsiya</h3>
<p>"Dizaynni yaxshila", "Mobil uchun moslash", "Login qo'sh" kabi buyruqlar bilan davom etasiz.</p>
<h3>5-qadam: Deploy</h3>
<p>Vercel yoki Netlify ga birlashtirish uchun: "Bu loyihani Vercel ga deploy qilishim uchun nima kerak?" deb so'rang.</p>`
  },
  {
    slug: 'claude-beginners',
    title: 'Yangi boshlovchilar uchun Claude',
    desc: 'Tajriba va kodsiz tez start.',
    tags: ['Claude', 'Neyrotarmoqlar'],
    free: false,
    bg: '#111',
    accent: '#e879f9',
    badge: 'start',
    content: `<h2>Claude bilan ishlashni boshlash</h2>
<p>Claude — Anthropic tomonidan yaratilgan kuchli AI yordamchi. Bu qo'llanma siz uchun tez start beradi.</p>
<h3>Birinchi suhbat</h3>
<p>claude.ai ga kiring va quyidagilardan birini yozing:</p>
<ul>
  <li>"Menga LinkedIn post yoz: [mavzu]"</li>
  <li>"Bu matnni inglizchaga tarjima qil: [matn]"</li>
  <li>"Kichik biznes uchun marketing rejasi tuz"</li>
</ul>
<h3>Eng yaxshi natija olish uchun</h3>
<p>Aniq bo'ling: "Post yoz" emas, "Instagram uchun 3 ta variantli post yoz, har biri 150 so'z, hashtag bilan".</p>
<h3>Foydali buyruqlar</h3>
<ul>
  <li><strong>Tarjima:</strong> "Tarjima qil: [matn]"</li>
  <li><strong>Yaxshilash:</strong> "Bu matnni takomillashtir: [matn]"</li>
  <li><strong>Tahlil:</strong> "Bu hujjatni tahlil qil va asosiy fikrlarni chiqar"</li>
</ul>`
  }
]

const guide = allGuides.find(g => g.slug === (route.params.slug as string))

if (!guide) {
  throw createError({ statusCode: 404, statusMessage: "Qo'llanma topilmadi" })
}

useSeoMeta({ title: `${guide.title} — Chayroom AI` })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <NuxtLink to="/guides" class="hover:text-cx-ink transition-colors">Qo'llanmalar</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium truncate max-w-80">{{ guide.title }}</span>
      </div>

      <div class="max-w-[720px]">
        <!-- Tags + access badge -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span
            v-for="tag in guide.tags"
            :key="tag"
            class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
          >{{ tag }}</span>
          <span v-if="guide.free" class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-600 border border-green-100">
            <UIcon name="i-lucide-lock-keyhole-open" class="size-3" />
            Bepul
          </span>
          <span v-else-if="hasSubscription" class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-600 border border-green-100">
            <UIcon name="i-lucide-lock-keyhole-open" class="size-3" />
            Доступно по подписке
          </span>
          <span v-else class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-500 border border-red-100">
            <UIcon name="i-lucide-lock-keyhole" class="size-3" />
            По подписке
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-[30px] font-extrabold tracking-tight text-[#1a1a1a] leading-[1.2] mb-3">
          {{ guide.title }}
        </h1>

        <!-- Description -->
        <p class="text-[16px] text-cx-muted leading-[1.6] mb-8">
          {{ guide.desc }}
        </p>

        <!-- Paywall block -->
        <div v-if="!guide.free && !hasSubscription" class="flex flex-col items-center text-center py-12 px-8 rounded-2xl border border-cx-line bg-[#fafafa]">
          <div class="w-14 h-14 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-5">
            <UIcon name="i-lucide-lock" class="size-6 text-[#6f6f72]" />
          </div>
          <h2 class="text-[20px] font-extrabold text-[#1a1a1a] mb-2">
            Гайд доступен по подписке
          </h2>
          <p class="text-[14px] text-cx-muted leading-[1.6] max-w-[340px] mb-6">
            Оформите подписку AI Room Club, чтобы получить доступ к этому и другим материалам
          </p>
          <button
            class="btn-primary px-8 py-3 text-[15px]! mb-3"
            @click="isAccessModalOpen = true"
          >
            Оформить подписку
          </button>
          <NuxtLink to="/login" class="text-[13px] text-cx-muted hover:text-cx-ink transition-colors">
            Уже есть подписка? Войти
          </NuxtLink>
        </div>

        <!-- Content block -->
        <div
          v-else
          class="prose prose-sm max-w-none text-[#1a1a1a] [&_h2]:text-[20px] [&_h2]:font-extrabold [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_p]:text-[14px] [&_p]:leading-[1.7] [&_p]:mb-3 [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:text-[14px] [&_li]:leading-[1.7] [&_li]:mb-1 [&_code]:bg-[#f0f0f0] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_pre]:bg-[#1a1a1a] [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-4"
          v-html="guide.content"
        />
      </div>
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/guides/[slug].vue
git commit -m "feat: add guide detail page with subscription paywall"
```

---

### Task 3: Update course detail sidebar

**Files:**
- Modify: `app/pages/courses/[slug].vue` (sidebar CTA card only)

Current CTA card to replace (lines ~312-344):
```html
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
    @click="isAccessModalOpen = true"
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
        `Bepul qo'llanmalar va materiallar`,
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
```

- [ ] **Step 1: Replace the CTA card with a two-state block**

Replace the entire `<!-- CTA card -->` block with:

```html
<!-- Sidebar subscription block -->
<div v-if="!hasSubscription" class="rounded-2xl border border-cx-line bg-white p-6 shadow-lift">
  <div class="text-[10px] font-bold text-cx-muted uppercase tracking-widest mb-1">1 oylik tarifi</div>
  <div class="text-[15px] font-bold text-cx-ink mb-4">Chayroom AI Club</div>
  <button
    class="btn-primary w-full text-[14px]! py-3! mb-5"
    @click="isAccessModalOpen = true"
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
        `Bepul qo'llanmalar va materiallar`,
        'Prompt va vositalar bazasi',
        'Yopiq Telegram guruh',
        'Efirlar va tahlillarga kirish'
      ]"
      :key="item"
      class="flex items-start gap-2 text-[13px] text-cx-ink"
    >
      <UIcon name="i-lucide-check" class="size-3.5 text-green-500 shrink-0 mt-0.5" />
      {{ item }}
    </li>
  </ul>
</div>

<div v-else class="rounded-2xl border border-cx-line bg-[#f8f8fa] p-5">
  <div class="flex items-center justify-between mb-3">
    <span class="text-[13px] font-bold text-cx-ink">Ваш прогресс</span>
    <span class="text-[13px] font-bold text-cx-ink">0%</span>
  </div>
  <div class="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden mb-2">
    <div class="h-full bg-cx-blue rounded-full transition-all duration-500" style="width: 0%" />
  </div>
  <div class="text-[12px] text-cx-muted mb-4">0 из {{ course.lessons }} уроков</div>
  <NuxtLink
    :to="'/courses/' + course.slug"
    class="btn-primary w-full text-[14px]! py-3! flex items-center justify-center gap-2"
  >
    <span>Начать обучение</span>
    <span class="btn-arrow">→</span>
  </NuxtLink>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/courses/[slug].vue
git commit -m "feat: replace course sidebar CTA with subscription-aware block"
```
