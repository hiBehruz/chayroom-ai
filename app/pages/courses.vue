<script setup lang="ts">
const categories = ['Все', 'Вайбкодинг', 'AI-агенты', 'Нейросети', 'Контент']
const activeCategory = ref('Все')

const tabRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref({ left: '6px', width: '0px' })

function updateIndicator(index: number) {
  const el = tabRefs.value[index]
  if (!el) return
  indicatorStyle.value = { left: el.offsetLeft + 'px', width: el.offsetWidth + 'px' }
}

function selectCategory(cat: string, index: number) {
  activeCategory.value = cat
  updateIndicator(index)
}

onMounted(() => nextTick(() => updateIndicator(0)))

const courses = [
  {
    title: 'Создание и Кастомизация AI-агента на базе Hermes',
    desc: 'Курс, в котором мы с нуля создадим агента и добавим в него навыки и улучшения.',
    tags: ['AI', 'AI-агент', 'Hermes'],
    category: 'AI-агенты',
    level: 'Начинающий',
    levelColor: '#22c55e',
    modules: 3,
    lessons: 7,
    duration: '~2h',
    bg: '#f0f4ff',
    dark: false,
    badge: 'курс',
    accentTitle: ['AI-агента', 'Hermes'],
    accentColor: '#0075DE'
  },
  {
    title: 'Вайбкодинг с 0',
    desc: 'Как без знания кода, собирать нужные digital-штуки с помощью ИИ — сайты, инструменты, приложения.',
    tags: ['Вайбкодинг'],
    category: 'Вайбкодинг',
    level: 'Начинающий',
    levelColor: '#22c55e',
    modules: 5,
    lessons: 31,
    duration: '~8h',
    bg: '#0d1117',
    dark: true,
    badge: 'курс',
    accentTitle: [],
    accentColor: '#f97316'
  }
]

const filtered = computed(() =>
  activeCategory.value === 'Все'
    ? courses
    : courses.filter(c => c.category === activeCategory.value)
)

useSeoMeta({ title: 'Курсы — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Главная</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">Курсы</span>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-[32px] font-extrabold tracking-tight text-[#1a1a1a]">
          Курсы
        </h1>
        <p class="text-cx-muted mt-1 text-[15px]">
          Пошаговые программы по внедрению ИИ в работу и жизнь
        </p>
      </div>

      <!-- Category filter -->
      <div class="relative inline-flex items-center bg-[#f0f0f0] rounded-2xl p-1.5 mb-8">
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

      <!-- Course cards -->
      <div class="grid grid-cols-3 gap-5">
        <UCard
          v-for="course in filtered"
          :key="course.title"
          :ui="{
            root: 'bg-[#fafafa] border border-cx-line rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] cursor-pointer group',
            header: 'p-0',
            body: 'flex flex-col flex-1 p-5 gap-3'
          }"
        >
          <template #header>
            <div
              class="relative h-52 flex items-end p-5 overflow-hidden"
              :style="{ backgroundColor: course.bg }"
            >
              <!-- Top badges row -->
              <div class="absolute top-3 left-4 flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-black/20 text-white">
                  {{ course.badge }}
                </span>
              </div>
              <div class="absolute top-3 right-4">
                <span
                  class="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
                  :style="{ backgroundColor: course.levelColor + '22', color: course.levelColor, border: `1px solid ${course.levelColor}44` }"
                >
                  {{ course.level }}
                  <span class="text-[9px]">✦</span>
                </span>
              </div>

              <!-- Preview content -->
              <div v-if="!course.dark" class="absolute inset-0 flex items-center justify-center p-5 pt-10">
                <div class="flex items-center justify-between w-full">
                  <div class="max-w-[55%]">
                    <p class="text-[13px] font-bold text-cx-muted mb-1 uppercase tracking-wide">Курс:</p>
                    <p class="text-[18px] font-extrabold text-[#1a1a1a] leading-[1.2]">
                      Создание и кастомизация<br>
                      <span :style="{ color: course.accentColor }">AI-агента</span><br>
                      на базе <span :style="{ color: course.accentColor }">Hermes</span>
                    </p>
                  </div>
                  <div class="flex flex-col gap-2 items-end opacity-60">
                    <UIcon name="i-lucide-settings" class="size-7 text-cx-blue" />
                    <UIcon name="i-lucide-bot" class="size-9 text-[#1a1a1a]" />
                    <UIcon name="i-lucide-pen-line" class="size-5 text-cx-blue" />
                  </div>
                </div>
              </div>

              <div v-else class="absolute inset-0 flex items-center justify-center p-5 pt-10 gap-4">
                <UIcon name="i-lucide-globe" class="size-14 text-[#f97316] shrink-0" />
                <div>
                  <p class="text-[22px] font-extrabold text-white leading-tight mb-1">Вайбкодинг с 0</p>
                  <p class="text-[12px] text-white/60 leading-normal">Как без знания кода, собирать нужные digital-штуки с помощью ИИ — сайты, инструменты, приложения</p>
                </div>
              </div>
            </div>
          </template>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in course.tags"
              :key="tag"
              class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Title -->
          <p class="text-[15px] font-bold text-[#1a1a1a] leading-[1.4] line-clamp-1 transition-colors duration-200 group-hover:text-cx-blue">
            {{ course.title }}
          </p>

          <!-- Desc -->
          <p class="text-[13px] text-cx-muted leading-[1.6] line-clamp-3 flex-1">
            {{ course.desc }}
          </p>

          <!-- Stats -->
          <div class="flex items-center gap-4 text-[12px] text-cx-muted">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-layout-list" class="size-3.5" />
              {{ course.modules }} модул{{ course.modules === 1 ? 'ь' : 'я' }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-play-circle" class="size-3.5" />
              {{ course.lessons }} урок{{ course.lessons >= 5 ? 'ов' : 'а' }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="size-3.5" />
              {{ course.duration }}
            </span>
          </div>

          <!-- Button -->
          <button class="btn-primary w-full text-[13px]! py-2.5!">
            Смотреть курс →
          </button>
        </UCard>
      </div>
    </div>
  </div>
</template>
