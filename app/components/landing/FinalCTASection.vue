<!-- app/components/landing/FinalCTASection.vue -->
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
    y: 32, opacity: 0, duration: 0.7, ease: 'power2.out', clearProps: 'all'
  })
})
</script>

<template>
  <section class="bg-[#f4f1ed] pt-36 pb-36 relative overflow-hidden max-md:pt-28 max-md:pb-28">
    <!-- Top arch -->
    <div class="absolute top-0 left-0 right-0 pointer-events-none select-none">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        class="w-full h-20"
      >
        <path
          d="M0,80 Q720,0 1440,80 L1440,0 L0,0 Z"
          fill="#fffdf9"
        />
      </svg>
    </div>
    <!-- Bottom arch -->
    <div class="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        class="w-full h-20"
      >
        <path
          d="M0,0 Q720,80 1440,0 L1440,80 L0,80 Z"
          fill="#fffdf9"
        />
      </svg>
    </div>

    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 max-md:px-4 relative">
      <!-- Right illustration: modern.svg icon -->
      <div class="absolute left-full top-1/2 -translate-y-1/2 pl-6 pointer-events-none select-none max-xl:hidden">
        <img
          src="@/assets/icons/modern.svg"
          width="160"
          height="160"
          alt=""
        >
      </div>

      <div
        ref="bannerRef"
        class="flex flex-col items-center text-center gap-6 mx-auto"
      >
        <!-- Text -->
        <div class="flex flex-col items-center gap-4">
          <!-- Icon above heading -->
          <ClientOnly>
            <div class="size-36 max-md:size-28">
              <DotLottieVue
                src="/animations/Door.lottie"
                :autoplay="true"
                :loop="true"
                style="width:100%;height:100%;display:block"
              />
            </div>
          </ClientOnly>
          <h2 class="font-inter-display text-[60px] font-semibold leading-[1.1] tracking-[-0.02em] text-(--text) max-md:text-[28px] max-md:leading-[30.8px] max-md:tracking-[-0.56px]">
            Boshlashga tayyormisan?
          </h2>
          <p class="text-[15px] text-cx-muted leading-[1.6] max-w-100">
            Telegram yopiq kanalga qo'shil va bugunoq AIni hayot, ish va biznesingga joriy qilishni boshlagin.
          </p>
          <button
            class="hero-link-btn hero-link-btn--blue final-cta-btn"
            @click="scrollToPricing"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-5 shrink-0"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-9.642-2.618q-1.458.607-5.831 2.513q-.711.282-.744.552c-.038.304.343.424.862.587l.218.07c.51.166 1.198.36 1.555.368q.486.01 1.084-.4q4.086-2.76 4.218-2.789c.063-.014.149-.032.207.02c.059.052.053.15.047.177c-.038.161-1.534 1.552-2.308 2.271q-.344.324-.683.653c-.474.457-.83.8.02 1.36c.861.568 1.73 1.134 2.57 1.733c.414.296.786.56 1.246.519c.267-.025.543-.276.683-1.026c.332-1.77.983-5.608 1.133-7.19a1.8 1.8 0 0 0-.017-.393a.42.42 0 0 0-.142-.27c-.12-.098-.305-.118-.387-.117c-.376.007-.953.207-3.73 1.362"
              />
            </svg>
            Kirish huquqini olish
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.final-cta-btn {
  margin-left: 12px;
}
</style>
