<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()
const isLoggedIn = computed(() => !!authStore.user)

onMounted(() => coursesStore.load())

const course = computed(() => coursesStore.all.find(c => c.slug === (route.params.slug as string)))

const openModules = ref<Set<number>>(new Set([0]))

function getLessonFlatIndex(modIndex: number, lessonIndex: number): number {
  let offset = 0
  for (let i = 0; i < modIndex; i++) {
    offset += (course.value?.modulesList[i].lessons.length ?? 0)
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
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8 max-md:px-4">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <NuxtLink to="/courses" class="hover:text-cx-ink transition-colors">Kurslar</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium truncate max-w-80 max-md:max-w-[45vw]">{{ course.title }}</span>
      </div>

      <!-- Hero card (full width) -->
      <div class="rounded-2xl border border-cx-line bg-[#f7f7f5] overflow-hidden mb-8 flex max-md:flex-col">
        <!-- Left: info -->
        <div class="flex-1 p-7 flex flex-col justify-center">
          <h1 class="text-[30px] font-extrabold tracking-tight text-[#1a1a1a] leading-tight mb-2">
            {{ course.title }}
          </h1>
          <p class="text-[16px] text-cx-muted leading-[1.6] mb-3">{{ course.desc }}</p>
          <div class="flex items-center gap-5 text-[13px] text-cx-muted mb-4">
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
              class="px-3 py-1 rounded-full text-[12px] font-medium bg-[#EAEAE8] text-[#6B6B6B]"
            >{{ tag }}</span>
            <span
              class="px-3 py-1 rounded-full text-[12px] font-medium"
              :style="{ backgroundColor: course.levelColor + '22', color: course.levelColor, border: `1px solid ${course.levelColor}44` }"
            >{{ course.level }}</span>
          </div>
        </div>

        <!-- Right: preview -->
        <div class="w-72 shrink-0 relative overflow-hidden max-md:w-full max-md:h-48" :style="{ backgroundColor: course.bg }">
          <div class="absolute top-3 left-4">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-black/20 text-white">{{ course.badge }}</span>
          </div>
          <div class="absolute top-3 right-4">
            <span
              class="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
              :style="{ backgroundColor: course.levelColor + '22', color: course.levelColor, border: `1px solid ${course.levelColor}44` }"
            >{{ course.level }} <span class="text-[9px]">✦</span></span>
          </div>

          <!-- Light course preview -->
          <div v-if="!course.dark" class="absolute inset-0 flex items-center justify-center p-5 pt-10">
            <div class="flex items-center justify-between w-full gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-[11px] font-bold text-cx-muted mb-1 uppercase tracking-wide">Kurs:</p>
                <p class="text-[16px] font-extrabold text-[#1a1a1a] leading-[1.2]">
                  Yaratish va sozlash<br>
                  <span :style="{ color: course.accentColor }">AI agentni</span><br>
                  <span :style="{ color: course.accentColor }">Hermes</span> asosida
                </p>
              </div>
              <div class="flex flex-col gap-2 items-end opacity-60">
                <UIcon name="i-lucide-settings" class="size-6 text-cx-blue" />
                <UIcon name="i-lucide-bot" class="size-8 text-[#1a1a1a]" />
                <UIcon name="i-lucide-pen-line" class="size-5 text-cx-blue" />
              </div>
            </div>
          </div>

          <!-- Dark course preview -->
          <div v-else class="absolute inset-0 flex items-center justify-center p-5 pt-10 gap-3">
            <UIcon name="i-lucide-globe" class="size-12 text-[#f97316] shrink-0" />
            <div>
              <p class="text-[18px] font-extrabold text-white leading-tight mb-1">Vibe coding noldan</p>
              <p class="text-[11px] text-white/60 leading-normal">Kod bilmasdan AI yordamida saytlar, vositalar va ilovalar yaratish</p>
            </div>
          </div>
        </div>
      </div>

      <h2 class="text-[18px] font-extrabold text-[#1a1a1a] mb-4">Kurs tarkibi</h2>

      <div class="grid grid-cols-[1fr_340px] max-md:grid-cols-1 gap-8">
        <!-- LEFT COLUMN -->
        <div>
          <div class="flex flex-col gap-3">
            <div
              v-for="(mod, modIndex) in course.modulesList"
              :key="modIndex"
              class="rounded-2xl border border-cx-line overflow-hidden"
            >
              <!-- Module header -->
              <button
                class="w-full flex items-center gap-3 px-5 py-4 bg-[#f7f7f5] hover:bg-[#efefed] transition-colors duration-150 text-left cursor-pointer focus:outline-none"
                @click="toggleModule(modIndex)"
              >
                <span class="text-[12px] font-semibold text-cx-muted shrink-0">Modul {{ modIndex + 1 }}</span>
                <UIcon
                  v-if="!isLoggedIn"
                  name="i-lucide-lock"
                  class="size-3.5 text-cx-muted shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <div class="text-[14px] font-bold text-[#1a1a1a]">{{ mod.title }}</div>
                  <div class="text-[12px] text-cx-muted">{{ mod.subtitle }}</div>
                </div>
                <div class="flex items-center gap-3 text-[12px] text-cx-muted shrink-0">
                  <span>{{ mod.lessons.length }} dars</span>
                  <span>{{ mod.duration }}</span>
                </div>
                <UIcon
                  :name="openModules.has(modIndex) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="size-4 text-cx-muted shrink-0"
                />
              </button>

              <!-- Lessons list -->
              <div v-if="openModules.has(modIndex)">
                <component
                  :is="isLoggedIn ? 'NuxtLink' : 'div'"
                  v-for="(lesson, lessonIndex) in mod.lessons"
                  :key="lessonIndex"
                  :to="isLoggedIn ? `/courses/${course.slug}/lesson/${getLessonFlatIndex(modIndex, lessonIndex)}` : undefined"
                  class="flex items-center gap-3 px-5 py-3 border-t border-cx-line bg-[#f7f7f5] transition-colors duration-150"
                  :class="isLoggedIn ? 'hover:bg-[#efefed] cursor-pointer' : ''"
                >
                  <UIcon
                    :name="(!lesson.free && !isLoggedIn) ? 'i-lucide-lock' : 'i-lucide-play-circle'"
                    class="size-4 shrink-0"
                    :class="(!lesson.free && !isLoggedIn) ? 'text-cx-muted' : 'text-cx-blue'"
                  />
                  <span class="flex-1 text-[13px] text-[#1a1a1a]">
                    {{ getLessonFlatIndex(modIndex, lessonIndex) }}. {{ lesson.title }}
                  </span>
                  <span class="text-[12px] text-cx-muted shrink-0 mr-3">{{ lesson.type }}</span>
                  <span class="flex items-center gap-1 text-[12px] text-cx-muted shrink-0">
                    <UIcon name="i-lucide-clock" class="size-3" />
                    {{ lesson.duration }}
                  </span>
                </component>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT SIDEBAR -->
        <div class="sticky top-24 max-md:static flex flex-col gap-4">
          <!-- Stats card -->
          <div class="rounded-2xl border border-cx-line bg-[#f7f7f5] p-5">
            <div class="grid grid-cols-3 gap-3 text-center divide-x divide-cx-line">
              <div>
                <div class="text-[22px] font-extrabold text-[#1a1a1a]">{{ course.modules }}</div>
                <div class="text-[12px] text-cx-muted mt-0.5">Modullar</div>
              </div>
              <div>
                <div class="text-[22px] font-extrabold text-[#1a1a1a]">{{ course.lessons }}</div>
                <div class="text-[12px] text-cx-muted mt-0.5">Darslar</div>
              </div>
              <div>
                <div class="text-[22px] font-extrabold text-[#1a1a1a]">{{ course.duration }}</div>
                <div class="text-[12px] text-cx-muted mt-0.5">Vaqt</div>
              </div>
            </div>

          </div>

          <!-- Progress card (logged in) -->
          <div v-if="isLoggedIn" class="rounded-2xl border border-cx-line bg-[#f7f7f5] p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[13px] font-bold text-cx-ink">Ваш прогресс</span>
              <span class="text-[13px] font-bold text-cx-ink">0%</span>
            </div>
            <div class="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden mb-2">
              <div class="h-full bg-cx-blue rounded-full transition-all duration-500" style="width: 0%" />
            </div>
            <div class="text-[12px] text-cx-muted mb-4">0 из {{ course.lessons }} уроков</div>
            <NuxtLink
              :to="'/courses/' + course.slug + '/lesson/1'"
              class="btn-primary w-full text-[16px]! py-4! flex items-center justify-center gap-2"
            >
              <span>Начать обучение</span>
              <span class="btn-arrow">→</span>
            </NuxtLink>
          </div>

          <!-- CTA card (not logged in) -->
          <div v-if="!isLoggedIn" class="rounded-2xl bg-[#f2f2f0] p-7 flex flex-col items-center text-center">
            <div class="text-[20px] font-extrabold text-[#1a1a1a] mb-1">Полный доступ в AI Room Club</div>
            <div class="text-[13px] text-cx-muted mb-6">Откройте все курсы одной подпиской</div>

            <div class="text-[14px] text-cx-muted line-through mb-1">249 000 so'm</div>
            <div class="flex items-baseline gap-1.5 mb-6">
              <span class="text-[42px] font-extrabold text-cx-blue leading-none">199 000</span>
              <span class="text-[14px] text-cx-muted">so'm / oy</span>
            </div>

            <NuxtLink
              :to="{ path: '/login', query: { redirect: `/courses/${course.slug}` } }"
              class="btn-primary btn-primary-dark w-full h-14 text-[15px]! font-bold! mb-6"
            >
              Kirish huquqini olish →
            </NuxtLink>

            <ul class="w-full flex flex-col gap-3 text-left">
              <li
                v-for="item in [
                  'Все курсы и гайды',
                  'Закрытый Telegram-чат',
                  'Эфиры и нетворкинг'
                ]"
                :key="item"
                class="flex items-center gap-2.5 text-[14px] text-[#1a1a1a]"
              >
                <svg class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
