<script setup lang="ts">
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const taskOverview = {
  progress: 4,
  total: 4,
  items: ['Про наше сообщество', 'Наши правила', 'Расскажите о себе', 'Первый материал']
}

const tasks = [
  {
    id: 'about',
    label: 'Про наше сообщество',
    icon: '📖',
    done: true,
    gradient: 'linear-gradient(135deg,#1d3557,#457b9d)',
    accent: '#90e0ef',
  },
  {
    id: 'rules',
    label: 'Наши правила',
    icon: '📋',
    done: true,
    gradient: 'linear-gradient(135deg,#7b2d8b,#a855f7)',
    accent: '#e9d5ff',
  },
  {
    id: 'intro',
    label: 'Расскажите о себе',
    icon: '🙋',
    done: true,
    gradient: 'linear-gradient(135deg,#c2410c,#f97316)',
    accent: '#fed7aa',
  },
  {
    id: 'first',
    label: 'Первый материал',
    icon: '🎯',
    done: true,
    gradient: 'linear-gradient(135deg,#0f766e,#2dd4bf)',
    accent: '#99f6e4',
  },
]

const continueItem = {
  type: 'ГАЙД',
  title: 'AI-агент «YouTube ресерчер»',
  desc: 'За 10 минут создай своего ИИ-агента «YouTube ресерчера» прямо в Claude',
  slug: 'youtube-researcher-agent',
  icon: '🎬',
}

const freshItems = [
  { type: 'КУРС', title: 'Создание и Кастомизация AI-агента на базе Hermes', slug: 'hermes-ai-agent', icon: '🤖' },
  { type: 'ГАЙД', title: 'Подключаем Notion к своему AI-агенту', slug: 'notion-ai-agent', icon: '🔗' },
  { type: 'ГАЙД', title: 'Создание AI-агента на базе Codex CLI', slug: 'codex-cli-agent', icon: '💻' },
]
</script>

<template>
  <div class="flex justify-center items-start" style="background:#17212b; min-height:100vh">
    <div
      class="w-full relative overflow-x-hidden text-white"
      style="background:#17212b; max-width:390px; min-height:100vh; padding-bottom:80px"
    >
      <!-- Header -->
      <div class="px-4 pt-7 pb-6">
        <h1 class="text-[26px] font-black tracking-tight leading-tight text-white mt-0.5">
          Salom, {{ user?.first_name }} 👋🏻
        </h1>
      </div>

      <!-- ЗАДАНИЯ -->
      <div class="mb-7">
        <div class="flex items-center justify-between px-4 mb-3">
          <p class="text-[11px] font-bold tracking-[0.12em] uppercase" style="color:#708499">Задания</p>
          <span class="text-[11px] font-semibold" style="color:#5288c1">{{ taskOverview.progress }}/{{ taskOverview.total }} выполнено</span>
        </div>

        <div class="flex gap-3 px-4 overflow-x-auto pb-1" style="scrollbar-width:none; -ms-overflow-style:none">
          <!-- Overview card -->
          <div
            class="flex-none rounded-2xl p-4 flex flex-col justify-between"
            style="background:linear-gradient(135deg,#2d6a4f,#1b4332); width:120px; min-height:130px; box-shadow:0 8px 32px rgba(29,99,66,0.4)"
          >
            <div>
              <p class="text-[9px] font-black tracking-widest uppercase mb-2" style="color:#95d5b2">ПРОГРЕСС</p>
              <p class="font-black leading-none" style="font-size:36px; color:#fff">
                {{ taskOverview.progress }}<span style="font-size:18px; color:#95d5b2; font-weight:700">/{{ taskOverview.total }}</span>
              </p>
              <p class="text-[10px] font-semibold mt-1.5" style="color:#95d5b2">Завершённые</p>
            </div>
          </div>

          <!-- Task cards -->
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex-none rounded-2xl p-4 flex flex-col justify-between"
            :style="`background:${task.gradient}; width:120px; min-height:130px; box-shadow:0 8px 24px rgba(0,0,0,0.3)`"
          >
            <div class="text-[32px]">{{ task.icon }}</div>
            <div>
              <div
                v-if="task.done"
                class="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full mb-2"
                :style="`background:rgba(255,255,255,0.15); color:${task.accent}`"
              >
                ✓ Готово
              </div>
              <p class="text-[11px] font-bold text-white leading-snug">{{ task.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ПРОДОЛЖИТЬ -->
      <div class="px-4 mb-7">
        <p class="text-[11px] font-bold tracking-[0.12em] uppercase mb-3" style="color:#708499">Продолжить</p>
        <NuxtLink
          :to="`/guides/${continueItem.slug}`"
          class="flex gap-4 items-start rounded-2xl p-4 active:opacity-75 transition-opacity"
          style="background:#232e3c; border:1px solid #2b3a4a; box-shadow:0 4px 16px rgba(0,0,0,0.2)"
        >
          <div
            class="flex-none rounded-xl flex items-center justify-center text-[28px]"
            style="width:56px; height:56px; background:linear-gradient(135deg,#1e3a5f,#5288c1)"
          >
            {{ continueItem.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <span
              class="inline-block text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full mb-2"
              style="color:#5288c1; background:rgba(82,136,193,0.18)"
            >
              {{ continueItem.type }}
            </span>
            <h3 class="text-[13px] font-bold text-white leading-snug mb-1">{{ continueItem.title }}</h3>
            <p class="text-[11px] leading-relaxed line-clamp-2" style="color:#708499">{{ continueItem.desc }}</p>
            <p class="text-[11px] font-bold mt-2" style="color:#5288c1">Читать →</p>
          </div>
        </NuxtLink>
      </div>

      <!-- СВЕЖИЕ МАТЕРИАЛЫ -->
      <div class="px-4">
        <p class="text-[11px] font-bold tracking-[0.12em] uppercase mb-3" style="color:#708499">Свежие материалы</p>
        <div class="space-y-2">
          <NuxtLink
            v-for="item in freshItems"
            :key="item.slug"
            :to="item.type === 'КУРС' ? `/courses/${item.slug}` : `/guides/${item.slug}`"
            class="flex items-center gap-3 rounded-xl px-4 py-3.5 active:opacity-75 transition-opacity"
            style="background:#232e3c; border:1px solid #2b3a4a"
          >
            <span class="text-[22px] flex-none">{{ item.icon }}</span>
            <div class="flex-1 min-w-0">
              <span
                class="inline-block text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full mb-0.5"
                :style="item.type === 'КУРС'
                  ? 'color:#4caf82; background:rgba(76,175,130,0.15)'
                  : 'color:#5288c1; background:rgba(82,136,193,0.15)'"
              >
                {{ item.type }}
              </span>
              <p class="text-[13px] font-semibold text-white leading-snug truncate">{{ item.title }}</p>
            </div>
            <span class="text-[18px] flex-none" style="color:#2b3a4a">›</span>
          </NuxtLink>
        </div>
      </div>

      <MiniAppBottomNav />
    </div>
  </div>
</template>
