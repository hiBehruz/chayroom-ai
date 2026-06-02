<script setup lang="ts">
withDefaults(defineProps<{
  variant: 'male' | 'female'
  size?: 'sm' | 'lg'
}>(), {
  size: 'sm'
})
</script>

<template>
  <div
    class="profile-agent-avatar"
    :class="size === 'lg' ? 'profile-agent-avatar--lg' : 'profile-agent-avatar--sm'"
    :data-variant="variant"
  >
    <svg
      viewBox="0 0 32 32"
      class="profile-agent-svg"
      fill="none"
      aria-hidden="true"
    >
      <rect x="8" y="7" width="16" height="18" rx="3" fill="#f8d8b8" />
      <rect
        v-if="variant === 'female'"
        x="7"
        y="5"
        width="18"
        height="9"
        rx="3"
        fill="#2a1a13"
      />
      <rect
        v-else
        x="8"
        y="5"
        width="16"
        height="6"
        rx="2"
        fill="#2a1a13"
      />
      <rect
        v-if="variant === 'female'"
        x="6"
        y="12"
        width="4"
        height="11"
        rx="1"
        fill="#2a1a13"
      />
      <rect
        v-if="variant === 'female'"
        x="22"
        y="12"
        width="4"
        height="11"
        rx="1"
        fill="#2a1a13"
      />
      <rect x="12" y="15" width="3" height="3" rx="0.5" fill="#111827" />
      <rect x="17" y="15" width="3" height="3" rx="0.5" fill="#111827" />
      <rect x="14" y="21" width="5" height="2" rx="1" fill="#b45309" />
      <rect
        v-if="variant === 'female'"
        x="11"
        y="24"
        width="10"
        height="4"
        rx="1"
        fill="#e11d48"
      />
      <rect
        v-else
        x="11"
        y="24"
        width="10"
        height="4"
        rx="1"
        fill="#3480f1"
      />
      <rect x="6" y="13" width="3" height="5" rx="1" fill="#f2c59f" />
      <rect x="23" y="13" width="3" height="5" rx="1" fill="#f2c59f" />
    </svg>
  </div>
</template>

<style scoped>
.profile-agent-avatar {
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 9999px;
  background:
    radial-gradient(circle at 32% 24%, rgba(255,255,255,0.12), transparent 28%),
    linear-gradient(135deg, #2e3248 0%, #1a1d2e 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.12) inset,
    0 4px 12px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.profile-agent-avatar--sm {
  width: 32px;
  height: 32px;
}

.profile-agent-avatar--lg {
  width: 68px;
  height: 68px;
}

.profile-agent-avatar::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: inherit;
  border: 1px solid rgba(255,255,255,0.14);
  pointer-events: none;
}

.profile-agent-avatar::after {
  content: '';
  position: absolute;
  inset: -35%;
  background: conic-gradient(from 130deg, transparent 0 62%, rgba(255,255,255,0.38) 70%, transparent 78% 100%);
  animation: profile-agent-shine 4.2s ease-in-out infinite;
}

.profile-agent-avatar[data-variant='female'] {
  background:
    radial-gradient(circle at 32% 24%, rgba(255,255,255,0.12), transparent 28%),
    linear-gradient(135deg, #2e3248 0%, #1a1d2e 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.12) inset,
    0 4px 12px rgba(0, 0, 0, 0.4);
}

.profile-agent-svg {
  position: relative;
  z-index: 1;
  width: 88%;
  height: 88%;
  image-rendering: pixelated;
  shape-rendering: crispEdges;
  animation: profile-agent-bob 3.8s ease-in-out infinite;
}

@keyframes profile-agent-bob {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-1.5px);
  }
}

@keyframes profile-agent-shine {
  0%, 72%, 100% {
    transform: rotate(0deg);
    opacity: 0;
  }

  82% {
    opacity: 1;
  }

  92% {
    transform: rotate(95deg);
    opacity: 0;
  }
}
</style>
