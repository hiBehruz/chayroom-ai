<script setup lang="ts">
const authStore = useAuthStore()
authStore.restoreFromStorage()
const categories = [
  { label: 'Hammasi', value: 'Hammasi', icon: '', color: '' },
  { label: 'Vibe coding', value: 'Vibe coding', icon: 'i-solar-code-circle-bold', color: '#6366f1' },
  { label: 'AI agentlar', value: 'AI agentlar', icon: 'i-solar-command-bold', color: '#f97316' },
  { label: 'Neyrotarmoqlar', value: 'Neyrotarmoqlar', icon: 'i-solar-atom-bold', color: '#22c55e' },
  { label: 'Kontent', value: 'Kontent', icon: 'i-solar-pen-new-round-bold', color: '#ec4899' }
]
const activeCategory = ref('Hammasi')
const isOwner = computed(() => authStore.isOwner)
const isAccessModalOpen = ref(false)

function openCourse(slug: string) {
  navigateTo(`/courses/${slug}`)
}
function selectCategory(value: string) {
  activeCategory.value = value
}

async function toggleFree(course: import('~/stores/courses').Course) {
  const newVal = !course.free
  await $fetch(`/api/courses/${course.slug}`, { method: 'PATCH', body: { isFree: newVal } })
  await coursesStore.load(true)
}

const { isMiniApp } = useTelegramApp()

const coursesStore = useCoursesStore()
onMounted(() => coursesStore.load())

const filtered = computed(() => {
  const all = coursesStore.all
  if (activeCategory.value === 'Hammasi') return all
  return all.filter(c => c.tags.some(t => t === activeCategory.value))
})

const COURSE_LEVEL_ICONS: Record<string, string> = {
  'Boshlang\'ich': 'i-lucide-award',
  'O\'rta': 'i-lucide-bar-chart-2',
  'Tajribali': 'i-lucide-flame',
  'Professional': 'i-lucide-rocket'
}

function courseLevelIcon(l: string) {
  return COURSE_LEVEL_ICONS[l] ?? 'i-lucide-award'
}

useSeoMeta({ title: 'Kurslar — Chayroom AI' })
</script>

