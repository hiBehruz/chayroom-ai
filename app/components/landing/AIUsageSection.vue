<script setup lang="ts">
const usagePills = [
  { key: 'learning', label: 'Обучение', quote: 'ИИ превращает любую книгу в личного наставника — задавай вопросы, получай объяснения на своём уровне и учись в 10 раз быстрее.' },
  { key: 'content', label: 'Контент и блогинг', quote: 'Генерируй идеи, пиши черновики и создавай вирусный контент в разы быстрее с помощью AI-инструментов.' },
  { key: 'work', label: 'Работа и фриланс', quote: 'Автоматизируй рутинные задачи, пиши письма и отчёты за минуты — освободи время для важного.' },
  { key: 'business', label: 'Бизнес и команды', quote: 'Оптимизируй процессы, создавай AI-ассистентов для команды и снижай операционные расходы.' },
  { key: 'sales', label: 'Продажи и лиды', quote: 'Пиши продающие тексты, анализируй клиентов и автоматизируй воронку продаж с помощью ИИ.' },
  { key: 'sites', label: 'Сайты и сервисы', quote: 'Собирай полноценные веб-приложения и лендинги без глубокого знания кода.' },
  { key: 'agents', label: 'AI-агенты', quote: 'Создавай автономных AI-сотрудников, которые выполняют задачи без твоего участия.' },
  { key: 'travel', label: 'Путешествия', quote: 'Планируй маршруты, бронируй жильё и находи лучшие цены с персональным AI-ассистентом.' },
  { key: 'health', label: 'Здоровье', quote: 'Анализируй свои показатели, составляй планы питания и тренировок с поддержкой AI.' },
  { key: 'finance', label: 'Финансы', quote: 'Анализируй расходы, ищи инвестиционные возможности и планируй бюджет с помощью ИИ.' },
  { key: 'research', label: 'Исследования', quote: 'Обрабатывай большие объёмы информации, находи паттерны и делай выводы быстрее.' },
  { key: 'communication', label: 'Коммуникация', quote: 'Пиши чёткие и убедительные сообщения, переводи тексты и адаптируй стиль под аудиторию.' },
  { key: 'brand', label: 'Личный бренд', quote: 'Строй экспертный образ, создавай контент-стратегию и расти как эксперт в своей нише.' }
]

const active = ref<string | null>(null)
const activeQuote = computed<string>(() => usagePills.find(p => p.key === active.value)?.quote ?? '')
const activeLabel = computed<string>(() => usagePills.find(p => p.key === active.value)?.label ?? '')

function toggle(key: string) {
  active.value = active.value === key ? null : key
}

function closeActive() { active.value = null }
onMounted(() => document.addEventListener('click', closeActive))
onUnmounted(() => document.removeEventListener('click', closeActive))
</script>

<template>
  <section class="py-16 bg-cx-surface">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionDivider class="mb-10" />
      <UiSectionHeader
        title="Как и где применить AI"
        subtitle="Десятки способов упростить себе жизнь, улучшить проекты и открыть новые возможности."
        class="mb-12"
      />
      <div class="flex flex-wrap gap-2.5 justify-center">
        <div
          v-for="pill in usagePills"
          :key="pill.key"
          class="relative"
        >
          <button
            :class="[
              'px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              active === pill.key
                ? 'bg-cx-blue text-white shadow-blue'
                : 'bg-[#f7f7f5] text-cx-ink hover:bg-[#ebebea]'
            ]"
            @click.stop="toggle(pill.key)"
          >
            {{ pill.label }}
          </button>

          <Transition name="slide-down">
            <div
              v-if="active === pill.key"
              class="absolute top-[calc(100%+10px)] left-0 z-30 w-65 bg-white border border-cx-line rounded-2xl p-4 shadow-lift text-left"
            >
              <!-- arrow -->
              <span class="absolute -top-1.75 left-5 w-3 h-3 bg-white border-l border-t border-cx-line rotate-45" />
              <p class="text-sm leading-relaxed text-cx-ink">
                {{ pill.quote }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
