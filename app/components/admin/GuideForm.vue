<script setup lang="ts">
const props = defineProps<{ initialData?: Record<string, unknown> }>()
const emit = defineEmits<{ submit: [data: Record<string, unknown>] }>()

const categories = ['Вайбкодинг', 'AI-агенты', 'Нейросети', 'Контент']

const form = reactive({
  title: '',
  description: '',
  category: 'Нейросети',
  tags: [] as string[],
  cover_url: '',
  bg_color: '#0d1117',
  accent_color: '#60a5fa',
  badge: 'гайд',
  is_free: true,
  notion_page_id: '',
  is_published: false,
  ...props.initialData
})

const tagInput = ref('')
const notionUrlInput = ref('')

function addTag() {
  const t = tagInput.value.trim()
  if (t && !form.tags.includes(t)) form.tags.push(t)
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

function parseNotionUrl() {
  const url = notionUrlInput.value.trim()
  const match = url.match(/([a-f0-9]{32})/)
  if (match) {
    form.notion_page_id = match[1]
    notionUrlInput.value = ''
  }
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
        <input v-model="form.title" type="text" required class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue" placeholder="Название гайда">
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Описание (тизер)</label>
        <textarea v-model="form.description" rows="2" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue resize-none" placeholder="Краткое описание" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Категория</label>
        <select v-model="form.category" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue bg-white">
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Значок</label>
        <select v-model="form.badge" class="px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue bg-white">
          <option>гайд</option>
          <option>start</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Фон карточки</label>
        <div class="flex items-center gap-2">
          <input v-model="form.bg_color" type="color" class="w-10 h-10 rounded-lg border border-cx-line cursor-pointer p-0.5">
          <input v-model="form.bg_color" type="text" class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Акцентный цвет</label>
        <div class="flex items-center gap-2">
          <input v-model="form.accent_color" type="color" class="w-10 h-10 rounded-lg border border-cx-line cursor-pointer p-0.5">
          <input v-model="form.accent_color" type="text" class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue">
        </div>
      </div>

      <div class="col-span-2 flex items-center gap-3">
        <input id="isFree" v-model="form.is_free" type="checkbox" class="cursor-pointer">
        <label for="isFree" class="text-[13px] font-semibold text-[#1a1a1a] cursor-pointer">Бесплатный гайд</label>
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Теги</label>
        <div class="flex flex-wrap gap-1.5 mb-1.5">
          <span v-for="tag in form.tags" :key="tag" class="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted bg-white">
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
        <label class="text-[13px] font-semibold text-[#1a1a1a]">Notion страница</label>
        <div class="flex gap-2">
          <input
            v-model="notionUrlInput"
            type="text"
            placeholder="Вставьте ссылку на Notion страницу"
            class="flex-1 px-3 py-2 rounded-xl border border-cx-line text-[14px] focus:outline-none focus:border-cx-blue"
          >
          <button type="button" class="px-4 py-2 rounded-xl border border-cx-line text-[13px] font-medium hover:border-cx-blue transition-colors" @click="parseNotionUrl">
            Применить
          </button>
        </div>
        <p v-if="form.notion_page_id" class="text-[12px] text-green-600 font-medium">
          ID: {{ form.notion_page_id }}
        </p>
        <p v-else class="text-[12px] text-cx-muted">
          Сделайте страницу Notion публичной перед публикацией
        </p>
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
