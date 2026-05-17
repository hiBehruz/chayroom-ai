<script setup lang="ts">
import gsap from 'gsap'

const skills = [
  { num: '01', title: 'Работать с AI-ассистентами', body: 'Эффективно общаться с ChatGPT, Claude и другими моделями, чтобы получать нужный результат с первого раза.' },
  { num: '02', title: 'Создавать AI-агентов', body: 'Строить автономных агентов, которые выполняют задачи самостоятельно: исследуют, пишут, публикуют.' },
  { num: '03', title: 'Автоматизировать рутину', body: 'Настраивать потоки автоматизации с Make, n8n и Zapier, чтобы освободить десятки часов в месяц.' },
  { num: '04', title: 'Генерировать контент', body: 'Создавать тексты, изображения, видео и голос с помощью AI-инструментов для любых платформ.' },
  { num: '05', title: 'Строить сайты без кода', body: 'Собирать полноценные веб-приложения, лендинги и сервисы с помощью vibe-coding подхода.' },
  { num: '06', title: 'Писать промпты профессионально', body: 'Создавать системные промпты и знать методологии, которые дают стабильный и предсказуемый результат.' },
  { num: '07', title: 'Монетизировать AI-навыки', body: 'Продавать услуги на основе ИИ: автоматизацию, контент, агентов, консалтинг.' },
  { num: '08', title: 'Внедрять ИИ в бизнес', body: 'Находить точки применения ИИ в бизнес-процессах и внедрять их системно.' },
  { num: '09', title: 'Создавать AI-воронки', body: 'Строить маркетинговые воронки с AI-персонализацией, от первого контакта до продажи.' }
]

const ITEMS_PER_PAGE = 2
const totalPages = computed(() => Math.ceil(skills.length / ITEMS_PER_PAGE))
const currentPage = ref(0)
const trackRef = ref<HTMLElement>()

function goToPage(page: number) {
  if (!trackRef.value) return
  const containerWidth = trackRef.value.parentElement!.offsetWidth
  gsap.to(trackRef.value, { x: -(containerWidth * page), duration: 0.5, ease: 'power2.out' })
  currentPage.value = page
}

function prev() { if (currentPage.value > 0) goToPage(currentPage.value - 1) }
function next() { if (currentPage.value < totalPages.value - 1) goToPage(currentPage.value + 1) }

function skillsForPage(page: number) {
  return skills.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE)
}
</script>

<template>
  <section class="py-16 bg-cx-surface">
    <div class="max-w-[1180px] mx-auto px-10">
      <div class="flex justify-between items-center mb-8">
        <UiSectionHeader eyebrow="Навыки" title="Чему ты научишься в нашем сообществе?" align="left" class="[&_h2]:text-[36px]" />
        <div class="flex gap-2 shrink-0">
          <button
            :class="['w-10 h-10 rounded-full bg-white border border-cx-line flex items-center justify-center text-base transition-colors duration-200', currentPage === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer']"
            :disabled="currentPage === 0"
            @click="prev"
          >←</button>
          <button
            :class="['w-10 h-10 rounded-full bg-white border border-cx-line flex items-center justify-center text-base transition-colors duration-200', currentPage === totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer']"
            :disabled="currentPage === totalPages - 1"
            @click="next"
          >→</button>
        </div>
      </div>

      <div class="overflow-hidden">
        <div ref="trackRef" class="flex" :style="{ width: `${totalPages * 100}%` }">
          <div
            v-for="page in totalPages"
            :key="page"
            class="grid grid-cols-2 gap-5"
            :style="{ width: `${100 / totalPages}%` }"
          >
            <div
              v-for="skill in skillsForPage(page - 1)"
              :key="skill.num"
              class="bg-white border border-cx-line rounded-3xl p-8 shadow-card"
            >
              <div class="text-[32px] font-extrabold text-cx-line mb-4">{{ skill.num }}</div>
              <div class="text-[19px] font-bold mb-2.5 leading-[1.3]">{{ skill.title }}</div>
              <div class="text-sm text-cx-muted leading-[1.6]">{{ skill.body }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dots -->
      <div class="flex gap-1.5 justify-center mt-5">
        <button
          v-for="i in totalPages"
          :key="i"
          :class="[
            'rounded-full transition-all duration-200',
            currentPage === i - 1 ? 'w-5 h-2 bg-cx-ink' : 'w-2 h-2 bg-cx-line hover:bg-cx-muted'
          ]"
          @click="goToPage(i - 1)"
        ></button>
      </div>
    </div>
  </section>
</template>
