<script setup lang="ts">
const authStore = useAuthStore()
const categories = ['Hammasi', 'Vibe coding', 'AI agentlar', 'Neyrotarmoqlar', 'Kontent']
const activeCategory = ref('Hammasi')
const hasSubscription = computed(() => authStore.hasSubscription)
const isOwner = computed(() => authStore.isOwner)
const isAccessModalOpen = ref(false)

function openCourse(slug: string) {
  navigateTo(`/courses/${slug}`)
}
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

let categoryResizeHandler: () => void
onMounted(() => {
  categoryResizeHandler = updateCategoryIndicator
  window.addEventListener('resize', categoryResizeHandler, { passive: true })
  scheduleCategoryIndicatorUpdate()
  document.fonts?.ready.then(updateCategoryIndicator)
})
onUnmounted(() => {
  window.removeEventListener('resize', categoryResizeHandler)
})

const coursesStore = useCoursesStore()
onMounted(() => coursesStore.load())

const filtered = computed(() => {
  const all = coursesStore.all
  if (activeCategory.value === 'Hammasi') return all
  return all.filter(c => c.tags.some(t => t === activeCategory.value))
})

function moduleLabel(count: number) {
  return count === 1 ? 'модуль' : count < 5 ? 'модуля' : 'модулей'
}

function lessonLabel(count: number) {
  return count === 1 ? 'урок' : count < 5 ? 'урока' : 'уроков'
}

useSeoMeta({ title: 'Kurslar — Chayroom AI' })
</script>

<template>
  <div class="bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">Kurslar</span>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-[32px] font-extrabold tracking-tight text-[#1a1a1a]">
            Kurslar
          </h1>
          <p class="text-cx-muted mt-1 text-[15px]">
            AIni ish va hayotga joriy qilish bo'yicha qadam-baqadam dasturlar
          </p>
        </div>
        <NuxtLink
          v-if="isOwner"
          to="/admin/courses/new"
          class="btn-primary btn-primary-dark flex items-center gap-2 px-4! py-2.5! text-[13px]! shrink-0"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          Kurs qo'shish
        </NuxtLink>
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

      <!-- Course cards -->
      <div class="grid grid-cols-3 gap-5">
        <div
          v-for="course in filtered"
          :key="course.title"
          class="group flex flex-col overflow-hidden rounded-2xl border border-[#D4D4D1] bg-[#fafafa] cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] hover:border-[#D4D4D1]/60"
          @click="openCourse(course.slug)"
        >
          <!-- Header -->
          <div class="relative h-44 overflow-hidden shrink-0" :style="{ backgroundColor: course.bg }">
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
          <div class="flex h-[264.5px] flex-col px-5 pt-5 pb-5 gap-3">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in course.tags"
                :key="tag"
                class="inline-flex h-7 items-center rounded-full bg-[#EAEAE8] border border-[#D4D4D1] px-3 text-[12px] font-medium text-[#6B6B6B]"
              >{{ tag }}</span>
            </div>

            <p class="text-[15px] font-bold text-[#1a1a1a] leading-[1.4] line-clamp-1 transition-colors duration-200 group-hover:text-cx-blue">
              {{ course.title }}
            </p>

            <p class="text-[13px] text-cx-muted leading-[1.6] line-clamp-3 flex-1">
              {{ course.desc }}
            </p>

            <div class="mt-auto pt-3">
              <div class="mb-3 grid grid-cols-3 gap-2 text-[12px] font-medium text-cx-muted">
                <span class="flex items-center gap-1.5 whitespace-nowrap">
                  <UIcon
                    name="i-lucide-layout-list"
                    class="size-3.5 shrink-0"
                  />
                  {{ course.modules }} {{ moduleLabel(course.modules) }}
                </span>
                <span class="flex items-center gap-1.5 whitespace-nowrap">
                  <UIcon
                    name="i-lucide-play-circle"
                    class="size-3.5 shrink-0"
                  />
                  {{ course.lessons }} {{ lessonLabel(course.lessons) }}
                </span>
                <span class="flex items-center gap-1.5 whitespace-nowrap">
                  <UIcon
                    name="i-lucide-clock"
                    class="size-3.5 shrink-0"
                  />
                  {{ course.duration }}
                </span>
              </div>

              <button
                class="btn-primary w-full text-[13px]! py-2.5! flex items-center justify-center gap-2"
                @click.stop="openCourse(course.slug)"
              >
                <span>Смотреть курс</span>
                <span class="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="!filtered.length"
          class="col-span-3 flex min-h-105 flex-col items-center justify-center gap-3 text-cx-muted"
        >
        <UIcon name="i-lucide-book-open" class="size-9 opacity-40" />
        <p class="text-[15px] font-semibold">Bu kategoriyada kurslar hali yo'q</p>
      </div>

      </div>
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
  </div>
</template>
