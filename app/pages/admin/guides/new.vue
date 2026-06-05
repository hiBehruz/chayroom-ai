<script setup lang="ts">
import JSZip from 'jszip'

const authStore = useAuthStore()
const guidesStore = useGuidesStore()

const DRAFT_KEY = 'guide-draft-new'

const title = ref('')
const desc = ref('')
const badge = ref("qo'llanma")
const category = ref('Claude')
const free = ref(false)
const level = ref('Yangi boshlagan')
const levelOptions = [
  { label: 'Yangi boshlagan', color: '#10b981', icon: 'i-lucide-sprout',      desc: 'Faqat tanishishni boshlamoqda' },
  { label: "O'rta",           color: '#f59e0b', icon: 'i-lucide-bar-chart-2', desc: 'Vositalarni biladi, vaqti-vaqti bilan ishlatadi' },
  { label: 'Tajribali',       color: '#8b5cf6', icon: 'i-lucide-flame',       desc: 'Muntazam ishlaydi, loyihalarga tatbiq etadi' },
  { label: 'Professional',    color: '#8b5cf6', icon: 'i-lucide-rocket',      desc: "O'z yechimlarini yaratadi va avtomatlashtiradi" },
]
const content = ref('')
const contentTab = ref<'editor' | 'notion'>('editor')

const notionPasted = ref(false)
const notionZoneRef = ref<HTMLDivElement | null>(null)

// ── ZIP import ────────────────────────────────────────────
const zipLoading = ref(false)
const zipStatus = ref<'idle' | 'success' | 'error'>('idle')
const zipMessage = ref('')
const zipInputRef = ref<HTMLInputElement | null>(null)

async function onZipPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  zipLoading.value = true
  zipStatus.value = 'idle'
  zipMessage.value = ''

  try {
    const zip = await JSZip.loadAsync(file)

    // Find the main HTML file (not inside a subfolder as an image)
    const htmlFile = Object.values(zip.files).find(
      f => !f.dir && f.name.endsWith('.html') && !f.name.includes('/')
    )
    if (!htmlFile) throw new Error("HTML fayl topilmadi. Notion 'HTML' formatida eksport qiling.")

    const htmlText = await htmlFile.async('text')

    // Parse HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlText, 'text/html')

    // Replace all relative img src with base64 data URLs
    const imgEls = Array.from(doc.querySelectorAll('img'))
    await Promise.all(imgEls.map(async img => {
      const src = img.getAttribute('src') ?? ''
      if (src.startsWith('data:') || src.startsWith('http')) return

      // Decode URI and find in zip (path may be like "PageName/image.png")
      const decoded = decodeURIComponent(src)
      const zipEntry = zip.file(decoded) ?? zip.file(src)
      if (!zipEntry) { img.remove(); return }

      const blob = await zipEntry.async('uint8array')
      const ext = src.split('.').pop()?.toLowerCase() ?? 'png'
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
        : ext === 'gif' ? 'image/gif'
        : ext === 'webp' ? 'image/webp'
        : 'image/png'
      const b64 = btoa(String.fromCharCode(...blob))
      img.setAttribute('src', `data:${mime};base64,${b64}`)
      img.removeAttribute('class')
      img.removeAttribute('style')
    }))

    content.value = cleanNotionHtml(doc.body.innerHTML)

    // Auto-fill title from Notion page title if field is empty
    if (!title.value.trim()) {
      const h1 = doc.querySelector('h1.page-title, h1')
      if (h1) title.value = h1.textContent?.trim() ?? ''
    }

    zipStatus.value = 'success'
    zipMessage.value = `${imgEls.length} rasm bilan import qilindi`
    setTimeout(() => { contentTab.value = 'editor'; zipStatus.value = 'idle' }, 2000)
  } catch (err: unknown) {
    zipStatus.value = 'error'
    zipMessage.value = err instanceof Error ? err.message : 'Xatolik yuz berdi'
  } finally {
    zipLoading.value = false
    if (zipInputRef.value) zipInputRef.value.value = ''
  }
}

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
    contentTab.value = 'editor'
    notionPasted.value = false
  }, 1800)
}

const categories = ['Claude', 'ChatGPT', 'AI-agentlar', 'Kontent']

const slug = computed(() =>
  title.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
)
const slugError = computed(() =>
  slug.value && guidesStore.slugExists(slug.value) ? 'Bu slug allaqachon mavjud' : ''
)


