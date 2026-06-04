<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const bannerRef = ref<HTMLElement>()
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(bannerRef.value!, {
    scrollTrigger: { trigger: bannerRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, ease: 'power2.out', clearProps: 'all'
  })
})
</script>

<template>
  <section
    id="guides"
    class="guides-banner-section pt-36 pb-36 scroll-mt-20 relative overflow-hidden max-md:pt-28 max-md:pb-28"
  >
    <!-- Top arch -->
    <div class="absolute top-0 left-0 right-0 pointer-events-none select-none">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" class="w-full h-20">
        <path d="M0,80 Q720,0 1440,80 L1440,0 L0,0 Z" fill="#fffdf9"/>
      </svg>
    </div>

    <!-- Bottom arch -->
    <div class="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" class="w-full h-20">
        <path d="M0,0 Q720,80 1440,0 L1440,80 L0,80 Z" fill="#fffdf9"/>
      </svg>
    </div>

    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 max-md:px-5">
      <div
        ref="bannerRef"
        class="guides-banner-panel relative mx-auto -mt-16 flex min-h-[390px] w-full flex-col items-center justify-center gap-3 pt-2 text-center max-md:mt-0 max-md:min-h-130 max-md:py-14"
      >
        <svg
          class="guides-banner-left-sparkle max-md:hidden"
          viewBox="0 0 83 64"
          fill="none"
          aria-hidden="true"
        >
          <path
            stroke="#3480F1"
            stroke-linejoin="round"
            stroke-width="4"
            d="M7.616 3.48c3.104 6.709-1.489 11.933-4.173 13.707 7.927-3.505 9.077-1.185 13.865 4.259-2.644-8.759.546-8.61 4.297-13.299-7.617 2.3-9.261.574-13.989-4.666ZM50.508 7.778C51.605 27.196 35.31 35.53 27.025 37.27c22.789-.898 23.355 5.89 29.8 23.847 2.011-23.989 9.671-20.537 23.39-28.376-20.864-1.75-23.216-7.565-29.707-24.963Z"
          />
        </svg>
        <svg
          class="guides-banner-right-sparkle max-md:hidden"
          viewBox="0 0 27 27"
          fill="none"
          aria-hidden="true"
        >
          <path
            stroke="#3480F1"
            stroke-linejoin="round"
            stroke-width="4"
            d="M20.459 2.158C14.843 9.955 5.995 8.09 2.273 6.182c9.03 6.74 7.137 9.523 4.029 18.421 8.23-8.586 10.099-4.879 17.803-3.624-7.468-7.158-6.563-10.122-3.646-18.821Z"
          />
        </svg>
        <div
          class="guides-banner-art relative z-10 translate-x-16 shrink-0 max-md:translate-x-0"
          aria-hidden="true"
        >
          <ClientOnly>
            <div class="size-[260px] max-md:size-[220px] max-md:mx-auto">
              <DotLottieVue
                src="/animations/Book.lottie"
                :autoplay="true"
                :loop="true"
                style="width:100%;height:100%;display:block"
              />
            </div>
          </ClientOnly>
        </div>
        <div class="guides-banner-copy relative z-10 mx-auto -mt-8 flex max-w-[600px] flex-col items-center text-center max-md:mt-0">
          <h2 class="guides-banner-title">
            Bepul qo‘llanmalar
          </h2>
          <p class="guides-banner-desc">
            AIni hayot, ish va biznesingning bir qismiga aylantirish bo‘yicha amaliy qo‘llanmalar.
          </p>
          <NuxtLink
            to="/guides"
            class="hero-link-btn hero-link-btn--blue guides-banner-link"
          >
            <UIcon
              name="i-lucide-book-open"
              class="size-5 text-white"
              aria-hidden="true"
            />
            Qo'llanmalarni ochish
            <UIcon
              name="i-lucide-arrow-right"
              class="size-5 text-white"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.guides-banner-section {
  background: #f4f1ed;
}

.guides-banner-panel {
  /* layout only — background lives on the section */
}

.guides-banner-left-sparkle {
  position: absolute;
  top: 72px;
  left: 14%;
  width: 83px;
  height: 64px;
  pointer-events: none;
}

.guides-banner-right-sparkle {
  position: absolute;
  right: 18%;
  bottom: 120px;
  width: 27px;
  height: 27px;
  pointer-events: none;
}

.guides-banner-title {
  color: #14161f;
  font-family: var(--font-inter-display);
  font-size: 60px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 66px;
}

.guides-banner-desc {
  max-width: 520px;
  margin-right: auto;
  margin-top: 18px;
  margin-left: auto;
  color: #30313a;
  font-size: 20px;
  font-weight: 500;
  line-height: 30px;
}

.guides-banner-link {
  margin-top: 28px;
  line-height: 1;
}

.guides-banner-art {
  width: min(420px, 34vw);
}

.guides-banner-art svg {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 734px) {
  .guides-banner-title {
    font-size: 28px;
    line-height: 30.8px;
    letter-spacing: -0.56px;
  }

  .guides-banner-desc {
    margin-top: 14px;
    font-size: 17px;
    line-height: 25px;
  }

  .guides-banner-link {
    margin-top: 22px;
    font-size: 16px;
  }

  .guides-banner-art {
    width: min(320px, 82vw);
  }
}
</style>
