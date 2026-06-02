<script setup lang="ts">
useSeoMeta({ title: 'Club haqida — Chayroom AI' })

const spaces = [
  {
    icon: 'i-solar-bell-bing-bold',
    title: 'Kanal',
    desc: 'Muhim e\'lonlar, foydali postlar va klub tadbirlari. Bildirishnomalarni yoqing.',
    link: null,
    linkLabel: null,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.12)',
  },
  {
    icon: 'i-solar-chat-round-dots-bold',
    title: 'Chat',
    desc: 'Ish zonasi: vibe coding, loyihalar, vazifalar, vositalar.',
    link: '#',
    linkLabel: 'Chatni ochish',
    iconColor: '#3480f1',
    iconBg: 'rgba(52,128,241,0.12)',
  },
  {
    icon: 'i-solar-monitor-smartphone-bold',
    title: 'Platforma',
    desc: 'Kurslar, gaidlar va materiallar.',
    link: '/courses',
    linkLabel: 'Web-versiya',
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139,92,246,0.12)',
  },
  {
    icon: 'i-solar-headphones-round-bold',
    title: 'Yordam',
    desc: 'To\'lov va kirish huquqlari bo\'yicha har qanday savol uchun.',
    link: '#',
    linkLabel: 'Yozish',
    iconColor: '#14b8a6',
    iconBg: 'rgba(20,184,166,0.12)',
  },
]

const contents = [
  { icon: 'i-solar-document-text-bold', title: 'Gaidlar', soon: false, iconColor: '#f97316', iconBg: 'rgba(249,115,22,0.12)' },
  { icon: 'i-solar-diploma-bold', title: 'Kurslar', soon: false, iconColor: '#8b5cf6', iconBg: 'rgba(139,92,246,0.12)' },
  { icon: 'i-solar-lightning-bold', title: 'Skilllar', soon: true, iconColor: '#eab308', iconBg: 'rgba(234,179,8,0.12)' },
  { icon: 'i-solar-folder-with-files-bold', title: 'Yuzkeyslar', soon: true, iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.12)' },
  { icon: 'i-solar-videocamera-bold', title: 'Efirlar', soon: true, iconColor: '#ec4899', iconBg: 'rgba(236,72,153,0.12)' },
  { icon: 'i-solar-hammer-bold', title: 'Vorkshoplar', soon: true, iconColor: '#06b6d4', iconBg: 'rgba(6,182,212,0.12)' },
]

const steps = [
  {
    title: 'O\'zingiz haqingizda ayting',
    desc: 'Maqsad va darajangizga mos materiallar tanlaymiz.',
    link: null,
    linkLabel: null,
  },
  {
    title: 'Qoidalarni o\'qing',
    desc: 'Bir-ikki daqiqa, va bizda hamma narsa qanday ishlashini tushunasiz.',
    link: null,
    linkLabel: null,
  },
  {
    title: 'Katalogni oching',
    desc: 'Platforma materiallarining hammasi bir joyda.',
    link: '/courses',
    linkLabel: 'Katalogga o\'tish',
  },
]

const tags = ['AI-agentlar', 'Vibe coding', 'Avtomatlashtirish', 'Shaxsiy assistentlar', 'Neyrotarmoqlar']
</script>

