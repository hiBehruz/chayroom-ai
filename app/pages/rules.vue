<script setup lang="ts">
useSeoMeta({ title: 'Правила — Chayroom AI' })

const rules = [
  {
    icon: 'i-solar-chat-round-dots-bold',
    iconColor: '#3480f1',
    iconBg: 'rgba(52,128,241,0.12)',
    title: 'О чём говорим в чате',
    body: [
      {
        type: 'text',
        content: 'Чат — для рабочих тем: вайбкодинг, проекты, задачи, AI-инструменты, разборы и идеи.',
      },
      {
        type: 'text',
        content: 'Организационные вопросы — про оплату, доступы и содержание курсов — это в @helptreysi. Так чат не превращается в очередь поддержки и остаётся местом для содержательных разговоров.',
      },
    ],
  },
  {
    icon: 'i-solar-heart-bold',
    iconColor: '#ec4899',
    iconBg: 'rgba(236,72,153,0.12)',
    title: 'Атмосфера',
    body: [
      { type: 'text', content: 'Мы здесь, чтобы помогать друг другу, а не выяснять отношения.' },
      {
        type: 'list',
        items: [
          'Не оскорбляем и не переходим на личности.',
          'Цель любого спора — найти решение, а не «остаться правым». Если ты прав — это будет видно по результату.',
          'Сохраняем дружелюбный тон даже когда не согласны.',
        ],
      },
      { type: 'text', content: 'Это база, ради которой всё и собирается.' },
    ],
  },
  {
    icon: 'i-solar-forbidden-bold',
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.12)',
    title: 'Без рекламы',
    body: [
      { type: 'text', content: 'Любой пиар своего продукта или услуги в чате запрещён.' },
      { type: 'text', content: 'После двух предупреждений — аннулирование доступа к сообществу без возможности вернуться.' },
      { type: 'text', content: 'Если есть что-то реально полезное для участников — напиши в @helptreysi, обсудим.' },
    ],
  },
  {
    icon: 'i-solar-lock-bold',
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.12)',
    title: 'Материалы — только для своих',
    body: [
      { type: 'text', content: 'Курсы, гайды, записи эфиров и всё что внутри платформы — это для участников клуба.' },
      {
        type: 'list',
        items: [
          'Не пересылай и не выкладывай материалы за пределы клуба.',
          'Не передавай свой доступ кому-то ещё.',
        ],
      },
      { type: 'text', content: 'Нарушение — аннулирование доступа к сообществу.' },
    ],
  },
]

const support = [
  {
    icon: 'i-solar-users-group-rounded-bold',
    iconColor: '#14b8a6',
    iconBg: 'rgba(20,184,166,0.12)',
    title: 'Помощь другим',
    desc: 'Если ты активно отвечаешь на вопросы и делишься знаниями — со временем можешь стать одним из кураторов клуба, со своими привилегиями.',
  },
  {
    icon: 'i-solar-rocket-bold',
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139,92,246,0.12)',
    title: 'Кейсы и проекты',
    desc: 'Делись тем, что собрал внутри клуба — мы посмотрим, дадим обратную связь, а самые яркие истории попадут в наши соцсети.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-cx-surface">
    <div class="w-[780px] max-w-[calc(100vw-40px)] mx-auto py-14 max-md:py-10 max-md:px-4">

      <!-- Hero -->
      <div class="mb-14 max-md:mb-10">
        <span class="inline-block text-[13px] font-semibold tracking-widest uppercase text-cx-blue mb-4 max-md:mb-3">
          Сообщество
        </span>
        <h1 class="font-inter-display text-[56px] font-semibold leading-[1.06] tracking-[-0.025em] text-[#14161f] mb-4 max-md:text-[36px]">
          Правила
        </h1>
        <p class="text-[18px] text-cx-muted leading-relaxed max-w-[520px] max-md:text-[16px]">
          Несколько простых принципов. Они помогают клубу оставаться местом, куда хочется возвращаться.
        </p>
      </div>

      <div class="h-px bg-cx-line mb-14 max-md:mb-10" />

      <!-- Rules -->
      <div class="flex flex-col gap-0">
        <div
          v-for="(rule, i) in rules"
          :key="rule.title"
          class="flex gap-6 py-10 border-b border-cx-line first:pt-0 last:border-b-0 max-md:flex-col max-md:gap-4 max-md:py-8"
        >
          <!-- Left: number + icon -->
          <div class="w-10 shrink-0 flex flex-col items-center gap-2 max-md:flex-row max-md:w-auto">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: rule.iconBg }">
              <UIcon :name="rule.icon" class="size-5" :style="{ color: rule.iconColor }" />
            </div>
            <span class="text-[12px] font-semibold text-cx-faint">{{ String(i + 1).padStart(2, '0') }}</span>
          </div>

          <!-- Right: content -->
          <div class="flex-1 min-w-0">
            <h2 class="font-inter-display text-[20px] font-semibold tracking-[-0.01em] text-[#14161f] mb-4 max-md:text-[18px] max-md:mb-3">
              {{ rule.title }}
            </h2>
            <div class="flex flex-col gap-3">
              <template v-for="(block, bi) in rule.body" :key="bi">
                <p v-if="block.type === 'text'" class="text-[15px] text-cx-muted leading-relaxed">
                  {{ block.content }}
                </p>
                <ul v-else-if="block.type === 'list'" class="flex flex-col gap-2 pl-0">
                  <li
                    v-for="item in block.items"
                    :key="item"
                    class="flex gap-3 text-[15px] text-cx-muted leading-relaxed"
                  >
                    <span class="w-1 h-1 rounded-full bg-cx-faint mt-2.5 shrink-0" />
                    {{ item }}
                  </li>
                </ul>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="h-px bg-cx-line mt-14 mb-14 max-md:mt-10 max-md:mb-10" />

      <!-- Что мы поддерживаем -->
      <section>
        <h2 class="font-inter-display text-[22px] font-semibold tracking-[-0.01em] text-[#14161f] mb-2 max-md:text-[19px]">
          Что мы поддерживаем
        </h2>
        <p class="text-[15px] text-cx-muted mb-7 max-md:mb-5">
          Пара вещей, за которые мы особенно благодарны:
        </p>
        <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div
            v-for="item in support"
            :key="item.title"
            class="rounded-2xl bg-[#f7f5ef] border border-[#e8e6e1] p-6 flex flex-col gap-3"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: item.iconBg }">
              <UIcon :name="item.icon" class="size-5" :style="{ color: item.iconColor }" />
            </div>
            <div>
              <div class="text-[16px] font-semibold text-[#14161f] mb-1.5">{{ item.title }}</div>
              <div class="text-[14px] text-cx-muted leading-relaxed">{{ item.desc }}</div>
            </div>
          </div>
        </div>
        <p class="text-[14px] text-cx-muted mt-6 max-md:mt-4">
          Это и есть то, что превращает клуб из набора материалов в живое сообщество.
        </p>
      </section>

    </div>
  </div>
</template>
