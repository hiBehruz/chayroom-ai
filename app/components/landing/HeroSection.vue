<!-- app/components/landing/HeroSection.vue -->
<script setup lang="ts">
import teapotHero from '~/assets/images/herochoynak.png'

const keywords = ['AI-инструменты', 'AI-агенты', 'Трендовые решения', 'Вайбкодинг']
const currentKeyword = ref(0)
const heroArtStyle = ref({ '--hero-art-x': '0px', '--hero-art-y': '0px', '--hero-circle-x': '0px', '--hero-circle-y': '0px' })

let keywordInterval: ReturnType<typeof setInterval>
let rafId = 0
const target = { x: 0, y: 0 }
const current = { x: 0, y: 0 }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function applyStyle() {
  heroArtStyle.value = {
    '--hero-art-x': `${(current.x * 28).toFixed(2)}px`,
    '--hero-art-y': `${(current.y * 20).toFixed(2)}px`,
    '--hero-circle-x': `${(-current.x * 36).toFixed(2)}px`,
    '--hero-circle-y': `${(-current.y * 26).toFixed(2)}px`
  }
}

function tick() {
  current.x = lerp(current.x, target.x, 0.08)
  current.y = lerp(current.y, target.y, 0.08)
  applyStyle()
  rafId = requestAnimationFrame(tick)
}

function nextKeyword() {
  currentKeyword.value = (currentKeyword.value + 1) % keywords.length
}

onMounted(() => {
  keywordInterval = setInterval(nextKeyword, 2500)
})

onUnmounted(() => {
  clearInterval(keywordInterval)
  cancelAnimationFrame(rafId)
})

function scrollToPricing() {
  document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToFeatures() {
  document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
}

function handleHeroArtMove(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  target.x = (event.clientX - rect.left) / rect.width - 0.5
  target.y = (event.clientY - rect.top) / rect.height - 0.5
  if (!rafId) tick()
}

function resetHeroArtMove() {
  target.x = 0
  target.y = 0
}
</script>

<template>
  <section class="hero-section pt-0 pb-6">
    <div class="relative z-10 max-w-295 mx-auto px-10">
      <div class="grid min-h-140 grid-cols-[46%_1fr] items-center gap-0">
        <!-- Left: text -->
        <div
          class="relative z-20 flex min-w-0 translate-x-22 flex-col items-start justify-center gap-5.5"
        >
          <h1 class="text-[72px] font-extrabold leading-[1.05] tracking-[-0.03em]">
            <span class="whitespace-nowrap">
              <span class="hero-title-gradient">Chayroom</span>
              <span class="hero-ai-title text-cx-blue"> AI</span>
            </span>
          </h1>

          <p class="hero-desc max-w-105">
            Внедряй ИИ в работу и жизнь, создавай свои проекты и осваивай новые навыки вместе с сильным окружением.
          </p>

          <div class="flex items-center min-h-8 overflow-hidden">
            <Transition name="keyword" mode="out-in">
              <span
                :key="currentKeyword"
                class="text-[20px] font-bold leading-tight text-cx-blue inline-block"
              >
                {{ keywords[currentKeyword] }}
              </span>
            </Transition>
          </div>

          <div
            class="flex gap-3 mt-1"
          >
            <button class="btn-primary" @click="scrollToPricing">
              Получить доступ →
            </button>
            <button class="btn-secondary" @click="scrollToFeatures">
              Что меня ждёт
            </button>
          </div>
        </div>

        <!-- Right: art -->
        <div
          class="relative flex items-center justify-start w-full overflow-visible"
        >
          <div
            class="hero-art-stage relative w-[112%] translate-x-4"
            :style="heroArtStyle"
            @mousemove="handleHeroArtMove"
            @mouseleave="resetHeroArtMove"
          >
            <div
              class="hero-art-circle"
              aria-hidden="true"
            />
            <div
              class="hero-sparkles"
              aria-hidden="true"
            >
              <span class="hero-sparkle hero-sparkle-1" />
              <span class="hero-sparkle hero-sparkle-2" />
              <span class="hero-sparkle hero-sparkle-3" />
              <span class="hero-sparkle hero-sparkle-4" />
              <span class="hero-sparkle hero-sparkle-5" />
            </div>
            <div
              class="hero-steam"
              aria-hidden="true"
            >
              <span class="hero-steam-puff hero-steam-puff-1" />
              <span class="hero-steam-puff hero-steam-puff-2" />
              <span class="hero-steam-puff hero-steam-puff-3" />
              <span class="hero-steam-puff hero-steam-puff-4" />
            </div>
            <div
              class="hero-steam hero-steam-lid"
              aria-hidden="true"
            >
              <span class="hero-steam-puff hero-steam-puff-1" />
              <span class="hero-steam-puff hero-steam-puff-2" />
              <span class="hero-steam-puff hero-steam-puff-3" />
            </div>
            <div
              class="hero-ai-icons"
              aria-hidden="true"
            >
              <span class="hero-ai-icon hero-ai-icon-1">
                <UIcon
                  name="i-lucide-brain-circuit"
                  class="hero-ai-symbol"
                />
              </span>
              <span class="hero-ai-icon hero-ai-icon-2">
                <UIcon
                  name="i-lucide-bot"
                  class="hero-ai-symbol"
                />
              </span>
              <span class="hero-ai-icon hero-ai-icon-3">
                <UIcon
                  name="i-lucide-sparkles"
                  class="hero-ai-symbol"
                />
              </span>
              <span class="hero-ai-icon hero-ai-icon-4">
                <UIcon
                  name="i-lucide-cpu"
                  class="hero-ai-symbol"
                />
              </span>
            </div>
            <div
              class="hero-fire"
              aria-hidden="true"
            >
              <span class="hero-fire-glow" />
              <span class="hero-flame hero-flame-1" />
              <span class="hero-flame hero-flame-2" />
              <span class="hero-flame hero-flame-3" />
              <span class="hero-flame hero-flame-4" />
              <span class="hero-blue-flame hero-blue-flame-1" />
              <span class="hero-blue-flame hero-blue-flame-2" />
            </div>
            <img
              :src="teapotHero"
              alt="Chayroom AI teapot"
              class="hero-art-image relative z-10 w-full h-auto block"
            >
          </div>
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

.hero-art-stage {
  isolation: isolate;
}

.hero-art-circle {
  position: absolute;
  z-index: 0;
  left: 49%;
  top: 50%;
  width: 62%;
  aspect-ratio: 1;
  border-radius: 9999px;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.2) 24%, transparent 42%),
    linear-gradient(145deg, rgba(0, 117, 222, 0.22), rgba(232, 243, 255, 0.86) 54%, rgba(0, 117, 222, 0.12));
  box-shadow: none;
  transform: translate(calc(-50% + var(--hero-circle-x, 0px)), calc(-50% + var(--hero-circle-y, 0px)));
  transform-origin: center;
  animation: hero-circle-float 7.5s ease-in-out infinite;
}

