<script setup lang="ts">
import type { Course, CourseModule, Lesson } from '~/stores/courses'

const authStore = useAuthStore()
const coursesStore = useCoursesStore()

onMounted(() => {
  coursesStore.load()
  if (!authStore.isOwner) navigateTo('/courses')
})

// ── Basic info ────────────────────────────────────────────
const title = ref('')
const desc = ref('')
const badge = ref('kurs')
const duration = ref('')
const level = ref("Boshlang'ich")
const levelColor = ref('#10b981')

const levelOptions = [
  { label: "Boshlang'ich", color: '#10b981' },
  { label: "O'rta", color: '#f59e0b' },
  { label: "Ilg'or", color: '#8b5cf6' },
]

const slug = computed(() =>
  title.value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
)

const slugError = computed(() =>
  slug.value && coursesStore.slugExists(slug.value)
    ? 'Bu slug allaqachon mavjud'
    : ''
)

// ── Tags ──────────────────────────────────────────────────
const tagInput = ref('')
const tags = ref<string[]>([])

function addTag() {
  const t = tagInput.value.trim()
  if (t && !tags.value.includes(t)) tags.value.push(t)
  tagInput.value = ''
}

function removeTag(i: number) {
  tags.value.splice(i, 1)
}

// ── Visual ────────────────────────────────────────────────
const dark = ref(false)
const accentColor = ref('#3480f1')
const previewImage = ref<string>('')
const imageInputRef = ref<HTMLInputElement | null>(null)

function onImagePick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { previewImage.value = reader.result as string }
  reader.readAsDataURL(file)
}

function removeImage() {
  previewImage.value = ''
  if (imageInputRef.value) imageInputRef.value.value = ''
}
const bgPresets = [
  { label: 'Moviy', value: '#3480f1', dark: false },
  { label: 'Sariq', value: '#fffbeb', dark: false },
  { label: 'Yashil', value: '#f0fdf4', dark: false },
  { label: 'Qora', value: '#0d1117', dark: true },
  { label: "To'q ko'k", value: '#0f172a', dark: true },
  { label: "To'q yashil", value: '#0d1f1a', dark: true },
]
const bg = ref(bgPresets[0].value)

function selectBg(preset: typeof bgPresets[0]) {
  bg.value = preset.value
  dark.value = preset.dark
}

// ── Content ───────────────────────────────────────────────
const content = ref('')
const contentTab = ref<'editor' | 'notion'>('editor')
const notionPasted = ref(false)
const notionZoneRef = ref<HTMLDivElement | null>(null)

function cleanNotionHtml(html: string): string {
  if (!import.meta.client) return html
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    const el = node as Element
    const tag = el.tagName.toLowerCase()
    const inner = Array.from(el.childNodes).map(processNode).join('')

    const keep: Record<string, (i: string, e: Element) => string> = {
      h1: i => `<h1>${i}</h1>\n`,
      h2: i => `<h2>${i}</h2>\n`,
      h3: i => `<h3>${i}</h3>\n`,
      h4: i => `<h4>${i}</h4>\n`,
      p:  i => i.trim() ? `<p>${i}</p>\n` : '',
      ul: i => `<ul>\n${i}</ul>\n`,
      ol: i => `<ol>\n${i}</ol>\n`,
      li: i => `  <li>${i}</li>\n`,
      strong: i => `<strong>${i}</strong>`,
      b:      i => `<strong>${i}</strong>`,
      em: i => `<em>${i}</em>`,
      i:  i => `<em>${i}</em>`,
      code: i => `<code>${i}</code>`,
      pre:  i => `<pre><code>${i.replace(/<[^>]+>/g, '')}</code></pre>\n`,
      blockquote: i => `<blockquote>${i}</blockquote>\n`,
      br: () => `<br>`,
      a:  (i, e) => `<a href="${e.getAttribute('href') ?? ''}">${i}</a>`,
    }

    if (keep[tag]) return keep[tag](inner, el)

    if (tag === 'span') {
      const style = (el as HTMLElement).style
      const parts: string[] = []
      if (style.color) parts.push(`color:${style.color}`)
      if (style.backgroundColor) parts.push(`background-color:${style.backgroundColor}`)
      if (parts.length) return `<span style="${parts.join(';')}">${inner}</span>`
      return inner
    }

    return inner
  }

  return Array.from(doc.body.childNodes)
    .map(processNode)
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function onNotionPaste(e: ClipboardEvent) {
  e.preventDefault()
  const html = e.clipboardData?.getData('text/html')
  const text = e.clipboardData?.getData('text/plain') ?? ''

  if (html && html.trim()) {
    content.value = cleanNotionHtml(html)
  } else {
    content.value = text
  }

  notionPasted.value = true
  setTimeout(() => {
    contentTab.value = 'html'
    notionPasted.value = false
  }, 1800)
}

