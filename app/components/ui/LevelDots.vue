<script setup lang="ts">
const props = defineProps<{
  level: 1 | 2 | 3
}>()
</script>

<template>
  <div class="flex gap-2 items-center">
    <div
      v-for="i in 3"
      :key="i"
      class="level-dot size-3 rounded-full transition-all duration-250"
      :class="i <= props.level ? 'dot-on' : 'dot-off'"
    />
  </div>
</template>

<style scoped>
.level-dot {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dot-on {
  background: currentColor;
}

.dot-off {
  background: transparent;
  border: 1.5px solid color-mix(in srgb, currentColor 30%, transparent);
}

/* nth-child stagger handled via parent group-hover */
.level-dot:nth-child(1) { transition-delay: 0ms; }
.level-dot:nth-child(2) { transition-delay: 50ms; }
.level-dot:nth-child(3) { transition-delay: 100ms; }

/* Parent hover trigger: wrap with class="group" to activate */
:global(.group:hover) .dot-on {
  transform: scale(1.3);
  filter: drop-shadow(0 0 5px currentColor);
}

:global(.group:hover) .dot-off {
  transform: scale(1.1);
}

:global(.group:active) .dot-on {
  transform: scale(0.85);
  transition-duration: 80ms;
  transition-delay: 0ms !important;
}
</style>
