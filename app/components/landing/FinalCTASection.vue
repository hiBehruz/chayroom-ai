<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const bannerRef = ref<HTMLElement>()

function scrollToPricing() {
  document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(bannerRef.value!, {
    scrollTrigger: { trigger: bannerRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, ease: 'power2.out'
  })
})
</script>

<template>
  <section class="py-16">
    <div class="max-w-295 mx-auto px-10">
      <div
        ref="bannerRef"
        class="bg-[#dbeafe] rounded-3xl flex items-center gap-14 w-209.25 h-73.75 px-14 mx-auto"
      >
        <!-- Door Lottie animation -->
        <ClientOnly>
          <div class="shrink-0 w-44 h-44">
            <DotLottieVue
              src="/animations/Door.lottie?v=2"
              :autoplay="true"
              :loop="true"
              class="w-full h-full"
            />
          </div>
        </ClientOnly>

        <!-- Text -->
        <div class="flex flex-col gap-4">
          <h2 class="text-[32px] font-extrabold text-[#1a1a1a] tracking-tight leading-[1.1]">
            Готовы начать?
          </h2>
          <p class="text-[15px] text-cx-muted leading-[1.6] max-w-100">
            Вступай в сообщество и начни внедрять ИИ в свою жизнь, работу и бизнес уже сегодня.
          </p>
          <button class="btn-primary self-start text-[13px]! px-5! py-2.5!" @click="scrollToPricing">
            Получить доступ
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
