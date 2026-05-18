<!-- app/components/ui/SectionHeader.vue -->
<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}>()
</script>

<template>
  <div :class="align === 'left' ? 'text-left' : 'text-center'">
    <div class="text-[11px] font-bold tracking-[.08em] uppercase text-cx-blue mb-2.5">
      {{ eyebrow }}
    </div>
    <h2 class="text-[36px] font-extrabold tracking-[-0.025em] leading-[1.1] text-[#1a1a1a] mb-3.5">
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
