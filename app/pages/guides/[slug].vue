<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const guidesStore = useGuidesStore()
const hasSubscription = computed(() => authStore.hasSubscription)
const isOwner = computed(() => authStore.isOwner)
const isAccessModalOpen = ref(false)
const freeGuideCtaFeatures = [
  'Все курсы и гайды',
  'Закрытый Telegram-чат',
  'Эфиры и нетворкинг'
]

onMounted(() => guidesStore.load())

const guide = computed(() => guidesStore.all.find(g => g.slug === (route.params.slug as string)))

if (!guide.value && import.meta.client) {
  throw createError({ statusCode: 404, statusMessage: "Qo'llanma topilmadi" })
}

// ── Inline edit ───────────────────────────────────────────
const isEditing = ref(false)
const editTitle = ref('')
const editDesc = ref('')
const editContent = ref('')
const editBadge = ref('')
const editFree = ref(false)
const editTags = ref<string[]>([])
const editTagInput = ref('')
const editBg = ref('')
const editAccent = ref('')
const editCategory = ref('')

const bgPresets = [
  { label: 'Sariq', value: '#f5ede0', dark: false },
  { label: 'Moviy', value: '#f0f4ff', dark: false },
  { label: 'Yashil', value: '#f0fdf4', dark: false },
  { label: 'Qora', value: '#111111', dark: true },
  { label: "To'q ko'k", value: '#0d1117', dark: true },
  { label: "To'q yashil", value: '#0d1f1a', dark: true },
]
const categories = ['Vibe coding', 'AI agentlar', 'Neyrotarmoqlar', 'Kontent']

