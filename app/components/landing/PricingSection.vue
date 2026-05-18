<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const authStore = useAuthStore()

const plans = [
  {
    id: 'monthly',
    period: 'Месяц',
    desc: 'Сможешь попробовать и протестировать',
    oldPrice: '249 000 сум',
    price: '199 000',
    unit: 'сум / мес',
    featured: false,
    badge: null,
    savings: null
  },
  {
    id: 'quarterly',
    period: '3 Месяца',
    desc: 'Достаточно времени, чтобы увидеть результаты',
    oldPrice: '597 000 сум',
    price: '507 450',
    unit: 'сум / 3 мес',
    featured: true,
    badge: 'Выгодный и Популярный',
    savings: 'Экономия 15%'
  },
  {
    id: 'half-year',
    period: '6 Месяцев',
    desc: 'Максимальный фокус на внедрении AI',
    oldPrice: '1 194 000 сум',
    price: '955 200',
    unit: 'сум / 6 мес',
    featured: false,
    badge: null,
    savings: 'Экономия 20%'
  }
]

const features = ['Все курсы и гайды', 'Закрытый чат сообщества', 'Разборы AI-инструментов', 'Пошаговые инструкции', 'Доступ к новым материалам']

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.price-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out'
  })
})

function requestAccess(planId: string) {
  return navigateTo({
    path: authStore.user ? '/dashboard' : '/login',
    query: { plan: planId }
  })
}
</script>

<template>
  <section
    id="pricing"
    ref="sectionRef"
    class="py-16 scroll-mt-20"
  >
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader
        eyebrow="Тарифы"
        title="Выбери свой формат"
        subtitle="Подписка — доступно, удобно и выгодно. Без скрытых условий."
        class="[&>div:first-child]:text-[14px] mb-12"
      />
      <div class="grid grid-cols-3 gap-8 items-end">
        <div
          v-for="plan in plans"
          :key="plan.period"
          class="relative"
          :class="plan.badge ? 'pt-4' : ''"
        >
          <div
            v-if="plan.badge"
            class="absolute top-0 left-1/2 -translate-x-1/2 bg-cx-blue text-white text-[11px] font-bold px-3.5 py-1 rounded-full tracking-[.04em] whitespace-nowrap z-10"
          >
            {{ plan.badge }}
          </div>
          <div
            v-sparkle
            :class="[
              'price-card bg-[#f7f7f5] rounded-3xl flex flex-col',
              plan.featured ? 'p-7 shadow-lift scale-105' : 'p-6'
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
              <span class="text-[42px] font-extrabold tracking-[-0.03em] leading-none text-cx-blue">{{ plan.price }}</span>
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
                  class="w-3 h-3 text-cx-blue shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                ><path d="M20 6L9 17l-5-5" /></svg>
                {{ feat }}
              </li>
              <li
                v-if="plan.savings"
                class="flex items-center gap-2.5 text-sm"
              >
                <svg
                  class="w-3 h-3 text-cx-blue shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                ><path d="M20 6L9 17l-5-5" /></svg>
                {{ plan.savings }}
              </li>
              <!-- placeholder to keep height consistent -->
              <li
                v-else
                class="invisible flex items-center gap-2.5 text-sm"
              >
                <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" /><span>placeholder</span>
              </li>
            </ul>

            <button
              :class="[
                'price-btn w-full',
                plan.featured ? 'price-btn--featured' : 'price-btn--dark'
              ]"
              @click="requestAccess(plan.id)"
            >
              <span>Получить доступ</span>
              <svg class="price-btn-arrow" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
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
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
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

.price-btn:hover .price-btn-arrow {
  transform: translateX(3px);
}

/* Featured — gradient shimmer */
.price-btn--featured {
  background: linear-gradient(135deg, #0075de 0%, #0ea5e9 60%, #0075de 100%);
  background-size: 200% 100%;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 117, 222, 0.38), 0 1px 3px rgba(0,0,0,0.12);
  animation: btn-shimmer 3s ease infinite;
}

.price-btn--featured:hover {
  box-shadow: 0 6px 28px rgba(0, 117, 222, 0.52), 0 2px 6px rgba(0,0,0,0.14);
  transform: translateY(-1px);
}

.price-btn--featured::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%);
  transform: translateX(-100%);
  transition: transform 0.55s ease;
}

.price-btn--featured:hover::after {
  transform: translateX(100%);
}

/* Monthly / Half-year — light blue, fill rises on hover */
.price-btn--dark {
  background: #e8f2fd;
  color: #0075de;
  border: none;
  box-shadow: none;
  transition: color 0.28s ease, box-shadow 0.28s ease, transform 0.18s ease;
}

.price-btn--dark::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #0075de;
  border-radius: inherit;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.price-btn--dark:hover {
  color: #fff;
  box-shadow: 0 6px 24px rgba(0,117,222,0.35);
  transform: translateY(-1px);
}

.price-btn--dark:hover::before {
  transform: scaleX(1);
}

.price-btn--dark::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
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