<template>
  <div class="min-h-screen bg-cx-surface">
    <div class="w-[780px] max-w-[calc(100vw-40px)] mx-auto py-14 max-md:py-10 max-md:px-4">

      <!-- Hero -->
      <div class="mb-14 max-md:mb-10">
        <span class="inline-block text-[13px] font-semibold tracking-widest uppercase text-cx-blue mb-4 max-md:mb-3">
          Yopiq klub
        </span>
        <h1 class="font-inter-display text-[56px] font-semibold leading-[1.06] tracking-[-0.025em] text-[#14161f] mb-5 max-md:text-[36px] max-md:mb-4">
          AI Room Club
        </h1>
        <p class="text-[18px] text-cx-muted leading-relaxed max-w-[560px] mb-7 max-md:text-[16px] max-md:mb-5">
          Yopiq jamiyat — bu yerda biz birga hayot, ish va biznesga AI ni joriy qilamiz. Vositalarni muhokama qilamiz, tajriba almashib, loyihalar yaratamiz.
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in tags"
            :key="tag"
            class="px-3 py-1.5 rounded-full bg-[#f0ede8] text-[13px] font-medium text-[#4a4a52]"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="h-px bg-cx-line mb-14 max-md:mb-10" />

      <!-- Как устроено пространство -->
      <section class="mb-14 max-md:mb-10">
        <h2 class="font-inter-display text-[22px] font-semibold tracking-[-0.01em] text-[#14161f] mb-6 max-md:text-[19px] max-md:mb-5">
          Maydon qanday tuzilgan
        </h2>
        <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div
            v-for="space in spaces"
            :key="space.title"
            class="rounded-2xl bg-[#f7f5ef] border border-transparent hover:border-[#e8e6e1] transition-colors duration-200 p-5 flex gap-4 items-start"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" :style="{ background: space.iconBg }">
              <UIcon :name="space.icon" class="size-5" :style="{ color: space.iconColor }" />
            </div>
            <div class="min-w-0">
              <div class="text-[15px] font-semibold text-[#14161f] mb-1">{{ space.title }}</div>
              <div class="text-[14px] text-cx-muted leading-snug mb-2">{{ space.desc }}</div>
              <NuxtLink
                v-if="space.link"
                :to="space.link"
                class="inline-flex items-center gap-1 text-[13px] font-semibold text-cx-blue hover:opacity-75 transition-opacity"
              >
                {{ space.linkLabel }}
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <div class="h-px bg-cx-line mb-14 max-md:mb-10" />

      <!-- Что внутри -->
      <section class="mb-14 max-md:mb-10">
        <h2 class="font-inter-display text-[22px] font-semibold tracking-[-0.01em] text-[#14161f] mb-6 max-md:text-[19px] max-md:mb-5">
          Ichida nima bor
        </h2>
        <div class="grid grid-cols-3 gap-3 max-md:grid-cols-2">
          <div
            v-for="item in contents"
            :key="item.title"
            :class="[
              'rounded-2xl border p-5 flex flex-col gap-3 transition-colors duration-200',
              item.soon
                ? 'bg-[#f7f5ef] border-transparent opacity-60'
                : 'bg-[#f7f5ef] border-transparent hover:border-[#e8e6e1]'
            ]"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" :style="{ background: item.iconBg }">
              <UIcon :name="item.icon" class="size-4.5" :style="{ color: item.iconColor }" />
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[15px] font-semibold text-[#14161f]">{{ item.title }}</span>
              <span
                v-if="item.soon"
                class="text-[11px] font-semibold text-cx-faint bg-[#e8e6e1] px-2 py-0.5 rounded-full"
              >
                tez kunda
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="h-px bg-cx-line mb-14 max-md:mb-10" />

      <!-- С чего начать -->
      <section>
        <h2 class="font-inter-display text-[22px] font-semibold tracking-[-0.01em] text-[#14161f] mb-6 max-md:text-[19px] max-md:mb-5">
          Qayerdan boshlash kerak
        </h2>
        <div class="flex flex-col gap-px">
          <div
            v-for="(step, i) in steps"
            :key="step.title"
            class="flex gap-5 py-5 border-b border-cx-line last:border-b-0 max-md:gap-4"
          >
            <div class="w-8 h-8 rounded-full bg-cx-blue/10 flex items-center justify-center shrink-0 mt-0.5">
              <span class="text-[13px] font-bold text-cx-blue">{{ i + 1 }}</span>
            </div>
            <div>
              <div class="text-[16px] font-semibold text-[#14161f] mb-1">{{ step.title }}</div>
              <div class="text-[14px] text-cx-muted leading-snug mb-2">{{ step.desc }}</div>
              <NuxtLink
                v-if="step.link"
                :to="step.link"
                class="inline-flex items-center gap-1 text-[13px] font-semibold text-cx-blue hover:opacity-75 transition-opacity"
              >
                {{ step.linkLabel }}
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>
