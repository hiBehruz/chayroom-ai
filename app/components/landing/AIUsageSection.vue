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

const active = ref(usagePills[0].key)
const activeQuote = computed(() => usagePills.find(p => p.key === active.value)?.quote ?? '')
const activeLabel = computed(() => usagePills.find(p => p.key === active.value)?.label ?? '')
</script>

<template>
  <section class="py-16 bg-cx-surface">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="Применение" title="Как и где применить AI" subtitle="Десятки способов упростить себе жизнь, улучшить проекты и открыть новые возможности." class="mb-12" />
      <div class="flex flex-wrap gap-2.5 justify-center">
        <button
          v-for="pill in usagePills"
          :key="pill.key"
          :class="[
            'px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200',
            active === pill.key
              ? 'bg-cx-ink text-white border-cx-ink'
              : 'bg-white text-cx-ink border-cx-line hover:bg-cx-ink hover:text-white hover:border-cx-ink'
          ]"
          @click="active = pill.key"
        >
          {{ pill.label }}
        </button>
      </div>
      <div class="mt-8 text-center p-6 px-8 bg-white border border-cx-line rounded-[20px]">
        <div class="text-[11px] font-semibold tracking-[.06em] uppercase text-cx-blue mb-2.5">
          AI о теме «{{ activeLabel }}»
        </div>
        <p class="text-base leading-[1.6] text-cx-ink">«{{ activeQuote }}»</p>
      </div>
    </div>
  </section>
</template>