const accent = ref('#e8b97a')
const bgPresets = [
  { label: 'Sariq', value: '#f5ede0', dark: false },
  { label: 'Moviy', value: '#3480f1', dark: false },
  { label: 'Yashil', value: '#f0fdf4', dark: false },
  { label: 'Qora', value: '#111111', dark: true },
  { label: "To'q ko'k", value: '#0d1117', dark: true },
  { label: "To'q yashil", value: '#0d1f1a', dark: true },
]
const defaultBg = bgPresets[0]?.value ?? '#f5ede0'
const bg = ref(defaultBg)
const bgDark = ref(false)
function selectBg(preset: typeof bgPresets[number]) {
  bg.value = preset.value
  bgDark.value = preset.dark
}

const previewImage = ref('')

onMounted(() => {
  guidesStore.fetch()
  if (!authStore.isOwner) navigateTo('/guides')

  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      const d = JSON.parse(saved)
      if (d.title) title.value = d.title
      if (d.desc) desc.value = d.desc
      if (d.badge) badge.value = d.badge
      if (d.category) category.value = d.category
      if (typeof d.free === 'boolean') free.value = d.free
      if (d.content) content.value = d.content
      if (d.level) level.value = d.level
      if (d.accent) accent.value = d.accent
      if (d.bg) bg.value = d.bg
      if (typeof d.bgDark === 'boolean') bgDark.value = d.bgDark
      if (d.previewImage) previewImage.value = d.previewImage
    }
  } catch {}
})

watch(
  [title, desc, badge, category, free, level, content, accent, bg, bgDark, previewImage],
  () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        title: title.value, desc: desc.value, badge: badge.value,
        category: category.value, free: free.value, level: level.value, content: content.value,
        accent: accent.value, bg: bg.value,
        bgDark: bgDark.value, previewImage: previewImage.value
      }))
    } catch {}
  },
  { deep: true }
)

const imageInputRef = ref<HTMLInputElement | null>(null)
const imageUploading = ref(false)
const imageError = ref('')

const localObjectUrl = ref('')

async function onImagePick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (imageInputRef.value) imageInputRef.value.value = ''
  if (localObjectUrl.value) URL.revokeObjectURL(localObjectUrl.value)
  localObjectUrl.value = URL.createObjectURL(file)
  previewImage.value = localObjectUrl.value
  imageUploading.value = true
  imageError.value = ''
  try {
    const name = encodeURIComponent(`cover-${Date.now()}-${file.name}`)
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: file,
      headers: { 'Content-Type': file.type || 'image/jpeg', 'X-Filename': name },
    })
    if (!res.ok) throw new Error(await res.text() || `Server xatosi: ${res.status}`)
    const { publicUrl } = await res.json()
    previewImage.value = publicUrl
  } catch (err: unknown) {
    imageError.value = err instanceof Error ? err.message : 'Yuklashda xatolik yuz berdi'
  } finally {
    imageUploading.value = false
  }
}

function removeImage() {
  if (localObjectUrl.value) { URL.revokeObjectURL(localObjectUrl.value); localObjectUrl.value = '' }
  previewImage.value = ''
  if (imageInputRef.value) imageInputRef.value.value = ''
}

const errors = ref<string[]>([])
const saving = ref(false)

function validate() {
  const e: string[] = []
  if (!title.value.trim()) e.push('Sarlavha kiritilmagan')
  if (!desc.value.trim()) e.push('Tavsif kiritilmagan')
  if (!content.value.trim()) e.push('Kontent kiritilmagan')
  if (slugError.value) e.push(slugError.value)
  errors.value = e
  return e.length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const result = await $fetch('/api/guides', {
      method: 'POST',
      body: {
        slug: slug.value,
        title: title.value.trim(),
        description: desc.value.trim(),
        isFree: free.value,
        level: level.value,
        bg: bg.value,
        accent: accent.value,
        badge: badge.value,
        category: category.value,
        content: content.value,
        coverUrl: previewImage.value || null
      }
    })
    localStorage.removeItem(DRAFT_KEY)
    await guidesStore.fetch(true)
    navigateTo(`/guides/${(result as { slug: string }).slug}`)
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string }; message?: string })?.data?.message
      ?? (e as { message?: string })?.message
      ?? 'Saqlashda xatolik yuz berdi'
    errors.value = [msg]
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    saving.value = false
  }
}

