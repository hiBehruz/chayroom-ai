<script setup lang="ts">
const route = useRoute()

const available = [
  {
    label: "Qo'llanmalar",
    href: '/guides',
    icon: 'i-solar-notes-minimalistic-bold',
    description: "Qisqa, foydali yozma materiallar. AI, vibe coding va no-code mavzularida.",
    iconColor: '#f97316',
    iconBg: 'rgba(249,115,22,0.12)',
    dim: false,
  },
]

const soon = [
  { label: 'Kurslar', icon: 'i-solar-square-academic-cap-bold', iconColor: '#8b5cf6', iconBg: 'rgba(139,92,246,0.12)' },
  { label: 'Skilllar', icon: 'i-ph-brain-fill', iconColor: '#eab308', iconBg: 'rgba(234,179,8,0.12)' },
  { label: 'Yuzkeyslar', icon: 'i-solar-bag-3-bold', iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.12)' },
  { label: 'Efirlar', icon: 'i-solar-video-frame-bold', iconColor: '#ec4899', iconBg: 'rgba(236,72,153,0.12)' },
  { label: 'Vorkshoplar', icon: 'i-solar-users-group-rounded-bold', iconColor: '#06b6d4', iconBg: 'rgba(6,182,212,0.12)' },
]

function isCurrentRoute(href: string) {
  return route.path === href
}
</script>

<template>
  <div class="min-h-screen bg-[#fffdf9]">
    <!-- Page header -->
    <div class="border-b border-[#e8e6e1]">
      <div class="mx-auto w-[1240px] max-w-[calc(100vw-40px)] py-10 max-md:py-8 text-center">
        <h1 class="font-inter-display text-[60px] max-md:text-[36px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#1a1a1a] mb-3">
          <span class="relative inline-block">
            Materiallar
            <svg class="absolute -bottom-1 left-[-1%] w-[102%] overflow-visible" viewBox="0 0 600 18" preserveAspectRatio="none" fill="none" aria-hidden="true">
              <path d="M10,12 C150,2 450,2 590,12" stroke="#3480f1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="vector-effect:non-scaling-stroke" />
            </svg>
          </span>
        </h1>
        <p class="text-[24px] max-md:text-[16px] font-medium text-cx-muted">
          O'rganish formatini tanlang.
        </p>
      </div>
    </div>

    <div class="mx-auto w-[1240px] max-w-[calc(100vw-40px)] py-10 max-md:py-8">

      <!-- All formats in one grid -->
      <div class="grid grid-cols-4 max-md:grid-cols-1 gap-4">
        <NuxtLink
          v-for="item in available"
          :key="item.label"
          :to="item.href"
          :class="[
            'group flex flex-col justify-between h-66 max-md:h-auto max-md:gap-8 p-6 rounded-2xl transition-all duration-200 cursor-pointer',
            isCurrentRoute(item.href)
              ? 'bg-[#f7f5ef] border border-[#e8e6e1] shadow-[0_4px_24px_rgba(52,128,241,0.09)]'
              : 'bg-[#f7f5ef] border border-transparent hover:border-[#e8e6e1] hover:shadow-[0_4px_24px_rgba(52,128,241,0.09)]',
            item.dim ? 'opacity-50' : ''
          ]"
        >
          <div
            class="icon-wrap w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-200"
            :style="{ background: item.iconBg }"
          >
            <UIcon
              :name="item.icon"
              class="icon-bounce size-8 transition-colors duration-200"
              :style="{ color: item.iconColor }"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span :class="['text-[20px] font-bold leading-tight transition-colors duration-200', isCurrentRoute(item.href) ? 'text-[#3480f1]' : 'text-[#14161f] group-hover:text-[#3480f1]']">{{ item.label }}</span>
              <UIcon
                name="i-lucide-arrow-right"
                :class="[
                  'size-4 shrink-0 transition-all duration-200',
                  isCurrentRoute(item.href)
                    ? 'text-[#3480f1] translate-x-0.5'
                    : 'text-[#bbb] group-hover:text-[#3480f1] group-hover:translate-x-0.5'
                ]"
              />
            </div>
            <p class="text-[14px] text-[#72706b] leading-relaxed">
              {{ item.description }}
            </p>
          </div>
        </NuxtLink>

        <div
          v-for="item in soon"
          :key="item.label"
          class="flex flex-col justify-between h-66 max-md:h-auto max-md:gap-8 p-6 rounded-2xl bg-[#f7f5ef] border border-transparent opacity-50 select-none"
        >
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center"
            :style="{ background: item.iconBg }"
          >
            <UIcon :name="item.icon" class="size-8" :style="{ color: item.iconColor }" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[20px] font-bold text-[#14161f]">{{ item.label }}</span>
            <span class="text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Tez kunda</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
