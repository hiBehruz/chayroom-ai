<script setup lang="ts">
const authStore = useAuthStore()

const LEVEL_COLORS: Record<string, string> = {
  'Yangi boshlagan': '#10b981',
  "O'rta": '#f59e0b',
  'Tajribali': '#8b5cf6',
  'Professional': '#8b5cf6',
}
const LEVEL_ICONS: Record<string, string> = {
  'Yangi boshlagan': 'i-lucide-sprout',
  "O'rta": 'i-lucide-bar-chart-2',
  'Tajribali': 'i-lucide-flame',
  'Professional': 'i-lucide-rocket',
}
function levelColor(l: string | null) { return LEVEL_COLORS[l ?? ''] ?? '#3480f1' }
function levelIcon(l: string | null) { return LEVEL_ICONS[l ?? ''] ?? 'i-lucide-award' }
function levelLabel(l: string | null) {
  if (l === 'Yangi boshlagan') return "Boshlangich"
  if (l === "O'rta") return "O'rta daraja"
  if (l === 'Tajribali' || l === 'Professional') return "Pro"
  return l ?? "Boshlangich"
}
const isOwner = computed(() => authStore.isOwner)

const categories = [
  { label: 'Все', value: 'all', icon: 'i-lucide-layout-grid', color: '' },
  { label: 'Claude', value: 'vibe-coding', icon: 'i-simple-icons-claude', color: '#6366f1' },
  { label: 'ChatGPT', value: 'ai-agents', icon: 'i-simple-icons-openai', color: '#f97316' },
  { label: 'AI-agentlar', value: 'neural-networks', icon: 'i-solar-atom-bold', color: '#22c55e' },
  { label: 'Kontent', value: 'content', icon: 'i-solar-pen-new-round-bold', color: '#ec4899' }
]
const activeCategory = ref('all')

function selectCategory(category: string) {
  activeCategory.value = category
}

function guideTrack(guide: { category: string | null, tags?: string[] | null }) {
  const category = guide.category ?? ''
  if (category === 'Claude' || category === 'Vibe coding') return 'Claude'
  if (category === 'ChatGPT' || category === 'AI agentlar') return 'ChatGPT'
  if (category === 'AI-agentlar' || category === 'Neyrotarmoqlar') return 'AI-agentlar'
  const tagText = (guide.tags ?? []).join(' ').toLowerCase()
  if (tagText.includes('claude')) return 'Claude'
  if (tagText.includes('chatgpt')) return 'ChatGPT'
  return 'Kontent'
}
function guideTrackIcon(guide: { category: string | null, tags?: string[] | null }) {
  const track = guideTrack(guide)
  if (track === 'Claude') return 'i-simple-icons-claude'
  if (track === 'ChatGPT') return 'i-simple-icons-openai'
  return 'i-solar-tag-bold'
}


const { isMiniApp } = useTelegramApp()

const guidesStore = useGuidesStore()
onMounted(() => guidesStore.fetch())

const filtered = computed(() => {
  const all = guidesStore.guides
  if (activeCategory.value === 'all') return all
  if (activeCategory.value === 'vibe-coding') {
    return all.filter(g => g.category === 'Claude' || g.category === 'Vibe coding')
  }
  if (activeCategory.value === 'ai-agents') {
    return all.filter(g => g.category === 'ChatGPT' || g.category === 'AI agentlar')
  }
  if (activeCategory.value === 'neural-networks') {
    return all.filter(g => g.category === 'AI-agentlar' || g.category === 'Neyrotarmoqlar')
  }
  return all.filter(g => g.category === 'Kontent' || g.category === 'Content')
})

useSeoMeta({ title: 'Qo\'llanmalar — Chayroom AI' })
</script>

