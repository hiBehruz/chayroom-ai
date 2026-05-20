<script setup lang="ts">
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const taskOverview = {
  progress: 4,
  total: 4,
  items: ['Про наше сообщество', 'Наши правила', 'Расскажите о себе', 'Первый материал']
}

const tasks = [
  { id: 'about', label: 'Про наше сообщество', icon: '📖', done: true },
  { id: 'rules', label: 'Наши правила', icon: '📋', done: true },
  { id: 'intro', label: 'Расскажите о себе', icon: '🙋', done: true },
  { id: 'first', label: 'Первый материал', icon: '🎯', done: true },
]

const continueItem = {
  type: 'ГАЙД',
  title: 'AI-агент «YouTube ресерчер»',
  desc: 'За 10 минут создай своего ИИ-агента «YouTube ресерчера» прямо в Claude',
  slug: 'youtube-researcher-agent',
}

const freshItems = [
  { type: 'КУРС', title: 'Создание и Кастомизация AI-агента на базе Hermes', slug: 'hermes-ai-agent' },
  { type: 'ГАЙД', title: 'Подключаем Notion к своему AI-агенту', slug: 'notion-ai-agent' },
  { type: 'ГАЙД', title: 'Создание AI-агента на базе Codex CLI', slug: 'codex-cli-agent' },
]
</script>

<template>
  <div class="min-h-screen w-full max-w-full overflow-x-hidden pb-8 text-white" style="background:#17212b">
    <!-- Header -->
    <div class="px-4 pt-6 pb-5">
      <p class="text-[13px] font-medium mb-0.5 tracking-wide uppercase" style="color:#708499">Личный кабинет</p>
      <h1 class="text-[22px] font-bold tracking-tight leading-tight text-white">
        Привет, {{ user?.first_name }} 👋🏻
      </h1>
    </div>

    <!-- ЗАДАНИЯ -->
    <div class="mb-6">
      <p class="px-4 text-[11px] font-bold tracking-[0.12em] uppercase mb-3" style="color:#708499">
        Задания
      </p>
      <div class="flex gap-3 px-4 overflow-x-auto scrollbar-none">
        <!-- Overview card -->
        <div
          class="flex-none w-44 rounded-2xl p-4 flex flex-col justify-between min-h-40"
          style="background:rgba(82,136,193,0.15); border:1px solid rgba(82,136,193,0.3)"
        >
          <div>
            <p class="text-[10px] font-bold tracking-[0.1em] uppercase mb-1" style="color:#5288c1">Прогресс</p>
            <p class="text-[32px] font-black leading-none text-white">
              {{ taskOverview.progress }}<span class="text-[18px] font-bold" style="color:#708499">/{{ taskOverview.total }}</span>
            </p>
            <p class="text-[11px] font-semibold mt-1 mb-3" style="color:#708499">Завершённые</p>
          </div>
          <ul class="space-y-1">
            <li
              v-for="item in taskOverview.items"
              :key="item"
              class="text-[11px] flex items-center gap-1.5 leading-tight text-white/70"
            >
              <span class="text-[10px]" style="color:#4caf82">✓</span>
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Task cards -->
        <div
          v-for="task in tasks"
          :key="task.id"
          class="flex-none w-36 rounded-2xl p-4 flex flex-col justify-between min-h-40"
          style="background:#232e3c; border:1px solid #2b3a4a"
        >
          <div class="text-3xl mb-3">{{ task.icon }}</div>
          <div>
            <div
              v-if="task.done"
              class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
              style="background:rgba(76,175,130,0.2); color:#4caf82"
            >
              <span>✓</span> Готово
            </div>
            <p class="text-[12px] font-semibold text-white leading-snug">{{ task.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ПРОДОЛЖИТЬ -->
    <div class="px-4 mb-6">
      <p class="text-[11px] font-bold tracking-[0.12em] uppercase mb-3" style="color:#708499">
        Продолжить
      </p>
      <NuxtLink
        :to="`/guides/${continueItem.slug}`"
        class="block rounded-2xl p-4 active:opacity-80 transition-opacity"
        style="background:#232e3c; border:1px solid #2b3a4a"
      >
        <span
          class="inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full mb-3"
          style="color:#5288c1; background:rgba(82,136,193,0.15)"
        >
          {{ continueItem.type }}
        </span>
        <h3 class="text-[15px] font-bold text-white leading-snug mb-2">{{ continueItem.title }}</h3>
        <p class="text-[12px] leading-relaxed" style="color:#708499">{{ continueItem.desc }}</p>
        <div class="mt-4 flex items-center gap-1 text-[12px] font-semibold" style="color:#5288c1">
          Читать <span>→</span>
        </div>
      </NuxtLink>
    </div>

    <!-- СВЕЖИЕ МАТЕРИАЛЫ -->
    <div class="px-4">
      <p class="text-[11px] font-bold tracking-[0.12em] uppercase mb-3" style="color:#708499">
        Свежие материалы
      </p>
      <div class="space-y-2">
        <NuxtLink
          v-for="item in freshItems"
          :key="item.slug"
          :to="item.type === 'КУРС' ? `/courses/${item.slug}` : `/guides/${item.slug}`"
          class="flex items-center gap-3 rounded-xl px-4 py-3.5 active:opacity-80 transition-opacity"
          style="background:#232e3c; border:1px solid #2b3a4a"
        >
          <span
            class="flex-none text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full"
            :style="item.type === 'КУРС'
              ? 'color:#4caf82; background:rgba(76,175,130,0.15)'
              : 'color:#5288c1; background:rgba(82,136,193,0.15)'"
          >
            {{ item.type }}
          </span>
          <p class="flex-1 text-[13px] font-medium text-white leading-snug">{{ item.title }}</p>
          <span class="text-[16px] flex-none" style="color:#708499">›</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
