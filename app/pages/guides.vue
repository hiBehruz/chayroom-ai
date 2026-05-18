<script setup lang="ts">
const categories = ['Все', 'Вайбкодинг', 'AI-агенты', 'Нейросети', 'Контент']
const activeCategory = ref('Все')

const tabRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref({ left: '6px', width: '0px' })

function updateIndicator(index: number) {
  const el = tabRefs.value[index]
  if (!el) return
  indicatorStyle.value = {
    left: el.offsetLeft + 'px',
    width: el.offsetWidth + 'px'
  }
}

function selectCategory(cat: string, index: number) {
  activeCategory.value = cat
  updateIndicator(index)
}

onMounted(() => {
  nextTick(() => updateIndicator(0))
})

const guides = [
  {
    title: 'Как не сжечь все токены за раз в Claude Code',
    desc: 'Разбор, как перестать сливать токены при работе в Claude.',
    tags: ['Claude', 'Limits', 'Claude Code'],
    category: 'Нейросети',
    free: true,
    bg: '#f5ede0',
    accent: '#e8b97a',
    badge: 'start'
  },
  {
    title: 'Codex для новичков',
    desc: 'Гайд по Codex: знакомство и настройка с нуля.',
    tags: ['Codex', 'ChatGPT'],
    category: 'Нейросети',
    free: true,
    bg: '#0d1f1a',
    accent: '#22c55e',
    badge: 'гайд'
  },
  {
    title: 'Регистрация и оплата Claude / ChatGPT из РФ в 2026',
    desc: 'Как зарегистрироваться и оплатить подписку в Claude и ChatGPT, если ты из РФ в 2026 году.',
    tags: ['Claude', 'ChatGPT'],
    category: 'Нейросети',
    free: true,
    bg: '#111',
    accent: '#a78bfa',
    badge: 'start'
  },
  {
    title: 'AI-агент YouTube ресерчер',
    desc: 'За 10 минут создай своего ИИ-агента "YouTube ресерчера" прямо в Claude.',
    tags: ['AI-агент', 'Claude'],
    category: 'AI-агенты',
    free: false,
    bg: '#0d1117',
    accent: '#f97316',
    badge: 'start'
  },
  {
    title: 'Вайбкодинг с 0: пошаговый гайд',
    desc: 'Как создать своё веб-разработку от идеи до рабочего сайта с помощью ИИ.',
    tags: ['Вайбкодинг', 'AI'],
    category: 'Вайбкодинг',
    free: false,
    bg: '#0d1117',
    accent: '#60a5fa',
    badge: 'гайд'
  },
  {
    title: 'Claude для новичков',
    desc: 'Быстрый старт без опыта и кода.',
    tags: ['Claude', 'Нейросети'],
    category: 'Нейросети',
    free: false,
    bg: '#111',
    accent: '#e879f9',
    badge: 'start'
  }
]

const filtered = computed(() =>
  activeCategory.value === 'Все'
    ? guides
    : guides.filter(g => g.category === activeCategory.value)
)

useSeoMeta({ title: 'Гайды — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Главная</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">Гайды</span>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-[32px] font-extrabold tracking-tight text-[#1a1a1a]">
          Гайды
        </h1>
        <p class="text-cx-muted mt-1 text-[15px]">
          Практические руководства по AI.
        </p>
      </div>

      <!-- Category filter -->
      <div class="relative inline-flex items-center bg-[#f0f0f0] rounded-2xl p-1.5 mb-8">
        <!-- Sliding indicator -->
        <div
          class="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm pointer-events-none"
          :style="{ left: indicatorStyle.left, width: indicatorStyle.width, transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)' }"
        />
        <button
          v-for="(cat, i) in categories"
          :key="cat"
          :ref="el => { if (el) tabRefs[i] = el as HTMLElement }"
          :class="[
            'relative z-10 px-5 py-2 rounded-xl text-[13px] font-semibold transition-colors duration-200',
            activeCategory === cat ? 'text-[#1a1a1a]' : 'text-cx-muted hover:text-cx-ink'
          ]"
          @click="selectCategory(cat, i)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Guide cards -->
      <div
        v-if="filtered.length"
        class="grid grid-cols-3 gap-5"
      >
        <UCard
          v-for="guide in filtered"
          :key="guide.title"
          :ui="{
            root: 'bg-[#fafafa] border border-cx-line rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] cursor-pointer group',
            header: 'p-0',
            body: 'flex flex-col flex-1 p-4 gap-3'
          }"
        >
          <!-- Preview image -->
          <template #header>
            <div
              class="relative h-44 flex items-center justify-center p-5 overflow-hidden"
              :style="{ backgroundColor: guide.bg }"
            >
              <span
                class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                :style="{ backgroundColor: guide.accent + '33', color: guide.accent }"
              >
                {{ guide.badge }}
              </span>
              <div
                class="absolute right-0 bottom-0 w-28 h-28 opacity-25"
                :style="{ background: `radial-gradient(circle at 80% 80%, ${guide.accent}, transparent 70%)` }"
              />
              <p
                class="text-[15px] font-bold leading-[1.3] text-center line-clamp-3 relative z-10"
                :style="{ color: guide.bg === '#f5ede0' ? '#1a1a1a' : 'white' }"
              >
                {{ guide.title }}
              </p>
            </div>
          </template>

          <!-- Body -->
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in guide.tags"
              :key="tag"
              class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
            >
              {{ tag }}
            </span>
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
              Бесплатно
            </span>
            <span v-else class="flex items-center gap-1 text-[12px] font-medium text-red-500">
              <UIcon name="i-lucide-lock-keyhole" class="size-4" />
              По подписке
            </span>
          </div>

          <button class="btn-primary w-full text-[13px]! py-2.5!">
            Читать гайд →
          </button>
        </UCard>
      </div>

      <div
        v-else
        class="flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-cx-line bg-[#fafafa] px-6 text-center"
      >
        <p class="text-[15px] font-semibold text-cx-muted">
          Гайдов в этой категории пока нет
        </p>
      </div>
    </div>
  </div>
</template>
