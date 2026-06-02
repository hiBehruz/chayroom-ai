<template>
  <div class="flex items-end justify-center pt-1 pb-0 gap-2 -mb-2">
    <span class="sparkle-sm">✦</span>
    <span class="sparkle-lg">✦</span>
    <span class="sparkle-dot">•</span>
  </div>
</template>

<style scoped>
.sparkle-lg {
  font-size: 26px;
  color: #3480f1;
  animation: pulse-lg 3s ease-in-out infinite;
  line-height: 1;
  margin-bottom: 8px;
}

.sparkle-sm {
  font-size: 15px;
  color: #C0C0C0;
  animation: pulse-sm 3s ease-in-out infinite 0.6s;
  line-height: 1;
}

.sparkle-dot {
  font-size: 13px;
  color: #3480f1;
  animation: pulse-sm 3s ease-in-out infinite 1.2s;
  line-height: 1;
  margin-bottom: 2px;
}

@keyframes pulse-lg {
  0%, 100% { opacity: 0.7; transform: scale(1) translateY(0); }
  50% { opacity: 1; transform: scale(1.15) translateY(-7px); }
}

@keyframes pulse-sm {
  0%, 100% { opacity: 0.5; transform: scale(1) translateY(0); }
  50% { opacity: 0.9; transform: scale(1.1) translateY(-5px); }
}
</style>
