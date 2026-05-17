<script setup lang="ts">
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
  <section class="py-16" id="guides">
    <div class="max-w-[1180px] mx-auto px-10">
      <div ref="bannerRef" class="bg-cx-ink rounded-[28px] p-14 px-16 grid grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <h2 class="text-[36px] font-extrabold text-white tracking-[-0.02em] mb-2.5">Бесплатные гайды</h2>
          <p class="text-base text-white/60 max-w-[480px] leading-[1.5]">Практические руководства о том, как сделать AI частью своей жизни, работы и бизнеса.</p>
        </div>
        <button class="shrink-0 px-[26px] py-3.5 rounded-full bg-white text-cx-ink font-semibold text-[15px] hover:bg-gray-100 transition-colors duration-200 active:scale-[.98]">
          Открыть →
        </button>
      </div>
    </div>
  </section>
</template>
