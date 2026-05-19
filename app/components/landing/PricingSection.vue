<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const isAccessModalOpen = ref(false)

const plans = [
  {
    id: 'monthly',
    period: '1 oy',
    desc: "Сможешь попробовать и протестировать",
    oldPrice: "249 000 so'm",
    price: '199 000',
    unit: "so'm / oy",
    featured: false,
    badge: null,
    savings: null
  },
  {
    id: 'quarterly',
    period: '3 oy',
    desc: "Достаточно времени, чтобы увидеть серьёзные результаты",
    oldPrice: "597 000 so'm",
    price: '507 450',
    unit: "so'm / 3 oy",
    featured: true,
    badge: 'Foydali va ommabop',
    savings: '15% tejash'
  },
  {
    id: 'half-year',
    period: '6 oy',
    desc: "Максимальный фокус на том, чтобы AI стал частью твоей жизни",
    oldPrice: "1 194 000 so'm",
    price: '955 200',
    unit: "so'm / 6 oy",
    featured: false,
    badge: null,
    savings: '20% tejash'
  }
]

const features = ["Barcha kurslar va qo'llanmalar", 'Telegram yopiq kanal', 'AI vositalar tahlili', "Qadam-baqadam yo'riqnomalar", 'Yangi materiallarga kirish']

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
    class="py-16 scroll-mt-20"
  >
    <div class="max-w-295 mx-auto px-10 max-md:px-5">
      <UiSectionHeader
        eyebrow="Tariflar"
        title="O'zingga mos formatni tanla"
        subtitle="Obuna qulay, tushunarli va foydali. Yashirin shartlarsiz."
        class="[&>div:first-child]:text-[14px] mb-12"
      />
      <div class="grid grid-cols-3 max-md:grid-cols-1 gap-4 max-md:gap-6 items-end">
        <div
          v-for="plan in plans"
          :key="plan.period"
          class="relative flex justify-center max-md:justify-stretch"
          :class="plan.badge ? 'pt-4' : ''"
        >
          <div
            v-if="plan.badge"
            class="pricing-badge absolute top-0 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3.5 py-1 rounded-full tracking-[.04em] whitespace-nowrap z-10"
          >
            {{ plan.badge }}
          </div>
          <div
            v-sparkle
            :class="[
              'price-card bg-[#f7f7f5] rounded-3xl flex flex-col max-md:w-full max-md:h-auto',
              plan.featured ? 'w-[331.84px] h-[530.4px] p-7 shadow-lift max-md:ring-2 max-md:ring-cx-blue/40 max-md:ring-offset-2' : 'w-[325.33px] h-130 p-6'
            ]"
          >
            <!-- Period + desc: fixed height for cross-card alignment -->
            <div class="min-h-22 text-center mb-4">
              <div class="text-xl font-bold text-[#1a1a1a] mb-2">
                {{ plan.period }}
              </div>
              <div class="text-[13px] text-cx-muted leading-normal">
                {{ plan.desc }}
              </div>
            </div>

            <!-- Old price: fixed height -->
            <div class="h-6 text-center mb-1">
              <span class="text-sm text-cx-faint line-through">{{ plan.oldPrice }}</span>
            </div>

            <!-- Main price + unit -->
            <div class="text-center mb-6">
              <span class="price-amount text-[42px] font-extrabold tracking-[-0.03em] leading-none">{{ plan.price }}</span>
              <span class="text-sm text-cx-muted ml-1">{{ plan.unit }}</span>
            </div>

            <!-- Features -->
            <ul class="flex flex-col gap-2.5 mb-6 flex-1">
              <li
                v-for="feat in features"
                :key="feat"
                class="flex items-center gap-2.5 text-sm"
              >
                <svg
                  class="w-4 h-4 text-green-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                {{ feat }}
              </li>
              <li
                v-if="plan.savings"
                class="flex items-center gap-2.5 text-sm"
              >
                <svg
                  class="w-4 h-4 text-green-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
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
                'price-btn w-full',
                plan.featured ? 'price-btn--featured' : 'price-btn--dark'
              ]"
              @click="requestAccess(plan.id)"
            >
              <span>Kirish huquqini olish</span>
              <svg
                class="price-btn-arrow"
                viewBox="0 0 16 16"
                fill="none"
              ><path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
  </section>
