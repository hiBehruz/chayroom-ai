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
