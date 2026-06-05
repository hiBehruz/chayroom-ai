<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const isAccessModalOpen = ref(false)

const { data: exchangeData } = await useFetch('/api/exchange-rate')
const usdRate = computed(() => exchangeData.value?.rate ?? null)
function toSom(usd: number) {
  if (!usdRate.value) return ''
  return '≈ ' + Math.round(usd * usdRate.value).toLocaleString('ru-RU') + ' so\'m'
}

const plans = [
  {
    id: 'monthly',
    period: '1 oy',
    icon: 'i-lucide-calendar-1',
    desc: 'Sinab ko\'rish va o\'zingga mosligini tekshirish uchun',
    oldPrice: '20 $',
    price: '15.90',
    usdAmount: 15.90,
    unit: '$/oy',
    featured: false,
    badge: null,
    savings: null
  },
  {
    id: 'quarterly',
    period: '3 oy',
    icon: 'i-lucide-calendar-clock',
    desc: 'Natijani ko\'rish va odatga aylantirish uchun eng qulay muddat',
    oldPrice: '49 $',
    price: '39.90',
    usdAmount: 39.90,
    unit: '$/3 oy',
    featured: true,
    badge: 'Foydali va ommabop',
    savings: 'Ekonom 15%'
  },
  {
    id: 'half-year',
    period: '6 oy',
    icon: 'i-lucide-calendar-range',
    desc: 'AIni ish, o\'qish va hayot tarzingga chuqur qo\'shish uchun',
    oldPrice: '89 $',
    price: '69.90',
    usdAmount: 69.90,
    unit: '$/6 oy',
    featured: false,
    badge: null,
    savings: 'Ekonom 26%'
  }
]

const features = ['Barcha kurslar va qo\'llanmalar', 'Telegram yopiq kanal', 'AI vositalar tahlili', 'Qadam-baqadam yo\'riqnomalar', 'Yangi materiallarga kirish']

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.price-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out'
  })
})

function requestAccess(_planId: string) {
  isAccessModalOpen.value = true
}
</script>

