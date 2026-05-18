<!-- app/pages/dashboard.vue -->
<script setup lang="ts">
const authStore = useAuthStore()

onMounted(() => authStore.restoreFromStorage())

const user = computed(() => authStore.user)

const stats = computed(() => [
  { label: 'Курсов', value: user.value ? '2' : '0', icon: 'i-lucide-book-open' },
  { label: 'Пройдено уроков', value: user.value ? '0 / 38' : '—', icon: 'i-lucide-circle-check' },
  { label: 'Часов обучения', value: user.value ? '0h' : '—', icon: 'i-lucide-clock' },
  { label: 'Сертификаты', value: '0', icon: 'i-lucide-timer' }
])

const courses = [
  {
    title: 'Создание и Кастомизация AI-агента на базе Hermes',
    desc: 'Курс, в котором мы с нуля создадим агента и добавим в него навыки и улучшения.',
    tags: ['AI', 'AI-агент', 'Hermes'],
    locked: true,
    progress: 0
  },
  {
    title: 'Вайбкодинг с 0',
    desc: 'Как без знания кода, собирать нужные сайты, инструменты, приложения.',
    tags: ['Вайбкодинг'],
    locked: true,
    progress: 0
  }
]

const hasSubscription = ref(false)

useSeoMeta({ title: 'Панель — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Главная</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">Панель</span>
      </div>

      <!-- Welcome -->
      <div class="mb-7">
        <h1 class="text-[28px] font-extrabold tracking-tight text-[#1a1a1a]">
          С возвращением!
        </h1>
        <p class="text-cx-muted mt-1 text-[14px]">
          Продолжай учиться. Ты отлично продвигаешься.
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <UCard
          v-for="stat in stats"
          :key="stat.label"
          :ui="{
            root: 'bg-[#fafafa] border border-cx-line rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
            body: 'p-5 flex flex-col gap-2'
          }"
        >
          <UIcon :name="stat.icon" class="size-5 text-cx-muted" />
          <div class="text-[22px] font-extrabold tracking-tight text-[#1a1a1a]">
            {{ stat.value }}
          </div>
          <div class="text-[13px] text-cx-muted">
            {{ stat.label }}
          </div>
        </UCard>
      </div>

      <!-- Telegram community -->
      <div class="bg-[#f8f8fa] rounded-2xl px-6 py-5 flex items-center gap-4 mb-8">
        <div class="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" class="w-4 h-4 fill-cx-blue">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
          </svg>
        </div>
        <div>
          <div class="text-[14px] font-bold text-[#1a1a1a]">
            Закрытое сообщество в Telegram
          </div>
          <div class="text-[13px] text-cx-muted mt-0.5">
            Общение с участниками, эфиры и новости.
          </div>
          <div class="text-[13px] text-cx-muted">
            Доступно после оформления подписки.
          </div>
        </div>
      </div>

      <!-- Main grid -->
      <div class="relative">
        <div class="grid grid-cols-[1fr_380px] gap-6">
          <!-- Courses -->
          <div>
            <div class="flex items-center gap-2 mb-5">
              <UIcon name="i-lucide-book-open" class="size-4 text-cx-muted" />
              <h2 class="text-[15px] font-bold text-[#1a1a1a]">
                Мои курсы
              </h2>
            </div>
            <div class="flex flex-col gap-4">
              <UCard
                v-for="course in courses"
                :key="course.title"
                :ui="{
                  root: 'bg-[#fafafa] border border-cx-line rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] group',
                  body: 'p-5'
                }"
              >
                <div class="flex items-start justify-between gap-3 mb-2">
                  <span class="text-[14px] font-semibold text-[#1a1a1a] leading-[1.4] group-hover:text-cx-blue transition-colors duration-200">
                    {{ course.title }}
                  </span>
                  <span
                    v-if="course.locked"
                    class="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ebebea] text-cx-muted text-[11px] font-medium"
                  >
                    <UIcon name="i-lucide-lock" class="size-3" />
                    Заблокировано
                  </span>
                </div>
                <p class="text-[12px] text-cx-muted leading-[1.6] mb-3">
                  {{ course.desc }}
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in course.tags"
                    :key="tag"
                    class="px-2.5 py-0.5 rounded-full bg-white border border-cx-line text-[11px] text-cx-muted font-medium"
                  >
                    {{ tag }}
                  </span>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Progress -->
          <div>
            <div class="flex items-center gap-2 mb-5">
              <UIcon name="i-lucide-bar-chart-2" class="size-4 text-cx-muted" />
              <h2 class="text-[15px] font-bold text-[#1a1a1a]">
                Прогресс обучения
              </h2>
            </div>
            <div class="bg-[#f8f8fa] rounded-2xl p-5 flex flex-col gap-4">
              <div
                v-for="course in courses"
                :key="course.title"
                class="flex flex-col gap-2"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[12px] text-cx-muted truncate max-w-55">{{ course.title }}</span>
                  <span class="text-[12px] font-semibold text-cx-muted">{{ course.progress }}%</span>
                </div>
                <div class="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                  <div
                    class="h-full bg-cx-blue rounded-full transition-all duration-500"
                    :style="{ width: `${course.progress}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paywall overlay -->
        <div
          v-if="!user || !hasSubscription"
          class="absolute inset-0 flex items-end justify-center pb-0"
        >
          <div class="absolute inset-0 bg-linear-to-t from-white via-white/80 to-transparent" />
          <div class="relative z-10 bg-white rounded-2xl border border-cx-line shadow-lift p-8 mx-auto max-w-lg text-center mb-4">
            <h3 class="text-[18px] font-extrabold text-[#1a1a1a] mb-2">
              Откройте свой учебный дашборд
            </h3>
            <p class="text-[13px] text-cx-muted leading-[1.6] mb-5">
              Получите доступ ко всем курсам, отслеживанию прогресса и сертификатам.
            </p>
            <button
              class="btn-primary w-full text-[14px]! px-6! py-3.5!"
              @click="navigateTo('/#pricing')"
            >
              <UIcon name="i-lucide-sparkles" class="size-4" />
              Получить полный доступ →
            </button>
            <p class="text-[11px] text-cx-muted mt-3">
              Оплата в Telegram. Доступ ко всем курсам и материалам.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
