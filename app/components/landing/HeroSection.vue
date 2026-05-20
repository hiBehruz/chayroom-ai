<!-- app/components/landing/HeroSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'
import heroBlobBg from '~/assets/images/hero-blob-bg.svg'

const keywords = ['AI vositalar', 'AI agentlar', 'Trend yechimlar', 'Vibe coding', 'AI Choyxona']
const currentKeyword = ref(0)
const heroContent = ref<HTMLElement>()

let keywordInterval: ReturnType<typeof setInterval>

function nextKeyword() {
  currentKeyword.value = (currentKeyword.value + 1) % keywords.length
}

onMounted(() => {
  keywordInterval = setInterval(nextKeyword, 2500)
  gsap.from(heroContent.value!, { y: 40, opacity: 0, duration: 0.75, ease: 'power3.out', delay: 0.15 })
})

onUnmounted(() => {
  clearInterval(keywordInterval)
})

function scrollToPricing() {
  document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToFeatures() {
  document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="hero-section pt-0 pb-6">
    <img
      :src="heroBlobBg"
      alt=""
      aria-hidden="true"
      class="hero-blob-bg"
    >
    <div class="relative z-10 max-w-295 mx-auto px-10 max-md:px-5">
      <div
        ref="heroContent"
        class="flex min-h-140 flex-col items-center justify-center text-center gap-5.5 max-md:min-h-0 max-md:pt-10 max-md:pb-8"
      >
        <h1 class="text-[72px] max-md:text-[42px] font-extrabold leading-[1.05] tracking-[-0.03em]">
          <span class="whitespace-nowrap">
            <span class="hero-title-gradient">Chayroom</span>
            <span class="hero-ai-title brand-ai-gradient"> AI</span>
          </span>
        </h1>

        <p class="hero-desc max-w-140 max-md:text-[15px]">
          AIni ish va hayotingga joriy qil, o’z loyihalaringni yarat va kuchli muhit bilan yangi ko’nikmalarni o’zlashtir.
        </p>

        <div class="flex items-center min-h-8 overflow-hidden">
          <Transition name="keyword" mode="out-in">
            <span
              :key="currentKeyword"
              class="text-[20px] max-md:text-[17px] font-bold leading-tight text-cx-blue inline-block"
            >
              {{ keywords[currentKeyword] }}
            </span>
          </Transition>
        </div>

        <div class="flex gap-3 mt-1 max-md:flex-col">
          <button class="btn-primary btn-primary-dark max-md:text-[13px]! max-md:py-2.5! max-md:px-4!" @click="scrollToPricing">
            Kirish huquqini olish →
          </button>
          <button class="btn-secondary max-md:text-[13px]! max-md:py-2.5! max-md:px-4!" @click="scrollToFeatures">
            Meni nima kutadi
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #fff 0%, #fff 64%, #f7fbff 100%);
}

.hero-blob-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  z-index: 0;
  opacity: 0.9;
}

.hero-section::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 120px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), #fff 86%);
}

.keyword-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.keyword-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.keyword-enter-from {
  opacity: 0;
  transform: translateY(14px);
}
.keyword-leave-to {
  opacity: 0;
  transform: translateY(-14px);
}

.hero-title-gradient {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-ai-title {
  position: relative;
  display: inline-block;
  margin-left: 0.16em;
  color: transparent;
  background:
    linear-gradient(115deg, #063b78 0%, #0075de 26%, #8dd4ff 48%, #1a4fe0 66%, #082f68 100%);
  background-size: 260% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-text-stroke: 0.35px rgba(255, 255, 255, 0.24);
  background-clip: text;
  text-shadow: 0 10px 30px rgba(0, 117, 222, 0.18);
  isolation: isolate;
  animation:
    hero-ai-title-shimmer 5.8s cubic-bezier(0.45, 0, 0.2, 1) infinite,
    hero-ai-title-pulse 4.6s ease-in-out infinite;
}

.hero-ai-title::before,
.hero-ai-title::after {
  content: '';
  position: absolute;
  inset: -22% -28%;
  z-index: -1;
  border-radius: 9999px;
  pointer-events: none;
  opacity: 0;
}

.hero-ai-title::before {
  background:
    radial-gradient(ellipse at 42% 58%, rgba(148, 163, 184, 0.34), rgba(203, 213, 225, 0.18) 46%, transparent 72%),
    radial-gradient(ellipse at 68% 34%, rgba(100, 116, 139, 0.18), transparent 66%);
  filter: blur(13px);
  animation: hero-ai-title-smoke 5.4s ease-in-out infinite;
}

.hero-ai-title::after {
  inset: -38% -52%;
  background:
    radial-gradient(ellipse at 34% 48%, rgba(226, 232, 240, 0.32), transparent 62%),
    radial-gradient(ellipse at 72% 62%, rgba(148, 163, 184, 0.2), transparent 58%);
  filter: blur(18px);
  animation: hero-ai-title-smoke 5.4s ease-in-out 1.35s infinite;
}

.hero-desc {
  font-size: 17px;
  line-height: 1.7;
  color: transparent;
  background: linear-gradient(135deg, #4a4a4f 0%, #6b6b72 52%, #8d8d94 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 450;
  letter-spacing: -0.01em;
}

@keyframes hero-ai-title-smoke {
  0%, 100% {
    opacity: 0;
    transform: translate3d(12px, 10px, 0) scale(0.72) rotate(-4deg);
  }
  28% {
    opacity: 0.42;
    transform: translate3d(0, 0, 0) scale(0.96) rotate(1deg);
  }
  58% {
    opacity: 0.32;
    transform: translate3d(-18px, -16px, 0) scale(1.22) rotate(5deg);
  }
  82% {
    opacity: 0.08;
    transform: translate3d(-34px, -32px, 0) scale(1.46) rotate(-3deg);
  }
}

@keyframes hero-ai-title-shimmer {
  0% {
    background-position: 8% 50%;
  }
  46% {
    background-position: 92% 50%;
  }
  100% {
    background-position: 8% 50%;
  }
}

@keyframes hero-ai-title-pulse {
  0%, 100% {
    filter:
      drop-shadow(0 0 0 rgba(0, 117, 222, 0))
      drop-shadow(0 0 0 rgba(141, 212, 255, 0));
    transform: translateY(0) scale(1);
  }
  50% {
    filter:
      drop-shadow(0 8px 18px rgba(0, 117, 222, 0.16))
      drop-shadow(0 0 12px rgba(141, 212, 255, 0.18));
    transform: translateY(-0.5px) scale(1.012);
  }
}
</style>
