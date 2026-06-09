<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const guidesStore = useGuidesStore()
const { isMiniApp } = useTelegramApp()
const hasSubscription = computed(() => authStore.hasSubscription)
const isOwner = computed(() => authStore.isOwner)
const isAccessModalOpen = ref(false)
const freeGuideCtaFeatures = [
  {
    icon: 'i-solar-book-bookmark-bold',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    title: 'Barcha kurs va qo\'llanmalar',
    description: 'Nazariyadan amaliyotgacha bo\'lgan barcha materiallar bitta obunada'
  },
  {
    icon: 'i-ph-telegram-logo-fill',
    color: '#3480f1',
    bg: 'rgba(52,128,241,0.12)',
    title: 'Yopiq Telegram hamjamiyati',
    description: 'Savol berish, tajriba almashish va tezkor fikr olish uchun'
  },
  {
    icon: 'i-lucide-users',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    title: 'Jonli efirlar va netvorking',
    description: 'Yangi vositalar, real misollar va bir xil yo\'nalishdagi odamlar bilan aloqa'
  }
]

const reqFetch = useRequestFetch()
const { data: guide, status } = await useAsyncData(
  `guide-${route.params.slug}`,
  () => reqFetch<import('~/stores/guides').Guide>(`/api/guides/${route.params.slug as string}`),
  { getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key] }
)

if (!guide.value) {
  throw createError({ statusCode: 404, statusMessage: 'Qo\'llanma topilmadi' })
}

const guideLoading = computed(() => status.value === 'pending')

// ── Inline edit ───────────────────────────────────────────
const isEditing = ref(false)
const editTitle = ref('')
const editDesc = ref('')
const editContent = ref('')
const editBadge = ref('')
const editFree = ref(false)
const editLevel = ref('Yangi boshlagan')
const editTags = ref<string[]>([])
const editTagInput = ref('')
const editBg = ref('')

const levelOptions = [
  { label: 'Yangi boshlagan', color: '#10b981', icon: 'i-lucide-sprout' },
  { label: 'O\'rta', color: '#f59e0b', icon: 'i-lucide-bar-chart-2' },
  { label: 'Tajribali', color: '#8b5cf6', icon: 'i-lucide-flame' },
  { label: 'Professional', color: '#8b5cf6', icon: 'i-lucide-rocket' }
]
const editAccent = ref('')
const editCategory = ref('')
const editImage = ref('')
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
  editImage.value = localObjectUrl.value
  imageUploading.value = true
  imageError.value = ''
  try {
    const name = encodeURIComponent(`cover-${Date.now()}-${file.name}`)
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: file,
      headers: { 'Content-Type': file.type || 'image/jpeg', 'X-Filename': name }
    })
    if (!res.ok) throw new Error(await res.text() || `Server xatosi: ${res.status}`)
    const { publicUrl } = await res.json()
    editImage.value = publicUrl
  } catch (err: unknown) {
    imageError.value = err instanceof Error ? err.message : 'Yuklashda xatolik yuz berdi'
  } finally {
    imageUploading.value = false
  }
}

function removeImage() {
  if (localObjectUrl.value) {
    URL.revokeObjectURL(localObjectUrl.value)
    localObjectUrl.value = ''
  }
  editImage.value = ''
  if (imageInputRef.value) imageInputRef.value.value = ''
}

const bgPresets = [
  { label: 'Sariq', value: '#f5ede0', dark: false },
  { label: 'Moviy', value: '#3480f1', dark: false },
  { label: 'Yashil', value: '#f0fdf4', dark: false },
  { label: 'Qora', value: '#111111', dark: true },
  { label: 'To\'q ko\'k', value: '#0d1117', dark: true },
  { label: 'To\'q yashil', value: '#0d1f1a', dark: true }
]
const categories = ['Claude', 'ChatGPT', 'AI-agentlar', 'Kontent']