<template>
  <!-- ── MINI-APP layout ── -->
  <div
    v-if="isMiniApp"
    style="background:#efefef; min-height:100vh"
  >
    <div class="w-full">
      <!-- Header -->
      <div class="px-4 pt-7 pb-4">
        <h1
          class="text-[26px] font-black tracking-tight leading-tight"
          style="color:#14161f"
        >
          Kurslar
        </h1>
        <p
          class="text-[14px] mt-1"
          style="color:#70707a"
        >
          AI agentlar, neyrotarmoqlar va vibe coding.
        </p>
      </div>

      <!-- Category pills -->
      <div
        class="flex gap-2 px-4 pb-4 overflow-x-auto"
        style="scrollbar-width:none"
      >
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="flex-none px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-150 active:scale-95 whitespace-nowrap"
          :style="activeCategory === cat.value
            ? 'background:#3480f1; color:#ffffff'
            : 'background:#ffffff; color:#14161f; border:1px solid #e8e6e0'"
          @click="selectCategory(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Course list -->
      <div class="px-4 space-y-2.5 pb-6">
        <div
          v-for="course in filtered"
          :key="course.slug"
          class="flex items-center gap-3 p-3 rounded-2xl active:opacity-70 transition-opacity cursor-pointer"
          style="background:#ffffff; border:1px solid #e8e6e0"
          @click="openCourse(course.slug)"
        >
          <!-- Thumbnail -->
          <div
            class="flex-none rounded-xl overflow-hidden"
            style="width:72px; height:72px"
            :style="{ backgroundColor: course.bg }"
          />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap gap-1 mb-1">
              <span
                v-for="tag in (course.tags || []).slice(0, 2)"
                :key="tag"
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style="background:#f0ede8; color:#70707a"
              >{{ tag }}</span>
            </div>
            <h3
              class="text-[14px] font-bold leading-snug mb-1 line-clamp-2"
              style="color:#14161f"
            >
              {{ course.title }}
            </h3>
            <p
              class="text-[12px] leading-snug line-clamp-1"
              style="color:#70707a"
            >
              {{ course.desc }}
            </p>
          </div>

          <!-- Arrow -->
          <svg
            class="flex-none"
            width="8"
            height="14"
            viewBox="0 0 8 14"
            fill="none"
          >
            <path
              d="M1 1l6 6-6 6"
              stroke="#c0c0c8"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div
          v-if="!filtered.length"
          class="py-12 text-center"
        >
          <p
            class="text-[15px] font-semibold"
            style="color:#a0a0a8"
          >
            Bu kategoriyada kurslar hali yo'q
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- ── DESKTOP layout ── -->
  <div
    v-else
    class="bg-cx-surface"
  >
    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 pt-0 pb-8 max-md:w-full max-md:max-w-none max-md:mx-0 max-md:px-0">
      <!-- Hero -->
      <section class="relative mx-auto flex max-w-310 flex-col items-center justify-center overflow-hidden text-center py-10 max-md:py-8 max-md:px-6 border-b border-[#e8e6e1]">
        <h1 class="courses-title relative z-10 text-[#14161f] max-[734px]:text-[28px] max-[734px]:leading-[30.8px] max-[734px]:tracking-[-0.56px]">
          <span class="block max-md:hidden">AI agentlar, <span class="relative inline-block">neyrotarmoqlar<svg
            class="absolute -bottom-2 left-[-3%] w-[106%] overflow-visible"
            viewBox="0 0 600 18"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          ><path
            d="M10,12 C150,2 450,2 590,12"
            stroke="#3480f1"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="vector-effect:non-scaling-stroke"
          /></svg></span> va<br>vibe coding kurslari</span>
          <span class="hidden max-md:block">Kurslar</span>
        </h1>
      </section>

      <!-- Category filter -->
      <div
        :class="[
          'mt-10 mb-14 flex items-center gap-2 max-md:mt-4 max-md:mb-6 max-md:w-full max-md:overflow-x-auto max-md:px-4 max-md:gap-1 max-md:justify-start scrollbar-none',
          isOwner ? 'justify-between' : 'justify-center'
        ]"
      >
        <div class="inline-flex shrink-0 items-center gap-2 whitespace-nowrap max-md:gap-1">
          <button
            v-for="cat in categories"
            :key="cat.value"
            :class="[
              'course-filter-button inline-flex items-center gap-2 rounded-full text-[18px] font-semibold transition-all duration-200',
              activeCategory === cat.value
                ? 'bg-[#14161f] text-[#fffdf9]'
                : 'bg-[#f7f5ef] text-[#14161f] hover:bg-[#eceae4]'
            ]"
            @click="selectCategory(cat.value)"
          >
            <UIcon
              v-if="cat.icon"
              :name="cat.icon"
              class="size-5 max-md:size-4"
            />
            {{ cat.label }}
          </button>
        </div>

        <NuxtLink
          v-if="isOwner"
          to="/admin/courses/new"
          class="courses-add-button shrink-0 inline-flex items-center gap-2"
        >
          <UIcon
            name="i-lucide-plus"
            class="size-4"
          />
          Kurs qo'shish
        </NuxtLink>
      </div>

      <!-- Course cards -->
      <TransitionGroup
        v-if="filtered.length"
        tag="div"
        enter-active-class="transition-[opacity,transform] duration-100 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="hidden"
        class="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3 max-md:gap-6 max-md:px-4"
      >
        <article
          v-for="course in filtered"
          :key="course.slug"
          class="course-card group cursor-pointer"
          @click="openCourse(course.slug)"
        >
          <!-- Preview -->
          <div
            class="course-preview relative overflow-hidden rounded-[28px] max-[734px]:rounded-[20px]"
            :style="{ backgroundColor: course.bg }"
          >
            <div
              v-if="isOwner"
              class="absolute right-5 top-5 z-20 flex gap-2"
            >
              <button
                class="grid size-9 place-items-center rounded-full backdrop-blur-sm transition-all"
                :class="course.free ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-black/40 text-white hover:bg-black/60'"
                :title="course.free ? 'Pullik qilish' : 'Bepul qilish'"
                @click.stop="toggleFree(course)"
              >
                <UIcon
                  :name="course.free ? 'i-lucide-unlock' : 'i-lucide-lock'"
                  class="size-4"
                />
              </button>
              <button
                class="grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                @click.stop="navigateTo('/admin/courses/edit/' + course.slug)"
              >
                <UIcon
                  name="i-lucide-pencil"
                  class="size-4"
                />
              </button>
            </div>

            <div
              class="course-card-art absolute inset-0"
              :class="course.dark ? 'text-white' : 'text-[#14161f]'"
            >
              <span class="art-star art-star-1" />
              <span class="art-star art-star-2" />
              <span class="art-line art-line-1" />
              <span class="art-line art-line-2" />
              <span class="art-orbit" />
              <span
                class="art-object"
                :style="{ backgroundColor: course.accentColor }"
              />
              <span
                class="art-hand"
                :class="course.dark ? 'art-hand-dark' : ''"
              />
            </div>
          </div>

          <!-- Body -->
          <div class="course-card-body px-2 pt-6 max-md:px-0 max-md:pt-3">
            <div class="mb-3 flex flex-nowrap items-center gap-1.5 overflow-hidden max-md:gap-1 max-md:mb-1.5">
              <span
                class="course-meta-chip inline-flex items-center gap-1.5 whitespace-nowrap rounded-md"
                :style="{ background: (course.levelColor || '#22c55e') + '20', color: course.levelColor || '#22c55e' }"
              >
                <UIcon
                  :name="courseLevelIcon(course.level)"
                  class="size-3.5 shrink-0"
                />
                {{ course.level }}
              </span>
              <span class="course-meta-chip inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-[#f7f5ef] text-[#14161f]">
                <UIcon
                  name="i-solar-tag-bold"
                  class="size-4 shrink-0"
                />
                {{ course.tags[0] }}
              </span>
            </div>

            <h2 class="line-clamp-2 text-[24px] font-semibold leading-[28px] text-[#14161f] max-md:text-[18px] max-md:leading-6">
              {{ course.title }}
            </h2>

            <div
              v-if="course.free"
              class="mt-2"
            >
              <span class="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[12px] font-semibold text-emerald-700">
                <svg
                  class="size-3 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                Bepul
              </span>
            </div>
          </div>
        </article>
      </TransitionGroup>

      <div
        v-if="!filtered.length"
        class="flex min-h-105 flex-col items-center justify-center gap-3 text-cx-muted"
      >
        <div class="grid size-16 place-items-center rounded-2xl bg-[#1a1a1a]">
          <UIcon
            name="i-lucide-book-open"
            class="size-8 text-white"
          />
        </div>
        <p class="text-[18px] font-semibold text-[#1a1a1a]">
          Bu kategoriyada kurslar hali yo'q
        </p>
      </div>
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
  </div>
