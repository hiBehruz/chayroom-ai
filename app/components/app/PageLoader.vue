<script setup lang="ts">
import teapotHero from '~/assets/images/herochoynak.png'

const emit = defineEmits<{ done: [] }>()
const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
    setTimeout(() => emit('done'), 280)
  }, 600)
})
</script>

<template>
  <Transition name="overlay-exit">
    <div
      v-if="visible"
      class="fixed inset-0 z-200 bg-white flex flex-col items-center justify-center gap-5 select-none"
    >
      <div class="relative w-48 h-48">
        <span class="loader-steam-puff loader-steam-puff-1" aria-hidden="true" />
        <span class="loader-steam-puff loader-steam-puff-2" aria-hidden="true" />
        <span class="loader-steam-puff loader-steam-puff-3" aria-hidden="true" />
        <img
          :src="teapotHero"
          alt="Chayroom AI"
          class="loader-teapot relative z-10 w-full h-full object-contain select-none"
        />
      </div>
      <div class="flex flex-col items-center gap-4">
        <p class="loader-text text-[18px] font-extrabold tracking-tight text-[#0a0a0b]">
          Chayroom
          <span class="brand-ai-gradient">AI</span>
          Club
        </p>
        <div class="w-28 h-0.5 bg-[#f0f0f0] rounded-full overflow-hidden">
          <div class="loader-bar h-full bg-cx-blue rounded-full" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-exit-leave-active {
  transition: opacity 0.38s ease;
}
.overlay-exit-leave-to {
  opacity: 0;
}

.loader-text {
  animation: fade-up 0.4s ease both;
  animation-delay: 0.18s;
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.loader-bar {
  width: 0;
  animation: fill-bar 0.55s cubic-bezier(0.4, 0, 0.2, 1) 0.05s both;
}
@keyframes fill-bar {
  from { width: 0%; }
  to   { width: 100%; }
}

.loader-teapot {
  transform-origin: 52% 56%;
  animation:
    loader-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
    loader-breathe 6.5s ease-in-out 0.5s infinite;
}
@keyframes loader-pop {
  from { opacity: 0; transform: scale(0.55); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes loader-breathe {
  0%,100% { transform: translate3d(0,0,0) scale(1); }
  20%     { transform: translate3d(0.5px,-3px,0) scale(1.03); }
  45%     { transform: translate3d(0,-8px,0) scale(1.05); }
  72%     { transform: translate3d(-0.5px,2px,0) scale(0.99); }
}

.loader-steam-puff {
  position: absolute;
  left: 14%;
  bottom: 38%;
  width: 28px;
  height: 46px;
  border-radius: 9999px;
  background:
    radial-gradient(ellipse at 50% 22%, rgba(132,144,160,0.7), rgba(156,169,184,0.38) 44%, transparent 74%),
    radial-gradient(ellipse at 48% 74%, rgba(196,207,219,0.5), transparent 70%);
  opacity: 0;
  filter: blur(4px);
  transform: translate3d(-50%,0,0) scale(0.5) rotate(0deg);
  animation: loader-steam-rise 4.5s ease-out infinite;
}
.loader-steam-puff-1 { margin-left: -6px; animation-delay: 0s; }
.loader-steam-puff-2 { width: 34px; height: 56px; margin-left: -18px; animation-delay: 1.3s; }
.loader-steam-puff-3 { width: 22px; height: 40px; margin-left: 4px;  animation-delay: 2.6s; }
@keyframes loader-steam-rise {
  0%   { opacity: 0; transform: translate3d(-50%,14px,0) scale(0.32) rotate(-10deg); }
  14%  { opacity: 0.72; }
  44%  { opacity: 0.5; transform: translate3d(calc(-50% - 10px),-36px,0) scale(0.9) rotate(6deg); }
  74%  { opacity: 0.18; transform: translate3d(calc(-50% + 8px),-72px,0) scale(1.2) rotate(-8deg); }
  100% { opacity: 0;   transform: translate3d(calc(-50% - 14px),-100px,0) scale(1.46) rotate(10deg); }
}
</style>
