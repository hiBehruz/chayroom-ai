<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const bannerRef = ref<HTMLElement>()
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(bannerRef.value!, {
    scrollTrigger: { trigger: bannerRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, ease: 'power2.out'
  })
})
</script>

<template>
  <section
    id="guides"
    class="py-16 scroll-mt-20"
  >
    <div class="max-w-295 mx-auto px-10">
      <div
        ref="bannerRef"
        class="bg-[#f5e6c8] rounded-3xl flex items-center gap-14 w-209.25 h-73.75 px-14 mx-auto"
      >
        <!-- Book Lottie + sparkles -->
        <div class="relative shrink-0 w-56 h-56 flex items-center justify-center">
          <!-- Sparkles -->
          <span class="sparkle sparkle-1 absolute top-2 left-6 text-[#3b82f6] text-[18px]">✦</span>
          <span class="sparkle sparkle-2 absolute top-6 right-4 text-[#94a3b8] text-[12px]">✦</span>
          <span class="sparkle sparkle-3 absolute top-1 left-1/2 text-[#60a5fa] text-[10px]">✦</span>
          <span class="sparkle sparkle-4 absolute bottom-4 left-4 text-[#cbd5e1] text-[14px]">✦</span>
          <span class="sparkle sparkle-5 absolute bottom-2 right-6 text-[#3b82f6] text-[16px]">✦</span>
          <span class="sparkle sparkle-1 absolute bottom-8 left-1/2 text-[#64748b] text-[9px]">✦</span>
          <span class="sparkle sparkle-3 absolute top-10 left-2 text-[#93c5fd] text-[11px]">✦</span>
          <span class="sparkle sparkle-2 absolute top-14 right-2 text-[#94a3b8] text-[8px]">✦</span>
          <ClientOnly>
            <DotLottieVue
              src="/animations/Book.lottie"
              :autoplay="true"
              :loop="true"
              class="w-full h-full"
            />
          </ClientOnly>
        </div>

        <!-- Text -->
        <div class="flex flex-col gap-4">
          <h2 class="text-[32px] font-extrabold text-[#1a1a1a] tracking-tight leading-[1.1]">
            Бесплатные гайды
          </h2>
          <p class="text-[15px] text-cx-muted leading-[1.6] max-w-105">
            Практические руководства о том, как сделать AI частью своей жизни, работы и бизнеса.
          </p>
          <button class="btn-primary self-start text-[13px]! px-5! py-2.5!">
            Открыть
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sparkle { pointer-events: none; }
.sparkle-1 { animation: sp1 2.8s ease-in-out infinite; }
.sparkle-2 { animation: sp2 3.4s ease-in-out infinite 0.6s; }
.sparkle-3 { animation: sp3 2.2s ease-in-out infinite 1.2s; }
.sparkle-4 { animation: sp1 3.8s ease-in-out infinite 0.3s; }
.sparkle-5 { animation: sp2 2.5s ease-in-out infinite 1.8s; }

@keyframes sp1 {
  0%, 100% { opacity: 0; transform: scale(0.6) rotate(0deg); }
  40% { opacity: 1; transform: scale(1.2) rotate(20deg); }
  70% { opacity: 0.6; transform: scale(0.9) rotate(10deg); }
}
@keyframes sp2 {
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(-15deg); }
  50% { opacity: 1; transform: scale(1.3) rotate(15deg); }
}
@keyframes sp3 {
  0%, 100% { opacity: 0; transform: scale(0.7) rotate(0deg); }
  30% { opacity: 0.8; transform: scale(1.1) rotate(-20deg); }
  60% { opacity: 0; transform: scale(0.5) rotate(-30deg); }
}
</style>