function startEdit() {
  const g = guide.value
  if (!g) return
  editTitle.value = g.title
  editDesc.value = g.desc
  editContent.value = g.content
  editBadge.value = g.badge
  editFree.value = g.free
  editTags.value = [...g.tags]
  editBg.value = g.bg
  editAccent.value = g.accent
  editCategory.value = g.category
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

function saveEdit() {
  const g = guide.value
  if (!g) return
  guidesStore.updateGuide(g.slug, {
    title: editTitle.value.trim(),
    desc: editDesc.value.trim(),
    content: editContent.value,
    badge: editBadge.value,
    free: editFree.value,
    tags: editTags.value,
    bg: editBg.value,
    accent: editAccent.value,
    category: editCategory.value,
  })
  isEditing.value = false
}

function addEditTag() {
  const t = editTagInput.value.trim()
  if (t && !editTags.value.includes(t)) editTags.value.push(t)
  editTagInput.value = ''
}

useSeoMeta({ title: computed(() => `${guide.value?.title ?? "Qo'llanma"} — Chayroom AI`) })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6 max-w-180 mx-auto">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <NuxtLink to="/guides" class="hover:text-cx-ink transition-colors">Qo'llanmalar</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium truncate max-w-80">{{ guide?.title }}</span>
      </div>

      <div v-if="guide" class="max-w-180 mx-auto">

        <!-- Owner edit bar -->
        <div v-if="isOwner" class="flex items-center justify-end gap-2 mb-5">
          <template v-if="!isEditing">
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-xl border border-cx-line bg-[#f7f7f5] text-[13px] font-semibold text-cx-muted hover:border-cx-blue hover:text-cx-blue transition-colors"
              @click="startEdit"
            >
              <UIcon name="i-lucide-pencil" class="size-3.5" />
              Redaktirovat
            </button>
          </template>
          <template v-else>
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-xl border border-cx-line bg-white text-[13px] font-semibold text-cx-muted hover:text-cx-ink transition-colors"
              @click="cancelEdit"
            >
              <UIcon name="i-lucide-x" class="size-3.5" />
              Bekor qilish
            </button>
            <button
              class="btn-primary btn-primary-dark flex items-center gap-2 px-4! py-2! text-[13px]!"
              @click="saveEdit"
            >
              <UIcon name="i-lucide-check" class="size-3.5" />
              Saqlash
            </button>
          </template>
        </div>

        <!-- ── EDIT MODE ──────────────────────────────────── -->
        <div v-if="isEditing" class="flex flex-col gap-5 mb-8">

          <!-- Title -->
          <div>
            <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Sarlavha</label>
            <input
              v-model="editTitle"
              type="text"
              class="w-full px-4 py-3 rounded-xl border border-cx-line bg-[#fafafa] text-[20px] font-extrabold text-[#1a1a1a] focus:outline-none focus:border-cx-blue focus:bg-white transition-colors"
            />
          </div>

          <!-- Desc -->
          <div>
            <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Tavsif</label>
            <textarea
              v-model="editDesc"
              rows="2"
              class="w-full px-4 py-3 rounded-xl border border-cx-line bg-[#fafafa] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-cx-blue focus:bg-white transition-colors resize-none leading-relaxed"
            />
          </div>

          <!-- Meta row: category + badge + free -->
          <div class="flex flex-wrap items-start gap-6">
            <div>
              <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Kategoriya</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  class="px-3 py-1.5 rounded-xl border-2 text-[11px] font-semibold transition-all"
                  :class="editCategory === cat ? 'border-cx-blue bg-[#eef5ff] text-cx-blue' : 'border-cx-line bg-white text-cx-muted hover:border-[#c0c0bc]'"
                  @click="editCategory = cat"
                >{{ cat }}</button>
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Badge</label>
              <input
                v-model="editBadge"
                type="text"
                class="w-32 px-3 py-1.5 rounded-xl border border-cx-line bg-[#fafafa] text-[12px] text-cx-ink focus:outline-none focus:border-cx-blue transition-colors"
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Kirish</label>
              <div class="flex gap-1.5">
                <button
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-[11px] font-semibold transition-all"
                  :class="editFree ? 'border-green-500 bg-green-50 text-green-600' : 'border-cx-line bg-white text-cx-muted hover:border-[#c0c0bc]'"
                  @click="editFree = true"
                >
                  <UIcon name="i-lucide-unlock" class="size-3" /> Bepul
                </button>
                <button
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-[11px] font-semibold transition-all"
                  :class="!editFree ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-cx-line bg-white text-cx-muted hover:border-[#c0c0bc]'"
                  @click="editFree = false"
                >
                  <UIcon name="i-lucide-lock" class="size-3" /> Obuna
                </button>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Teglar</label>
            <div class="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border border-cx-line bg-[#fafafa] min-h-10">
              <span
                v-for="(tag, i) in editTags"
                :key="tag"
                class="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eef5ff] border border-[#c7deff] text-[11px] font-semibold text-cx-blue"
              >
                {{ tag }}
                <button class="hover:text-red-400 transition-colors" @click="editTags.splice(i, 1)">×</button>
              </span>
              <input
                v-model="editTagInput"
                type="text"
                placeholder="Tag qo'shish (Enter)..."
                class="flex-1 min-w-20 text-[12px] bg-transparent outline-none placeholder:text-cx-faint"
                @keydown.enter.prevent="addEditTag"
                @keydown.comma.prevent="addEditTag"
              />
            </div>
          </div>

          <!-- Visual -->
          <div class="flex items-center gap-5">
            <div>
              <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Fon</label>
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
              <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Accent</label>
              <div class="relative">
                <input v-model="editAccent" type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                <div class="size-7 rounded-xl border-2 border-cx-line cursor-pointer" :style="{ backgroundColor: editAccent }" />
              </div>
            </div>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-[11px] font-bold text-cx-muted uppercase tracking-wider mb-2">Kontent (HTML)</label>
            <textarea
              v-model="editContent"
              rows="14"
              class="w-full px-4 py-3.5 rounded-xl border border-cx-line bg-[#fafafa] text-[12px] font-mono text-[#1a1a1a] focus:outline-none focus:border-cx-blue focus:bg-white transition-colors resize-none leading-relaxed"
            />
          </div>

        </div>

        <!-- Tags + access badge -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span
            v-for="tag in guide.tags"
            :key="tag"
            class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
          >{{ tag }}</span>
          <span v-if="guide.free" class="text-xs font-medium text-green-600 flex items-center gap-1">
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
          <span v-else-if="hasSubscription" class="text-xs font-medium text-green-600 flex items-center gap-1">
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
            Доступно по подписке
          </span>
          <span v-else class="text-xs font-medium text-red-500 flex items-center gap-1">
            <UIcon name="i-lucide-lock-keyhole" class="size-3" />
            По подписке
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-[30px] font-extrabold tracking-tight text-[#1a1a1a] leading-[1.2] mb-3">
          {{ guide.title }}
        </h1>

        <!-- Description -->
        <p class="text-[16px] text-cx-muted leading-[1.6] mb-8">
          {{ guide.desc }}
        </p>

        <!-- Paywall block -->
        <div v-if="!guide.free && !hasSubscription" class="flex flex-col items-center text-center py-12 px-8">
          <div class="w-14 h-14 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-5">
            <UIcon name="i-lucide-lock" class="size-6 text-[#6f6f72]" />
          </div>
          <h2 class="text-[20px] font-extrabold text-[#1a1a1a] mb-2">
            Гайд доступен по подписке
          </h2>
          <p class="text-[14px] text-cx-muted leading-[1.6] max-w-[340px] mb-6">
            Оформите подписку AI Room Club, чтобы получить доступ к этому и другим материалам
          </p>
          <button
            class="btn-primary btn-primary-dark px-8 py-3 text-[15px]! mb-3"
            @click="isAccessModalOpen = true"
          >
            Оформить подписку
          </button>
          <NuxtLink to="/login" class="text-[13px] text-cx-muted hover:text-cx-ink transition-colors">
            Уже есть подписка? Войти
          </NuxtLink>
        </div>

        <!-- Content block -->
        <div
          v-else
          class="prose prose-sm max-w-none text-[#1a1a1a] [&_h2]:text-[20px] [&_h2]:font-extrabold [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_p]:text-[14px] [&_p]:leading-[1.7] [&_p]:mb-3 [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:text-[14px] [&_li]:leading-[1.7] [&_li]:mb-1 [&_code]:bg-[#f0f0f0] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_pre]:bg-[#1a1a1a] [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-4"
          v-html="guide.content"
        />

        <section v-if="guide.free && !hasSubscription" class="mt-12 border-t border-cx-line pt-10 text-center">
          <div class="mb-12">
            <h2 class="text-[32px] font-extrabold tracking-tight text-[#1a1a1a] leading-tight mb-4">
              Готовы перейти от теории к практике?
            </h2>
            <p class="max-w-[620px] mx-auto text-[18px] text-cx-muted leading-[1.75]">
              Внутри AI Room Club вас ждут курсы, разборы инструментов, закрытый чат и сообщество людей, которые уже применяют AI каждый день.
            </p>
          </div>

          <div class="w-full max-w-[448px] min-h-[316px] mx-auto rounded-[28px] bg-[#f7f7f5] p-8 text-center">
            <div class="text-[18px] font-extrabold text-[#1a1a1a] mb-5">
              Полный доступ в AI Room Club
            </div>

            <div class="max-w-[310px] mx-auto flex items-baseline justify-center gap-2 mb-5 whitespace-nowrap">
              <span class="guide-price-amount text-[44px] font-extrabold leading-none">199.000</span>
              <span class="text-[16px] font-medium text-cx-muted">so'm/oyiga</span>
            </div>

            <button
              class="btn-primary btn-primary-dark w-full max-w-[310px] mx-auto px-5! py-3.5! text-[16px]! mb-6"
              @click="isAccessModalOpen = true"
            >
              Вступить в сообщество
              <UIcon name="i-lucide-arrow-right" class="ml-3 size-5 align-[-3px]" />
            </button>

            <ul class="max-w-[310px] mx-auto flex flex-col gap-2.5 text-left">
              <li
                v-for="feature in freeGuideCtaFeatures"
                :key="feature"
                class="flex items-center gap-3 text-[15px] text-[#33415a]"
              >
                <svg
                  class="w-4 h-4 text-green-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
  </div>
</template>

<style scoped>
.guide-price-amount {
  display: inline-block;
  background:
    linear-gradient(128deg, #b9ecff 0%, #008cff 10%, #0a64d8 28%, #0642a7 52%, #062b78 76%, #020f3f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow:
    0 1px 0 rgba(255,255,255,0.22),
    0 14px 30px rgba(0, 63, 150, 0.22);
  filter: drop-shadow(0 2px 0 rgba(1, 32, 92, 0.12));
}
</style>
