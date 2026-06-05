<script setup lang="ts">
useSeoMeta({ title: 'О себе — Chayroom AI' })

const occupations = [
  { icon: 'i-solar-rocket-bold', label: 'Предприниматель', color: '#8b5cf6' },
  { icon: 'i-solar-suitcase-bold', label: 'Специалист', color: '#3480f1' },
  { icon: 'i-solar-videocamera-bold', label: 'Блоггер', color: '#ef4444' },
  { icon: 'i-solar-medal-star-bold', label: 'Эксперт', color: '#f59e0b' },
  { icon: 'i-solar-speaker-bold', label: 'Маркетолог, SMM', color: '#f97316' },
  { icon: 'i-solar-palette-bold', label: 'Дизайнер', color: '#ec4899' },
  { icon: 'i-solar-heart-bold', label: 'Психолог, коуч', color: '#f43f5e' },
  { icon: 'i-solar-book-bold', label: 'Учусь, студент', color: '#22c55e' },
  { icon: 'i-solar-code-bold', label: 'Разработчик', color: '#06b6d4' },
  { icon: 'i-solar-pen-bold', label: 'Другое', color: '#6b7280' }
]

const goals = [
  { icon: 'i-solar-dollar-bold', label: 'Зарабатывать на ИИ', color: '#22c55e' },
  { icon: 'i-solar-rocket-bold', label: 'Запустить проект с ИИ', color: '#8b5cf6' },
  { icon: 'i-solar-target-bold', label: 'Применять в своей работе', color: '#ef4444' },
  { icon: 'i-solar-settings-bold', label: 'Автоматизировать рутину', color: '#3480f1' },
  { icon: 'i-solar-buildings-bold', label: 'Внедрить в свой бизнес', color: '#f97316' },
  { icon: 'i-solar-scissors-bold', label: 'Сократить расходы', color: '#f59e0b' },
  { icon: 'i-solar-users-group-rounded-bold', label: 'Найти единомышленников', color: '#06b6d4' },
  { icon: 'i-solar-star-bold', label: 'Просто интересно', color: '#eab308' }
]

const levels = [
  {
    value: 'beginner',
    label: 'Новичок',
    desc: 'Только начинаю знакомиться',
    icon: 'i-solar-leaf-bold',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)'
  },
  {
    value: 'middle',
    label: 'Средний',
    desc: 'Знаком с инструментами, использую периодически',
    icon: 'i-solar-chart-bold',
    color: '#3480f1',
    bg: 'rgba(52,128,241,0.15)'
  },
  {
    value: 'experienced',
    label: 'Опытный',
    desc: 'Использую регулярно в работе и проектах',
    icon: 'i-solar-flame-bold',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.15)'
  },
  {
    value: 'pro',
    label: 'Профессионал',
    desc: 'Создаю свои решения и автоматизации',
    icon: 'i-solar-rocket-bold',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.15)'
  }
]

const STORAGE_KEY = 'chayroom_about_me'

function loadFromStorage() {
  if (import.meta.client) {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  }
  return {}
}

const stored = loadFromStorage()

const selectedOccupation = ref<string | null>(stored.occupation ?? null)
const customOccupation = ref(stored.customOccupation ?? '')
const customInputRef = ref<HTMLInputElement | null>(null)
const selectedGoals = ref<string[]>(stored.goals ?? [])
const selectedLevel = ref<string | null>(stored.level ?? null)

// animation triggers
const poppingChip = ref<string | null>(null)
const poppingGoal = ref<string | null>(null)
const poppingLevel = ref<string | null>(null)

function selectOccupation(label: string) {
  selectedOccupation.value = selectedOccupation.value === label ? null : label
  poppingChip.value = label
  setTimeout(() => {
    poppingChip.value = null
  }, 300)
  if (label === 'Другое' && selectedOccupation.value === 'Другое') {
    nextTick(() => customInputRef.value?.focus())
  }
}

function toggleGoal(label: string) {
  const idx = selectedGoals.value.indexOf(label)
  if (idx === -1) selectedGoals.value.push(label)
  else selectedGoals.value.splice(idx, 1)
  poppingGoal.value = label
  setTimeout(() => {
    poppingGoal.value = null
  }, 300)
}

function selectLevel(value: string) {
  selectedLevel.value = selectedLevel.value === value ? null : value
  poppingLevel.value = value
  setTimeout(() => {
    poppingLevel.value = null
  }, 350)
}

