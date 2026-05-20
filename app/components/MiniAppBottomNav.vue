<script setup lang="ts">
const route = useRoute()

const tabs = [
  {
    to: '/dashboard',
    label: 'Главная',
    svg: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  },
  {
    to: '/catalog',
    label: 'Каталог',
    svg: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  },
  {
    to: '/profile',
    label: 'Профиль',
    svg: `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>`,
  },
]
</script>

<template>
  <div
    class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex items-center justify-around py-1 z-50 backdrop-blur-md"
    style="max-width:390px; background:rgba(23,33,43,0.96); border-top:1px solid #2b3a4a"
  >
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="flex-1 flex justify-center items-center active:opacity-70 transition-opacity"
    >
      <span
        class="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl"
        :style="route.path === tab.to
          ? 'color:#ffffff; background:#5288c1'
          : 'color:#708499'"
      >
        <svg
        :key="route.path === tab.to ? 'on' : 'off'"
        :class="route.path === tab.to ? 'tg-nav-pop' : ''"
        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
        v-html="tab.svg"
      />
        <span class="text-[10px] font-bold">{{ tab.label }}</span>
      </span>
    </NuxtLink>
  </div>
</template>