.hero-art-image {
  transform-origin: 52% 56%;
  translate: var(--hero-art-x, 0px) var(--hero-art-y, 0px);
  animation: hero-art-breathe 6.5s ease-in-out infinite;
}

.hero-steam {
  position: absolute;
  z-index: 12;
  left: 10%;
  top: 30%;
  width: 26%;
  height: 34%;
  pointer-events: none;
  filter: blur(0.2px);
}

.hero-steam-lid {
  left: 46%;
  top: 5%;
  width: 22%;
  height: 30%;
}

.hero-steam-lid .hero-steam-puff {
  left: 50%;
  bottom: 4%;
  animation-name: hero-steam-lid-rise;
}

.hero-steam-lid .hero-steam-puff-1 {
  margin-left: -12px;
  animation-delay: 0.45s;
}

.hero-steam-lid .hero-steam-puff-2 {
  margin-left: 10px;
  animation-delay: 1.65s;
}

.hero-steam-lid .hero-steam-puff-3 {
  margin-left: -2px;
  animation-delay: 2.8s;
}

.hero-steam-puff {
  position: absolute;
  left: 46%;
  bottom: 28%;
  width: 36px;
  height: 58px;
  border-radius: 9999px;
  background:
    radial-gradient(ellipse at 50% 22%, rgba(132, 144, 160, 0.7), rgba(156, 169, 184, 0.38) 44%, transparent 74%),
    radial-gradient(ellipse at 48% 74%, rgba(196, 207, 219, 0.5), transparent 70%);
  opacity: 0;
  filter: blur(5px);
  transform: translate3d(-50%, 0, 0) scale(0.55) rotate(0deg);
  animation: hero-steam-rise 4.8s ease-out infinite;
}

.hero-steam-puff-1 {
  margin-left: -8px;
  animation-delay: 0s;
}

.hero-steam-puff-2 {
  width: 42px;
  height: 70px;
  margin-left: -22px;
  animation-delay: 1.1s;
}

.hero-steam-puff-3 {
  width: 30px;
  height: 54px;
  margin-left: 6px;
  animation-delay: 2.1s;
}

.hero-steam-puff-4 {
  width: 48px;
  height: 78px;
  margin-left: -34px;
  animation-delay: 3.15s;
}

