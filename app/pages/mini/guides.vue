<script setup lang="ts">
import type { Guide } from '~/stores/guides'

const router = useRouter()

const { data: allGuides, pending } = useAsyncData('mini-guides', () => $fetch<Guide[]>('/api/guides'))

const chips = [
  { label: 'Hammasi', value: 'all', icon: null },
  { label: 'Vibe coding', value: 'vibe-coding', icon: 'i-solar-code-circle-bold' },
  { label: 'AI-agentlar', value: 'ai-agents', icon: 'i-solar-command-bold' },
  { label: 'Neyrolar', value: 'neural', icon: 'i-solar-atom-bold' },
  { label: 'Claude', value: 'claude', icon: 'i-ph-robot-bold' }
]

const activeChip = ref('all')
const filterRef = ref<HTMLElement | null>(null)
const chipRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref({ left: '0px', width: '0px', opacity: '0' })

function updateIndicator() {
  const index = chips.findIndex(chip => chip.value === activeChip.value)
  const btn = chipRefs.value[index]
  const filter = filterRef.value

  if (!btn || !filter) return

  const btnRect = btn.getBoundingClientRect()
  const filterRect = filter.getBoundingClientRect()

  indicatorStyle.value = {
    left: `${btnRect.left - filterRect.left + filter.scrollLeft}px`,
    width: `${btnRect.width}px`,
    opacity: '1'
  }
}

function selectChip(value: string) {
  activeChip.value = value
  nextTick(() => {
    updateIndicator()
    requestAnimationFrame(updateIndicator)
  })
}

function formatGuideDate(date: string | null) {
  if (!date) return 'Yangi'

  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date))
}

function cardBg(guide: Guide) {
  return guide.bg || '#f3efe7'
}

const guides = computed(() => allGuides.value ?? [])

onMounted(() => {
  nextTick(() => {
    updateIndicator()
    requestAnimationFrame(updateIndicator)
  })
  document.fonts?.ready.then(updateIndicator)
})

useSeoMeta({ title: 'Qo\'llanmalar' })
</script>

<template>
  <div style="background:#fffdf9;min-height:100vh;font-family:inherit">
    <div style="padding:18px 18px 28px">
      <div class="mb-4 flex items-center gap-3">
        <button
          class="inline-flex flex-none items-center justify-center tg-press-sm"
          style="width:40px;height:40px;border-radius:999px;background:#f4efe6;border:none"
          @click="router.back()"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0f1115"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <div>
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9aa0a8">
            Mini-app
          </p>
          <h1 style="margin:2px 0 0;font-size:30px;font-weight:800;letter-spacing:-0.04em;line-height:1;color:#0f1115">
            Qo'llanmalar
          </h1>
        </div>
      </div>

      <div class="mb-5">
        <p style="margin:0;max-width:280px;font-size:15px;line-height:1.55;color:#6b7280;font-weight:500">
          Amaliy qo'llanmalar, bosqichma-bosqich yo'riqnomalar va ishga tez kirish uchun materiallar.
        </p>
      </div>

      <div
        class="overflow-x-auto"
        style="padding-bottom:18px;scrollbar-width:none"
      >
        <div
          ref="filterRef"
          class="relative inline-flex items-center gap-2 whitespace-nowrap"
        >
          <span
            class="pointer-events-none absolute inset-y-0 rounded-full bg-[#262831]"
            style="transition:left 250ms cubic-bezier(0.23,1,0.32,1),width 250ms cubic-bezier(0.23,1,0.32,1),opacity 150ms ease"
            :style="indicatorStyle"
          />
          <button
            v-for="(chip, i) in chips"
            :key="chip.value"
            :ref="el => { if (el) chipRefs[i] = el as HTMLElement }"
            class="relative z-10 inline-flex flex-none items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-[color] duration-150 active:scale-95"
            :style="activeChip === chip.value ? 'color:#fffdf9;background:transparent' : 'color:#262831;background:#f4efe6'"
            @click="selectChip(chip.value)"
          >
            <UIcon
              v-if="chip.icon"
              :name="chip.icon"
              class="size-4"
            />
            {{ chip.label }}
          </button>
        </div>
      </div>

      <div
        v-if="pending"
        class="flex flex-col gap-4"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="flex items-center gap-3"
          style="border-radius:24px;background:#ffffff;border:1px solid #e8e6e0;padding:12px"
        >
          <div
            class="skeleton"
            style="width:72px;height:72px;border-radius:16px"
          />
          <div class="min-w-0 flex-1">
            <div
              class="skeleton mb-3"
              style="height:18px;width:82%;border-radius:10px"
            />
            <div
              class="flex gap-2"
            />
            <div
              class="skeleton inline-block"
              style="height:22px;width:54px;border-radius:999px"
            />
            <div
              class="skeleton inline-block"
              style="height:22px;width:72px;border-radius:999px"
            />
          </div>
          <div
            class="skeleton shrink-0"
            style="width:8px;height:14px;border-radius:4px"
          />
        </div>
      </div>

      <div
        v-else
        class="space-y-2.5"
      >
        <NuxtLink
          v-for="(guide, i) in guides"
          :key="guide.slug"
          :to="`/guides/${guide.slug}`"
          class="tg-press fade-up flex items-center gap-3"
          :class="`fade-up-d${Math.min(i, 5)}`"
          style="border-radius:24px;background:#ffffff;border:1px solid #e8e6e0;padding:12px;text-decoration:none"
        >
          <div
            class="shrink-0 overflow-hidden rounded-2xl"
            :style="{
              width: '72px',
              height: '72px',
              backgroundColor: cardBg(guide),
              backgroundImage: guide.coverUrl ? `url(${guide.coverUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }"
          />

          <div class="min-w-0 flex-1">
            <h3
              style="margin:0 0 8px;font-size:14px;font-weight:800;line-height:1.35;color:#14161f;display:-webkit-box;overflow:hidden;text-overflow:ellipsis;-webkit-line-clamp:2;-webkit-box-orient:vertical"
            >
              {{ guide.title }}
            </h3>
            <div class="flex flex-wrap gap-1">
              <span
                style="border-radius:999px;background:#f0ede8;padding:2px 8px;font-size:10px;font-weight:700;color:#70707a"
              >
                {{ formatGuideDate(guide.publishedAt) }}
              </span>
              <span
                v-for="tag in (guide.tags || []).slice(0, 2)"
                :key="tag"
                style="border-radius:999px;background:#f0ede8;padding:2px 8px;font-size:10px;font-weight:700;color:#70707a"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <svg
            class="shrink-0"
            width="8"
            height="14"
            viewBox="0 0 8 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1l6 6-6 6"
              stroke="#c0c0c8"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </NuxtLink>

        <div
          v-if="!guides.length"
          class="flex items-center justify-center"
          style="padding:52px 0;color:#9aa0a8;font-size:14px;font-weight:500"
        >
          Qo'llanmalar topilmadi
        </div>
      </div>
    </div>
  </div>
</template>
