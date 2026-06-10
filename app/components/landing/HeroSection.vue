<!-- app/components/landing/HeroSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'

const keywords = [
  'Amaliy vositalar',
  'Kurslar va qo\'llanmalar',
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

function scrollToFeatures() {
  document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="hero-section pt-0 pb-0">
    <div class="relative z-10 w-310 max-w-[calc(100vw-40px)] mx-auto px-0 max-md:px-4">
      <!-- Two-column: text left, image right -->
      <div
        ref="heroText"
        class="relative z-10 flex items-center justify-between gap-12 py-24 max-[734px]:flex-col-reverse max-[734px]:py-12 max-[734px]:gap-8"
      >
        <!-- Left: text -->
        <div class="flex flex-col items-start gap-5 max-[734px]:items-center max-[734px]:text-center">
          <h1 class="hero-title text-[80px] max-[734px]:text-[32px] font-semibold font-inter-display leading-[0.95] tracking-[-1.6px] max-[734px]:leading-[1.1] max-[734px]:tracking-[-0.03em]">
            <span class="hero-title-lockup relative inline-block whitespace-nowrap">
              <span class="hero-title-gradient">Chayroom</span>
              <span class="hero-ai-title"> AI</span>
              <span class="hero-title-gradient"> Club</span>
            </span>
          </h1>

          <p class="text-[16px] text-cx-muted leading-snug max-w-sm max-[734px]:text-[14px] max-[734px]:max-w-full">
            Внедряй ИИ в работу и жизнь, создавай свои проекты и осваивай новые навыки вместе с сильным окружением.
          </p>

          <div class="flex flex-wrap items-center gap-x-8 gap-y-2 max-[734px]:justify-center">
            <button
              class="hero-link-btn hero-link-btn--blue"
              @click="scrollToFeatures"
            >
              <UIcon
                name="i-lucide-sparkles"
                class="size-4.5 shrink-0"
              />
              Meni nima kutadi →
            </button>
            <div class="flex items-center">
              <Transition
                name="keyword"
                mode="out-in"
              >
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

        <!-- Right: image -->
        <div class="relative shrink-0">
          <img
            src="~/assets/images/aichoyxona_img.png"
            alt="Chayroom AI"
            class="h-[420px] w-auto object-contain max-[734px]:h-64"
          >
          <!-- Spout smoke -->
          <div
            class="hero-smoke hero-smoke--spout"
            aria-hidden="true"
          >
            <span class="hero-smoke-puff hero-smoke-puff-1" />
            <span class="hero-smoke-puff hero-smoke-puff-2" />
            <span class="hero-smoke-puff hero-smoke-puff-3" />
          </div>

          <!-- Lid smoke -->
          <div
            class="hero-smoke hero-smoke--lid"
            aria-hidden="true"
          >
            <span class="hero-smoke-puff hero-smoke-puff-1" />
            <span class="hero-smoke-puff hero-smoke-puff-2" />
            <span class="hero-smoke-puff hero-smoke-puff-3" />
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
            <span class="hero-ai-icon hero-ai-icon-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="hero-ai-symbol"
              ><g fill="none"><path
                fill="currentColor"
                d="M13.604 2.006a1 1 0 0 1 .89 1.099l-.643 6.104l3.868-4.834a1 1 0 0 1 1.562 1.25l-4.19 5.237l5.68-1.336a1.001 1.001 0 0 1 .458 1.948l-3.77.886l3.715.656a1 1 0 1 1-.348 1.968l-4.901-.865l4.225 3.622a.999.999 0 1 1-1.3 1.518l-2.324-1.991l1.331 2.217a1 1 0 0 1-1.715 1.03l-2.992-4.988l-.657 5.59a1 1 0 0 1-1.986-.234l.556-4.732l-3.256 4.44a1 1 0 0 1-1.614-1.183l2.564-3.497l-3.242 1.947a1 1 0 0 1-1.03-1.715l4.693-2.817L2.948 13a1 1 0 0 1 .105-1.998l6.218.327L3.901 7.3A1 1 0 1 1 5.1 5.7l4.446 3.335l-2.93-5.57a1 1 0 0 1 1.769-.93l3.466 6.584l.655-6.223a1 1 0 0 1 1.098-.89"
              /></g></svg>
            </span>
            <span class="hero-ai-icon hero-ai-icon-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                class="hero-ai-symbol hero-ai-symbol--raw"
              >
                <defs>
                  <linearGradient
                    id="_codex_g"
                    x1="0.1"
                    y1="0.1"
                    x2="0.9"
                    y2="0.9"
                  >
                    <stop
                      offset="0%"
                      stop-color="#a78bfa"
                    />
                    <stop
                      offset="100%"
                      stop-color="#5b8ef8"
                    />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#_codex_g)"
                  d="M 96 50 Q 80.7 35.3 78.8 14 Q 57.6 16.9 39.8 5.2 Q 28.7 23.4 8.5 30.2 Q 16 50 8.5 69.8 Q 28.7 76.6 39.8 94.8 Q 57.6 83.1 78.8 86 Q 80.7 64.7 96 50 Z"
                />
                <path
                  fill="none"
                  stroke="white"
                  stroke-width="9"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M 28 40 L 43 50 L 28 60"
                />
                <rect
                  fill="white"
                  x="51"
                  y="46"
                  width="19"
                  height="8"
                  rx="4"
                />
              </svg>
            </span>
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
  overflow-x: clip;
}

/* ── Title styles ── */
.hero-title {
  transform-origin: center top;
}

.hero-title-lockup {
  transform-origin: center bottom;
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
  transform-origin: center bottom;
}

.hero-title-trail {
  display: inline-block;
}

.hero-title-underline {
  transform-origin: center;
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

/* ── Smoke ── */
.hero-smoke {
  position: absolute;
  pointer-events: none;
  z-index: 12;
}

/* spout opening position */
.hero-smoke--spout {
  left: 26%;
  top: 17%;
}

/* lid knob position */
.hero-smoke--lid {
  left: 50%;
  top: 2%;
}

.hero-smoke-puff {
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(220, 220, 220, 0.55);
  filter: blur(5px);
  opacity: 0;
  --smoke-drift: 0px;
  animation: smoke-rise 2.8s ease-out infinite;
  will-change: transform, opacity;
}

.hero-smoke-puff-1 {
  --smoke-drift: -8px;
  animation-delay: 0s;
  width: 8px;
  height: 8px;
}

.hero-smoke-puff-2 {
  --smoke-drift: 6px;
  animation-delay: 0.9s;
  width: 12px;
  height: 12px;
}

.hero-smoke-puff-3 {
  --smoke-drift: -4px;
  animation-delay: 1.8s;
  width: 9px;
  height: 9px;
}

@keyframes smoke-rise {
  0%   { opacity: 0;    transform: translate(-50%, 0)                              scale(0.5); filter: blur(4px); }
  15%  { opacity: 0.65; transform: translate(calc(-50% + var(--smoke-drift) * 0.3), -10px)    scale(0.8); }
  55%  { opacity: 0.35; transform: translate(calc(-50% + var(--smoke-drift)),       -36px)    scale(1.5); filter: blur(7px); }
  100% { opacity: 0;    transform: translate(calc(-50% + var(--smoke-drift) * 1.6), -64px)    scale(2.2); filter: blur(12px); }
}

/* ── Floating icons ── */
.hero-ai-icons {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.hero-ai-icon {
  position: absolute;
  display: grid;
  place-items: center;
  /* spout opening */
  left: 26%;
  top: 17%;
  width: 44px;
  height: 44px;
  padding: 10px;
  border: 1px solid rgba(107, 114, 128, 0.1);
  border-radius: 9999px;
  color: rgba(55, 65, 81, 0.92);
  background: radial-gradient(circle at 50% 48%, rgba(226, 232, 240, 0.5), rgba(203, 213, 225, 0.24) 42%, transparent 72%);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08), inset 0 0 18px rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
  opacity: 0;
  --ai-drift-x: -30px;
  --ai-rise-mid: -55px;
  --ai-rise-soft: -100px;
  --ai-rise-end: -140px;
  animation: hero-ai-icon-rise 5.6s ease-in-out infinite;
  will-change: transform, opacity, filter;
}

.hero-ai-symbol {
  width: 100%;
  height: 100%;
  color: currentColor !important;
  background-color: currentColor !important;
}

/* raw SVG icons */
.hero-ai-icon svg.hero-ai-symbol {
  background-color: transparent !important;
  fill: currentColor;
}
/* Codex has its own gradient — ignore parent color/bg */
.hero-ai-icon svg.hero-ai-symbol--raw {
  fill: unset;
  background-color: transparent !important;
}

/* brain-circuit — up-left */
.hero-ai-icon-1 {
  color: rgba(52, 128, 241, 0.88);
  --ai-drift-x: -38px;
  --ai-rise-mid: -60px;
  --ai-rise-soft: -115px;
  --ai-rise-end: -160px;
  animation-delay: 0s;
}

/* bot — up-right */
.hero-ai-icon-2 {
  width: 40px;
  height: 40px;
  color: rgba(55, 65, 81, 0.9);
  --ai-drift-x: 30px;
  --ai-rise-mid: -70px;
  --ai-rise-soft: -140px;
  --ai-rise-end: -196px;
  animation-delay: 0.95s;
}

/* sparkles — straight up, slight left */
.hero-ai-icon-3 {
  color: rgba(71, 85, 105, 0.92);
  --ai-drift-x: -10px;
  --ai-rise-mid: -52px;
  --ai-rise-soft: -96px;
  --ai-rise-end: -132px;
  animation-delay: 1.9s;
}

/* cpu — right arc */
.hero-ai-icon-4 {
  width: 38px;
  height: 38px;
  color: rgba(75, 85, 99, 0.88);
  --ai-drift-x: 52px;
  --ai-rise-mid: -58px;
  --ai-rise-soft: -110px;
  --ai-rise-end: -155px;
  animation-delay: 2.8s;
}

/* claude — far left, high rise */
.hero-ai-icon-5 {
  color: rgba(217, 119, 87, 0.9);
  --ai-drift-x: -60px;
  --ai-rise-mid: -75px;
  --ai-rise-soft: -145px;
  --ai-rise-end: -200px;
  animation-delay: 3.7s;
}

/* codex — gentle right, medium rise */
.hero-ai-icon-6 {
  width: 40px;
  height: 40px;
  --ai-drift-x: 18px;
  --ai-rise-mid: -48px;
  --ai-rise-soft: -88px;
  --ai-rise-end: -122px;
  animation-delay: 4.65s;
}

@keyframes hero-ai-icon-rise {
  0%, 100% { opacity: 0; filter: blur(5px); transform: translate3d(-50%, 12px, 0) scale(0.38) rotate(-12deg); }
  15%       { opacity: 0.95; filter: blur(0); transform: translate3d(-50%, 0, 0) scale(0.88) rotate(0deg); }
  46%       { opacity: 0.8; filter: blur(1px); transform: translate3d(calc(-50% + var(--ai-drift-x)), var(--ai-rise-mid), 0) scale(1.08) rotate(7deg); }
  74%       { opacity: 0.28; filter: blur(5px); transform: translate3d(calc(-50% + var(--ai-drift-x) * 1.7), var(--ai-rise-soft), 0) scale(1.3) rotate(-5deg); }
  93%       { opacity: 0; filter: blur(11px); transform: translate3d(calc(-50% + var(--ai-drift-x) * 2.4), var(--ai-rise-end), 0) scale(1.58) rotate(9deg); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-smoke-puff,
  .hero-title-lockup,
  .hero-ai-title,
  .hero-title-trail,
  .hero-title-underline,
  .hero-ai-icon,
  .hero-ai-icon-1,
  .hero-ai-icon-2,
  .hero-ai-icon-3,
  .hero-ai-icon-4,
  .hero-ai-icon-5,
  .hero-ai-icon-6 {
    animation: none;
    will-change: auto;
  }
}
</style>