</template>

<style scoped>
.price-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  border: 1px solid rgba(120, 184, 255, 0.72);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.price-btn:active {
  transform: scale(0.97);
}

.price-btn-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.price-btn:hover .price-btn-arrow,
.price-card:hover .price-btn-arrow {
  transform: translateX(3px);
}

.pricing-badge {
  border: 1px solid rgba(0, 84, 185, 0.72);
  background:
    radial-gradient(circle at 18% 18%, rgba(255,255,255,0.08), transparent 22%),
    linear-gradient(105deg, #064aaf 0%, #006fd1 38%, #064b9f 68%, #03265f 100%);
  color: #fff;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.28) inset,
    0 -1px 0 rgba(0,14,56,0.34) inset,
    0 10px 24px rgba(0, 91, 200, 0.24);
}

.price-amount {
  display: inline-block;
  background:
    linear-gradient(128deg, #b9ecff 0%, #008cff 10%, #0a64d8 28%, #0642a7 52%, #062b78 76%, #020f3f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow:
    0 1px 0 rgba(255,255,255,0.22),
    0 14px 30px rgba(0, 63, 150, 0.22);
  filter: drop-shadow(0 2px 0 rgba(1, 32, 92, 0.12));
}

.price-btn--featured {
  border-color: rgba(2, 43, 120, 0.92);
  background:
    radial-gradient(circle at 18% 18%, rgba(255,255,255,0.08), transparent 22%),
    linear-gradient(105deg, #064aaf 0%, #006fd1 38%, #064b9f 68%, #03265f 100%);
  background-size: 100% 100%;
  color: #fff;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.28) inset,
    0 -1px 0 rgba(0,14,56,0.34) inset,
    0 14px 32px rgba(0, 63, 150, 0.3);
  animation: btn-shimmer 3s ease infinite;
}

.price-btn--featured:hover {
  border-color: rgba(3, 38, 108, 0.98);
  background:
    radial-gradient(circle at 18% 18%, rgba(255,255,255,0.1), transparent 22%),
    linear-gradient(105deg, #0754bf 0%, #0878dc 38%, #0755ad 68%, #032a68 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.32) inset,
    0 -1px 0 rgba(0,14,56,0.32) inset,
    0 18px 40px rgba(0, 63, 150, 0.36);
  transform: translateY(-1px);
}

.price-btn--featured::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 24%, rgba(255,255,255,0.44) 50%, transparent 76%);
  transform: translateX(-100%);
  transition: transform 1.05s ease;
}

.price-btn--featured:hover::after {
  transform: translateX(100%);
}

.price-btn--dark {
  background: linear-gradient(180deg, #f6fbff 0%, #eaf5ff 100%);
  color: #006bd1;
  box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 6px 18px rgba(0,117,222,0.08);
  transition: color 0.28s ease, box-shadow 0.28s ease, transform 0.18s ease;
}

.price-btn--dark::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(214,235,255,0.9) 100%);
  border-radius: inherit;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.price-btn--dark:hover {
  color: #005fbd;
  border-color: rgba(73, 163, 255, 0.82);
  box-shadow: 0 1px 0 rgba(255,255,255,1) inset, 0 10px 24px rgba(0,117,222,0.13);
  transform: translateY(-1px);
}

.price-btn--dark:hover::before {
  transform: scaleX(1);
}

.price-btn--dark::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.65) 50%, transparent 60%);
  transform: translateX(-100%);
  transition: transform 0.5s ease 0.15s;
  border-radius: inherit;
}

.price-btn--dark:hover::after {
  transform: translateX(100%);
}

.price-btn--dark span,
.price-btn--dark .price-btn-arrow {
  position: relative;
  z-index: 1;
}

@keyframes btn-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>