useSeoMeta({ title: "Qo'llanma qo'shish — Admin" })
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Top bar -->
    <div class="sticky top-0 z-30 bg-white border-b border-cx-line">
      <div class="w-310 max-w-[calc(100vw-40px)] mx-auto px-0 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/guides"
            class="grid size-8 place-items-center rounded-lg border border-cx-line text-cx-muted hover:text-cx-ink hover:border-cx-ink transition-colors"
          >
            <UIcon name="i-lucide-arrow-left" class="size-4" />
          </NuxtLink>
          <div class="h-4 w-px bg-cx-line" />
          <div class="flex items-center gap-2 text-[13px]">
            <NuxtLink to="/guides" class="text-cx-muted hover:text-cx-ink transition-colors">Qo'llanmalar</NuxtLink>
            <span class="text-cx-faint">/</span>
            <span class="text-cx-ink font-semibold">Yangi qo'llanma</span>
          </div>
        </div>
        <div class="flex items-center gap-2.5">
          <NuxtLink
            to="/guides"
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
        <h1 class="text-[50px] font-extrabold tracking-tight text-[#1a1a1a]">Yangi qo'llanma qo'shish</h1>
        <p class="text-cx-muted text-[13px] mt-1">Barcha maydonlarni to'ldiring — qo'llanma darhol saytda ko'rinadi.</p>
      </div>

      <!-- Errors -->
      <div v-if="errors.length" class="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4">
        <div class="flex items-start gap-2.5">
          <UIcon name="i-lucide-circle-alert" class="size-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-[13px] font-bold text-red-600 mb-1.5">Xatoliklarni to'g'rilang:</p>
            <ul class="flex flex-col gap-1">
              <li v-for="e in errors" :key="e" class="text-[12px] text-red-500">— {{ e }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-[1fr_320px] gap-6 items-start">

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
                <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Sarlavha *</label>
                <input
                  v-model="title"
                  type="text"
                  placeholder="Masalan: ChatGPT bilan professional ishlash"
                  class="w-full px-4 py-3 rounded-xl border border-cx-line bg-white text-[15px] font-semibold text-[#1a1a1a] placeholder:text-cx-faint placeholder:font-normal focus:outline-none focus:border-cx-blue transition-colors"
                />
                <div v-if="slug" class="mt-2 flex items-center gap-1.5 text-[11px]">
                  <UIcon name="i-lucide-link" class="size-3 text-cx-muted" />
                  <span class="text-cx-muted">chayroom.ai/guides/</span>
                  <span class="font-mono font-bold text-cx-blue">{{ slug }}</span>
                  <span v-if="slugError" class="text-red-500 font-semibold">· {{ slugError }}</span>
                </div>
              </div>

              <!-- Desc -->
              <div>
                <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Qisqa tavsif *</label>
                <textarea
                  v-model="desc"
                  rows="3"
                  placeholder="Qo'llanma haqida 1-2 jumlada: nima o'rganiladi, kim uchun mo'ljallangan."
                  class="w-full px-4 py-3 rounded-xl border border-cx-line bg-white text-[14px] text-[#1a1a1a] placeholder:text-cx-faint focus:outline-none focus:border-cx-blue transition-colors resize-none leading-relaxed"
                />
              </div>

              <!-- Category + Badge + Free -->
              <div class="grid grid-cols-[auto_1fr_auto] gap-5">

                <!-- Category -->
                <div>
                  <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Kategoriya *</label>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="cat in [
                        { label: 'Claude', icon: 'i-lucide-zap' },
                        { label: 'ChatGPT', icon: 'i-lucide-bot' },
                        { label: 'AI-agentlar', icon: 'i-lucide-brain' },
                        { label: 'Kontent', icon: 'i-lucide-pen-line' },
                      ]"
                      :key="cat.label"
                      class="flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-[12px] font-semibold transition-all duration-150 whitespace-nowrap"
                      :class="category === cat.label
                        ? 'border-cx-blue bg-cx-blue/10 text-cx-blue'
                        : 'border-cx-line bg-white text-cx-muted hover:border-[#c0c0bc] hover:text-cx-ink'"
                      @click="category = cat.label"
                    >
                      <UIcon :name="cat.icon" class="size-3.5 shrink-0" />
                      {{ cat.label }}
                    </button>
                  </div>
                </div>

                <!-- Badge + Free -->
                <div class="flex flex-col gap-4">
                  <div>
                    <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Badge</label>
                    <input
                      v-model="badge"
                      type="text"
                      placeholder="qo'llanma, start..."
                      class="w-full px-4 py-2.5 rounded-xl border border-cx-line bg-white text-[14px] text-[#1a1a1a] placeholder:text-cx-faint focus:outline-none focus:border-cx-blue transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Kirish</label>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        class="flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-[12px] font-semibold transition-all duration-150"
                        :class="free
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-cx-line bg-white text-cx-muted hover:border-[#c0c0bc]'"
                        @click="free = true"
                      >
                        <UIcon name="i-lucide-unlock" class="size-3.5 shrink-0" />
                        Bepul
                      </button>
                      <button
                        class="flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-[12px] font-semibold transition-all duration-150"
                        :class="!free
                          ? 'border-[#f59e0b] bg-amber-50 text-amber-600'
                          : 'border-cx-line bg-white text-cx-muted hover:border-[#c0c0bc]'"
                        @click="free = false"
                      >
                        <UIcon name="i-lucide-lock" class="size-3.5 shrink-0" />
                        Obuna kerak
                      </button>
                    </div>
                  </div>
                </div>

                <div />
              </div>

            </div>
          </div>

          <!-- 02 · Daraja -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-6 py-4 border-b border-cx-line flex items-center gap-3">
              <span class="text-[11px] font-bold text-cx-blue bg-cx-blue/10 px-2 py-0.5 rounded-md tracking-widest">02</span>
              <span class="text-[14px] font-bold text-[#1a1a1a]">Daraja</span>
            </div>
            <div class="p-6 flex flex-col gap-2">
              <button
                v-for="opt in levelOptions"
                :key="opt.label"
                class="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150"
                :class="level === opt.label ? 'border-current' : 'border-cx-line bg-white hover:border-[#c0c0bc]'"
                :style="level === opt.label ? { borderColor: opt.color, background: opt.color + '10' } : {}"
                @click="level = opt.label"
              >
                <div
                  class="size-11 rounded-2xl flex items-center justify-center shrink-0"
                  :style="{ background: opt.color + (level === opt.label ? '20' : '12') }"
                >
                  <UIcon :name="opt.icon" class="size-5" :style="{ color: opt.color }" />
                </div>
                <div>
                  <div class="text-[15px] font-bold" :style="level === opt.label ? { color: opt.color } : { color: '#14161f' }">{{ opt.label }}</div>
                  <div class="text-[12px] text-cx-muted mt-0.5">{{ opt.desc }}</div>
                </div>
                <UIcon v-if="level === opt.label" name="i-lucide-check-circle-2" class="ml-auto size-5 shrink-0" :style="{ color: opt.color }" />
              </button>
            </div>
          </div>

          <!-- 03 · Content -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-6 py-4 border-b border-cx-line flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-[11px] font-bold text-cx-blue bg-cx-blue/10 px-2 py-0.5 rounded-md tracking-widest">03</span>
                <span class="text-[14px] font-bold text-[#1a1a1a]">Kontent</span>
              </div>
              <!-- Tabs -->
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

              <!-- Visual editor tab -->
              <ClientOnly v-if="contentTab === 'editor'">
                <GuidesEditor v-model="content" />
              </ClientOnly>

              <!-- Notion tab -->
              <div v-else-if="contentTab === 'notion'">
                <!-- Success state -->
                <div
                  v-if="notionPasted"
                  class="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border-2 border-green-300 bg-green-50"
                >
                  <div class="grid size-12 place-items-center rounded-full bg-green-100">
                    <UIcon name="i-lucide-check" class="size-6 text-green-600" />
                  </div>
                  <p class="text-[14px] font-bold text-green-700">Muvaffaqiyatli import qilindi!</p>
                  <p class="text-[12px] text-green-600">Vizual editorga o'tilmoqda...</p>
                </div>

                <!-- Paste zone -->
                <div v-else class="rounded-xl border-2 border-dashed border-cx-line overflow-hidden">
                  <div class="px-4 py-3 bg-[#fafafa] border-b border-cx-line flex items-center gap-2">
                    <div class="size-5 rounded flex items-center justify-center bg-[#1a1a1a]">
                      <span class="text-white font-bold text-[10px]">N</span>
                    </div>
                    <span class="text-[12px] font-bold text-cx-ink">Notion'dan paste qilish</span>
                  </div>

                  <!-- Instructions -->
                  <div class="px-5 py-4 bg-[#fafafa] border-b border-cx-line">
                    <ol class="flex flex-col gap-1.5">
                      <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                        <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        Notion sahifangizni oching
                      </li>
                      <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                        <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        Kerakli matnni tanlang (Ctrl+A yoki qo'lda)
                      </li>
                      <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                        <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        Nusxa oling (Ctrl+C)
                      </li>
                      <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                        <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                        Quyidagi maydonni bosing va Ctrl+V bosing
                      </li>
                    </ol>
                  </div>

                  <!-- Paste target -->
                  <div
                    ref="notionZoneRef"
                    contenteditable="true"
                    class="min-h-48 px-5 py-4 bg-white text-[13px] text-cx-muted outline-none cursor-text focus:bg-[#fafeff]"
                    data-placeholder="Bu yerga Notion kontentini paste qiling (Ctrl+V)..."
                    @paste="onNotionPaste"
                  >
                    <span class="select-none text-cx-faint pointer-events-none" v-if="!notionPasted">
                      Bu yerga Notion kontentini paste qiling (Ctrl+V)...
                    </span>
                  </div>
                </div>

                <p class="mt-3 text-[11px] text-cx-muted flex items-center gap-1.5">
                  <UIcon name="i-lucide-info" class="size-3 shrink-0" />
                  H1–H3, paragraf, ro'yxat, kod bloklari, qalin va kursiv matn avtomatik HTML ga aylanadi.
                </p>
              </div>

              <div v-if="false">
                  <div class="rounded-xl border border-cx-line overflow-hidden mb-4">
                    <div class="px-4 py-3 bg-[#fafafa] border-b border-cx-line flex items-center gap-2">
                      <div class="size-5 rounded flex items-center justify-center bg-[#1a1a1a]">
                        <span class="text-white font-bold text-[10px]">N</span>
                      </div>
                      <span class="text-[12px] font-bold text-cx-ink">Notion HTML eksport (.zip)</span>
                    </div>
                    <div class="px-5 py-4 bg-[#fafafa]">
                      <ol class="flex flex-col gap-1.5">
                        <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                          <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                          Notion sahifasini oching → <strong class="text-cx-ink">···</strong> → <strong class="text-cx-ink">Export</strong>
                        </li>
                        <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                          <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                          Format: <strong class="text-cx-ink">HTML</strong> tanlang
                        </li>
                        <li class="flex items-start gap-2 text-[12px] text-cx-muted">
                          <span class="size-4 rounded-full bg-cx-blue/10 text-cx-blue text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                          Yuklab olingan <strong class="text-cx-ink">.zip</strong> faylni quyida tanlang
                        </li>
                      </ol>
                    </div>
                  </div>

                  <label class="flex flex-col items-center justify-center gap-3 h-40 rounded-xl border-2 border-dashed border-cx-line bg-white hover:border-cx-blue hover:bg-cx-blue/10 transition-all cursor-pointer">
                    <input ref="zipInputRef" type="file" accept=".zip" class="sr-only" @change="onZipPick" />
                    <div class="grid size-12 place-items-center rounded-xl bg-cx-blue/10">
                      <UIcon name="i-lucide-file-archive" class="size-6 text-cx-blue" />
                    </div>
                    <div class="text-center">
                      <p class="text-[14px] font-semibold text-cx-ink">ZIP fayl yuklash</p>
                      <p class="text-[12px] text-cx-muted mt-0.5">Notion eksport ZIP — rasmlar avtomatik saqlanadi</p>
                    </div>
                  </label>

              </div>

            </div>
          </div>

        </div><!-- end left column -->

        <!-- ── RIGHT COLUMN ────────────────────────────── -->
        <div class="sticky top-20 flex flex-col gap-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto pb-2 pr-0.5">

          <!-- 04 · Visual -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-5 py-3.5 border-b border-cx-line flex items-center gap-3">
              <span class="text-[11px] font-bold text-cx-blue bg-cx-blue/10 px-2 py-0.5 rounded-md tracking-widest">04</span>
              <span class="text-[14px] font-bold text-[#1a1a1a]">Ko'rinish</span>
            </div>
            <div class="p-5 flex flex-col gap-5">

              <!-- BG -->
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
                    <UIcon v-if="bg === preset.value" name="i-lucide-check" class="absolute bottom-1 right-1.5 size-3 text-cx-blue" />
                  </button>
                </div>
              </div>

              <!-- Accent -->
              <div>
                <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2.5">Accent rangi</label>
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <input v-model="accent" type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-xl" />
                    <div class="size-10 rounded-xl border-2 border-cx-line cursor-pointer" :style="{ backgroundColor: accent }" />
                  </div>
                  <div>
                    <div class="text-[13px] font-mono font-bold text-[#1a1a1a]">{{ accent }}</div>
                    <div class="text-[11px] text-cx-muted">Badge va gradient uchun</div>
                  </div>
                </div>
              </div>

              <!-- Image -->
              <div>
                <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2.5">Muqova rasmi</label>
                <div v-if="previewImage" class="relative rounded-xl overflow-hidden border border-cx-line bg-[#f7f7f5]">
                  <img :src="previewImage" alt="cover" class="w-full h-auto block" />
                  <button
                    class="absolute top-2 right-2 grid size-7 place-items-center rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                    @click="removeImage"
                  >
                    <UIcon name="i-lucide-x" class="size-3.5" />
                  </button>
                </div>
                <label
                  v-else
                  class="flex flex-col items-center justify-center gap-2.5 h-36 rounded-xl border-2 border-dashed border-cx-line bg-white hover:border-cx-blue hover:bg-cx-blue/10 transition-all cursor-pointer"
                  :class="{ 'opacity-60 pointer-events-none': imageUploading }"
                >
                  <input ref="imageInputRef" type="file" accept="image/*" class="sr-only" :disabled="imageUploading" @change="onImagePick" />
                  <div class="grid size-10 place-items-center rounded-xl bg-cx-blue/10">
                    <UIcon :name="imageUploading ? 'i-lucide-loader-2' : 'i-lucide-image-plus'" class="size-5 text-cx-blue" :class="{ 'animate-spin': imageUploading }" />
                  </div>
                  <div class="text-center">
                    <p class="text-[13px] font-semibold text-cx-ink">{{ imageUploading ? 'Yuklanmoqda...' : 'Rasm yuklash' }}</p>
                    <p class="text-[11px] text-cx-muted mt-0.5">PNG, JPG — karta muqovasi</p>
                  </div>
                </label>
                <p v-if="imageError" class="mt-2 text-[11px] text-red-500 font-semibold">{{ imageError }}</p>
              </div>

            </div>
          </div>

          <!-- Card preview -->
          <div class="rounded-2xl bg-[#f7f7f5] border border-cx-line overflow-hidden">
            <div class="px-5 py-3.5 border-b border-cx-line flex items-center justify-between">
              <span class="text-[13px] font-bold text-[#1a1a1a]">Karta ko'rinishi</span>
              <span class="text-[11px] text-cx-muted bg-[#ebebea] px-2 py-0.5 rounded-md">Live</span>
            </div>
            <div class="p-4">
              <div class="rounded-xl overflow-hidden border border-cx-line">
                <!-- Preview header -->
                <div class="relative overflow-hidden" style="aspect-ratio:397/264" :style="{ backgroundColor: bg }">
                  <img v-if="previewImage" :src="previewImage" alt="" class="absolute inset-0 w-full h-full object-contain" />
                  <div
                    class="absolute inset-0 opacity-35"
                    :style="{ background: `radial-gradient(ellipse at 95% 105%, ${accent} 0%, transparent 60%)` }"
                  />
                  <span
                    class="absolute top-2.5 left-3 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide"
                    :style="{ backgroundColor: accent + '33', color: accent }"
                  >{{ badge || "qo'llanma" }}</span>
                  <p
                    class="absolute inset-0 z-10 flex items-end px-3 pb-3 text-[13px] font-extrabold leading-snug line-clamp-2"
                    :style="{ color: bgDark ? 'white' : '#1a1a1a' }"
                  >
                    {{ title || "Sarlavha bu yerda ko'rinadi" }}
                  </p>
                </div>
                <!-- Preview body -->
                <div class="p-3 bg-[#fafafa]">
                  <p class="text-[11px] text-cx-muted line-clamp-2 mb-2.5 leading-relaxed">
                    {{ desc || "Tavsif bu yerda ko'rinadi..." }}
                  </p>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      :style="{ backgroundColor: accent + '22', color: accent }"
                    >{{ category }}</span>
                    <span
                      class="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      :style="{ backgroundColor: (levelOptions.find(o => o.label === level)?.color ?? '#22c55e') + '20', color: levelOptions.find(o => o.label === level)?.color ?? '#22c55e' }"
                    >{{ level }}</span>
                    <span class="text-[10px] font-medium" :class="free ? 'text-green-600' : 'text-amber-500'">
                      {{ free ? '✓ Bepul' : '🔒 Obuna' }}
                    </span>
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
