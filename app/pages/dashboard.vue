<!-- app/pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const user = computed(() => authStore.user!)

const stats = [
  { label: 'Курсов пройдено', value: '3', icon: '📚' },
  { label: 'Дней в клубе', value: '14', icon: '🗓️' },
  { label: 'Гайдов прочитано', value: '12', icon: '📖' }
]

const courses = [
  { title: 'ChatGPT с нуля до профи', progress: 75, tag: 'AI-ассистенты', color: 'bg-cx-blue-soft text-cx-blue' },
  { title: 'Автоматизация с Make', progress: 40, tag: 'Автоматизация', color: 'bg-green-100 text-green-700' },
  { title: 'Создание AI-агентов', progress: 10, tag: 'AI-агенты', color: 'bg-purple-100 text-purple-700' },
  { title: 'Midjourney: генерация изображений', progress: 0, tag: 'Контент', color: 'bg-orange-100 text-orange-700' }
]

useSeoMeta({ title: 'Панель — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen bg-[#F8F8FA]">
    <div class="max-w-[1180px] mx-auto px-10 py-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">
            Привет, {{ user.first_name }} 👋
          </h1>
          <p class="text-cx-muted mt-1">Добро пожаловать в AI Room Club</p>
        </div>
        <button
          class="px-4 py-2 rounded-full text-sm font-semibold border border-cx-line text-cx-muted hover:text-cx-ink transition-colors duration-200"
          @click="authStore.logout(); navigateTo('/')"
        >
          Выйти
        </button>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-5 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white border border-cx-line rounded-3xl p-6 shadow-card flex items-center gap-4"
        >
          <div class="w-12 h-12 rounded-2xl bg-cx-blue-soft flex items-center justify-center text-2xl">{{ stat.icon }}</div>
          <div>
            <div class="text-[28px] font-extrabold tracking-tight leading-none">{{ stat.value }}</div>
            <div class="text-sm text-cx-muted mt-0.5">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-[1fr_360px] gap-6">
        <!-- Courses -->
        <div class="bg-white border border-cx-line rounded-3xl p-7 shadow-card">
          <h2 class="text-xl font-bold mb-5">Мои курсы</h2>
          <div class="flex flex-col gap-5">
            <div
              v-for="course in courses"
              :key="course.title"
              class="flex flex-col gap-2.5"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full', course.color]">{{ course.tag }}</span>
                  <span class="text-sm font-semibold">{{ course.title }}</span>
                </div>
                <span class="text-sm font-semibold text-cx-muted">{{ course.progress }}%</span>
              </div>
              <div class="h-2 bg-[#F0F0F3] rounded-full overflow-hidden">
                <div
                  class="h-full bg-cx-blue rounded-full transition-all duration-500"
                  :style="{ width: `${course.progress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Telegram community card -->
        <div class="bg-cx-ink rounded-3xl p-7 flex flex-col justify-between text-white">
          <div>
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl mb-4">💬</div>
            <h3 class="text-xl font-bold mb-2">AI Room Club</h3>
            <p class="text-sm text-white/60 leading-relaxed">Закрытый Telegram-чат сообщества. Общайся с единомышленниками, задавай вопросы и делись результатами.</p>
          </div>
          <a
            href="https://t.me/airoomclub"
            target="_blank"
            class="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white text-cx-ink font-semibold text-sm hover:bg-gray-100 transition-colors duration-200"
          >
            Открыть в Telegram →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
