<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
authStore.restoreFromStorage()
const coursesStore = useCoursesStore()
const { isMiniApp } = useTelegramApp()
const isLoggedIn = computed(() => !!authStore.user)

onMounted(() => coursesStore.load())

const course = computed(() => coursesStore.all.find(c => c.slug === (route.params.slug as string)))

const openModules = ref<Set<number>>(new Set([0]))

function getLessonFlatIndex(modIndex: number, lessonIndex: number): number {
  let offset = 0
  for (let i = 0; i < modIndex; i++) {
    offset += (course.value?.modulesList[i]?.lessons.length ?? 0)
  }
  return offset + lessonIndex + 1
}

function toggleModule(index: number) {
  const next = new Set(openModules.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  openModules.value = next
}

useSeoMeta({ title: computed(() => `${course.value?.title ?? 'Kurs'} — Chayroom AI`) })
</script>

<template>
  <div v-if="course" class="min-h-screen" :class="isMiniApp ? 'bg-[#efefef] is-mini' : 'bg-cx-surface'">
    <!-- Preview image wrapper -->
    <div class="mx-auto" :class="isMiniApp ? 'px-4 pt-5 max-w-full' : 'w-310 max-w-[calc(100vw-40px)] px-0 pt-8 max-md:px-4'">
      <div class="mx-auto max-w-full" :class="isMiniApp ? '' : 'w-220.5'">

      <!-- Back button -->
      <div v-if="!isMiniApp" class="mb-4 pt-8">
        <NuxtLink to="/courses" class="course-back-button">
          <UIcon name="i-lucide-arrow-left" class="size-5" />
          Kurslarga qaytish
        </NuxtLink>
      </div>

      <!-- Course preview image -->
      <div class="rounded-2xl overflow-hidden mb-6 relative max-md:!h-[180px]" :style="{ height: isMiniApp ? '180px' : '400px', backgroundColor: course.bg }">
        <div class="absolute top-4 left-5">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-black/20 text-white">{{ course.badge }}</span>
        </div>
        <div class="absolute top-4 right-5">
          <span
            class="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-bold shadow-[0_10px_24px_rgba(10,10,10,0.12)]"
            :style="{ backgroundColor: course.levelColor + '22', color: course.levelColor }"
          >
            <UIcon name="i-solar-ranking-bold" class="size-4" />
            {{ course.level }}
          </span>
        </div>

        <!-- Light preview -->
        <div v-if="!course.dark" class="absolute inset-0 flex items-center justify-center">
          <div class="course-preview-copy flex items-center gap-6">
            <div>
              <p class="text-[12px] font-bold text-cx-muted mb-2 uppercase tracking-wide">Kurs:</p>
              <p class="course-preview-title text-[28px] font-extrabold text-[#1a1a1a] leading-[1.15]">
                Yaratish va sozlash<br>
                <span :style="{ color: course.accentColor }">AI agentni</span><br>
                <span :style="{ color: course.accentColor }">Hermes</span> asosida
              </p>
            </div>
            <div class="flex flex-col gap-3 items-end opacity-50">
              <UIcon name="i-lucide-settings" class="size-10 text-cx-blue" />
              <UIcon name="i-lucide-bot" class="size-14 text-[#1a1a1a]" />
              <UIcon name="i-lucide-pen-line" class="size-8 text-cx-blue" />
            </div>
          </div>
        </div>

        <!-- Dark preview -->
        <div v-else class="course-preview-copy absolute inset-0 flex items-center justify-center gap-5">
          <UIcon name="i-lucide-globe" class="size-16 text-[#f97316] shrink-0" />
          <div>
            <p class="course-preview-title text-[28px] font-extrabold text-white leading-tight mb-2">Vibe coding noldan</p>
            <p class="text-[14px] text-white/60 leading-normal">Kod bilmasdan AI yordamida saytlar, vositalar va ilovalar yaratish</p>
          </div>
        </div>
      </div>
      </div><!-- /882px inner -->
    </div>

    <!-- content -->
    <div class="mx-auto pb-8" :class="isMiniApp ? 'px-4 max-w-full' : 'w-310 max-w-[calc(100vw-40px)] px-0 max-md:px-4'">
      <div class="max-w-full" :class="isMiniApp ? '' : 'mx-auto w-220.5'">

      <!-- Course info -->
      <div class="mb-6">
        <h1 class="course-detail-title font-extrabold tracking-tight text-[#1a1a1a] leading-tight mb-2" :class="isMiniApp ? 'text-[26px]' : 'text-[48px]'">
          {{ course.title }}
        </h1>
        <p class="course-detail-desc text-cx-muted leading-[1.6] mb-3" :class="isMiniApp ? 'text-[15px]' : 'text-[20px]'">{{ course.desc }}</p>
        <div class="course-detail-meta flex items-center gap-5 text-cx-muted mb-4" :class="isMiniApp ? 'text-[13px]' : 'text-[20px]'">
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
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="tag in course.tags"
            :key="tag"
            class="course-meta-chip"
          >{{ tag }}</span>
          <span
            class="course-meta-chip"
            :style="{ backgroundColor: course.levelColor + '22', color: course.levelColor }"
          >
            <UIcon name="i-solar-ranking-bold" class="size-4" />
            {{ course.level }}
          </span>
        </div>
      </div>

      <div class="course-detail-grid grid items-start" :class="isMiniApp ? 'grid-cols-1 gap-5' : 'grid-cols-[1fr_300px] gap-10 max-md:grid-cols-1'">

        <!-- LEFT: modules -->
        <div>
          <!-- Rich content -->
          <div
            v-if="course.content"
            class="rich-content prose max-w-none text-[#14161f] mb-10"
            v-html="course.content"
          />

          <h2 class="course-detail-section-title flex items-center gap-3 font-extrabold text-[#1a1a1a] mb-4" :class="isMiniApp ? 'text-[18px]' : 'text-[40px]'">
            <UIcon name="i-solar-bill-list-bold" :class="isMiniApp ? 'size-5' : 'size-9'" />
            Kurs tarkibi
          </h2>
          <!-- Mini-app: flat card layout -->
          <div v-if="isMiniApp" class="flex flex-col gap-2">
            <div
              v-for="(mod, modIndex) in course.modulesList"
              :key="modIndex"
              class="rounded-2xl overflow-hidden"
              style="background:#ffffff"
            >
              <button
                class="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer focus:outline-none"
                @click="toggleModule(modIndex)"
              >
                <div class="flex size-7 items-center justify-center rounded-full shrink-0 text-[12px] font-bold" :style="openModules.has(modIndex) ? 'background:#3480f1;color:#fff' : 'background:#efefef;color:#70707a'">
                  {{ modIndex + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-[15px] text-[#14161f] leading-tight">{{ mod.title }}</span>
                  </div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[12px] text-[#70707a]">{{ mod.lessons.length }} dars</span>
                    <span class="text-[#e8e6e0]">·</span>
                    <span class="text-[12px] text-[#70707a]">{{ mod.duration }}</span>
                  </div>
                </div>
                <UIcon
                  :name="openModules.has(modIndex) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="size-4 text-[#70707a] shrink-0"
                />
              </button>

              <div v-if="openModules.has(modIndex)" class="flex flex-col gap-px px-3 pb-3">
                <NuxtLink
                  v-for="(lesson, lessonIndex) in mod.lessons"
                  :key="lessonIndex"
                  :to="`/courses/${course.slug}/lesson/${getLessonFlatIndex(modIndex, lessonIndex)}`"
                  class="lesson-item flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer"
                  :style="{ background: '#efefef', '--j': lessonIndex }"
                >
                  <UIcon
                    name="i-solar-clapperboard-play-bold"
                    class="size-3.5 shrink-0 text-[#3480f1]"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-[13px] text-[#14161f] leading-snug">
                      {{ getLessonFlatIndex(modIndex, lessonIndex) }}. {{ lesson.title }}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-[11px] text-[#70707a]">{{ lesson.type }}</span>
                      <span class="text-[#e8e6e0]">·</span>
                      <span class="inline-flex items-center gap-1 text-[11px] text-[#70707a]">
                        <UIcon name="i-lucide-clock" class="size-3" />
                        {{ lesson.duration }}
                      </span>
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Desktop: timeline layout -->
          <div v-else class="relative flex flex-col">
          <!-- Vertical line -->
          <div class="absolute left-4.75 top-10 bottom-4 w-px bg-cx-line" />

          <div
            v-for="(mod, modIndex) in course.modulesList"
            :key="modIndex"
            class="module-item relative flex gap-5"
            :class="modIndex < course.modulesList.length - 1 ? 'mb-2' : ''"
            :style="{ '--i': modIndex }"
          >
            <!-- Step dot -->
            <div class="relative z-10 flex flex-col items-center shrink-0">
              <div
                class="step-dot flex size-10 items-center justify-center rounded-full border-2 text-[14px] font-bold"
                :class="openModules.has(modIndex)
                  ? 'step-dot--active border-[#1a1a1a] bg-[#1a1a1a] text-white'
                  : 'border-cx-line bg-[#f7f5ef] text-cx-muted'"
              >
                {{ modIndex + 1 }}
              </div>
            </div>

            <!-- Module content -->
            <div class="flex-1 min-w-0 pb-6">
              <!-- Module header -->
              <button
                class="module-header w-full flex items-start gap-3 py-2 text-left cursor-pointer focus:outline-none group"
                @click="toggleModule(modIndex)"
              >
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-center gap-2">
                    <span class="course-detail-module-title font-bold text-[#1a1a1a] leading-tight text-[20px]">{{ mod.title }}</span>
                    <UIcon
                      v-if="!isLoggedIn"
                      name="i-lucide-lock"
                      class="size-4 text-cx-muted shrink-0"
                    />
                  </div>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-cx-muted text-[14px]">{{ mod.subtitle }}</span>
                    <span class="text-cx-line">·</span>
                    <span class="text-cx-muted text-[14px]">{{ mod.lessons.length }} dars</span>
                    <span class="text-cx-line">·</span>
                    <span class="text-cx-muted text-[14px]">{{ mod.duration }}</span>
                  </div>
                </div>
                <UIcon
                  :name="openModules.has(modIndex) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="chevron size-5 text-cx-muted shrink-0 mt-1"
                  :class="openModules.has(modIndex) ? 'chevron--open' : ''"
                />
              </button>

              <!-- Lessons list -->
              <div v-if="openModules.has(modIndex)" class="mt-3 flex flex-col gap-1.5">
                <component
                  :is="isLoggedIn ? 'NuxtLink' : 'div'"
                  v-for="(lesson, lessonIndex) in mod.lessons"
                  :key="lessonIndex"
                  :to="isLoggedIn ? `/courses/${course.slug}/lesson/${getLessonFlatIndex(modIndex, lessonIndex)}` : undefined"
                  class="lesson-item flex items-center gap-3 rounded-xl px-4 py-3 bg-[#f7f5ef]"
                  :class="isLoggedIn ? 'cursor-pointer' : ''"
                  :style="{ '--j': lessonIndex }"
                >
                  <UIcon
                    :name="(!lesson.free && !isLoggedIn) ? 'i-solar-lock-bold' : 'i-solar-clapperboard-play-bold'"
                    class="size-4 shrink-0"
                    :class="(!lesson.free && !isLoggedIn) ? 'text-cx-muted' : 'text-cx-blue'"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-[#1a1a1a] leading-snug text-[15px]">
                      {{ getLessonFlatIndex(modIndex, lessonIndex) }}. {{ lesson.title }}
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="inline-flex items-center rounded-md bg-[#ede9e0] px-2 py-0.5 text-[12px] font-medium text-cx-muted">{{ lesson.type }}</span>
                      <span class="inline-flex items-center gap-1 text-[12px] text-cx-muted">
                        <UIcon name="i-lucide-clock" class="size-3" />
                        {{ lesson.duration }}
                      </span>
                    </div>
                  </div>
                </component>
              </div>
            </div>
          </div>
          </div>
        </div>

        <!-- RIGHT: sticky sidebar -->
        <div class="sticky top-8 flex flex-col gap-4 max-md:order-first max-md:relative max-md:top-0">
          <!-- Stats card -->
          <div class="rounded-2xl border border-cx-line bg-[#f7f5ef] overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-cx-line">
              <div class="flex items-center gap-3">
                <UIcon name="i-solar-layers-minimalistic-bold" class="size-5 text-cx-blue shrink-0" />
                <span class="text-[15px] text-cx-muted font-medium">Modullar</span>
              </div>
              <span class="font-bold text-[#1a1a1a] tabular-nums" :class="isMiniApp ? 'text-[15px]' : 'text-[20px]'">{{ course.modules }}</span>
            </div>
            <div class="flex items-center justify-between px-5 py-4 border-b border-cx-line">
              <div class="flex items-center gap-3">
                <UIcon name="i-solar-play-circle-bold" class="size-5 text-cx-blue shrink-0" />
                <span class="text-[15px] text-cx-muted font-medium">Darslar</span>
              </div>
              <span class="font-bold text-[#1a1a1a] tabular-nums" :class="isMiniApp ? 'text-[15px]' : 'text-[20px]'">{{ course.lessons }}</span>
            </div>
            <div class="flex items-center justify-between px-5 py-4">
              <div class="flex items-center gap-3">
                <UIcon name="i-solar-clock-circle-bold" class="size-5 text-cx-blue shrink-0" />
                <span class="text-[15px] text-cx-muted font-medium">Vaqt</span>
              </div>
              <span class="font-bold text-[#1a1a1a]" :class="isMiniApp ? 'text-[15px]' : 'text-[20px]'">{{ course.duration }}</span>
            </div>
          </div>

          <!-- Unified start card — always shown, accent color never changes -->
          <div class="rounded-2xl border border-cx-line bg-[#f7f5ef] overflow-hidden">
            <!-- Progress (logged in) -->
            <div v-if="isLoggedIn" class="px-5 pt-5 pb-4">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2.5">
                  <UIcon name="i-solar-chart-2-bold" class="size-5 text-cx-blue" />
                  <span class="text-[15px] font-bold text-cx-ink">O'quv jarayoni</span>
                </div>
                <span class="text-[15px] font-bold text-cx-blue">0%</span>
              </div>
              <div class="h-2 bg-[#e5e2d8] rounded-full overflow-hidden mb-3">
                <div class="h-full bg-cx-blue rounded-full transition-[width] duration-500 ease-out" style="width: 0%" />
              </div>
              <div class="flex items-center gap-1.5 text-[13px] text-cx-muted">
                <UIcon name="i-solar-play-circle-bold" class="size-4 text-cx-muted" />
                <span>0 / {{ course.lessons }} dars</span>
              </div>
            </div>

            <!-- Subscription hint (not logged in) -->
            <div v-else class="px-5 pt-5 pb-4">
              <ul class="flex flex-col gap-3">
                <li
                  v-for="item in [
                    'Barcha kurslar va qo\'llanmalar',
                    'Yopiq Telegram chat',
                    'Jonli efirlar va networking'
                  ]"
                  :key="item"
                  class="flex items-center gap-2.5 text-[13px] text-[#1a1a1a]"
                >
                  <UIcon name="i-solar-check-circle-bold" class="size-4.5 text-emerald-500 shrink-0" />
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- Start button — always accent color -->
            <div class="border-t border-cx-line px-5 py-4">
              <NuxtLink
                :to="isLoggedIn ? '/courses/' + course.slug + '/lesson/1' : { path: '/login', query: { redirect: '/courses/' + course.slug } }"
                class="start-btn w-full flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-[15px] font-bold text-white"
                :style="{ background: course.accentColor || '#3480f1' }"
              >
                <UIcon name="i-solar-play-circle-bold" class="start-btn-icon size-5 shrink-0" />
                <span>O'qishni boshlash</span>
                <span class="start-btn-arrow ml-auto">→</span>
              </NuxtLink>
            </div>
          </div>
        </div><!-- /sidebar -->

      </div><!-- /grid -->
      </div><!-- /882px inner -->
    </div>
  </div>
</template>

<style scoped>
/* ── Easing tokens ─────────────────────────────────────── */
/* ease-out-quart: natural deceleration, decisive feel */

@keyframes module-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes lesson-enter {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes dot-activate {
  0%   { transform: scale(0.88); opacity: 0.6; }
  100% { transform: scale(1);    opacity: 1; }
}

/* ── Module entrance (staggered) ───────────────────────── */
.module-item {
  animation: module-enter 340ms cubic-bezier(0.25, 1, 0.5, 1) both;
  animation-delay: calc(var(--i, 0) * 45ms + 60ms);
}

/* ── Step dot ──────────────────────────────────────────── */
.step-dot {
  transition: background-color 200ms cubic-bezier(0.25, 1, 0.5, 1),
              border-color     200ms cubic-bezier(0.25, 1, 0.5, 1),
              color            200ms cubic-bezier(0.25, 1, 0.5, 1);
}
.step-dot--active {
  animation: dot-activate 240ms cubic-bezier(0.25, 1, 0.5, 1) both;
}

/* ── Chevron rotation ──────────────────────────────────── */
.chevron {
  transition: transform 240ms cubic-bezier(0.25, 1, 0.5, 1);
}
.chevron--open {
  transform: rotate(180deg);
}

/* ── Lesson items (staggered + hover lift) ─────────────── */
.lesson-item {
  animation: lesson-enter 260ms cubic-bezier(0.25, 1, 0.5, 1) both;
  animation-delay: calc(var(--j, 0) * 35ms + 15ms);
  transition: background-color 160ms cubic-bezier(0.25, 1, 0.5, 1),
              transform        180ms cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow       180ms cubic-bezier(0.25, 1, 0.5, 1);
}
.lesson-item:hover {
  background-color: #ede9e0;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(20, 22, 31, 0.06);
}
.lesson-item:active {
  transform: scale(0.985);
  box-shadow: none;
  transition-duration: 100ms;
}

/* ── Start button ──────────────────────────────────────── */
.start-btn {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transition: transform 200ms cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1),
              filter 200ms cubic-bezier(0.25, 1, 0.5, 1);
}
.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  filter: brightness(1.08);
}
.start-btn:active { transform: scale(0.97); }
.start-btn-icon {
  transition: transform 220ms cubic-bezier(0.25, 1, 0.5, 1);
}
.start-btn:hover .start-btn-icon {
  transform: scale(1.15) rotate(-8deg);
}
.start-btn-arrow {
  transition: transform 220ms cubic-bezier(0.25, 1, 0.5, 1);
}
.start-btn:hover .start-btn-arrow {
  transform: translateX(4px);
}

/* ── Accessibility ─────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .module-item,
  .lesson-item,
  .step-dot--active {
    animation: none;
  }
  .step-dot,
  .chevron,
  .lesson-item,
  .start-btn,
  .start-btn-icon,
  .start-btn-arrow {
    transition-duration: 0.01ms !important;
  }
}


.course-meta-chip {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 8px;
  background: #f7f5ef;
  color: #14161f;
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
}

.course-back-button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 22px;
  border-radius: 999px;
  background: #f7f5ef;
  color: #14161f;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  transition: transform 0.2s ease;
}

.course-back-button:hover {
  transform: scale(1.03);
  color: #3480f1;
}

.cta-access-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  justify-content: center;
  background: #0a0a0a;
  border: 1px solid #0a0a0a;
  border-radius: 999px;
  padding: 8px 14px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(10,10,10,0.12);
  transition: gap 0.2s ease, opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}
.cta-access-btn:hover  { gap: 12px; opacity: 0.9; transform: scale(1.04); background: #1a1a1a; }
.cta-access-btn:active { opacity: 0.7; transform: scale(0.98); }

/* ── Mini-app overrides ── */
.guide-detail--mini .course-meta-chip,
.is-mini .course-meta-chip {
  min-height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 6px;
}
</style>
