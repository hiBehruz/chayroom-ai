<!-- app/components/landing/HeroSection.vue -->
<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import teapotHero from '~/assets/images/24af7378-667c-4c7a-88d2-921d4008b6f3.png'

const titleRef = ref<HTMLElement>()
const subRef = ref<HTMLElement>()
const rotateRef = ref<HTMLElement>()
const ctaRef = ref<HTMLElement>()
const artRef = ref<HTMLElement>()
const keywordRef = ref<HTMLElement>()
const steamPaths = ref<SVGPathElement[]>([])

const keywords = ['AI-агенты', 'ChatGPT', 'Midjourney', 'Автоматизация', 'Sora', 'AI-инструменты']
const currentKeyword = ref(0)
let keywordInterval: ReturnType<typeof setInterval>

function nextKeyword() {
  if (!keywordRef.value) return
  gsap.to(keywordRef.value, {
    opacity: 0, y: -10, duration: 0.3,
    onComplete: () => {
      currentKeyword.value = (currentKeyword.value + 1) % keywords.length
      gsap.fromTo(keywordRef.value!, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 })
    }
  })
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  // Steam animation on each SVG path
  steamPaths.value.forEach((path, i) => {
    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 })
    function animateSteam() {
      const tl = gsap.timeline({ onComplete: animateSteam, delay: i * 0.55 })
      tl.to(path, { strokeDashoffset: -len * 0.1, opacity: 0.85, duration: 1.6 + i * 0.2, ease: 'power1.inOut' })
      tl.to(path, { opacity: 0, duration: 0.5, ease: 'power2.in' }, '-=0.3')
      tl.set(path, { strokeDashoffset: len, opacity: 0 })
      tl.to(path, { duration: 0.4 + i * 0.15 })
    }
    animateSteam()
  })

  // Hero entrance timeline
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.from(titleRef.value!, { y: 40, opacity: 0, duration: 0.9 })
    .from(subRef.value!, { y: 24, opacity: 0, duration: 0.7 }, '-=.5')
    .from(rotateRef.value!, { y: 16, opacity: 0, duration: 0.5 }, '-=.4')
    .from(ctaRef.value!, { y: 16, opacity: 0, duration: 0.5 }, '-=.3')
    .from(artRef.value!, { x: 40, opacity: 0, duration: 0.9, ease: 'power2.out' }, '<-.6')

  // Rotating keyword
  keywordInterval = setInterval(nextKeyword, 2500)
})

onUnmounted(() => {
  clearInterval(keywordInterval)
})

function collectSteamPath(el: Element | null, i: number) {
  if (el) steamPaths.value[i] = el as SVGPathElement
}
</script>

<template>
  <div class="pt-8 overflow-x-hidden">
    <div class="max-w-[1180px] mx-auto px-10">
      <div class="grid grid-cols-[45%_1fr] items-center">
        <!-- Left: text -->
        <div ref="titleRef" class="flex flex-col gap-[22px] items-start pb-16 min-w-0">
          <UiEyebrowPill label="AI Room Club" />

          <h1 class="text-[clamp(48px,5vw,88px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            <span class="whitespace-nowrap">Chayroom <span class="text-cx-blue">AI</span></span>
          </h1>

          <p ref="subRef" class="text-[17px] leading-[1.6] text-cx-ink max-w-[420px]">
            Внедряй ИИ в работу и жизнь, создавай свои проекты и осваивай новые навыки вместе с сильным окружением.
          </p>

          <div ref="rotateRef" class="flex items-center gap-2.5 text-sm text-cx-muted min-h-[32px]">
            <span
              ref="keywordRef"
              class="bg-cx-blue-soft text-cx-blue px-3.5 py-[5px] rounded-full text-xs font-bold"
            >
              {{ keywords[currentKeyword] }}
            </span>
          </div>

          <div ref="ctaRef" class="flex gap-3 mt-1">
            <button
              class="px-[26px] py-3.5 rounded-full bg-cx-ink text-white font-semibold text-[15px] flex items-center gap-2 hover:bg-cx-ink-soft transition-colors duration-200 active:scale-[.98]"
              @click="document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })"
            >
              Получить доступ →
            </button>
            <button class="px-[26px] py-3.5 rounded-full bg-white text-cx-ink font-semibold text-[15px] border border-cx-line flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200 active:scale-[.98]">
              ▶ Что меня ждёт
            </button>
          </div>
        </div>

        <!-- Right: art -->
        <div ref="artRef" class="flex items-end justify-start relative w-full overflow-visible">
          <!-- Radial glow -->
          <div
            class="absolute w-[85%] h-[85%] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style="background: radial-gradient(circle, #dde6ff 0%, rgba(220,230,255,0.18) 55%, transparent 72%)"
          ></div>

          <!-- Image wrapper — overflows right edge -->
          <div class="relative z-10 w-[130%] mr-[-30%]">
            <img :src="teapotHero" alt="Chayroom AI teapot" class="w-full h-auto block relative z-10" />

            <!-- Steam SVG overlay -->
            <svg
              viewBox="0 0 500 500"
              xmlns="http://www.w3.org/2000/svg"
              class="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
            >
              <defs>
                <filter id="blur1"><feGaussianBlur stdDeviation="2.5"/></filter>
                <filter id="blur2"><feGaussianBlur stdDeviation="1.8"/></filter>
              </defs>
              <path :ref="el => collectSteamPath(el as Element, 0)"
                d="M 118 320 C 110 295, 128 272, 116 248"
                fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="4" stroke-linecap="round" filter="url(#blur1)"/>
              <path :ref="el => collectSteamPath(el as Element, 1)"
                d="M 134 315 C 142 288, 124 264, 138 238"
                fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round" filter="url(#blur1)"/>
              <path :ref="el => collectSteamPath(el as Element, 2)"
                d="M 108 322 C 100 294, 114 268, 104 242"
                fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" stroke-linecap="round" filter="url(#blur2)"/>
              <path :ref="el => collectSteamPath(el as Element, 3)"
                d="M 146 318 C 154 290, 136 262, 150 234"
                fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-linecap="round" filter="url(#blur2)"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="max-w-[1180px] mx-auto px-10 pt-3 pb-9 flex justify-center">
      <div class="flex items-center gap-4 w-full max-w-[600px]">
        <div class="flex-1 h-px bg-cx-line"></div>
        <div class="w-2 h-2 rounded-full bg-cx-blue"></div>
        <span class="text-[22px] leading-none">✦</span>
        <div class="w-2 h-2 rounded-full bg-cx-blue"></div>
        <div class="flex-1 h-px bg-cx-line"></div>
      </div>
    </div>
  </div>
</template>
