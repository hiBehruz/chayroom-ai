<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const features = [
  { icon: 'i-lucide-wrench', title: 'Практические инструменты', body: 'Разбор самых актуальных инструментов на рынке AI под разные цели и задачи, а также чек-листы по внедрению.' },
  { icon: 'i-lucide-book-open', title: 'Курсы и гайды', body: 'Пошаговые инструкции с 0 — для бизнеса, работы, контента и повседневной жизни. Не просто теория, а конкретные мануалы.' },
  { icon: 'i-lucide-message-circle', title: 'Закрытый чат сообщества', body: 'Общение с единомышленниками, у которых есть одна общая цель — сделать ИИ своим преимуществом в жизни и бизнесе.' },
  { icon: 'i-lucide-zap', title: 'Готовые связки', body: 'Ежедневно тестируем различные решения и делимся ими внутри нашего комьюнити.' },
  { icon: 'i-lucide-mic', title: 'Прямые эфиры и воркшопы', body: 'Живые созвоны, ответы на вопросы, практические воркшопы, на которых мы вместе пробуем что-то сделать.' },
  { icon: 'i-lucide-rocket', title: 'Свежие тренды из мира AI', body: 'Одними из первых узнаёте последние новости и тестируете всё самое интересное в нише искусственного интеллекта.' }
]

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.feature-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 24,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power2.out',
    clearProps: 'transform'
  })
})
</script>

<template>
  <section
    id="features"
    ref="sectionRef"
    class="py-16 bg-white scroll-mt-20"
  >
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionDivider class="mb-10" />
      <div class="text-center mb-12">
        <h2 class="text-[36px] font-extrabold tracking-tight leading-[1.1] text-[#1a1a1a]">
          Что внутри Chayroom AI?
        </h2>
        <p class="text-[36px] font-extrabold tracking-tight leading-[1.1] text-[#1a1a1a]">
          И почему развиваться с нами<br>— правильное решение
        </p>
      </div>
      <div class="grid grid-cols-3 gap-4.5">
        <div
          v-for="f in features"
          :key="f.title"
          v-sparkle
          class="feature-card bg-[#f7f7f5] hover:bg-[#ebebea] rounded-2xl p-8 flex flex-col gap-3 transition-all duration-200"
        >
          <div class="feature-card-icon">
            <UIcon :name="f.icon" class="size-8" />
          </div>
          <div class="text-[16px] font-bold leading-[1.3] text-[#1a1a1a]">
            {{ f.title }}
          </div>
          <div class="text-[13px] font-normal text-cx-muted leading-[1.7]">
            {{ f.body }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-card-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-bottom: 12px;
  color: #1a1a1a;
}
</style>
