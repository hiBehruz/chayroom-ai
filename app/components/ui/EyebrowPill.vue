<!-- app/components/ui/EyebrowPill.vue -->
<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="inline-flex items-center gap-2 bg-white border border-cx-line px-3.5 py-2 rounded-full text-[11px] font-semibold tracking-[.07em] uppercase text-cx-blue">
    <span class="w-2 h-2 rounded-full bg-cx-blue shrink-0" />
    {{ label }}
  </div>
</template>
