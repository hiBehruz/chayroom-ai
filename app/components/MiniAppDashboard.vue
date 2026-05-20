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
  <div class="min-h-screen bg-tg-bg text-white pb-8">
    <!-- Header -->
    <div class="px-4 pt-6 pb-5">
      <p class="text-tg-muted text-[13px] font-medium mb-0.5 tracking-wide uppercase">Личный кабинет</p>
      <h1 class="text-[22px] font-bold tracking-tight leading-tight">
        Привет, {{ user?.first_name }} 👋🏻
      </h1>
    </div>

    <!-- ЗАДАНИЯ -->
    <div class="mb-6">
      <p class="px-4 text-[11px] font-bold tracking-[0.12em] text-tg-muted uppercase mb-3">
        Задания
      </p>
      <div class="flex gap-3 px-4 overflow-x-auto scrollbar-none">
        <!-- Overview card -->
        <div class="flex-none w-44 rounded-2xl bg-tg-blue/20 border border-tg-blue/30 p-4 flex flex-col justify-between min-h-[160px]">
          <div>
            <p class="text-[10px] font-bold tracking-[0.1em] text-tg-blue uppercase mb-1">Прогресс</p>
            <p class="text-[32px] font-black leading-none text-white">
              {{ taskOverview.progress }}<span class="text-tg-muted text-[18px] font-bold">/{{ taskOverview.total }}</span>
            </p>
            <p class="text-[11px] text-tg-muted font-semibold mt-1 mb-3">Завершённые</p>
          </div>
          <ul class="space-y-1">
            <li
              v-for="item in taskOverview.items"
              :key="item"
              class="text-[11px] text-white/70 flex items-center gap-1.5 leading-tight"
            >
              <span class="text-tg-green text-[10px]">✓</span>
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Task cards -->
        <div
          v-for="task in tasks"
          :key="task.id"
          class="flex-none w-36 rounded-2xl bg-tg-card border border-tg-border p-4 flex flex-col justify-between min-h-[160px]"
        >
          <div class="text-3xl mb-3">{{ task.icon }}</div>
          <div>
            <div
              v-if="task.done"
              class="inline-flex items-center gap-1 bg-tg-green/20 text-tg-green text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
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
      <p class="text-[11px] font-bold tracking-[0.12em] text-tg-muted uppercase mb-3">
        Продолжить
      </p>
      <NuxtLink
        :to="`/guides/${continueItem.slug}`"
        class="block rounded-2xl bg-tg-card border border-tg-border p-4 active:opacity-80 transition-opacity"
      >
        <span class="inline-block text-[10px] font-bold tracking-wider text-tg-blue bg-tg-blue/15 px-2 py-0.5 rounded-full mb-3">
          {{ continueItem.type }}
        </span>
        <h3 class="text-[15px] font-bold text-white leading-snug mb-2">{{ continueItem.title }}</h3>
        <p class="text-[12px] text-tg-muted leading-relaxed">{{ continueItem.desc }}</p>
        <div class="mt-4 flex items-center gap-1 text-tg-blue text-[12px] font-semibold">
          Читать <span>→</span>
        </div>
      </NuxtLink>
    </div>

    <!-- СВЕЖИЕ МАТЕРИАЛЫ -->
    <div class="px-4">
      <p class="text-[11px] font-bold tracking-[0.12em] text-tg-muted uppercase mb-3">
        Свежие материалы
      </p>
      <div class="space-y-2">
        <NuxtLink
          v-for="item in freshItems"
          :key="item.slug"
          :to="item.type === 'КУРС' ? `/courses/${item.slug}` : `/guides/${item.slug}`"
          class="flex items-center gap-3 rounded-xl bg-tg-card border border-tg-border px-4 py-3.5 active:opacity-80 transition-opacity"
        >
          <span
            class="flex-none text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full"
            :class="item.type === 'КУРС' ? 'text-tg-green bg-tg-green/15' : 'text-tg-blue bg-tg-blue/15'"
          >
            {{ item.type }}
          </span>
          <p class="flex-1 text-[13px] font-medium text-white leading-snug">{{ item.title }}</p>
          <span class="text-tg-muted text-[16px] flex-none">›</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