const saved = ref(false)

function save() {
  if (import.meta.client) {
    const occupationObj = occupations.find(o => o.label === selectedOccupation.value)
    const goalsArr = selectedGoals.value.map((label) => {
      const g = goals.find(g => g.label === label)
      return g ? { label: g.label, icon: g.icon, color: g.color } : { label, icon: '', color: '' }
    })
    const levelObj = levels.find(l => l.value === selectedLevel.value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      occupation: selectedOccupation.value,
      occupationIcon: occupationObj?.icon ?? '',
      occupationColor: occupationObj?.color ?? '',
      customOccupation: customOccupation.value,
      goals: goalsArr,
      level: selectedLevel.value,
      levelIcon: levelObj?.icon ?? '',
      levelColor: levelObj?.color ?? ''
    }))
  }
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2200)
}
</script>

<template>
  <div class="min-h-screen bg-cx-surface">
    <div class="w-[680px] max-w-[calc(100vw-40px)] mx-auto py-14 max-md:py-10 max-md:px-4">
      <!-- Hero -->
      <div class="mb-12 max-md:mb-8">
        <span class="inline-block text-[13px] font-semibold tracking-widest uppercase text-cx-blue mb-4 max-md:mb-3">
          Профиль
        </span>
        <h1 class="font-inter-display text-[52px] font-semibold leading-[1.06] tracking-[-0.025em] text-[#14161f] mb-4 max-md:text-[34px]">
          О себе
        </h1>
        <p class="text-[16px] text-cx-muted leading-relaxed max-w-[460px]">
          Эти ответы помогут подбирать материалы и события под ваши цели.
        </p>
      </div>

      <div class="flex flex-col gap-10">
        <!-- Occupation -->
        <section>
          <h2 class="font-inter-display text-[18px] font-semibold text-[#14161f] mb-4">
            Чем вы занимаетесь?
          </h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="item in occupations"
              :key="item.label"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[14px] font-medium
                     transition-colors duration-150
                     hover:scale-[1.03] active:scale-[0.93]"
              :class="[
                selectedOccupation === item.label
                  ? 'bg-[#14161f] border-[#14161f] text-white'
                  : 'bg-[#f7f5ef] border-[#e8e6e1] text-[#14161f] hover:border-[#14161f]/30',
                poppingChip === item.label ? 'animate-chip-pop' : ''
              ]"
              style="transition: color 0.15s, background 0.15s, border-color 0.15s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1)"
              @click="selectOccupation(item.label)"
            >
              <UIcon
                :name="item.icon"
                class="size-4 shrink-0 transition-transform duration-150"
                :class="selectedOccupation === item.label ? 'scale-110' : ''"
                :style="{ color: selectedOccupation === item.label ? '#fff' : item.color }"
              />
              <span>{{ item.label }}</span>
            </button>
          </div>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="selectedOccupation === 'Другое'"
              class="mt-3"
            >
              <input
                ref="customInputRef"
                v-model="customOccupation"
                type="text"
                placeholder="Например: художник, врач, повар..."
                class="w-full px-4 py-3 rounded-xl border border-[#e8e6e1] bg-white text-[14px] text-[#14161f] placeholder-[#b0adb8] outline-none focus:border-[#14161f]/40 transition-colors duration-150"
              >
            </div>
          </Transition>
        </section>

        <div class="h-px bg-cx-line" />

        <!-- Goals -->
        <section>
          <h2 class="font-inter-display text-[18px] font-semibold text-[#14161f] mb-1">
            Какие у вас цели в ИИ?
          </h2>
          <p class="text-[13px] text-cx-muted mb-4">
            Можно выбрать несколько
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="item in goals"
              :key="item.label"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[14px] font-medium
                     hover:scale-[1.03] active:scale-[0.93]"
              :class="[
                selectedGoals.includes(item.label)
                  ? 'bg-[#14161f] border-[#14161f] text-white'
                  : 'bg-[#f7f5ef] border-[#e8e6e1] text-[#14161f] hover:border-[#14161f]/30',
                poppingGoal === item.label ? 'animate-chip-pop' : ''
              ]"
              style="transition: color 0.15s, background 0.15s, border-color 0.15s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1)"
              @click="toggleGoal(item.label)"
            >
              <UIcon
                :name="item.icon"
                class="size-4 shrink-0 transition-transform duration-150"
                :class="selectedGoals.includes(item.label) ? 'scale-110' : ''"
                :style="{ color: selectedGoals.includes(item.label) ? '#fff' : item.color }"
              />
              <span>{{ item.label }}</span>
            </button>
          </div>
        </section>

        <div class="h-px bg-cx-line" />

        <!-- Level -->
        <section>
          <h2 class="font-inter-display text-[18px] font-semibold text-[#14161f] mb-4">
            Ваш уровень в ИИ?
          </h2>
          <div class="flex flex-col gap-2">
            <button
              v-for="item in levels"
              :key="item.value"
              class="flex items-center gap-4 px-5 py-4 rounded-xl border text-left w-full
                     hover:-translate-y-px active:scale-[0.99]"
              :class="selectedLevel === item.value
                ? 'bg-[#14161f] border-[#14161f]'
                : 'bg-[#f7f5ef] border-[#e8e6e1] hover:border-[#14161f]/30 hover:shadow-sm'"
              style="transition: background 0.18s ease, border-color 0.18s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease"
              @click="selectLevel(item.value)"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style="transition: background 0.18s ease"
                :style="selectedLevel === item.value
                  ? { background: 'rgba(255,255,255,0.12)' }
                  : { background: item.bg }"
              >
                <UIcon
                  :key="`${item.value}-${selectedLevel === item.value}`"
                  :name="item.icon"
                  class="size-5"
                  :class="poppingLevel === item.value ? 'animate-icon-pop' : ''"
                  :style="selectedLevel === item.value ? { color: '#fff' } : { color: item.color }"
                />
              </div>
              <div>
                <div
                  class="text-[15px] font-semibold leading-tight transition-colors duration-150"
                  :class="selectedLevel === item.value ? 'text-white' : 'text-[#14161f]'"
                >
                  {{ item.label }}
                </div>
                <div
                  class="text-[13px] mt-0.5 transition-colors duration-150"
                  :class="selectedLevel === item.value ? 'text-white/60' : 'text-cx-muted'"
                >
                  {{ item.desc }}
                </div>
              </div>
            </button>
          </div>
        </section>

        <div class="h-px bg-cx-line" />

        <!-- First material CTA -->
        <NuxtLink
          to="/materials"
          class="flex items-center gap-4 px-5 py-4 rounded-xl border border-[#e8e6e1] bg-[#f7f5ef]
                 hover:border-[#14161f]/30 hover:shadow-sm hover:-translate-y-px active:scale-[0.99]
                 transition-all duration-200 group"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style="background: rgba(52,128,241,0.12)"
          >
            <UIcon
              name="i-solar-notes-minimalistic-bold"
              class="size-5"
              style="color: #3480f1"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[15px] font-semibold text-[#14161f] leading-tight">Birinchi material</div>
            <div class="text-[13px] text-cx-muted mt-0.5">Boshlash uchun tavsiya etilgan qo'llanma</div>
          </div>
          <UIcon
            name="i-solar-arrow-right-linear"
            class="size-4 text-cx-muted shrink-0 group-hover:translate-x-0.5 transition-transform duration-150"
          />
        </NuxtLink>

        <!-- Save -->
        <div class="pt-2 pb-6">
          <button
            class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-bold
                   active:scale-[0.94]"
            :class="saved ? 'bg-green-500 text-white' : 'bg-[#14161f] text-white hover:opacity-88'"
            style="transition: background 0.22s ease, opacity 0.15s ease, transform 0.18s cubic-bezier(0.34,1.56,0.64,1)"
            @click="save"
          >
            <Transition
              enter-active-class="animate-check-pop"
              leave-active-class="transition-opacity duration-100"
              leave-to-class="opacity-0"
            >
              <UIcon
                v-if="saved"
                key="check"
                name="i-lucide-check"
                class="size-4"
              />
            </Transition>
            <Transition
              enter-active-class="transition-all duration-150"
              enter-from-class="opacity-0 translate-x-1"
              leave-active-class="transition-all duration-100"
              leave-to-class="opacity-0 -translate-x-1"
            >
              <span :key="saved ? 'saved' : 'save'">{{ saved ? 'Сохранено' : 'Сохранить' }}</span>
            </Transition>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