// ── Modules ───────────────────────────────────────────────
const modulesList = ref<CourseModule[]>([
  { title: '', subtitle: '', duration: '', lessons: [] }
])

function addModule() {
  modulesList.value.push({ title: '', subtitle: '', duration: '', lessons: [] })
}

function removeModule(mi: number) {
  modulesList.value.splice(mi, 1)
}

function addLesson(mi: number) {
  modulesList.value[mi].lessons.push({
    title: '',
    type: 'Nazariy',
    duration: '',
    free: false,
    videoUrl: undefined,
  })
}

const uploadingLesson = ref<string | null>(null)
const uploadError = ref<string | null>(null)

async function uploadVideo(mi: number, li: number, file: File) {
  const key = `${mi}-${li}`
  uploadingLesson.value = key
  uploadError.value = null
  try {
    const { uploadUrl, publicUrl } = await $fetch<{ uploadUrl: string; publicUrl: string }>(
      '/api/upload/presign',
      { method: 'POST', body: { filename: file.name, contentType: file.type } }
    )
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    modulesList.value[mi].lessons[li].videoUrl = publicUrl
  } catch (e: any) {
    uploadError.value = e?.message ?? 'Yuklashda xato'
  } finally {
    uploadingLesson.value = null
  }
}

function onVideoFileChange(mi: number, li: number, e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadVideo(mi, li, file)
}

function removeVideo(mi: number, li: number) {
  modulesList.value[mi].lessons[li].videoUrl = undefined
}

function removeLesson(mi: number, li: number) {
  modulesList.value[mi].lessons.splice(li, 1)
}

// ── Computed stats ────────────────────────────────────────
const totalModules = computed(() => modulesList.value.length)
const totalLessons = computed(() =>
  modulesList.value.reduce((s, m) => s + m.lessons.length, 0)
)

// ── Validation ────────────────────────────────────────────
const errors = ref<string[]>([])

function validate() {
  const e: string[] = []
  if (!title.value.trim()) e.push("Kurs nomi kiritilmagan")
  if (!desc.value.trim()) e.push("Tavsif kiritilmagan")
  if (!duration.value.trim()) e.push("Davomiylik kiritilmagan")
  if (tags.value.length === 0) e.push("Kamida bitta tag qo'shing")
  if (slugError.value) e.push(slugError.value)
  if (totalLessons.value === 0) e.push("Kamida bitta dars qo'shing")
  modulesList.value.forEach((m, i) => {
    if (!m.title.trim()) e.push(`Modul ${i + 1}: nom kiritilmagan`)
    m.lessons.forEach((l, j) => {
      if (!l.title.trim()) e.push(`Modul ${i + 1}, Dars ${j + 1}: sarlavha kiritilmagan`)
      if (!l.duration.trim()) e.push(`Modul ${i + 1}, Dars ${j + 1}: davomiylik kiritilmagan`)
    })
  })
  errors.value = e
  return e.length === 0
}

// ── Save ──────────────────────────────────────────────────
const saving = ref(false)

async function save() {
  if (!validate()) return
  saving.value = true

  try {
    const course: Course = {
      slug: slug.value,
      title: title.value.trim(),
      desc: desc.value.trim(),
      tags: tags.value,
      level: level.value,
      levelColor: levelColor.value,
      rating: 0,
      participants: 0,
      duration: duration.value.trim(),
      modules: totalModules.value,
      lessons: totalLessons.value,
      modulesList: modulesList.value,
      bg: bg.value,
      dark: dark.value,
      badge: badge.value,
      accentTitle: [],
      accentColor: accentColor.value,
      image: previewImage.value || undefined,
      content: content.value || undefined,
    }

    const result = await coursesStore.addCourse(course)
    navigateTo(`/courses/${result.slug}`)
  } catch (e: any) {
    errors.value = [e?.data?.message ?? e?.message ?? 'Saqlashda xatolik yuz berdi']
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    saving.value = false
  }
}

