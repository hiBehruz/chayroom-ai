<!-- app/components/ui/SectionHeader.vue -->
<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}>()
</script>

<template>
  <div :class="align === 'left' ? 'text-left' : 'text-center'">
    <div
      v-if="eyebrow"
      class="text-[11px] font-bold tracking-[.08em] uppercase text-cx-blue mb-2.5"
    >
      {{ eyebrow }}
    </div>
    <h2 class="font-inter-display text-[48px] font-semibold leading-[1.1] tracking-[-0.02em] text-(--text) mb-3.5 max-md:text-[34px] max-md:leading-[38px]">
      {{ title }}
    </h2>
    <p
      v-if="subtitle"
      class="text-cx-ink-soft/80 text-base max-w-[520px]"
      :class="align === 'left' ? '' : 'mx-auto'"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
