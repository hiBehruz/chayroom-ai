<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const features = [
  { icon: '🔧', title: 'Практические инструменты', body: 'Разбор самых актуальных инструментов на рынке AI под разные цели и задачи, а также чек-листы по внедрению.' },
  { icon: '📚', title: 'Курсы и гайды', body: 'Пошаговые инструкции с 0 — для бизнеса, работы, контента и повседневной жизни. Не просто теория, а конкретные мануалы.' },
  { icon: '💬', title: 'Закрытый чат AI Room Club', body: 'Общение с единомышленниками, у которых есть одна общая цель — сделать ИИ своим преимуществом в жизни и бизнесе.' },
  { icon: '⚡', title: 'Готовые связки', body: 'Ежедневно тестируем различные решения и делимся ими внутри нашего комьюнити.' },
  { icon: '🎙️', title: 'Прямые эфиры и воркшопы', body: 'Живые созвоны, ответы на вопросы, практические воркшопы, на которых мы вместе пробуем что-то сделать.' },
  { icon: '🚀', title: 'Свежие тренды из мира AI', body: 'Одними из первых узнаёте последние новости и тестируете всё самое интересное в нише искусственного интеллекта.' }
]

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.feature-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 32, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out'
  })
})
</script>

<template>
  <section ref="sectionRef" class="py-16 bg-white" id="features">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="Контент" title="Что внутри AI Room Club?" subtitle="И почему развиваться с нами — правильное решение" class="mb-12" />
      <div class="grid grid-cols-3 gap-[18px]">
        <div
          v-for="f in features"
          :key="f.title"
          class="feature-card bg-white border border-cx-line rounded-3xl p-7 px-6 flex flex-col gap-4 shadow-card hover:-translate-y-0.5 hover:shadow-lift transition-all duration-200"
        >
          <div class="w-11 h-11 rounded-xl bg-cx-blue-soft flex items-center justify-center text-xl">{{ f.icon }}</div>
          <div class="text-[17px] font-bold leading-[1.3]">{{ f.title }}</div>
          <div class="text-[13px] text-cx-muted leading-[1.6]">{{ f.body }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