useSeoMeta({ title: "Kurs qo'shish — Admin" })
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Top bar -->
    <div class="sticky top-0 z-30 bg-white border-b border-cx-line">
      <div class="w-310 max-w-[calc(100vw-40px)] mx-auto px-0 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/courses"
            class="grid size-8 place-items-center rounded-lg border border-cx-line text-cx-muted hover:text-cx-ink hover:border-cx-ink transition-colors"
          >
            <UIcon name="i-lucide-arrow-left" class="size-4" />
          </NuxtLink>
          <div class="h-4 w-px bg-cx-line" />
          <div class="flex items-center gap-2 text-[13px]">
            <NuxtLink to="/courses" class="text-cx-muted hover:text-cx-ink transition-colors">Kurslar</NuxtLink>
            <span class="text-cx-faint">/</span>
            <span class="text-cx-ink font-semibold">Yangi kurs</span>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <NuxtLink
            to="/courses"
            class="px-4 py-2 rounded-xl border border-cx-line text-[13px] font-semibold text-cx-muted hover:text-cx-ink hover:border-[#c0c0bc] transition-colors"
          >
            Bekor qilish
          </NuxtLink>
          <button
            class="btn-primary btn-primary-dark flex items-center gap-2 px-5! py-2! text-[13px]!"
            :disabled="saving"
            @click="save"
          >
            <UIcon v-if="saving" name="i-lucide-loader-circle" class="size-4 animate-spin" />
            <UIcon v-else name="i-lucide-cloud-upload" class="size-4" />
            {{ saving ? 'Saqlanmoqda...' : 'Nashr qilish' }}
          </button>
        </div>
      </div>
    </div>

    <div class="w-310 max-w-[calc(100vw-40px)] mx-auto px-0 py-8">

      <!-- Page heading -->
      <div class="mb-7">
        <h1 class="text-[26px] font-extrabold tracking-tight text-[#1a1a1a]">Yangi kurs qo'shish</h1>
        <p class="text-cx-muted text-[13px] mt-1">Barcha maydonlarni to'ldiring — kurs darhol saytda ko'rinadi.</p>
      </div>

      <!-- Errors -->
      <div v-if="errors.length" class="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4">
        <div class="flex items-start gap-2.5">
          <UIcon name="i-lucide-circle-alert" class="size-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-[13px] font-bold text-red-600 mb-1.5">Quyidagi xatoliklarni to'g'rilang:</p>
            <ul class="flex flex-col gap-1">
              <li v-for="e in errors" :key="e" class="text-[12px] text-red-500">— {{ e }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-[1fr_320px] gap-6 items-start">

        <!-- ── LEFT COLUMN ─────────────────────────────── -->
        <div class="flex flex-col gap-4">

          <!-- 01 · Basic info -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-6 py-4 border-b border-cx-line flex items-center gap-3">
              <span class="text-[11px] font-bold text-cx-blue bg-cx-blue/10 px-2 py-0.5 rounded-md tracking-widest">01</span>
              <span class="text-[14px] font-bold text-[#1a1a1a]">Asosiy ma'lumotlar</span>
            </div>

            <div class="p-6 flex flex-col gap-5">

              <!-- Title -->
              <div>
                <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Kurs nomi *</label>
                <input
                  v-model="title"
                  type="text"
                  placeholder="Masalan: ChatGPT bilan professional ishlash"
                  class="w-full px-4 py-3 rounded-xl border border-cx-line bg-[#fafafa] text-[15px] font-semibold text-[#1a1a1a] placeholder:text-cx-faint placeholder:font-normal focus:outline-none focus:border-cx-blue focus:bg-white transition-colors"
                />
                <div v-if="slug" class="mt-2 flex items-center gap-1.5 text-[11px]">
                  <UIcon name="i-lucide-link" class="size-3 text-cx-muted" />
                  <span class="text-cx-muted">chayroom.ai/courses/</span>
                  <span class="font-mono font-bold text-cx-blue">{{ slug }}</span>
                  <span v-if="slugError" class="text-red-500 font-semibold">· {{ slugError }}</span>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Qisqa tavsif *</label>
                <textarea
                  v-model="desc"
                  rows="3"
                  placeholder="Kurs haqida 1-2 jumlada: nima o'rganiladi, kim uchun mo'ljallangan."
                  class="w-full px-4 py-3 rounded-xl border border-cx-line bg-[#fafafa] text-[14px] text-[#1a1a1a] placeholder:text-cx-faint focus:outline-none focus:border-cx-blue focus:bg-white transition-colors resize-none leading-relaxed"
                />
              </div>

              <!-- Row: Level + Duration + Badge -->
              <div class="grid grid-cols-[auto_1fr_1fr] gap-5">

                <!-- Level -->
                <div>
                  <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Daraja *</label>
                  <div class="flex flex-col gap-1.5">
                    <button
                      v-for="opt in levelOptions"
                      :key="opt.label"
                      class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-2 text-[12px] font-semibold transition-all duration-150 whitespace-nowrap"
                      :class="level === opt.label
                        ? 'text-white border-transparent shadow-sm'
                        : 'border-cx-line bg-[#fafafa] text-cx-muted hover:border-[#c0c0bc] hover:text-cx-ink'"
                      :style="level === opt.label ? { backgroundColor: opt.color, borderColor: opt.color } : {}"
                      @click="level = opt.label; levelColor = opt.color"
                    >
                      <span
                        class="size-2 rounded-full shrink-0"
                        :style="{ backgroundColor: level === opt.label ? 'rgba(255,255,255,0.7)' : opt.color }"
                      />
                      {{ opt.label }}
                    </button>
                  </div>
                </div>

                <!-- Duration + Badge -->
                <div class="flex flex-col gap-4 col-span-1">
                  <div>
                    <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Davomiylik *</label>
                    <input
                      v-model="duration"
                      type="text"
                      placeholder="~2h, ~8h..."
                      class="w-full px-4 py-2.5 rounded-xl border border-cx-line bg-[#fafafa] text-[14px] text-[#1a1a1a] placeholder:text-cx-faint focus:outline-none focus:border-cx-blue focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Badge</label>
                    <input
                      v-model="badge"
                      type="text"
                      placeholder="kurs, bootcamp..."
                      class="w-full px-4 py-2.5 rounded-xl border border-cx-line bg-[#fafafa] text-[14px] text-[#1a1a1a] placeholder:text-cx-faint focus:outline-none focus:border-cx-blue focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div class="col-span-1" />
              </div>

            </div>
          </div>

          <!-- 02 · Tags -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-6 py-4 border-b border-cx-line flex items-center gap-3">
              <span class="text-[11px] font-bold text-cx-blue bg-cx-blue/10 px-2 py-0.5 rounded-md tracking-widest">02</span>
              <span class="text-[14px] font-bold text-[#1a1a1a]">Teglar va kategoriya</span>
            </div>

            <div class="p-6">
              <div class="flex gap-2 mb-4">
                <input
                  v-model="tagInput"
                  type="text"
                  placeholder="Enter yoki vergul bosib tag qo'shing..."
                  class="flex-1 px-4 py-2.5 rounded-xl border border-cx-line bg-[#fafafa] text-[14px] text-[#1a1a1a] placeholder:text-cx-faint focus:outline-none focus:border-cx-blue focus:bg-white transition-colors"
                  @keydown.enter.prevent="addTag"
                  @keydown.comma.prevent="addTag"
                />
                <button
                  class="shrink-0 px-4 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-[13px] font-semibold hover:bg-[#333] transition-colors"
                  @click="addTag"
                >
                  + Qo'shish
                </button>
              </div>

              <div v-if="tags.length" class="flex flex-wrap gap-2">
                <span
                  v-for="(tag, i) in tags"
                  :key="tag"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cx-blue/10 border border-cx-blue/25 text-[12px] font-semibold text-cx-blue"
                >
                  {{ tag }}
                  <button
                    class="grid size-4 place-items-center rounded-full hover:bg-cx-blue hover:text-white transition-colors text-cx-blue/60 leading-none"
                    @click="removeTag(i)"
                  >
                    <UIcon name="i-lucide-x" class="size-2.5" />
                  </button>
                </span>
              </div>

              <p v-else class="text-[12px] text-cx-faint">
                Teglar kurs kategoriya filtriga ta'sir qiladi.
              </p>
            </div>
          </div>

          <!-- 03 · Modules & Lessons -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-6 py-4 border-b border-cx-line flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-[11px] font-bold text-cx-blue bg-cx-blue/10 px-2 py-0.5 rounded-md tracking-widest">03</span>
                <span class="text-[14px] font-bold text-[#1a1a1a]">Modullar va darslar</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[12px] text-cx-muted">
                  <span class="font-bold text-[#1a1a1a]">{{ totalModules }}</span> modul ·
                  <span class="font-bold text-[#1a1a1a]">{{ totalLessons }}</span> dars
                </span>
              </div>
            </div>

            <div class="p-5 flex flex-col gap-3">

              <div
                v-for="(mod, mi) in modulesList"
                :key="mi"
                class="rounded-xl border border-cx-line overflow-hidden"
              >
                <!-- Module row -->
                <div class="bg-[#f7f7f5] px-4 py-3 flex items-center gap-3">
                  <div class="size-6 rounded-lg bg-cx-blue text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">
                    {{ mi + 1 }}
                  </div>
                  <input
                    v-model="mod.title"
                    type="text"
                    placeholder="Modul nomi"
                    class="flex-1 px-3 py-1.5 rounded-lg border border-cx-line bg-white text-[13px] font-semibold text-[#1a1a1a] placeholder:font-normal placeholder:text-cx-faint focus:outline-none focus:border-cx-blue transition-colors"
                  />
                  <input
                    v-model="mod.subtitle"
                    type="text"
                    placeholder="Ichki nom"
                    class="w-28 px-3 py-1.5 rounded-lg border border-cx-line bg-white text-[12px] text-cx-muted placeholder:text-cx-faint focus:outline-none focus:border-cx-blue transition-colors"
                  />
                  <input
                    v-model="mod.duration"
                    type="text"
                    placeholder="~30m"
                    class="w-20 px-3 py-1.5 rounded-lg border border-cx-line bg-white text-[12px] text-cx-muted placeholder:text-cx-faint focus:outline-none focus:border-cx-blue transition-colors"
                  />
                  <button
                    v-if="modulesList.length > 1"
                    class="shrink-0 grid size-7 place-items-center rounded-lg text-cx-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                    @click="removeModule(mi)"
                  >
                    <UIcon name="i-lucide-trash-2" class="size-3.5" />
                  </button>
                </div>

                <!-- Lessons list -->
                <div class="divide-y divide-cx-line">
                  <div
                    v-for="(lesson, li) in mod.lessons"
                    :key="li"
                    class="flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-[#fafafa] transition-colors group"
                  >
                    <span class="text-[11px] font-bold text-cx-muted/60 shrink-0 w-5 text-center">{{ li + 1 }}</span>
                    <UIcon name="i-lucide-grip-vertical" class="size-3.5 text-cx-line shrink-0" />
                    <input
                      v-model="lesson.title"
                      type="text"
                      placeholder="Dars sarlavhasi"
                      class="flex-1 bg-transparent text-[13px] text-[#1a1a1a] placeholder:text-cx-faint focus:outline-none"
                    />
                    <select
                      v-model="lesson.type"
                      class="shrink-0 px-2.5 py-1.5 rounded-lg border border-cx-line bg-[#fafafa] text-[11px] font-semibold text-cx-muted focus:outline-none focus:border-cx-blue transition-colors cursor-pointer"
                    >
                      <option>Nazariy</option>
                      <option>Amaliy</option>
                    </select>
                    <input
                      v-model="lesson.duration"
                      type="text"
                      placeholder="10 min"
                      class="w-18 px-2.5 py-1.5 rounded-lg border border-cx-line bg-[#fafafa] text-[11px] text-cx-muted placeholder:text-cx-faint focus:outline-none focus:border-cx-blue transition-colors text-center"
                    />
                    <label class="flex items-center gap-1.5 shrink-0 cursor-pointer group/free">
                      <div
                        class="size-4 rounded border-2 flex items-center justify-center transition-all"
                        :class="lesson.free ? 'bg-cx-blue border-cx-blue' : 'border-cx-line bg-white group-hover/free:border-cx-blue'"
                        @click="lesson.free = !lesson.free"
                      >
                        <UIcon v-if="lesson.free" name="i-lucide-check" class="size-2.5 text-white" />
                      </div>
                      <span class="text-[11px] text-cx-muted select-none">Bepul</span>
                    </label>
                    <!-- Video upload -->
                    <div class="shrink-0 flex items-center gap-1">
                      <template v-if="lesson.videoUrl">
                        <span class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <UIcon name="i-lucide-video" class="size-3" />
                          Video
                        </span>
                        <button
                          class="grid size-5 place-items-center rounded text-red-400 hover:bg-red-50 transition-colors"
                          @click="removeVideo(mi, li)"
                        >
                          <UIcon name="i-lucide-x" class="size-3" />
                        </button>
                      </template>
                      <template v-else>
                        <label
                          class="grid size-6 place-items-center rounded-lg text-cx-muted hover:text-cx-blue hover:bg-blue-50 transition-colors cursor-pointer"
                          :class="{ 'animate-pulse text-cx-blue': uploadingLesson === `${mi}-${li}` }"
                        >
                          <UIcon
                            :name="uploadingLesson === `${mi}-${li}` ? 'i-lucide-loader' : 'i-lucide-video'"
                            class="size-3.5"
                          />
                          <input
                            type="file"
                            accept="video/*"
                            class="hidden"
                            :disabled="!!uploadingLesson"
                            @change="onVideoFileChange(mi, li, $event)"
                          />
                        </label>
                      </template>
                    </div>
                    <button
                      class="shrink-0 grid size-6 place-items-center rounded-lg text-cx-line hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      @click="removeLesson(mi, li)"
                    >
                      <UIcon name="i-lucide-x" class="size-3" />
                    </button>
                  </div>
                </div>

                <!-- Add lesson -->
                <div class="px-4 py-2.5 bg-white border-t border-dashed border-cx-line">
                  <button
                    class="flex items-center gap-2 text-[12px] font-semibold text-cx-muted hover:text-cx-blue transition-colors"
                    @click="addLesson(mi)"
                  >
                    <UIcon name="i-lucide-plus" class="size-3.5" />
                    Dars qo'shish
                  </button>
                  <p v-if="uploadError" class="px-4 py-2 text-[12px] text-red-500">{{ uploadError }}</p>
                </div>
              </div>

              <!-- Add module -->
              <button
                class="flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-dashed border-cx-line text-[13px] font-semibold text-cx-muted hover:border-cx-blue hover:text-cx-blue hover:bg-cx-blue/10 transition-all duration-200"
                @click="addModule"
              >
                <div class="size-5 rounded border-2 border-current flex items-center justify-center">
                  <UIcon name="i-lucide-plus" class="size-3" />
                </div>
                Yangi modul qo'shish
              </button>
            </div>
          </div>

          <!-- 04 · Content -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-6 py-4 border-b border-cx-line flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-[11px] font-bold text-cx-blue bg-cx-blue/10 px-2 py-0.5 rounded-md tracking-widest">04</span>
                <span class="text-[14px] font-bold text-[#1a1a1a]">Kontent</span>
              </div>
              <div class="flex items-center gap-1 bg-[#ebebea] rounded-xl p-1">
                <button
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                  :class="contentTab === 'editor' ? 'bg-white text-cx-ink shadow-sm' : 'text-cx-muted hover:text-cx-ink'"
                  @click="contentTab = 'editor'"
                >
                  <UIcon name="i-lucide-pencil-line" class="size-3.5" />
                  Vizual
                </button>
                <button
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                  :class="contentTab === 'notion' ? 'bg-white text-cx-ink shadow-sm' : 'text-cx-muted hover:text-cx-ink'"
                  @click="contentTab = 'notion'; notionPasted = false"
                >
                  <UIcon name="i-lucide-clipboard-paste" class="size-3.5" />
                  Notion paste
                </button>
              </div>
            </div>

            <div class="p-5">
              <ClientOnly v-if="contentTab === 'editor'">
                <GuidesEditor v-model="content" />
              </ClientOnly>

              <div v-else-if="contentTab === 'notion'">
                <div
                  v-if="notionPasted"
                  class="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border-2 border-green-300 bg-green-50"
                >
                  <div class="grid size-12 place-items-center rounded-full bg-green-100">
                    <UIcon name="i-lucide-check" class="size-6 text-green-600" />
                  </div>
                  <p class="text-[14px] font-bold text-green-700">Muvaffaqiyatli import qilindi!</p>
                </div>

                <div v-else class="rounded-xl border-2 border-dashed border-cx-line overflow-hidden">
                  <div class="px-4 py-3 bg-[#fafafa] border-b border-cx-line flex items-center gap-2">
                    <div class="size-5 rounded flex items-center justify-center bg-[#1a1a1a]">
                      <span class="text-white font-bold text-[10px]">N</span>
                    </div>
                    <span class="text-[12px] font-bold text-cx-ink">Notion'dan paste qilish</span>
                  </div>
                  <div class="px-5 py-4 bg-[#fafafa] border-b border-cx-line">
                    <ol class="flex flex-col gap-1.5">
                      <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                        <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        Notion sahifangizni oching
                      </li>
                      <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                        <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        Kerakli matnni tanlang va nusxa oling (Ctrl+C)
                      </li>
                      <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                        <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        Quyidagi maydonni bosing va Ctrl+V bosing
                      </li>
                    </ol>
                  </div>
                  <div
                    ref="notionZoneRef"
                    contenteditable="true"
                    class="min-h-48 px-5 py-4 bg-white text-[13px] text-cx-muted outline-none cursor-text focus:bg-[#fafeff]"
                    @paste="onNotionPaste"
                  >
                    <span class="select-none text-cx-faint pointer-events-none">
                      Bu yerga Notion kontentini paste qiling (Ctrl+V)...
                    </span>
                  </div>
                </div>

                <p class="mt-3 text-[11px] text-cx-muted flex items-center gap-1.5">
                  <UIcon name="i-lucide-info" class="size-3 shrink-0" />
                  H1–H3, paragraf, ro'yxat, kod bloklari, qalin va kursiv matn avtomatik HTML ga aylanadi.
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- ── RIGHT COLUMN ────────────────────────────── -->
        <div class="sticky top-20 flex flex-col gap-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto pb-2 pr-0.5">

          <!-- Visual settings -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-5 py-3.5 border-b border-cx-line flex items-center gap-3">
              <span class="text-[11px] font-bold text-cx-blue bg-cx-blue/10 px-2 py-0.5 rounded-md tracking-widest">05</span>
              <span class="text-[14px] font-bold text-[#1a1a1a]">Ko'rinish</span>
            </div>

            <div class="p-5 flex flex-col gap-5">

              <!-- BG presets -->
              <div>
                <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2.5">Fon rangi</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="preset in bgPresets"
                    :key="preset.value"
                    class="relative h-11 rounded-xl border-2 transition-all duration-150 overflow-hidden"
                    :style="{ backgroundColor: preset.value }"
                    :class="bg === preset.value ? 'border-cx-blue ring-2 ring-cx-blue/20' : 'border-transparent hover:border-[#c0c0bc]'"
                    @click="selectBg(preset)"
                  >
                    <span
                      class="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                      :style="{ color: preset.dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.35)' }"
                    >{{ preset.label }}</span>
                    <UIcon
                      v-if="bg === preset.value"
                      name="i-lucide-check"
                      class="absolute bottom-1 right-1.5 size-3 text-cx-blue"
                    />
                  </button>
                </div>
              </div>

              <!-- Accent color -->
              <div>
                <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2.5">Accent rangi</label>
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <input
                      v-model="accentColor"
                      type="color"
                      class="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-xl"
                    />
                    <div
                      class="size-10 rounded-xl border-2 border-cx-line cursor-pointer"
                      :style="{ backgroundColor: accentColor }"
                    />
                  </div>
                  <div>
                    <div class="text-[13px] font-mono font-bold text-[#1a1a1a]">{{ accentColor }}</div>
                    <div class="text-[11px] text-cx-muted">Sarlavha va aksentlar uchun</div>
                  </div>
                </div>
              </div>

              <!-- Preview image -->
              <div>
                <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2.5">Kurs rasmi</label>

                <!-- Uploaded state -->
                <div v-if="previewImage" class="relative rounded-xl overflow-hidden border border-cx-line">
                  <img :src="previewImage" alt="preview" class="w-full h-40 object-cover" />
                  <button
                    class="absolute top-2 right-2 grid size-7 place-items-center rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                    @click="removeImage"
                  >
                    <UIcon name="i-lucide-x" class="size-3.5" />
                  </button>
                </div>

                <!-- Upload zone -->
                <label
                  v-else
                  class="flex flex-col items-center justify-center gap-2.5 h-36 rounded-xl border-2 border-dashed border-cx-line bg-[#fafafa] hover:border-cx-blue hover:bg-cx-blue/10 transition-all cursor-pointer"
                >
                  <input
                    ref="imageInputRef"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    @change="onImagePick"
                  />
                  <div class="grid size-10 place-items-center rounded-xl bg-cx-blue/10">
                    <UIcon name="i-lucide-image-plus" class="size-5 text-cx-blue" />
                  </div>
                  <div class="text-center">
                    <p class="text-[13px] font-semibold text-cx-ink">Rasm yuklash</p>
                    <p class="text-[11px] text-cx-muted mt-0.5">PNG, JPG — kurs kartochkasida ko'rinadi</p>
                  </div>
                </label>
              </div>

            </div>
          </div>

          <!-- Live preview -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-5 py-3.5 border-b border-cx-line flex items-center justify-between">
              <span class="text-[13px] font-bold text-[#1a1a1a]">Karta ko'rinishi</span>
              <span class="text-[11px] text-cx-muted bg-[#f0f0ee] px-2 py-0.5 rounded-md">Live</span>
            </div>

            <div class="p-4">
              <div class="rounded-xl overflow-hidden border border-cx-line">
                <!-- Card header -->
                <div
                  class="relative h-32 overflow-hidden"
                  :style="{ backgroundColor: bg }"
                >
                  <!-- Uploaded image overlay -->
                  <img
                    v-if="previewImage"
                    :src="previewImage"
                    alt=""
                    class="absolute inset-0 w-full h-full object-cover"
                  />
                  <div class="absolute inset-0 flex items-end px-4 pb-4">
                    <div class="absolute top-2.5 left-3">
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-black/25 text-white">
                        {{ badge || 'kurs' }}
                      </span>
                    </div>
                    <div class="absolute top-2.5 right-3">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                        :style="{ backgroundColor: levelColor + '22', color: levelColor, borderColor: levelColor + '44' }"
                      >{{ level }}</span>
                    </div>
                    <p
                      v-if="!previewImage"
                      class="text-[13px] font-extrabold leading-snug line-clamp-2"
                      :style="{ color: dark ? 'white' : '#1a1a1a' }"
                    >
                      {{ title || "Kurs nomi bu yerda ko'rinadi" }}
                    </p>
                  </div>
                </div>

                <!-- Card body -->
                <div class="p-3 bg-[#fafafa]">
                  <div class="flex flex-wrap gap-1 mb-2">
                    <template v-if="tags.length">
                      <span
                        v-for="tag in tags"
                        :key="tag"
                        class="px-2 py-0.5 rounded-full bg-[#eaeae8] text-[10px] font-medium text-cx-muted"
                      >{{ tag }}</span>
                    </template>
                    <span v-else class="px-2 py-0.5 rounded-full bg-[#eaeae8] text-[10px] text-cx-faint">tag</span>
                  </div>

                  <p class="text-[11px] font-semibold text-[#1a1a1a] mb-0.5 line-clamp-1">
                    {{ title || "Kurs nomi" }}
                  </p>

                  <p class="text-[11px] text-cx-muted line-clamp-2 mb-3 leading-relaxed">
                    {{ desc || "Kurs tavsifi bu yerda ko'rinadi..." }}
                  </p>

                  <div class="flex items-center gap-3 text-[10px] text-cx-muted mb-2.5">
                    <span class="flex items-center gap-1">
                      <UIcon name="i-lucide-layout-list" class="size-3" />
                      {{ totalModules }} modul
                    </span>
                    <span class="flex items-center gap-1">
                      <UIcon name="i-lucide-play-circle" class="size-3" />
                      {{ totalLessons }} dars
                    </span>
                    <span class="flex items-center gap-1">
                      <UIcon name="i-lucide-clock" class="size-3" />
                      {{ duration || '—' }}
                    </span>
                  </div>

                  <div class="h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                    <span class="text-[10px] font-bold text-white">Смотреть курс →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  </div>
</template>
