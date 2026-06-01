<script setup lang="ts">
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

const props = defineProps<{ src: string }>()

const videoRef = ref<HTMLVideoElement | null>(null)
let player: Plyr | null = null

onMounted(() => {
  if (!videoRef.value) return
  player = new Plyr(videoRef.value, {
    controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
    settings: ['speed'],
    speed: { selected: 1, options: [0.75, 1, 1.25, 1.5, 2] },
    captions: { active: false },
  })
})

onUnmounted(() => {
  player?.destroy()
  player = null
})
</script>

<template>
  <div class="video-player-wrap rounded-2xl overflow-hidden">
    <video ref="videoRef" playsinline>
      <source :src="props.src" />
    </video>
  </div>
</template>

<style scoped>
.video-player-wrap :deep(.plyr) {
  --plyr-color-main: #3480f1;
  --plyr-border-radius: 12px;
  border-radius: 12px;
}
</style>
