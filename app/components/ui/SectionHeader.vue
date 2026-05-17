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
    <div class="text-[11px] font-semibold tracking-[.08em] uppercase text-cx-muted mb-2.5">
      {{ eyebrow }}
    </div>
    <h2 class="text-[40px] font-extrabold tracking-[-0.025em] leading-[1.1] mb-3.5">{{ title }}</h2>
    <p v-if="subtitle" class="text-cx-muted text-base max-w-[520px]" :class="align === 'left' ? '' : 'mx-auto'">
      {{ subtitle }}
    </p>
  </div>
</template>