<template>
  <section
    id="pricing"
    ref="sectionRef"
    class="pricing-section py-20 scroll-mt-20"
  >
    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 max-md:px-5">
      <div class="pricing-top mb-12">
        <div>
          <div class="pricing-eyebrow">
            Tariflar
          </div>
          <h2 class="pricing-title">
            <svg
              class="pricing-title-arrow"
              viewBox="0 0 51 123"
              fill="none"
              aria-hidden="true"
            >
              <path
                stroke="#3480F1"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="4"
                d="M48.389 2.504c-56.832 14.135-66.334 64.133-.027 118.171m0 0c-.88-2.917-5.455-15.693-3.316-26.984m3.316 26.984c-3.026 1.244-15.117-2.621-25.881-11.551"
              />
            </svg>
            <span>
              O'zingizga mos tarifni
              <span class="pricing-title-wavy">
                tanlang
                <svg
                  viewBox="0 0 120 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8 C12 2 18 2 28 8 S44 14 54 8 S70 2 80 8 S96 14 106 8 S114 2 118 6"
                    stroke="#3480f1"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
            </span>
            <svg
              class="pricing-title-sparkle pricing-title-sparkle--small"
              viewBox="0 0 26 26"
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
          </h2>
        </div>
      </div>

      <div class="grid grid-cols-3 max-md:grid-cols-1 gap-10 max-md:gap-6">
        <div
          v-for="plan in plans"
          :key="plan.period"
          class="pricing-plan relative flex flex-col"
          :class="plan.badge ? 'pt-8' : (plan.id === 'monthly' ? 'pt-10' : plan.id === 'half-year' ? 'pt-8 pb-6' : '')"
        >
          <div
            v-if="plan.badge"
            class="pricing-badge"
          >
            {{ plan.badge }}
          </div>
          <div
            :class="[
              'price-card flex flex-col flex-1 w-full max-md:h-auto',
              plan.featured ? 'price-card--featured -mt-6 p-8 pb-6 mb-6 max-md:mt-0 max-md:mb-0' : plan.id === 'monthly' ? 'p-6 pb-[18px] max-md:pb-6' : 'p-6'
            ]"
          >
            <!-- Period + desc: fixed height for cross-card alignment -->
            <div class="min-h-24 mb-5">
              <div class="flex items-center justify-center">
                <div class="price-period">
                  <UIcon
                    :name="plan.icon"
                    class="price-period-icon"
                  />
                  {{ plan.period }}
                </div>
              </div>
              <div class="mt-3 text-[14px] text-cx-muted leading-normal text-center">
                {{ plan.desc }}
              </div>
            </div>

            <!-- Old price: fixed height -->
            <div class="h-6 mb-1 text-center">
              <span class="text-sm text-cx-faint line-through">{{ plan.oldPrice }}</span>
            </div>

            <!-- Main price + unit -->
            <div class="mb-5 text-center">
              <span class="price-amount text-[42px] font-extrabold tracking-[-0.03em] leading-none">{{ plan.price }}</span>
              <span class="text-sm text-cx-muted ml-1">{{ plan.unit }}</span>
              <div
                v-if="usdRate"
                class="text-[12px] text-cx-faint mt-1"
              >
                {{ toSom(plan.usdAmount) }}
              </div>
            </div>

            <!-- Features -->
            <ul class="flex flex-col gap-3 mb-8 flex-1">
              <li
                v-for="feat in features"
                :key="feat"
                class="price-feature"
              >
                <UIcon
                  name="i-lucide-check"
                  class="price-check"
                />
                {{ feat }}
              </li>
              <li
                v-if="plan.savings"
                class="price-feature"
              >
                <UIcon
                  name="i-lucide-check"
                  class="price-check"
                />
                {{ plan.savings }}
              </li>
              <!-- placeholder to keep height consistent -->
              <li
                v-else
                class="invisible flex items-center gap-2.5 text-sm"
              >
                <svg
                  class="w-3 h-3 shrink-0"
                  viewBox="0 0 24 24"
                /><span>placeholder</span>
              </li>
            </ul>

            <button
              :class="[
                'hero-link-btn hero-link-btn--blue flex w-full items-center justify-center px-6 py-[15px] text-[16px]',
                plan.featured ? 'translate-y-1 max-md:translate-y-0' : ''
              ]"
              @click="requestAccess(plan.id)"
            >
              <span>Kirish huquqini olish</span>
              <UIcon
                name="i-solar-alt-arrow-right-bold"
                class="price-btn-icon"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
  </section>
</template>

<style scoped>
.pricing-section {
  position: relative;
  overflow: hidden;
  background: #fffdf9;
}

.pricing-section::before {
  content: none;
}

.pricing-section > div {
  position: relative;
  z-index: 1;
}

.pricing-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.pricing-eyebrow {
  width: max-content;
  margin-right: auto;
  margin-bottom: 14px;
  margin-left: auto;
  padding: 0;
  color: #3480f1;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pricing-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  max-width: 760px;
  color: #0a0a0a;
  font-family: var(--font-inter-display, inherit);
  font-size: 50px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.08;
}

.pricing-title-sparkle {
  width: 58px;
  height: 45px;
  flex-shrink: 0;
}

.pricing-title-arrow {
  width: 51px;
  height: 123px;
  flex-shrink: 0;
}

.pricing-title-wavy {
  position: relative;
  display: inline-block;
  padding-bottom: 12px;
}

.pricing-title-wavy svg {
  position: absolute;
  left: -12px;
  bottom: 0;
  width: calc(100% + 24px);
  height: 12px;
}

.pricing-title-sparkle--small {
  width: 26px;
  height: 26px;
}

.pricing-subtitle {
  margin: 0;
  max-width: 460px;
  color: #6b6b72;
  font-size: 16px;
  line-height: 1.7;
}

.price-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(10,10,10,0.08);
  border-radius: 28px;
  background: #fbf9f4;
  transform-origin: center;
  transition: transform 0.22s ease, background-color 0.22s ease;
}

.price-card:hover {
  transform: scale(1.025);
}

