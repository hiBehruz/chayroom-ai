<script setup lang="ts">
const props = defineProps<{
  initialData?: Record<string, unknown>
}>()
const emit = defineEmits<{ submit: [data: Record<string, unknown>] }>()

const categories = ['Вайбкодинг', 'AI-агенты', 'Нейросети', 'Контент']
const levels = [
  { label: 'Начинающий', color: '#22c55e' },
  { label: 'Средний', color: '#f97316' },
  { label: 'Продвинутый', color: '#ef4444' }
]

const form = reactive({
  title: '',
  description: '',
  category: 'AI-агенты',
  tags: [] as string[],
  level: 'Начинающий',
  level_color: '#22c55e',
  modules_count: 0,
  lessons_count: 0,
  duration: '',
  cover_url: '',
  bg_color: '#f0f4ff',
  is_dark: false,
  kinescope_video_id: '',
  is_published: false,
  ...props.initialData
})

const tagInput = ref('')

function addTag() {
  const t = tagInput.value.trim()
  if (t && !form.tags.includes(t)) form.tags.push(t)
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

function onLevelChange(label: string) {
  form.level = label
  form.level_color = levels.find(l => l.label === label)?.color ?? '#22c55e'
}

function onSubmit(publish: boolean) {
  emit('submit', { ...form, is_published: publish })
}
</script>

<template>
  <form class="flex flex-col gap-5 max-w-2xl" @submit.prevent>
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Название</label>
        <input v-model="form.title" type="text" required class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue" placeholder="Название курса">
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Описание</label>
        <textarea v-model="form.description" rows="3" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue resize-none" placeholder="Краткое описание курса" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Категория</label>
        <select v-model="form.category" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue bg-white">
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Уровень</label>
        <select :value="form.level" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue bg-white" @change="e => onLevelChange((e.target as HTMLSelectElement).value)">
          <option v-for="l in levels" :key="l.label">{{ l.label }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Модулей</label>
        <input v-model.number="form.modules_count" type="number" min="0" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Уроков</label>
        <input v-model.number="form.lessons_count" type="number" min="0" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Длительность</label>
        <input v-model="form.duration" type="text" placeholder="~2h" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">ID видео Kinescope</label>
        <input v-model="form.kinescope_video_id" type="text" placeholder="abc123def" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Фон карточки</label>
        <div class="flex items-center gap-2">
          <input v-model="form.bg_color" type="color" class="w-10 h-10 rounded-lg border border-cx-line cursor-pointer p-0.5">
          <input v-model="form.bg_color" type="text" class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <input id="isDark" v-model="form.is_dark" type="checkbox" class="cursor-pointer">
        <label for="isDark" class="text-[13px] font-semibold text-[#1a1a1a] cursor-pointer">Тёмный фон (белый текст)</label>
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Теги</label>
        <div class="flex flex-wrap gap-1.5 mb-1.5">
          <span
            v-for="tag in form.tags"
            :key="tag"
            class="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
          >
            {{ tag }}
            <button type="button" class="text-red-400 hover:text-red-600" @click="removeTag(tag)">×</button>
          </span>
        </div>
        <div class="flex gap-2">
          <input v-model="tagInput" type="text" placeholder="Новый тег" class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue" @keydown.enter.prevent="addTag">
          <button type="button" class="px-4 py-2 rounded-xl border border-cx-line text-[13px] font-medium hover:border-cx-blue transition-colors" @click="addTag">+</button>
        </div>
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Обложка</label>
        <AdminImageUpload v-model="form.cover_url" />
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <button type="button" class="flex-1 py-2.5 rounded-xl border border-cx-line text-[13px] font-semibold hover:bg-[#f7f7f7] transition-colors" @click="onSubmit(false)">
        Сохранить как черновик
      </button>
      <button type="button" class="flex-1 btn-primary text-[13px]! py-2.5!" @click="onSubmit(true)">
        Опубликовать
      </button>
    </div>
  </form>
</template>