.hero-ai-icons {
  position: absolute;
  z-index: 13;
  left: -6%;
  top: 7%;
  width: 34%;
  height: 40%;
  pointer-events: none;
}

.hero-ai-icon {
  position: absolute;
  display: grid;
  place-items: center;
  left: 48%;
  bottom: 12%;
  width: 44px;
  height: 44px;
  padding: 10px;
  border: 1px solid rgba(107, 114, 128, 0.08);
  border-radius: 9999px;
  color: rgba(55, 65, 81, 0.92);
  background:
    radial-gradient(circle at 50% 48%, rgba(226, 232, 240, 0.46), rgba(203, 213, 225, 0.22) 42%, transparent 72%);
  box-shadow:
    0 8px 22px rgba(15, 23, 42, 0.08),
    inset 0 0 18px rgba(255, 255, 255, 0.26);
  opacity: 0;
  filter: blur(0);
  backdrop-filter: blur(5px);
  --ai-drift-x: -48px;
  --ai-drift-soft: -86px;
  --ai-drift-end: -124px;
  --ai-rise-mid: -62px;
  --ai-rise-soft: -112px;
  --ai-rise-end: -148px;
  animation: hero-ai-icon-rise 5.4s ease-in-out infinite;
}

.hero-ai-icon::before {
  content: '';
  position: absolute;
  inset: -12px;
  z-index: -1;
  border-radius: 9999px;
  background:
    radial-gradient(ellipse at 46% 58%, rgba(203, 213, 225, 0.42), rgba(226, 232, 240, 0.22) 42%, transparent 72%),
    radial-gradient(ellipse at 62% 30%, rgba(148, 163, 184, 0.22), transparent 64%);
  filter: blur(9px);
}

.hero-ai-symbol {
  width: 100%;
  height: 100%;
  color: currentColor !important;
  background-color: currentColor !important;
}

.hero-ai-icon-1 {
  color: rgba(55, 65, 81, 0.94);
  --ai-drift-x: -58px;
  --ai-drift-soft: -96px;
  --ai-drift-end: -132px;
  --ai-rise-mid: -72px;
  --ai-rise-soft: -138px;
  --ai-rise-end: -188px;
  animation-delay: 0.2s;
}

.hero-ai-icon-2 {
  width: 40px;
  height: 40px;
  color: rgba(75, 85, 99, 0.9);
  border-color: rgba(122, 132, 145, 0.08);
  --ai-drift-x: 8px;
  --ai-drift-soft: -16px;
  --ai-drift-end: -44px;
  --ai-rise-mid: -78px;
  --ai-rise-soft: -154px;
  --ai-rise-end: -214px;
  animation-delay: 1.35s;
}

.hero-ai-icon-3 {
  color: rgba(71, 85, 105, 0.92);
  border-color: rgba(104, 114, 128, 0.08);
  box-shadow:
    0 8px 22px rgba(15, 23, 42, 0.08),
    inset 0 0 18px rgba(255, 255, 255, 0.24);
  --ai-drift-x: -86px;
  --ai-drift-soft: -126px;
  --ai-drift-end: -172px;
  --ai-rise-mid: -58px;
  --ai-rise-soft: -104px;
  --ai-rise-end: -142px;
  animation-delay: 2.45s;
}

.hero-ai-icon-4 {
  width: 38px;
  height: 38px;
  color: rgba(75, 85, 99, 0.9);
  border-color: rgba(95, 104, 116, 0.08);
  --ai-drift-x: 24px;
  --ai-drift-soft: 38px;
  --ai-drift-end: 18px;
  --ai-rise-mid: -64px;
  --ai-rise-soft: -132px;
  --ai-rise-end: -184px;
  animation-delay: 3.55s;
}

.hero-fire {
  position: absolute;
  z-index: 9;
  left: 38%;
  bottom: 7%;
  width: 26%;
  height: 18%;
  pointer-events: none;
  filter: saturate(1.12);
}

.hero-fire-glow {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 92%;
  height: 42%;
  border-radius: 9999px;
  background:
    radial-gradient(ellipse at center, rgba(255, 168, 36, 0.5), rgba(255, 168, 36, 0.18) 44%, transparent 72%),
    radial-gradient(ellipse at center, rgba(0, 117, 222, 0.28), transparent 68%);
  filter: blur(10px);
  transform: translateX(-50%);
  animation: hero-fire-glow 1.6s ease-in-out infinite;
}

.hero-flame,
.hero-blue-flame {
  position: absolute;
  bottom: 18%;
  left: 50%;
  border-radius: 52% 48% 54% 46% / 62% 58% 42% 38%;
  transform-origin: 50% 100%;
  opacity: 0.9;
}

