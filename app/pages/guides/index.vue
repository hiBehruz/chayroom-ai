<script setup lang="ts">
const authStore = useAuthStore()
const hasSubscription = computed(() => authStore.hasSubscription)
const isOwner = computed(() => authStore.isOwner)

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

const guidesStore = useGuidesStore()
onMounted(() => guidesStore.load())

const filtered = computed(() => {
  const all = guidesStore.all
  if (activeCategory.value === 'Hammasi') return all
  return all.filter(g => g.category === activeCategory.value)
})

useSeoMeta({ title: 'Qo\'llanmalar — Chayroom AI' })
</script>

<template>
  <div class="bg-white">
    <div class="max-w-295 mx-auto px-10 py-8 max-md:px-4">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink
          to="/"
          class="hover:text-cx-ink transition-colors"
        >Bosh sahifa</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">Qo'llanmalar</span>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between mb-6 max-md:flex-col max-md:items-start max-md:gap-3">
        <div>
          <h1 class="text-[32px] font-extrabold tracking-tight text-[#1a1a1a]">
            Qo'llanmalar
          </h1>
          <p class="text-cx-muted mt-1 text-[15px]">
            AI bo'yicha amaliy qo'llanmalar.
          </p>
        </div>
        <NuxtLink
          v-if="isOwner"
          to="/admin/guides/new"
          class="btn-primary btn-primary-dark flex items-center gap-2 px-4! py-2.5! text-[13px]! shrink-0"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          Qo'llanma qo'shish
        </NuxtLink>
      </div>

      <!-- Category filter -->
      <div class="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-8 scrollbar-none">
        <div
          ref="categoryFilterRef"
          class="relative inline-flex items-center bg-[#f0f0f0] rounded-2xl p-1.5 whitespace-nowrap"
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
      </div>

      <!-- Guide cards -->
      <TransitionGroup
        v-if="filtered.length"
        tag="div"
        enter-active-class="transition-[opacity,transform] duration-100 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="hidden"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <article
          v-for="guide in filtered"
          :key="guide.slug"
          class="group flex min-h-113.75 flex-col overflow-hidden rounded-2xl border border-[#D4D4D1] bg-[#fafafa] cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] hover:border-[#D4D4D1]/60"
          @click="navigateTo('/guides/' + guide.slug)"
        >
          <!-- Preview -->
          <div
            class="relative h-47 overflow-hidden shrink-0"
            :style="{ backgroundColor: guide.bg }"
          >
            <span
              class="absolute top-3 left-5 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
              :style="{ backgroundColor: guide.accent + '33', color: guide.accent }"
            >{{ guide.badge }}</span>

            <!-- Owner: edit icon -->
            <button
              v-if="isOwner"
              class="absolute top-3 right-3 z-20 grid size-7 place-items-center rounded-lg bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
              @click.stop="navigateTo('/admin/guides/edit/' + guide.slug)"
            >
              <UIcon name="i-lucide-pencil" class="size-3.5" />
            </button>
            <div
              class="absolute inset-0 opacity-35 transition-opacity duration-300 group-hover:opacity-50"
              :style="{ background: `radial-gradient(ellipse at 95% 105%, ${guide.accent} 0%, transparent 60%)` }"
            />
            <div
              class="absolute inset-0 opacity-15"
              :style="{ background: `radial-gradient(ellipse at 5% -5%, ${guide.accent} 0%, transparent 55%)` }"
            />
            <p
              class="absolute inset-0 z-10 flex items-center justify-center px-6 text-[19px] font-extrabold leading-[1.18] text-center line-clamp-3 transition-transform duration-300 group-hover:scale-[1.03]"
              :style="{ color: guide.bg === '#f5ede0' ? '#1a1a1a' : 'white' }"
            >
              {{ guide.title }}
            </p>
          </div>

          <!-- Body -->
          <div class="flex h-[260.25px] flex-col gap-3.5 px-5 pb-5 pt-5">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in guide.tags"
                :key="tag"
                class="inline-flex h-7 items-center rounded-full bg-[#EAEAE8] border border-[#D4D4D1] px-3 text-[12px] font-medium text-[#6B6B6B]"
              >{{ tag }}</span>
            </div>

            <p class="truncate text-[15px] font-bold leading-[1.35] text-[#1a1a1a] transition-colors duration-200 group-hover:text-cx-blue">
              {{ guide.title }}
            </p>

            <p class="flex-1 text-[13px] leading-[1.55] text-cx-muted line-clamp-3">
              {{ guide.desc }}
            </p>

            <div class="mt-2 flex items-center gap-1.5">
              <span
                v-if="guide.free"
                class="flex items-center gap-1 text-xs font-medium text-green-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  class="size-4"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                Bepul
              </span>
              <span
                v-else-if="hasSubscription"
                class="flex items-center gap-1 text-xs font-medium text-green-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  class="size-4"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                Доступно по подписке
              </span>
              <span
                v-else
                class="flex items-center gap-1 text-xs font-medium text-red-500"
              >
                <UIcon
                  name="i-lucide-lock-keyhole"
                  class="size-4"
                />
                По подписке
              </span>
            </div>

            <button
              class="btn-soft-blue mt-0 h-11 w-full px-4 text-[14px] font-bold"
              type="button"
              @click.stop="navigateTo('/guides/' + guide.slug)"
            >
              <span>Читать гайд</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </article>
      </TransitionGroup>

      <div
        v-else
        class="flex min-h-105 flex-col items-center justify-center gap-3 text-cx-muted"
      >
        <UIcon name="i-lucide-file-text" class="size-9 opacity-40" />
        <p class="text-[15px] font-semibold">Bu kategoriyada qo'llanmalar hali yo'q</p>
      </div>
    </div>
  </div>
</template>

<style>
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