function startEdit() {
  const g = guide.value
  if (!g) return
  editTitle.value = g.title
  editDesc.value = g.description ?? ''
  editContent.value = g.content ?? ''
  editBadge.value = g.badge ?? ''
  editFree.value = g.isFree
  editLevel.value = g.level ?? 'Yangi boshlagan'
  editTags.value = [...(g.tags ?? [])]
  editBg.value = g.bg ?? '#f5ede0'
  editAccent.value = g.accent ?? '#e8b97a'
  editCategory.value = g.category ?? 'Claude'
  editImage.value = g.coverUrl ?? ''
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  const g = guide.value
  if (!g) return
  await $fetch(`/api/guides/${g.slug}`, {
    method: 'PATCH',
    body: {
      title: editTitle.value.trim(),
      description: editDesc.value.trim(),
      content: editContent.value,
      badge: editBadge.value,
      category: editCategory.value,
      isFree: editFree.value,
      level: editLevel.value,
      tags: editTags.value,
      bg: editBg.value,
      accent: editAccent.value,
      coverUrl: editImage.value.trim() || null
    }
  })
  await guidesStore.fetch(true)
  guide.value = await $fetch<import('~/stores/guides').Guide>(`/api/guides/${(guide.value as import('~/stores/guides').Guide).slug}`)
  isEditing.value = false
}

const coverError = ref(false)
watch(() => guide.value?.coverUrl, () => {
  coverError.value = false
})

function addEditTag() {
  const t = editTagInput.value.trim()
  if (t && !editTags.value.includes(t)) editTags.value.push(t)
  editTagInput.value = ''
}

function onEditTagKeydown(event: KeyboardEvent) {
  if (event.key !== ',') return
  event.preventDefault()
  addEditTag()
}

async function copyGuideLink() {
  if (!import.meta.client) return
  await navigator.clipboard?.writeText(window.location.href)
}

const deleteConfirmOpen = ref(false)
const deleting = ref(false)

async function deleteGuide() {
  const g = guide.value
  if (!g) return
  deleting.value = true
  try {
    await $fetch(`/api/guides/${g.slug}`, { method: 'DELETE' })
    await guidesStore.fetch(true)
    navigateTo('/guides')
  } finally {
    deleting.value = false
  }
}

useSeoMeta({ title: computed(() => `${guide.value?.title ?? 'Qo\'llanma'} — Chayroom AI`) })
</script>

