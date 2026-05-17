<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const plans = [
  {
    period: '1 Месяц',
    desc: 'Сможешь попробовать и протестировать',
    oldPrice: '1 990 ₽',
    price: '1 490 ₽',
    unit: '/мес',
    featured: false,
    badge: null,
    savings: null,
    telegramLink: 'https://t.me/'
  },
  {
    period: '3 Месяца',
    desc: 'Достаточно времени, чтобы увидеть результаты',
    oldPrice: '4 470 ₽',
    price: '3 790 ₽',
    unit: '/3 мес',
    featured: true,
    badge: 'Выгодный и Популярный',
    savings: 'Экономия 15%',
    telegramLink: 'https://t.me/'
  },
  {
    period: '6 Месяцев',
    desc: 'Максимальный фокус на внедрении AI',
    oldPrice: '8 940 ₽',
    price: '7 150 ₽',
    unit: '/6 мес',
    featured: false,
    badge: null,
    savings: 'Экономия 20%',
    telegramLink: 'https://t.me/'
  }
]

const features = ['Все курсы и гайды', 'Закрытый чат AI Room Club', 'Разборы AI-инструментов', 'Пошаговые инструкции', 'Доступ к новым материалам']

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.price-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out'
  })
})
</script>

<template>
  <section ref="sectionRef" class="py-16" id="pricing">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="Тарифы" title="Выбери свой формат" subtitle="Подписка — доступно, удобно и выгодно. Без скрытых условий." class="mb-12" />
      <div class="grid grid-cols-3 gap-5">
        <div
          v-for="plan in plans"
          :key="plan.period"
          :class="[
            'price-card relative bg-white border rounded-3xl p-8 shadow-card',
            plan.featured ? 'border-cx-blue shadow-blue' : 'border-cx-line'
          ]"
        >
          <div v-if="plan.badge" class="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-cx-blue text-white text-[11px] font-bold px-3.5 py-1 rounded-full tracking-[.04em] whitespace-nowrap">
            {{ plan.badge }}
          </div>
          <div class="text-[13px] font-semibold text-cx-muted uppercase tracking-[.04em] mb-2">{{ plan.period }}</div>
          <div class="text-[13px] text-cx-muted mb-5">{{ plan.desc }}</div>
          <div class="text-sm text-cx-faint line-through mb-0.5">{{ plan.oldPrice }}</div>
          <div class="text-[40px] font-extrabold tracking-[-0.03em] leading-none">{{ plan.price }}</div>
          <div class="text-sm text-cx-muted mt-1 mb-6 flex items-center gap-1.5">
            {{ plan.unit }}
            <span v-if="plan.savings" class="bg-cx-blue-soft text-cx-blue text-[11px] font-bold px-2.5 py-0.5 rounded-full">{{ plan.savings }}</span>
          </div>
          <ul class="flex flex-col gap-2.5 mb-7">
            <li v-for="feat in features" :key="feat" class="flex items-center gap-2.5 text-sm">
              <span class="w-[18px] h-[18px] rounded-full bg-cx-blue-soft flex items-center justify-center shrink-0">
                <svg class="w-3 h-3 text-cx-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </span>
              {{ feat }}
            </li>
          </ul>
          <a
            :href="plan.telegramLink"
            target="_blank"
            :class="[
              'w-full flex justify-center items-center px-6 py-3.5 rounded-full font-semibold text-[15px] transition-colors duration-200',
              plan.featured
                ? 'bg-cx-ink text-white hover:bg-cx-ink-soft'
                : 'bg-white text-cx-ink border border-cx-line hover:bg-gray-50'
            ]"
          >
            Купить в Telegram →
          </a>
        </div>
      </div>
      <p class="text-center mt-4 text-xs text-cx-faint">
        Оплата через Tribute в Telegram. Доступ активируется автоматически после оплаты.
      </p>
    </div>
  </section>
</template>
