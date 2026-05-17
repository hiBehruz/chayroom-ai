<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const cards = [
  { num: '01', title: 'Хочешь зарабатывать с помощью ИИ', body: 'Ищешь навык на годы вперёд, который будет приносить стабильный доход. Работая над своими проектами или выполняя заказы для других.' },
  { num: '02', title: 'Владеешь бизнесом, но тонешь в операционке', body: 'Хочешь сократить расходы с помощью ИИ, оптимизировать бизнес-процессы или создать свою команду AI-сотрудников.' },
  { num: '03', title: 'Чувствуешь, что теряешь актуальность на рынке', body: 'Видишь, как другие эксперты уже внедряют ИИ и получают преимущество. Хочешь освоить новые инструменты.' },
  { num: '04', title: 'Хочешь идти в ногу со временем', body: 'Чувствуешь, что пора внедрять ИИ в свою жизнь, но пока не понимаешь с чего начать и как это поможет вырасти в доходе.' }
]

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.club-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out'
  })
})
</script>

<template>
  <section ref="sectionRef" class="py-16">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="Для кого" title="Наш клуб для тебя, если ты..." subtitle="Мы создали пространство для людей, которые хотят использовать ИИ как настоящее преимущество." class="mb-10" />
      <div class="grid grid-cols-2 gap-5">
        <div
          v-for="card in cards"
          :key="card.num"
          class="club-card bg-white border border-cx-line rounded-3xl p-8 shadow-card hover:-translate-y-0.5 hover:shadow-lift transition-all duration-200"
        >
          <div class="text-xs font-bold text-cx-blue tracking-[.04em] mb-3.5">{{ card.num }}</div>
          <div class="text-lg font-bold mb-2.5 leading-[1.3]">{{ card.title }}</div>
          <div class="text-sm text-cx-muted leading-[1.6]">{{ card.body }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