.price-card--featured::before {
  content: none;
}

.price-period {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #0a0a0a;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.price-period-icon {
  width: 38px;
  height: 38px;
  padding: 8px;
  border: 1px solid rgba(10,10,10,0.92);
  border-radius: 12px;
  background: #0a0a0a;
  flex-shrink: 0;
  color: #ffffff;
  transform-origin: center;
  animation: price-period-icon-float 2.8s ease-in-out infinite;
  will-change: transform;
}

.price-feature {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #1f2328;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.35;
}

.price-check {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #0a0a0a !important;
  transform-origin: center;
  animation: price-check-pop 2.4s ease-in-out infinite;
  will-change: transform;
}

.price-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 15px 24px;
  border: 0;
  border-radius: 999px;
  background: #0a0a0a;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.82) inset,
    0 8px 24px rgba(10,10,10,0.04);
  transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.price-btn:hover {
  opacity: 0.9;
  transform: scale(1.025);
  background: #1a1a1a;
}

.price-btn:active {
  opacity: 0.7;
  transform: scale(0.98);
}

.price-btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.price-btn:hover .price-btn-icon {
  transform: translateX(3px);
}

.pricing-badge {
  position: absolute;
  top: 36px;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);
  min-width: 140px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  background: #3480f1;
  color: #fff;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.price-amount {
  display: inline-block;
  color: #3480f1;
}

.price-divider {
  height: 1px;
  margin-bottom: 24px;
  background: rgba(10,10,10,0.1);
}

.price-btn--featured {
  border-color: transparent;
  background: #0a0a0a;
  color: #ffffff;
}

.price-btn--featured:hover {
  border-color: transparent;
  background: #1a1a1a;
}

.price-btn--featured::after {
  content: none;
}

.price-btn--featured:hover::after {
  transform: none;
}

.price-btn--dark {
  border-color: transparent;
  background: #0a0a0a;
  color: #ffffff;
}

.price-btn--dark::before {
  content: none;
}

.price-btn--dark:hover {
  color: #ffffff;
  border-color: transparent;
  background: #1a1a1a;
}

.price-btn--dark:hover::before {
  transform: none;
}

.price-btn--dark::after {
  content: none;
}

.price-btn--dark:hover::after {
  transform: none;
}

.price-btn--featured span,
.price-btn--dark span {
  position: relative;
  z-index: 1;
}

@keyframes btn-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes price-period-icon-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }

  35% {
    transform: translateY(-2px) rotate(-4deg) scale(1.04, 0.98);
  }

  70% {
    transform: translateY(1px) rotate(3deg) scale(0.98, 1.03);
  }
}

@keyframes price-check-pop {
  0%, 100% {
    transform: translateY(0) scale(1);
  }

  45% {
    transform: translateY(-1px) scale(1.14);
  }

  70% {
    transform: translateY(0) scale(0.96);
  }
}

@keyframes pricing-badge-bob {
  0%, 100% {
    transform: translate(-50%, -50%) rotate(-4deg) scale(1);
  }

  35% {
    transform: translate(-50%, -53%) rotate(-6deg) scale(1.03, 0.98);
  }

  70% {
    transform: translate(-50%, -48%) rotate(-2deg) scale(0.99, 1.02);
  }
}

@media (prefers-reduced-motion: reduce) {
  .price-period-icon,
  .price-check,
  .pricing-badge {
    animation: none;
    will-change: auto;
  }

  .price-card:hover .price-period-icon,
  .price-card:hover .price-check,
  .pricing-badge:hover {
    transform: none;
  }
}

@media (max-width: 734px) {
  .pricing-section {
    padding-top: 64px;
    padding-bottom: 64px;
  }

  .pricing-top {
    gap: 18px;
    margin-bottom: 32px;
  }

  .pricing-title {
    font-size: 28px;
    line-height: 30.8px;
    letter-spacing: -0.56px;
  }

  .pricing-subtitle {
    max-width: 320px;
  }

  .price-card {
    min-height: auto;
    border-radius: 22px;
  }

  .price-period {
    font-size: 26px;
  }
}
</style>
