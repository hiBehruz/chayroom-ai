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

const { data: allCourses } = await useFetch('/api/courses')

const filtered = computed(() =>
  activeCategory.value === 'Все'
    ? (allCourses.value ?? [])
    : (allCourses.value ?? []).filter((c: any) => c.category === activeCategory.value)
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
      <!-- Skeleton while loading -->
      <div v-if="!allCourses" class="grid grid-cols-3 gap-5">
        <div v-for="n in 3" :key="n" class="rounded-2xl bg-[#f7f7f7] overflow-hidden animate-pulse">
          <div class="h-52 bg-[#ebebeb]" />
          <div class="p-5 space-y-3">
            <div class="h-4 bg-[#ebebeb] rounded w-2/3" />
            <div class="h-4 bg-[#ebebeb] rounded w-full" />
          </div>
        </div>
      </div>

      <!-- Actual grid -->
      <div v-else class="grid grid-cols-3 gap-5">
        <NuxtLink
          v-for="course in filtered"
          :key="course.id"
          :to="`/courses/${course.id}`"
        >
          <UCard
            :ui="{
              root: 'bg-[#fafafa] border border-cx-line rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] cursor-pointer group h-full',
              header: 'p-0',
              body: 'flex flex-col flex-1 p-5 gap-3'
            }"
          >
            <template #header>
              <div
                class="relative h-52 overflow-hidden bg-cover bg-center"
                :style="{
                  backgroundColor: course.bg_color,
                  backgroundImage: course.cover_url ? `url(${course.cover_url})` : undefined
                }"
              >
                <div class="absolute top-3 left-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-black/20 text-white">
                    курс
                  </span>
                </div>
                <div class="absolute top-3 right-4">
                  <span
                    class="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
                    :style="{ backgroundColor: course.level_color + '22', color: course.level_color, border: `1px solid ${course.level_color}44` }"
                  >
                    {{ course.level }}
                    <span class="text-[9px]">✦</span>
                  </span>
                </div>
                <div v-if="!course.cover_url" class="absolute inset-0 flex items-center justify-center">
                  <UIcon name="i-lucide-image" class="size-10 opacity-20" :class="course.is_dark ? 'text-white' : 'text-[#1a1a1a]'" />
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
              {{ course.description }}
            </p>

            <!-- Stats -->
            <div class="flex items-center gap-4 text-[12px] text-cx-muted">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-layout-list" class="size-3.5" />
                {{ course.modules_count }} модул{{ course.modules_count === 1 ? 'ь' : 'я' }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-play-circle" class="size-3.5" />
                {{ course.lessons_count }} урок{{ course.lessons_count >= 5 ? 'ов' : 'а' }}
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
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