<template>
  <div
    class="min-h-screen"
    :class="isMiniApp ? 'bg-[#fffdf9]' : 'bg-cx-surface'"
  >
    <div
      class="mx-auto"
      :class="isMiniApp ? 'px-4 py-5 max-w-full' : 'w-[1240px] max-w-[calc(100vw-40px)] px-0 py-20 max-md:px-4 max-md:py-10'"
    >
      <div
        v-if="guideLoading"
        class="flex items-center justify-center py-32"
      >
        <span class="inline-block size-8 border-2 border-cx-line border-t-cx-blue rounded-full animate-spin" />
      </div>

      <div
        v-else-if="guide"
        class="guide-detail mx-auto max-w-full"
        :class="isMiniApp ? 'guide-detail--mini' : 'w-[882px]'"
      >
        <div
          v-if="!isMiniApp"
          class="mb-8 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch"
        >
          <NuxtLink
            to="/guides"
            class="guide-pill-button"
          >
            <UIcon
              name="i-lucide-arrow-left"
              class="size-5"
            />
            Qo'llanmalarga qaytish
          </NuxtLink>

          <div
            v-if="isOwner && isEditing"
            class="flex items-center gap-2"
          >
            <button
              class="guide-pill-button max-md:justify-center"
              @click="cancelEdit"
            >
              <UIcon
                name="i-lucide-x"
                class="size-5"
              />
              Bekor qilish
            </button>
            <button
              class="guide-pill-button guide-pill-button--dark max-md:justify-center"
              @click="saveEdit"
            >
              <UIcon
                name="i-lucide-check"
                class="size-5"
              />
              Saqlash
            </button>
          </div>
          <div
            v-else-if="isOwner"
            class="flex items-center gap-2"
          >
            <button
              class="guide-pill-button max-md:justify-center"
              @click="startEdit"
            >
              <UIcon
                name="i-lucide-pencil"
                class="size-5"
              />
              Redaktirovat
            </button>
            <button
              class="guide-pill-button max-md:justify-center text-red-500 hover:bg-red-50"
              @click="deleteConfirmOpen = true"
            >
              <UIcon
                name="i-lucide-trash-2"
                class="size-5"
              />
              O'chirish
            </button>
          </div>
          <button
            v-else
            class="guide-pill-button max-md:justify-center"
            @click="copyGuideLink"
          >
            <UIcon
              name="i-lucide-link"
              class="size-5"
            />
            Copy Link
          </button>
        </div>

        <!-- ── EDIT MODE ──────────────────────────────────── -->
        <div
          v-if="isEditing"
          class="flex flex-col gap-5 mb-8"
        >
          <!-- Title -->
          <div>
            <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Sarlavha</label>
            <input
              v-model="editTitle"
              type="text"
              class="w-full px-4 py-3 rounded-xl border border-cx-line bg-[#f7f5ef] text-[20px] font-extrabold text-[#1a1a1a] focus:outline-none focus:border-cx-blue focus:bg-white transition-colors"
            >
          </div>

          <!-- Desc -->
          <div>
            <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Tavsif</label>
            <textarea
              v-model="editDesc"
              rows="2"
              class="w-full px-4 py-3 rounded-xl border border-cx-line bg-[#f7f5ef] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-cx-blue focus:bg-white transition-colors resize-none leading-relaxed"
            />
          </div>

          <!-- Meta row: category + badge + free -->
          <div class="flex flex-col gap-4">
            <div>
              <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Kategoriya</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  class="guide-pill-button min-h-0! text-[16px]! px-5! py-2.5! transition-all"
                  :class="editCategory === cat ? 'guide-pill-button--dark' : ''"
                  @click="editCategory = cat"
                >
                  {{ cat }}
                </button>
              </div>
            </div>
            <div class="flex items-start gap-6 flex-wrap">
              <div>
                <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Badge</label>
                <input
                  v-model="editBadge"
                  type="text"
                  class="w-32 px-3 py-1.5 rounded-xl border border-cx-line bg-[#f7f5ef] text-[12px] text-cx-ink focus:outline-none focus:border-cx-blue transition-colors"
                >
              </div>
              <div>
                <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Kirish</label>
                <div class="flex gap-1.5">
                  <button
                    class="guide-pill-button min-h-0! text-[16px]! px-5! py-2.5! gap-2"
                    :class="editFree ? 'guide-pill-button--dark' : ''"
                    @click="editFree = true"
                  >
                    <UIcon
                      name="i-lucide-unlock"
                      class="size-4"
                    />
                    Bepul
                  </button>
                  <button
                    class="guide-pill-button min-h-0! text-[16px]! px-5! py-2.5! gap-2"
                    :class="!editFree ? 'guide-pill-button--dark' : ''"
                    @click="editFree = false"
                  >
                    <UIcon
                      name="i-lucide-lock"
                      class="size-4"
                    />
                    Obuna
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Daraja</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="opt in levelOptions"
                    :key="opt.label"
                    class="flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-[13px] font-semibold transition-all duration-150"
                    :class="editLevel === opt.label ? 'border-current' : 'border-cx-line bg-[#f7f5ef] text-cx-muted hover:border-[#c0c0bc]'"
                    :style="editLevel === opt.label ? { borderColor: opt.color, background: opt.color + '15', color: opt.color } : {}"
                    @click="editLevel = opt.label"
                  >
                    <UIcon
                      :name="opt.icon"
                      class="size-3.5 shrink-0"
                    />
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Teglar</label>
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="(tag, i) in editTags"
                :key="tag"
                class="guide-meta-chip gap-2"
              >
                {{ tag }}
                <button
                  class="text-cx-muted hover:text-red-400 transition-colors text-[16px] leading-none ml-1"
                  @click="editTags.splice(i, 1)"
                >×</button>
              </span>
              <span class="inline-flex items-center gap-1.5">
                <input
                  v-model="editTagInput"
                  type="text"
                  placeholder="Tag qo'shish..."
                  class="guide-meta-chip bg-[#f7f5ef] outline-none placeholder:text-cx-muted min-w-32 border-2 border-dashed border-cx-line focus:border-cx-blue transition-colors"
                  @keydown.enter.prevent="addEditTag"
                  @keydown="onEditTagKeydown"
                >
                <button
                  v-if="editTagInput.trim()"
                  class="guide-pill-button min-h-0! text-[13px]! px-3! py-2! guide-pill-button--dark"
                  @click="addEditTag"
                >
                  <UIcon
                    name="i-lucide-plus"
                    class="size-4"
                  />
                </button>
              </span>
            </div>
          </div>

          <!-- Visual -->
          <div class="flex items-center gap-5">
            <div>
              <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Fon</label>
              <div class="flex gap-1.5">
                <button
                  v-for="p in bgPresets"
                  :key="p.value"
                  class="size-7 rounded-full border-2 transition-all"
                  :style="{ backgroundColor: p.value }"
                  :class="editBg === p.value ? 'border-cx-blue scale-110' : 'border-[#d8d8d4] hover:scale-105'"
                  @click="editBg = p.value"
                />
              </div>
            </div>
            <div>
              <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Accent</label>
              <div class="relative">
                <input
                  v-model="editAccent"
                  type="color"
                  class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                >
                <div
                  class="size-7 rounded-xl border-2 border-cx-line cursor-pointer"
                  :style="{ backgroundColor: editAccent }"
                />
              </div>
            </div>
          </div>

          <!-- Image -->
          <div>
            <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Rasm</label>
            <div
              v-if="editImage"
              class="relative rounded-xl overflow-hidden border border-cx-line"
            >
              <img
                :src="editImage"
                alt="cover"
                class="w-full h-auto block"
              >
              <button
                class="absolute top-2 right-2 grid size-7 place-items-center rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                @click="removeImage"
              >
                <UIcon
                  name="i-lucide-x"
                  class="size-3.5"
                />
              </button>
            </div>
            <label
              v-else
              class="flex flex-col items-center justify-center gap-2.5 h-36 rounded-xl border-2 border-dashed border-cx-line bg-[#f7f5ef] hover:border-cx-blue hover:bg-cx-blue/10 transition-all cursor-pointer"
              :class="{ 'opacity-60 pointer-events-none': imageUploading }"
            >
              <input
                ref="imageInputRef"
                type="file"
                accept="image/*"
                class="sr-only"
                :disabled="imageUploading"
                @change="onImagePick"
              >
              <div class="grid size-10 place-items-center rounded-xl bg-cx-blue/10">
                <UIcon
                  :name="imageUploading ? 'i-lucide-loader-2' : 'i-lucide-image-plus'"
                  class="size-5 text-cx-blue"
                  :class="{ 'animate-spin': imageUploading }"
                />
              </div>
              <div class="text-center">
                <p class="text-[14px] font-semibold text-cx-ink">{{ imageUploading ? 'Yuklanmoqda...' : 'Rasm yuklash' }}</p>
                <p class="text-[12px] text-cx-muted mt-0.5">PNG, JPG</p>
              </div>
            </label>
            <p
              v-if="imageError"
              class="mt-2 text-[12px] text-red-500 font-semibold"
            >
              {{ imageError }}
            </p>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-[16px] font-bold text-cx-muted uppercase tracking-wider mb-2">Kontent</label>
            <ClientOnly>
              <GuidesEditor v-model="editContent" />
            </ClientOnly>
          </div>
        </div>

        <!-- Cover image -->
        <div
          v-if="guide.coverUrl && !coverError"
          class="mb-8 w-full aspect-video rounded-2xl overflow-hidden"
        >
          <img
            :src="guide.coverUrl"
            alt=""
            class="w-full h-full object-cover block"
            @error="coverError = true"
          >
        </div>

        <!-- Tags + access badge -->
        <div class="mb-5 flex flex-wrap items-center gap-2">
          <span
            v-for="tag in guide.tags"
            :key="tag"
            class="guide-meta-chip"
          >{{ tag }}</span>
          <span
            v-if="guide.isFree && !isMiniApp"
            class="guide-meta-chip"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              class="size-3"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            Bepul
          </span>
          <span
            v-else-if="hasSubscription"
            class="guide-meta-chip"
            style="background: #f0fdf4; color: #16a34a;"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              class="size-3"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            По подписке
          </span>
          <span
            v-else
            class="guide-meta-chip"
            style="background: #fef2f2; color: #ef4444;"
          >
            <UIcon
              name="i-lucide-lock-keyhole"
              class="size-3"
            />
            По подписке
          </span>
        </div>

        <!-- Title -->
        <h1 class="guide-detail-title">
          {{ guide.title }}
        </h1>

        <!-- Description -->
        <p class="guide-detail-desc">
          {{ guide.description }}
        </p>

        <!-- Paywall block -->
        <div
          v-if="!guide.isFree && !hasSubscription"
          class="flex flex-col items-center text-center py-12 px-8"
        >
          <div class="w-14 h-14 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-5">
            <UIcon
              name="i-lucide-lock"
              class="size-6 text-[#6f6f72]"
            />
          </div>
          <h2 class="text-[28px] font-extrabold text-[#1a1a1a] mb-2">
            Гайд доступен по подписке
          </h2>
          <p class="text-[17px] text-cx-muted leading-[1.6] max-w-[380px] mb-6">
            Оформите подписку AI Room Club, чтобы получить доступ к этому и другим материалам
          </p>
          <button
            class="hero-link-btn hero-link-btn--blue flex items-center justify-center px-8 py-[15px] text-[16px]"
            @click="isAccessModalOpen = true"
          >
            Оформить подписку
          </button>
        </div>

        <!-- Content block -->
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-else
          class="rich-content prose max-w-none text-[#14161f]"
          v-html="guide.content"
        />
        <!-- eslint-enable vue/no-v-html -->

        <section
          v-if="guide.isFree && !hasSubscription"
          class="mt-14 border-t border-cx-line pt-10"
        >
          <div class="rounded-[30px] border border-cx-line bg-[#f7f6f2] overflow-hidden">
            <div class="grid grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)] max-md:grid-cols-1">
              <div class="px-8 py-8 max-md:px-5 max-md:py-6">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-[#14161f]/8 px-3 py-1 text-[12px] font-semibold text-[#14161f]">
                  <UIcon
                    name="i-lucide-sparkles"
                    class="size-3.5"
                  />
                  Chayroom AI Club
                </div>

                <h2 class="max-w-[12ch] text-[34px] font-extrabold tracking-tight leading-[1.08] text-[#1a1a1a] max-md:max-w-none max-md:text-[28px]">
                  Qo'llanmadan keyingi amaliy bosqich shu yerda
                </h2>

                <p class="mt-4 max-w-[56ch] text-[17px] leading-[1.75] text-cx-muted max-md:text-[15px]">
                  Ichkarida kurslar, vosita tahlillari, yopiq chat va AI'ni har kuni ishida qo'llayotgan odamlar jamlangan. Bu yer nazariyani tezroq real natijaga aylantirish uchun yig'ilgan.
                </p>

                <ul class="mt-7 grid gap-4">
                  <li
                    v-for="feature in freeGuideCtaFeatures"
                    :key="feature.title"
                    class="flex items-start gap-3"
                  >
                    <div
                      class="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl"
                      :style="{ background: feature.bg }"
                    >
                      <UIcon
                        :name="feature.icon"
                        class="size-4.5"
                        :style="{ color: feature.color }"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="text-[15px] font-semibold text-[#1a1a1a]">
                        {{ feature.title }}
                      </p>
                      <p class="mt-1 text-[14px] leading-[1.6] text-cx-muted">
                        {{ feature.description }}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div class="flex flex-col justify-between border-l border-cx-line bg-[#f2f3ef] px-8 py-8 max-md:border-l-0 max-md:border-t max-md:px-5 max-md:py-6">
                <div>
                  <p class="text-[13px] font-semibold uppercase tracking-[0.08em] text-cx-muted">
                    To'liq kirish
                  </p>
                  <p class="mt-3 text-[18px] font-bold text-[#1a1a1a]">
                    Chayroom AI Club ichidagi barcha materiallarga bitta obuna bilan kirasiz
                  </p>

                  <div class="mt-6">
                    <div class="flex items-end gap-2 max-md:flex-wrap">
                      <span class="text-[46px] font-extrabold leading-none text-[#3480f1] max-md:text-[40px]">199.000</span>
                      <span class="pb-1 text-[16px] font-medium text-cx-muted">so'm / oyiga</span>
                    </div>
                    <p class="mt-2 text-[13px] leading-[1.6] text-cx-muted">
                      Yangi kurslar, qo'llanmalar va club ichidagi yangilanishlar shu obunaga kiradi.
                    </p>
                  </div>
                </div>

                <div class="mt-8 space-y-3">
                  <button
                    class="hero-link-btn hero-link-btn--blue flex w-full items-center justify-center px-5 py-3.5 text-[16px] max-md:w-full"
                    @click="isAccessModalOpen = true"
                  >
                    Club'ga qo'shilish
                    <UIcon
                      name="i-solar-alt-arrow-right-bold"
                      class="size-4.5"
                    />
                  </button>

                  <p class="text-center text-[13px] text-cx-muted">
                    Obuna faollashgach, shu qo'llanma va qolgan materiallar darhol ochiladi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />

    <Teleport to="body">
      <div
        v-if="deleteConfirmOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="deleteConfirmOpen = false"
      >
        <div class="bg-white rounded-2xl p-6 shadow-2xl w-[360px]">
          <div class="flex items-center gap-3 mb-3">
            <div class="grid size-10 place-items-center rounded-xl bg-red-50 text-red-500 shrink-0">
              <UIcon
                name="i-lucide-trash-2"
                class="size-5"
              />
            </div>
            <h3 class="text-[16px] font-bold text-cx-ink">
              Qo'llanmani o'chirish
            </h3>
          </div>
          <p class="text-[14px] text-cx-muted mb-6">
            Ushbu qo'llanma butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.
          </p>
          <div class="flex gap-2.5">
            <button
              class="flex-1 px-4 py-2.5 rounded-xl border border-cx-line text-[13px] font-semibold text-cx-muted hover:text-cx-ink transition-colors"
              @click="deleteConfirmOpen = false"
            >
              Bekor qilish
            </button>
            <button
              class="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              :disabled="deleting"
              @click="deleteGuide"
            >
              <UIcon
                v-if="deleting"
                name="i-lucide-loader-circle"
                class="size-4 animate-spin"
              />
              {{ deleting ? 'O\'chirilmoqda...' : 'O\'chirish' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.guide-detail {
  color: #14161f;
}

.guide-pill-button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 22px;
  border-radius: 999px;
  background: #f7f5ef;
  color: #14161f;
  font-family: var(--font-inter), 'Inter Fallback', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  transition: transform 0.2s ease, color 0.2s ease;
}

.guide-pill-button:hover {
  transform: scale(1.03);
  color: #3480f1;
}

.guide-pill-button--dark {
  background: #14161f;
  color: #fffdf9;
}

.guide-pill-button--dark:hover {
  color: #fffdf9;
  opacity: 0.88;
}

.guide-visual {
  width: 100%;
  overflow: hidden;
  border-radius: 28px;
  background: #f7f5ef;
}

.guide-visual svg {
  display: block;
  width: 100%;
  height: auto;
}

.guide-visual-line {
  fill: none;
  stroke: #050505;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.guide-visual-blue {
  fill: #3480f1;
}

.guide-visual-white {
  fill: none;
  stroke: #fffdf9;
  stroke-width: 7;
  stroke-linecap: round;
}

.guide-meta-chip {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 8px;
  background: #f7f5ef;
  color: #14161f;
  font-family: var(--font-inter), 'Inter Fallback', sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
}

.guide-detail-title {
  margin-bottom: 18px;
  color: #14161f;
  font-family: var(--font-inter-display);
  font-size: 48px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 52.8px;
}

.guide-detail-desc {
  max-width: 760px;
  margin-bottom: 26px;
  color: #252733;
  font-size: 22px;
  font-weight: 500;
  line-height: 32px;
}

@media (max-width: 734px) {
  .guide-detail-title {
    font-size: 28px;
    line-height: 30.8px;
    letter-spacing: -0.56px;
  }

  .guide-detail-desc {
    font-size: 20px;
    line-height: 28px;
  }

  .guide-visual {
    border-radius: 20px;
  }
}

/* ── Mini-app overrides ── */
.guide-detail--mini .guide-meta-chip {
  min-height: 24px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

.guide-detail--mini .guide-detail-title {
  font-size: 26px;
  line-height: 1.2;
  margin-bottom: 10px;
}

.guide-detail--mini .guide-detail-desc {
  font-size: 15px;
  font-weight: 400;
  line-height: 1.6;
  margin-bottom: 18px;
}

.guide-detail--mini .guide-content :deep(h2) {
  font-size: 20px;
  line-height: 1.25;
  margin: 22px 0 8px;
}

.guide-detail--mini .guide-content :deep(h3) {
  font-size: 17px;
  line-height: 1.3;
  margin: 18px 0 6px;
}

.guide-detail--mini .guide-content :deep(p),
.guide-detail--mini .guide-content :deep(li) {
  font-size: 15px;
  font-weight: 400;
  line-height: 1.65;
}

.guide-detail--mini .guide-content :deep(p) {
  margin-bottom: 14px;
}

.guide-detail--mini .guide-content :deep(ul),
.guide-detail--mini .guide-content :deep(ol) {
  margin-bottom: 14px;
  padding-left: 20px;
}

.guide-detail--mini .guide-content :deep(code) {
  font-size: 13px;
}

.guide-detail--mini .guide-content :deep(pre) {
  font-size: 13px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.guide-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  margin: 8px 0 24px;
}

.guide-detail--mini .guide-content :deep(img) {
  width: 100%;
  border-radius: 12px;
}
</style>
