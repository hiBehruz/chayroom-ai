<script setup lang="ts">
const categories = [
  {
    id: 'guides',
    name: 'Гайды',
    icon: 'i-lucide-book-open',
    count: '13 материалов',
    soon: false,
    to: '/guides',
  },
  {
    id: 'courses',
    name: 'Курсы',
    icon: 'i-lucide-graduation-cap',
    count: '2 материала',
    soon: false,
    to: '/courses',
  },
  {
    id: 'skills',
    name: 'Скиллы',
    icon: 'i-lucide-sparkles',
    count: null,
    soon: true,
    to: null,
  },
  {
    id: 'usecases',
    name: 'Юзкейсы',
    icon: 'i-lucide-briefcase',
    count: null,
    soon: true,
    to: null,
  },
  {
    id: 'streams',
    name: 'Эфиры',
    icon: 'i-lucide-video',
    count: null,
    soon: true,
    to: null,
  },
  {
    id: 'workshops',
    name: 'Воркшопы',
    icon: 'i-lucide-users',
    count: null,
    soon: true,
    to: null,
  },
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
        <h1 class="text-[26px] font-black tracking-tight leading-tight text-white">Каталог</h1>
        <p class="text-[14px] mt-1" style="color:#708499">Форматы материалов на платформе.</p>
      </div>

      <!-- Category grid -->
      <div class="grid grid-cols-2 gap-3 px-4">
        <template v-for="cat in categories" :key="cat.id">
          <NuxtLink
            v-if="cat.to"
            :to="cat.to"
            class="relative flex flex-col justify-between rounded-[20px] p-4 active:opacity-75 transition-opacity"
            style="background:#232e3c; border:1px solid #2b3a4a; min-height:148px"
          >
            <span
              v-if="cat.soon"
              class="absolute top-3 right-3 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
              style="color:#f0b429; background:rgba(240,180,41,0.15)"
            >СКОРО</span>
            <div
              class="flex items-center justify-center rounded-[14px]"
              style="width:48px; height:48px; background:#1e2d3d"
            >
              <UIcon :name="cat.icon" class="size-[22px]" style="color:#5288c1" />
            </div>
            <div>
              <p class="text-[15px] font-bold text-white leading-snug">{{ cat.name }}</p>
              <p v-if="cat.count" class="text-[12px] font-medium mt-0.5" style="color:#708499">{{ cat.count }}</p>
            </div>
          </NuxtLink>
          <div
            v-else
            class="relative flex flex-col justify-between rounded-[20px] p-4"
            style="background:#232e3c; border:1px solid #2b3a4a; min-height:148px"
          >
            <span
              v-if="cat.soon"
              class="absolute top-3 right-3 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
              style="color:#f0b429; background:rgba(240,180,41,0.15)"
            >СКОРО</span>
            <div
              class="flex items-center justify-center rounded-[14px]"
              style="width:48px; height:48px; background:#1e2d3d"
            >
              <UIcon :name="cat.icon" class="size-[22px]" style="color:#5288c1" />
            </div>
            <div>
              <p class="text-[15px] font-bold text-white leading-snug">{{ cat.name }}</p>
              <p v-if="cat.count" class="text-[12px] font-medium mt-0.5" style="color:#708499">{{ cat.count }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Bottom Nav -->
      <div
        class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex items-center justify-around py-1 z-50 backdrop-blur-md"
        style="max-width:390px; background:rgba(23,33,43,0.96); border-top:1px solid #2b3a4a"
      >
        <NuxtLink
          to="/dashboard"
          class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl active:opacity-60 transition-opacity"
          style="color:#708499"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span class="text-[10px] font-bold">Главная</span>
        </NuxtLink>

        <div
          class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl"
          style="color:#5288c1; background:rgba(82,136,193,0.12)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span class="text-[10px] font-bold">Каталог</span>
        </div>

        <NuxtLink
          to="/profile"
          class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl active:opacity-60 transition-opacity"
          style="color:#708499"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span class="text-[10px] font-bold">Профиль</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