</template>

<style scoped>
.courses-add-button {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: #14161f;
  color: #fffdf9;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  transform-origin: center;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.courses-add-button:hover {
  transform: scale(1.04);
  opacity: 0.92;
}

.courses-title {
  font-family: var(--font-inter-display), 'Inter Display', sans-serif;
  font-weight: 600;
  font-size: 60px;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.courses-star {
  position: absolute;
  display: block;
  width: 36px;
  aspect-ratio: 1;
  background: currentColor;
  clip-path: polygon(50% 0, 62% 36%, 100% 50%, 62% 64%, 50% 100%, 38% 64%, 0 50%, 38% 36%);
}

.courses-star-1 {
  left: 10%;
  top: 52%;
  width: 44px;
  color: #3480f1;
}

.courses-star-2 {
  left: 9%;
  top: 18%;
  width: 20px;
  color: #3480f1;
}

.courses-star-3 {
  right: 9%;
  top: 16%;
  width: 46px;
  color: #3480f1;
}

.course-filter-button {
  padding: 11px 18px 13px;
  font-family: var(--font-inter), 'Inter Fallback', sans-serif;
  line-height: 1;
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.course-filter-button:hover {
  transform: scale(1.04);
}

@media (max-width: 734px) {
  .course-filter-button {
    padding: 6px 16px;
    font-size: 15px;
    line-height: 24px;
    gap: 4px;
  }
}

.course-card {
  width: 100%;
  max-width: 397px;
  min-width: 0;
  transform-origin: center top;
  transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (max-width: 734px) {
  .course-card {
    max-width: 370px;
    padding: 0 4px;
    margin-left: auto;
    margin-right: auto;
  }
}

.course-card:hover {
  transform: translateY(-7px) scale(1.025);
}

.course-preview {
  aspect-ratio: 16 / 9;
  box-shadow: none;
  transition: box-shadow 0.32s ease;
}

.course-card:hover .course-preview {
  box-shadow: 0 20px 46px rgba(20, 21, 31, 0.12);
}

.course-card-body {
  display: flex;
  flex-direction: column;
}

.course-meta-chip {
  padding: 6px 10px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

@media (max-width: 734px) {
  .course-meta-chip {
    font-size: 14px;
    line-height: 20px;
    gap: 4px;
  }
}

/* Art decorations */
.course-card-art {
  pointer-events: none;
}

.art-star {
  position: absolute;
  display: block;
  width: 36px;
  aspect-ratio: 1;
  background: currentColor;
  clip-path: polygon(50% 0, 62% 36%, 100% 50%, 62% 64%, 50% 100%, 38% 64%, 0 50%, 38% 36%);
}

.art-star-1 {
  left: 18%;
  bottom: 28%;
  width: 34px;
}

.art-star-2 {
  right: 20%;
  top: 18%;
  width: 28px;
}

.art-object {
  position: absolute;
  left: 47%;
  top: 38%;
  width: 92px;
  height: 92px;
  border-radius: 26px;
  transform: rotate(45deg);
  box-shadow: inset 0 0 0 8px rgba(255, 253, 249, 0.88);
}

.art-orbit {
  position: absolute;
  left: 22%;
  top: 18%;
  width: 46%;
  height: 58%;
  border: 6px solid currentColor;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-radius: 9999px;
  transform: rotate(-20deg);
}

.art-hand {
  position: absolute;
  right: -6%;
  bottom: -32%;
  width: 52%;
  height: 62%;
  border-radius: 52% 48% 0 0;
  background: #14161f;
  transform: rotate(-18deg);
}

.art-hand-dark {
  background: white;
}

.art-line {
  position: absolute;
  display: block;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
}

.art-line-1 {
  left: 18%;
  top: 30%;
  width: 28%;
  transform: rotate(-28deg);
}

.art-line-2 {
  right: 18%;
  bottom: 28%;
  width: 30%;
  transform: rotate(15deg);
}
</style>
