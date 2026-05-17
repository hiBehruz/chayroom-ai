<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
const sectionRef = ref<HTMLElement>()
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!, {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, ease: 'power2.out'
  })
})
</script>

<template>
  <section ref="sectionRef" class="bg-cx-surface">
    <div class="max-w-[1180px] mx-auto px-10 py-20 text-center">
      <h2 class="text-[48px] font-extrabold tracking-[-0.03em] mb-4 leading-[1.1]">Готовы начать?</h2>
      <p class="text-[17px] text-cx-muted max-w-[480px] mx-auto mb-9 leading-[1.6]">Вступай в сообщество и начни внедрять ИИ в свою жизнь, работу и бизнес уже сегодня.</p>
      <button
        class="px-8 py-4 rounded-full bg-cx-ink text-white font-semibold text-base hover:bg-cx-ink-soft transition-colors duration-200 active:scale-[.98]"
        @click="document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })"
      >
        Получить доступ →
      </button>
    </div>
  </section>
</template>