.hero-flame {
  width: 22px;
  height: 58px;
  background:
    radial-gradient(ellipse at 50% 70%, rgba(255, 255, 210, 0.98) 0 18%, rgba(255, 215, 58, 0.9) 42%, rgba(255, 111, 27, 0.96) 72%, rgba(239, 68, 68, 0.86) 100%);
  filter: drop-shadow(0 0 12px rgba(255, 132, 24, 0.45));
  clip-path: polygon(50% 0, 73% 30%, 65% 56%, 88% 100%, 50% 82%, 14% 100%, 34% 58%, 26% 31%);
  animation: hero-flame-flicker 1.05s ease-in-out infinite;
}

.hero-flame-1 {
  margin-left: -44px;
  height: 48px;
  animation-delay: -0.15s;
}

.hero-flame-2 {
  margin-left: -16px;
  height: 68px;
  width: 26px;
  animation-delay: -0.4s;
}

.hero-flame-3 {
  margin-left: 14px;
  height: 55px;
  animation-delay: -0.7s;
}

.hero-flame-4 {
  margin-left: 40px;
  height: 42px;
  width: 18px;
  animation-delay: -0.25s;
}

.hero-blue-flame {
  width: 16px;
  height: 34px;
  background: radial-gradient(ellipse at 50% 80%, rgba(224, 247, 255, 0.95), rgba(56, 189, 248, 0.78) 48%, rgba(0, 117, 222, 0.68) 100%);
  filter: blur(0.2px) drop-shadow(0 0 10px rgba(0, 117, 222, 0.34));
  clip-path: polygon(50% 0, 72% 34%, 61% 64%, 86% 100%, 50% 82%, 17% 100%, 39% 64%, 28% 34%);
  animation: hero-blue-flame-flicker 0.9s ease-in-out infinite;
}

.hero-blue-flame-1 {
  margin-left: -28px;
  animation-delay: -0.25s;
}

.hero-blue-flame-2 {
  margin-left: 26px;
  animation-delay: -0.55s;
}

.hero-sparkles {
  position: absolute;
  z-index: 11;
  inset: 15% 18% 12% 16%;
  pointer-events: none;
  animation: hero-sparkle-drift 10s ease-in-out infinite;
}

.hero-sparkle {
  position: absolute;
  width: 18px;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #ffffff 0%, currentColor 50%, #475569 100%);
  clip-path: polygon(50% 0, 61% 34%, 100% 50%, 61% 66%, 50% 100%, 39% 66%, 0 50%, 39% 34%);
  color: #64748b;
  filter: drop-shadow(0 5px 10px rgba(15, 23, 42, 0.14));
  opacity: 0;
  transform: translate3d(0, 0, 0) scale(0.7) rotate(0deg);
  animation: hero-sparkle-twinkle 3.6s ease-in-out infinite;
}

.hero-sparkle-1 {
  left: 15%;
  top: 24%;
  width: 16px;
  animation-delay: 0s;
}

.hero-sparkle-2 {
  right: 24%;
  top: 11%;
  width: 22px;
  color: #94a3b8;
  animation-delay: 0.7s;
}

.hero-sparkle-3 {
  right: 15%;
  top: 49%;
  width: 14px;
  animation-delay: 1.25s;
}

.hero-sparkle-4 {
  left: 24%;
  bottom: 18%;
  width: 20px;
  color: #64748b;
  animation-delay: 1.8s;
}

.hero-sparkle-5 {
  left: 9%;
  top: 56%;
  width: 12px;
  color: #a0aec0;
  animation-delay: 2.35s;
}

@keyframes hero-circle-float {
  0%, 100% {
    transform:
      translate(
        calc(-50%),
        calc(-50%)
      )
      rotate(0deg)
      scale(1);
  }
  42% {
    transform:
      translate(
        calc(-51%),
        calc(-53%)
      )
      rotate(5deg)
      scale(1.035);
  }
  72% {
    transform:
      translate(
        calc(-49%),
        calc(-48%)
      )
      rotate(-3deg)
      scale(0.985);
  }
}

@keyframes hero-sparkle-drift {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  45% { transform: translate3d(8px, -12px, 0) rotate(3deg); }
  74% { transform: translate3d(-5px, 7px, 0) rotate(-2deg); }
}

@keyframes hero-sparkle-twinkle {
  0%, 100% { opacity: 0; transform: translate3d(0, 8px, 0) scale(0.45) rotate(0deg); }
  18% { opacity: 0.95; transform: translate3d(0, 0, 0) scale(1) rotate(35deg); }
  42% { opacity: 0.32; transform: translate3d(0, -5px, 0) scale(0.75) rotate(70deg); }
  58% { opacity: 0.85; transform: translate3d(0, -2px, 0) scale(1.08) rotate(105deg); }
  78% { opacity: 0; transform: translate3d(0, -12px, 0) scale(0.5) rotate(150deg); }
}

