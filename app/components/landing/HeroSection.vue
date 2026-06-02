<!-- app/components/landing/HeroSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'

const keywords = [
  'Amaliy vositalar',
  "Kurslar va qo'llanmalar",
  'Yopiq chat AI Room Club',
  'AI olamidan yangi trendlar',
  'Jonli efirlar va workshoplar',
  'Tayyor templatelar'
]
const currentKeyword = ref(0)

const heroText = ref<HTMLElement>()

let keywordInterval: ReturnType<typeof setInterval>

function nextKeyword() {
  currentKeyword.value = (currentKeyword.value + 1) % keywords.length
}

onMounted(() => {
  keywordInterval = setInterval(nextKeyword, 2500)
  gsap.from(heroText.value!, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 })
})

onUnmounted(() => clearInterval(keywordInterval))

function scrollToPricing()  { document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }) }
function scrollToFeatures() { document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }) }
</script>

<template>
  <section class="hero-section pt-0 pb-0">
    <div class="relative z-10 w-310 max-w-[calc(100vw-40px)] mx-auto px-0 max-md:px-4">

      <!-- Centered text -->
      <div ref="heroText" class="relative z-10 flex flex-col items-center text-center gap-5 py-24 max-[734px]:py-12">
        <h1 class="hero-title flex flex-col items-center text-[80px] max-[734px]:text-[24px] font-semibold font-inter-display leading-22 tracking-[-1.6px] max-[734px]:leading-[1.1] max-[734px]:tracking-[-0.03em]">
          <span class="hero-title-line flex items-baseline justify-center gap-[0.16em]">
            <span class="hero-title-lockup relative inline-block max-[734px]:shrink-0 max-[734px]:whitespace-nowrap">
              <span class="hero-title-gradient">Chayroom</span>
              <span class="hero-ai-title"> AI</span>
              <span class="hero-title-gradient"> Club</span>
              <svg
                class="hero-title-underline absolute -bottom-1 -left-[6%] w-[114%] overflow-visible"
                viewBox="0 0 600 18"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <path class="hero-underline-path" d="M10,12 C150,2 450,2 590,12" stroke="#3480f1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="hero-title-gradient max-[734px]:shrink-0 max-[734px]:whitespace-nowrap">sun'iy intellekt</span>
          </span>
          <span class="hero-title-gradient hero-title-trail block">orqali yangi imkoniyatlar ochadi</span>
        </h1>

        <div class="mt-8 grid min-h-8 grid-cols-[auto_320px] items-center justify-center gap-x-8 gap-y-2 max-[734px]:mt-5 max-[734px]:grid-cols-1">
          <button class="hero-link-btn hero-link-btn--blue ml-3 max-[734px]:ml-0" @click="scrollToFeatures">
            <UIcon name="i-lucide-sparkles" class="size-4.5 shrink-0" />
            Meni nima kutadi →
          </button>
          <div class="flex items-center justify-center overflow-hidden">
            <Transition name="keyword" mode="out-in">
              <span
                :key="keywords[currentKeyword]"
                class="keyword-pill"
              >
                {{ keywords[currentKeyword] }}
              </span>
            </Transition>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  background: #fffdf9;
  overflow: hidden;
}

/* ── Title styles ── */
.hero-title {
  transform-origin: center top;
}

.hero-title-lockup {
  animation: hero-title-lockup-float 5.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  transform-origin: center bottom;
  will-change: transform;
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
  color: #0a0a0a;
  -webkit-text-fill-color: #0a0a0a;
  animation: hero-ai-pulse 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  transform-origin: center bottom;
  will-change: transform;
}

.hero-title-trail {
  display: inline-block;
  animation: hero-title-trail-rise 4.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  transform-origin: center;
  will-change: transform, opacity;
}

.hero-title-underline {
  animation: hero-underline-sway 4.8s ease-in-out infinite;
  transform-origin: center;
  will-change: transform;
}

.hero-desc {
  font-size: 18px;
  line-height: 1.75;
  color: transparent;
  background: linear-gradient(135deg, #4a4a4f 0%, #6b6b72 52%, #8d8d94 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.hero-underline-path {
  vector-effect: non-scaling-stroke;
}

.keyword-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0;
  color: #3480f1;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.15;
  white-space: nowrap;
}

@media (max-width: 734px) {
  .keyword-pill {
    min-height: 24px;
    font-size: 17px;
  }
}

/* ── Keyword transition ── */
.keyword-enter-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.keyword-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.keyword-enter-from   { opacity: 0; transform: translateY(14px);  }
.keyword-leave-to     { opacity: 0; transform: translateY(-14px); }

@keyframes hero-ai-shimmer {
  0%   { background-position: 8%  50%; }
  46%  { background-position: 92% 50%; }
  100% { background-position: 8%  50%; }
}

@keyframes hero-title-lockup-float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }

  35% {
    transform: translateY(-2px) scale(1.01, 0.995);
  }

  70% {
    transform: translateY(1px) scale(0.997, 1.004);
  }
}

@keyframes hero-ai-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 0 rgba(52,128,241,0));
    transform: translateY(0) scale(1);
  }

  50% {
    filter: drop-shadow(0 8px 18px rgba(52,128,241,0.14));
    transform: translateY(-1px) scale(1.035, 0.985);
  }
}

@keyframes hero-title-trail-rise {
  0%, 100% {
    transform: translateY(0);
    opacity: 1;
  }

  40% {
    transform: translateY(-1px);
    opacity: 0.92;
  }

  72% {
    transform: translateY(1px);
    opacity: 1;
  }
}

@keyframes hero-underline-sway {
  0%, 100% {
    transform: translateX(0) scaleX(1);
  }

  50% {
    transform: translateX(4px) scaleX(1.02);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-title-lockup,
  .hero-ai-title,
  .hero-title-trail,
  .hero-title-underline {
    animation: none;
    will-change: auto;
  }
}
</style>