<template>
  <!-- ── MINI-APP layout ── -->
  <div v-if="isMiniApp" style="background:#efefef; min-height:100vh">
    <div class="w-full">

      <!-- Header -->
      <div class="px-4 pt-7 pb-4">
        <h1 class="text-[26px] font-black tracking-tight leading-tight" style="color:#14161f">Qo'llanmalar</h1>
        <p class="text-[14px] mt-1" style="color:#70707a">Amaliy qo'llanmalar va bosqichma-bosqich ko'rsatmalar.</p>
      </div>

      <!-- Category pills -->
      <div class="flex gap-2 px-4 pb-4 overflow-x-auto" style="scrollbar-width:none">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="flex-none px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-150 active:scale-95 whitespace-nowrap"
          :style="activeCategory === cat.value
            ? 'background:#3480f1; color:#ffffff'
            : 'background:#ffffff; color:#14161f; border:1px solid #e8e6e0'"
          @click="selectCategory(cat.value)"
        >{{ cat.label }}</button>
      </div>

      <!-- Guide list -->
      <div class="px-4 space-y-2.5">
        <NuxtLink
          v-for="guide in filtered"
          :key="guide.slug"
          :to="'/guides/' + guide.slug"
          class="flex items-center gap-3 p-3 rounded-2xl active:opacity-70 transition-opacity"
          style="background:#ffffff; border:1px solid #e8e6e0"
        >
          <!-- Thumbnail -->
          <div
            class="flex-none rounded-xl overflow-hidden"
            style="width:72px; height:72px"
            :style="{
              backgroundColor: guide.bg || '#e8e8f0',
              backgroundImage: guide.coverUrl ? `url(${guide.coverUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }"
          />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-[14px] font-bold leading-snug mb-1 line-clamp-2" style="color:#14161f">{{ guide.title }}</h3>
            <p class="text-[12px] leading-snug line-clamp-2 mb-2" style="color:#70707a">{{ guide.description }}</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in (guide.tags || []).slice(0, 2)"
                :key="tag"
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style="background:#f0ede8; color:#70707a"
              >{{ tag }}</span>
            </div>
          </div>

          <!-- Arrow -->
          <svg class="flex-none" width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M1 1l6 6-6 6" stroke="#c0c0c8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </NuxtLink>

        <div v-if="!filtered.length" class="py-12 text-center">
          <p class="text-[15px] font-semibold" style="color:#a0a0a8">Bu kategoriyada qo'llanmalar hali yo'q</p>
        </div>
      </div>

    </div>
  </div>

  <!-- ── DESKTOP layout ── -->
  <div v-else class="guides-page min-h-screen bg-[var(--bg)]">
    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 pb-20 pt-0 max-md:w-full max-md:max-w-none max-md:mx-0 max-md:px-0 max-md:pt-0">
      <section class="guides-hero relative mx-auto flex max-w-310 flex-col items-center justify-center overflow-hidden text-center py-10 border-b border-[#e8e6e1] max-md:pt-5 max-md:pb-4 max-md:px-6 max-md:border-none">
        <h1 class="guides-title relative z-10 text-(--text) text-[48px]! leading-[52.8px]! tracking-[-0.96px]! max-[734px]:text-[28px]! max-[734px]:leading-[30.8px]! max-[734px]:tracking-[-0.56px]!">
          <span class="relative inline-block pb-2 max-md:pb-0">
            Qo'llanmalar
            <svg class="absolute -bottom-1 left-[-3%] w-[106%] overflow-visible" viewBox="0 0 600 18" preserveAspectRatio="none" fill="none" aria-hidden="true">
              <path d="M10,12 C150,2 450,2 590,12" stroke="#3480f1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="vector-effect:non-scaling-stroke"/>
            </svg>
          </span>
        </h1>
      </section>

      <div
        :class="[
          'mt-10 mb-14 flex items-center gap-2 max-md:mt-4 max-md:mb-6 max-md:w-full max-md:overflow-x-auto max-md:px-4 max-md:gap-1 max-md:justify-start scrollbar-none',
          isOwner ? 'justify-between' : 'justify-center'
        ]"
      >
        <div class="inline-flex shrink-0 items-center gap-2 whitespace-nowrap max-md:gap-1">
          <button
            v-for="cat in categories"
            :key="cat.label"
            :class="[
              'guides-filter-button inline-flex items-center gap-2 rounded-full text-[18px] font-semibold transition-all duration-200',
              activeCategory === cat.value
                ? 'bg-[#14161f] text-[#fffdf9]'
                : 'bg-[#f7f5ef] text-[#14161f] hover:bg-[#eceae4]'
            ]"
            @click="selectCategory(cat.value)"
          >
            <UIcon v-if="cat.icon && cat.value !== 'all'" :name="cat.icon" class="guides-filter-icon size-5 max-md:size-4" />
            {{ cat.label }}
          </button>
        </div>

        <NuxtLink
          v-if="isOwner"
          to="/admin/guides/new"
          class="guides-add-button inline-flex shrink-0 items-center gap-2"
        >
          <UIcon
            name="i-lucide-plus"
            class="size-4"
          />
          Qo'llanma qo'shish
        </NuxtLink>
      </div>

      <TransitionGroup
        v-if="filtered.length"
        tag="div"
        enter-active-class="transition-[opacity,transform] duration-100 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="hidden"
        class="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3 max-md:gap-6 max-md:px-4"
      >
        <article
          v-for="guide in filtered"
          :key="guide.slug"
          class="guide-card group cursor-pointer"
          @click="navigateTo('/guides/' + guide.slug)"
        >
          <div
            :class="[
              'guide-preview relative overflow-hidden rounded-[28px] max-[734px]:rounded-[20px]',
              guide.bg === '#f5ede0' ? 'guide-preview-light' : ''
            ]"
            :style="{ backgroundColor: guide.bg ?? undefined }"
          >
            <button
              v-if="isOwner"
              class="absolute right-5 top-5 z-20 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
              @click.stop="navigateTo('/admin/guides/edit/' + guide.slug)"
            >
              <UIcon
                name="i-lucide-pencil"
                class="size-4"
              />
            </button>

            <img
              v-if="guide.coverUrl"
              :src="guide.coverUrl"
              class="absolute inset-0 w-full h-full object-cover block"
              alt=""
            />

            <div v-if="!guide.coverUrl" class="guide-card-art absolute inset-0">
              <span class="guide-art-star guide-art-star-1" />
              <span class="guide-art-star guide-art-star-2" />
              <span class="guide-art-line guide-art-line-1" />
              <span class="guide-art-line guide-art-line-2" />
              <span class="guide-art-orbit" />
              <span
                class="guide-art-object"
                :style="{ backgroundColor: guide.accent ?? undefined }"
              />
              <span class="guide-art-hand" />
            </div>

          </div>

          <div class="guide-card-body px-2 pt-6 max-md:px-0 max-md:pt-3">
            <div class="mb-3 flex flex-wrap items-center gap-1.5 max-md:gap-1 max-md:mb-1.5">
              <span
                class="guide-meta-chip inline-flex items-center gap-1.5 whitespace-nowrap rounded-md max-md:text-[14px] max-md:leading-5"
                :style="{ background: levelColor(guide.level) + '20', color: levelColor(guide.level) }"
              >
                {{ levelLabel(guide.level) }}
              </span>
              <span class="guide-meta-chip inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-[#f7f5ef] text-[#14161f] max-md:text-[14px] max-md:leading-5">
                <UIcon :name="guideTrackIcon(guide)" class="size-4 shrink-0" />
                {{ guideTrack(guide) }}
              </span>
              <span v-if="guide.isFree" class="guide-meta-chip inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[#86efac] bg-[#f0fdf4] text-[#16a34a]">
                <svg class="size-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Bepul
              </span>
              <span v-else class="guide-meta-chip inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-red-200 bg-red-50 text-red-500">
                <UIcon name="i-lucide-lock" class="size-3.5 shrink-0" />
                По подписке
              </span>
            </div>

            <h2 class="line-clamp-2 text-[24px] font-semibold leading-[28px] text-[#14161f] max-md:text-[18px] max-md:leading-6">
              {{ guide.title }}
            </h2>
          </div>
        </article>
      </TransitionGroup>

      <div
        v-else
        class="flex min-h-105 flex-col items-center justify-center gap-3 text-cx-muted max-md:px-4"
      >
        <div class="grid size-16 place-items-center rounded-2xl bg-[#1a1a1a]">
          <UIcon name="i-solar-document-text-bold" class="size-8 text-white" />
        </div>
        <p class="text-[18px] font-semibold text-[#1a1a1a]">Bu kategoriyada qo'llanmalar hali yo'q</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guides-title {
  font-family: var(--font-inter-display), 'Inter Display', sans-serif;
  font-weight: 600;
  font-size: 60px;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.guides-filter-button {
  padding: 11px 18px 13px;
  font-family: var(--font-inter), 'Inter Fallback', sans-serif;
  line-height: 1;
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.guides-filter-button:hover {
  transform: scale(1.04);
}

@media (max-width: 734px) {
  .guides-filter-button {
    padding: 6px 16px;
    font-size: 15px;
    line-height: 24px;
    gap: 4px;
  }
}

.guides-filter-button .guides-filter-icon {
  color: inherit;
}

.guides-add-button {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: #14161f;
  color: #fffdf9;
  font-family: var(--font-inter), 'Inter Fallback', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  transform-origin: center;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.guides-add-button:hover {
  transform: scale(1.04);
  opacity: 0.92;
}

.guides-doodle {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.guides-doodle svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.guides-doodle-mic {
  left: 0;
  top: 30%;
  width: 120px;
  height: 96px;
  transform: rotate(-8deg);
}

.guides-doodle-pen {
  right: 0;
  top: 20%;
  width: 115px;
  height: 125px;
  transform: rotate(5deg);
}

.doodle-fill-blue {
  fill: #3480f1;
}

.doodle-fill-dark {
  fill: #3480f1;
}

.doodle-stroke,
.doodle-stroke-dark {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.doodle-stroke {
  stroke: #3480f1;
  stroke-width: 6;
}

.doodle-stroke-dark {
  stroke: #3480f1;
  stroke-width: 6;
}

.guides-star,
.guide-art-star {
  position: absolute;
  display: block;
  width: 36px;
  aspect-ratio: 1;
  background: currentColor;
  clip-path: polygon(50% 0, 62% 36%, 100% 50%, 62% 64%, 50% 100%, 38% 64%, 0 50%, 38% 36%);
}

.guides-star-1 {
  left: 10%;
  top: 52%;
  width: 44px;
  color: #3480f1;
}

.guides-star-2 {
  left: 9%;
  top: 18%;
  width: 20px;
  color: #3480f1;
}

.guides-star-3 {
  right: 9%;
  top: 16%;
  width: 46px;
  color: #3480f1;
}

.guides-underline {
  position: relative;
  z-index: 2;
  margin-top: 32px;
  width: min(280px, 40vw);
  height: 36px;
}

.guide-card {
  width: 100%;
  max-width: 397px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  transform-origin: center top;
  transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (max-width: 734px) {
  .guide-card {
    width: 100%;
    max-width: 370px;
    padding: 0 4px;
    margin-left: auto;
    margin-right: auto;
  }
}

.guide-card:hover {
  transform: translateY(-7px) scale(1.025);
}

.guide-preview {
  box-shadow: none;
  transition: box-shadow 0.32s ease;
  overflow: clip;
  border-radius: 28px;
  isolation: isolate;
  flex-shrink: 0;
  aspect-ratio: 16 / 9;
}


@media (max-width: 734px) {
  .guide-preview {
    border-radius: 20px;
  }
}

.guide-card:hover .guide-preview {
  box-shadow: none;
}

.guide-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.guide-card-desc {
  flex: 1;
}

.guide-card-actions {
  margin-top: auto;
  padding-top: 16px;
}

.guide-meta-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 10px;
  font-family: var(--font-inter), 'Inter Fallback', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

@media (max-width: 734px) {
  .guide-meta-chip {
    font-size: 14px;
    line-height: 20px;
    gap: 4px;
  }
}

.guide-card-art {
  color: var(--bg);
}

.guide-art-object {
  position: absolute;
  left: 47%;
  top: 38%;
  width: 92px;
  height: 92px;
  border-radius: 26px;
  transform: rotate(45deg);
  box-shadow: inset 0 0 0 8px rgba(255, 253, 249, 0.88);
}

.guide-art-orbit {
  position: absolute;
  left: 22%;
  top: 18%;
  width: 46%;
  height: 58%;
  border: 6px solid currentColor;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-radius: 9999px;
  transform: rotate(-20deg);
}

.guide-art-hand {
  position: absolute;
  right: -6%;
  bottom: -32%;
  width: 52%;
  height: 62%;
  border-radius: 52% 48% 0 0;
  background: var(--text);
  transform: rotate(-18deg);
}

.guide-art-line {
  position: absolute;
  display: block;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
}

.guide-art-line-1 {
  left: 18%;
  top: 30%;
  width: 28%;
  transform: rotate(-28deg);
}

.guide-art-line-2 {
  right: 18%;
  bottom: 28%;
  width: 30%;
  transform: rotate(15deg);
}

.guide-art-star-1 {
  left: 18%;
  bottom: 28%;
  width: 34px;
  color: currentColor;
}

.guide-art-star-2 {
  right: 20%;
  top: 18%;
  width: 28px;
  color: currentColor;
}

.guide-preview-light .guide-card-art {
  color: var(--text);
}

.guide-preview-light .guide-art-hand {
  background: transparent;
  border: 7px solid var(--text);
  border-bottom: 0;
}

@media (max-width: 768px) {
  .guides-doodle-mic {
    left: 2%;
    top: 14%;
    width: 64px;
    height: 94px;
    opacity: 0.72;
  }

  .guides-doodle-pen {
    right: 2%;
    top: 18%;
    width: 84px;
    height: 76px;
    opacity: 0.62;
  }

  .guides-star-1 {
    left: 3%;
    top: 52%;
    width: 30px;
  }

  .guides-star-2 {
    display: none;
  }

  .guides-star-3 {
    right: 6%;
    top: 52%;
    width: 32px;
  }
}
</style>