@keyframes hero-steam-rise {
  0% { opacity: 0; transform: translate3d(-50%, 18px, 0) scale(0.35) rotate(-12deg); }
  14% { opacity: 0.78; }
  42% { opacity: 0.58; transform: translate3d(calc(-50% - 14px), -44px, 0) scale(0.88) rotate(7deg); }
  72% { opacity: 0.24; transform: translate3d(calc(-50% + 10px), -94px, 0) scale(1.22) rotate(-10deg); }
  100% { opacity: 0; transform: translate3d(calc(-50% - 18px), -136px, 0) scale(1.48) rotate(11deg); }
}

@keyframes hero-steam-lid-rise {
  0% { opacity: 0; transform: translate3d(-50%, 16px, 0) scale(0.32) rotate(4deg); }
  15% { opacity: 0.72; }
  44% { opacity: 0.52; transform: translate3d(calc(-50% + 10px), -48px, 0) scale(0.86) rotate(-8deg); }
  72% { opacity: 0.22; transform: translate3d(calc(-50% - 12px), -104px, 0) scale(1.18) rotate(9deg); }
  100% { opacity: 0; transform: translate3d(calc(-50% + 4px), -150px, 0) scale(1.46) rotate(-7deg); }
}

@keyframes hero-ai-icon-rise {
  0%, 100% { opacity: 0; filter: blur(5px); transform: translate3d(-50%, 22px, 0) scale(0.42) rotate(-10deg); }
  18% { opacity: 0.96; filter: blur(0); transform: translate3d(-50%, 0, 0) scale(0.9) rotate(0deg); }
  48% { opacity: 0.76; filter: blur(1.8px); transform: translate3d(calc(-50% + var(--ai-drift-x)), var(--ai-rise-mid), 0) scale(1.1) rotate(9deg); }
  76% { opacity: 0.34; filter: blur(6px); transform: translate3d(calc(-50% + var(--ai-drift-soft)), var(--ai-rise-soft), 0) scale(1.34) rotate(-7deg); }
  94% { opacity: 0; filter: blur(12px); transform: translate3d(calc(-50% + var(--ai-drift-end)), var(--ai-rise-end), 0) scale(1.64) rotate(10deg); }
}

@keyframes hero-fire-glow {
  0%, 100% { opacity: 0.62; transform: translateX(-50%) scaleX(0.94); }
  50% { opacity: 0.92; transform: translateX(-50%) scaleX(1.08); }
}

@keyframes hero-flame-flicker {
  0%, 100% { transform: translate3d(-50%, 0, 0) scaleY(0.92) skewX(-4deg); opacity: 0.72; }
  35% { transform: translate3d(-50%, -7px, 0) scaleY(1.14) skewX(5deg); opacity: 1; }
  68% { transform: translate3d(-50%, -3px, 0) scaleY(0.98) skewX(-2deg); opacity: 0.86; }
}

@keyframes hero-blue-flame-flicker {
  0%, 100% { transform: translate3d(-50%, 0, 0) scaleY(0.82); opacity: 0.52; }
  50% { transform: translate3d(-50%, -5px, 0) scaleY(1.08); opacity: 0.9; }
}

@keyframes hero-art-breathe {
  0%, 100% {
    transform:
      translate3d(0, 0, 0)
  
  
      rotate(0deg)
      scale(1);
  }
  18% {
    transform:
      translate3d(1px, -3px, 0)
  
  
      rotate(0deg)
      scale(1.004);
  }
  22% {
    transform:
      translate3d(-1px, -4px, 0)
  
  
      rotate(0deg)
      scale(1.006);
  }
  26% {
    transform:
      translate3d(1px, -5px, 0)
  
  
      rotate(0deg)
      scale(1.008);
  }
  45% {
    transform:
      translate3d(0, -10px, 0)
  
  
      rotate(0deg)
      scale(1.015);
  }
  58% {
    transform:
      translate3d(1px, -5px, 0)
  
  
      rotate(0deg)
      scale(1.006);
  }
  62% {
    transform:
      translate3d(-1px, -4px, 0)
  
  
      rotate(0deg)
      scale(1.004);
  }
  72% {
    transform:
      translate3d(0, 4px, 0)
  
  
      rotate(0deg)
      scale(0.995);
  }
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
  background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 50%, #6b6b6b 100%);
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
