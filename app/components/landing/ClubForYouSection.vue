<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const cards = [
  { num: '01', icon: 'i-lucide-trending-up', title: 'Хочешь зарабатывать с помощью ИИ', body: 'Ищешь навык на годы вперёд, который будет приносить стабильный доход. Работая над своими проектами или выполняя заказы для других.' },
  { num: '02', icon: 'i-lucide-briefcase-business', title: 'Владеешь бизнесом, но тонешь в операционке', body: 'Хочешь сократить расходы с помощью ИИ, оптимизировать бизнес-процессы или создать свою команду AI-сотрудников.' },
  { num: '03', icon: 'i-lucide-radar', title: 'Чувствуешь, что теряешь актуальность на рынке', body: 'Видишь, как другие эксперты уже внедряют ИИ и получают преимущество. Хочешь освоить новые инструменты.' },
  { num: '04', icon: 'i-lucide-clock-3', title: 'Хочешь идти в ногу со временем', body: 'Чувствуешь, что пора внедрять ИИ в свою жизнь, но пока не понимаешь с чего начать и как это поможет вырасти в доходе.' }
]

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.club-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 24,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power2.out',
    clearProps: 'transform'
  })
})
</script>

<template>
  <section
    ref="sectionRef"
    class="pt-0 pb-16 -mt-2"
  >
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionDivider class="mb-10" />
      <UiSectionHeader
        title="Наш клуб для тебя, если ты..."
        subtitle="Мы создали пространство для людей, которые хотят использовать ИИ как настоящее преимущество."
        class="mb-10"
      />
      <div class="grid grid-cols-2 gap-5">
        <div
          v-for="card in cards"
          :key="card.num"
          v-sparkle
          class="club-card bg-[#f7f7f5] hover:bg-[#ebebea] rounded-3xl p-8 min-h-57.5 transition-all duration-200"
        >
          <div
            class="club-card-icon"
            aria-hidden="true"
          >
            <UIcon
              :name="card.icon"
              class="size-8"
            />
          </div>
          <div class="text-lg font-bold mb-2.5 leading-[1.3]">
            {{ card.title }}
          </div>
          <div class="text-sm text-cx-muted leading-[1.6]">
            {{ card.body }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.club-card-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-bottom: 18px;
  color: #1a1a1a;
}
</style>
