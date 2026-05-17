<script setup lang="ts">
const items = [
  { q: 'Это сообщество для новичков или для тех, кто уже в теме?', a: 'Для всех. Если ты новичок — получишь понятный путь с нуля. Если уже знаком с ИИ — найдёшь продвинутые инструменты, свежие тренды и сообщество единомышленников.' },
  { q: 'Нужно ли уметь программировать?', a: 'Нет. Большинство инструментов и подходов, которые мы разбираем, не требуют навыков программирования.' },
  { q: 'Что я получу внутри?', a: 'Курсы и гайды, закрытый чат, разборы AI-инструментов, готовые связки, прямые эфиры и воркшопы.' },
  { q: 'Подойдёт ли мне, если я предприниматель?', a: 'Да. Мы специально включаем материалы по автоматизации бизнес-процессов и созданию AI-команд.' },
  { q: 'Как устроена оплата?', a: 'Оплата через Tribute в Telegram. Доступ активируется автоматически сразу после оплаты.' }
]

const openIndex = ref<number | null>(0)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section class="py-16" id="faq">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionHeader eyebrow="" title="Частые вопросы" subtitle="Отвечаем на самые популярные вопросы" class="mb-10" />
      <div class="flex flex-col gap-1 max-w-[780px] mx-auto">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="border border-cx-line rounded-2xl overflow-hidden bg-white"
        >
          <button
            class="w-full px-6 py-5 font-semibold text-[15px] flex justify-between items-center text-left cursor-pointer"
            @click="toggle(i)"
          >
            {{ item.q }}
            <span :class="['text-lg text-cx-muted transition-transform duration-200', openIndex === i ? 'rotate-180' : '']">▾</span>
          </button>
          <div
            :class="[
              'overflow-hidden transition-all duration-300',
              openIndex === i ? 'max-h-40' : 'max-h-0'
            ]"
          >
            <div class="px-6 pb-5 text-sm text-cx-muted leading-[1.6]">{{ item.a }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
