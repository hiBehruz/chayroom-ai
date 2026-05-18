<script setup lang="ts">
const categories = ['Hammasi', 'Vibe coding', 'AI agentlar', 'Neyrotarmoqlar', 'Kontent']
const activeCategory = ref('Hammasi')

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

const filtered = computed(() =>
  activeCategory.value === 'Hammasi'
    ? courses
    : courses.filter(c => c.category === activeCategory.value)
)

useSeoMeta({ title: 'Kurslar — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">Kurslar</span>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-[32px] font-extrabold tracking-tight text-[#1a1a1a]">
          Kurslar
        </h1>
        <p class="text-cx-muted mt-1 text-[15px]">
          AIni ish va hayotga joriy qilish bo'yicha qadam-baqadam dasturlar
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
      <TransitionGroup
        tag="div"
        enter-active-class="transition-[opacity,transform] duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-5"
        class="grid grid-cols-3 gap-5"
      >
        <div
          v-for="course in filtered"
          :key="course.title"
          class="group flex flex-col overflow-hidden rounded-2xl border border-cx-line bg-[#fafafa] cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] hover:border-cx-line/60"
        >
          <!-- Header -->
          <div class="relative h-52 overflow-hidden shrink-0" :style="{ backgroundColor: course.bg }">
            <div class="absolute top-3 left-4 flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-black/20 text-white">{{ course.badge }}</span>
            </div>
            <div class="absolute top-3 right-4">
              <span
                class="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
                :style="{ backgroundColor: course.levelColor + '22', color: course.levelColor, border: `1px solid ${course.levelColor}44` }"
              >{{ course.level }} <span class="text-[9px]">✦</span></span>
            </div>

            <div v-if="!course.dark" class="absolute inset-0 flex items-center justify-center p-5 pt-10 transition-transform duration-300 group-hover:scale-[1.02]">
              <div class="flex items-center justify-between w-full gap-3">
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-bold text-cx-muted mb-1 uppercase tracking-wide">Kurs:</p>
                  <p class="text-[18px] font-extrabold text-[#1a1a1a] leading-[1.2]">
                    Yaratish va sozlash<br>
                    <span :style="{ color: course.accentColor }">AI agentni</span><br>
                    <span :style="{ color: course.accentColor }">Hermes</span> asosida
                  </p>
                </div>
                <div class="flex flex-col gap-2 items-end opacity-60">
                  <UIcon name="i-lucide-settings" class="size-7 text-cx-blue" />
                  <UIcon name="i-lucide-bot" class="size-9 text-[#1a1a1a]" />
                  <UIcon name="i-lucide-pen-line" class="size-5 text-cx-blue" />
                </div>
              </div>
            </div>

            <div v-else class="absolute inset-0 flex items-center justify-center p-5 pt-10 gap-4 transition-transform duration-300 group-hover:scale-[1.02]">
              <UIcon name="i-lucide-globe" class="size-14 text-[#f97316] shrink-0" />
              <div>
                <p class="text-[22px] font-extrabold text-white leading-tight mb-1">Vibe coding noldan</p>
                <p class="text-[12px] text-white/60 leading-normal">Kod bilmasdan AI yordamida saytlar, vositalar va ilovalar yaratish</p>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="flex flex-col flex-1 p-5 gap-3">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in course.tags"
                :key="tag"
                class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
              >{{ tag }}</span>
            </div>

            <p class="text-[15px] font-bold text-[#1a1a1a] leading-[1.4] line-clamp-1 transition-colors duration-200 group-hover:text-cx-blue">
              {{ course.title }}
            </p>

            <p class="text-[13px] text-cx-muted leading-[1.6] line-clamp-3 flex-1">
              {{ course.desc }}
            </p>

            <div class="flex items-center gap-4 text-[12px] text-cx-muted">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-layout-list" class="size-3.5" />
                {{ course.modules }} modul
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-play-circle" class="size-3.5" />
                {{ course.lessons }} dars
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="size-3.5" />
                {{ course.duration }}
              </span>
            </div>

            <NuxtLink
              :to="`/courses/${course.slug}`"
              class="btn-primary w-full text-[13px]! py-2.5! flex items-center justify-center gap-2"
            >
              <span>Kursni ko'rish</span>
              <span class="btn-arrow">→</span>
            </NuxtLink>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

