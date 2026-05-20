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
            class="relative flex flex-col gap-3 rounded-[20px] p-4 active:opacity-75 transition-opacity"
            style="background:#232e3c; border:1px solid #2b3a4a; min-height:120px"
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
            class="relative flex flex-col gap-3 rounded-[20px] p-4"
            style="background:#232e3c; border:1px solid #2b3a4a; min-height:120px"
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

      <MiniAppBottomNav />
    </div>
  </div>
</template>
