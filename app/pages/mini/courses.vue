<script setup lang="ts">
const router = useRouter()
const { data: allCourses, pending } = useAsyncData('mini-courses', () => $fetch<any[]>('/api/courses'))

const chips = [
  { label: 'Hammasi',     value: 'all',         icon: null },
  { label: 'Vibe coding', value: 'vibe-coding', icon: 'i-solar-code-circle-bold' },
  { label: 'AI agentlar', value: 'ai-agents',   icon: 'i-solar-command-bold' },
  { label: 'Neyrolar',    value: 'neural',       icon: 'i-solar-atom-bold' },
]
const activeChip = ref('all')
const filterRef = ref<HTMLElement | null>(null)
const chipRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref({ left: '0px', width: '0px', opacity: '0' })

function updateIndicator() {
  const index = chips.findIndex(c => c.value === activeChip.value)
  const btn = chipRefs.value[index]
  const filter = filterRef.value
  if (!btn || !filter) return
  const btnRect = btn.getBoundingClientRect()
  const filterRect = filter.getBoundingClientRect()
  indicatorStyle.value = {
    left: (btnRect.left - filterRect.left + filter.scrollLeft) + 'px',
    width: btnRect.width + 'px',
    opacity: '1'
  }
}

function selectChip(value: string) {
  activeChip.value = value
  nextTick(() => { updateIndicator(); requestAnimationFrame(updateIndicator) })
}

onMounted(() => {
  nextTick(() => { updateIndicator(); requestAnimationFrame(updateIndicator) })
  document.fonts?.ready.then(updateIndicator)
})

const courses = computed(() => allCourses.value ?? [])

useSeoMeta({ title: 'Kurslar' })
</script>

<template>
  <div style="background:#fffdf9;min-height:100vh;font-family:inherit">

    <!-- Header -->
    <div class="flex items-center gap-3 px-5 pt-4 pb-2">
      <button
        class="inline-flex items-center justify-center flex-none tg-press-sm"
        style="width:36px;height:36px;border-radius:50%;background:#f7f5ef;border:none"
        @click="router.back()"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f1115" stroke-width="2.5" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <div>
        <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#0f1115;margin:0">Kurslar</h1>
      </div>
    </div>
    <p style="font-size:13px;color:#6b7280;font-weight:500;margin:0;padding:0 20px 14px">AI agentlar, neyrotarmoqlar va vibe coding.</p>

    <!-- Chip filters -->
    <div class="overflow-x-auto" style="padding:0 20px 14px;scrollbar-width:none">
      <div ref="filterRef" class="relative inline-flex items-center gap-2 whitespace-nowrap">
        <span
          class="absolute inset-y-0 rounded-full bg-[#262831] pointer-events-none"
          style="transition:left 250ms cubic-bezier(0.23,1,0.32,1),width 250ms cubic-bezier(0.23,1,0.32,1),opacity 150ms ease"
          :style="indicatorStyle"
        />
        <button
          v-for="(chip, i) in chips"
          :key="chip.value"
          :ref="el => { if (el) chipRefs[i] = el as HTMLElement }"
          class="relative z-10 flex-none inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap active:scale-95 transition-[color] duration-150"
          :style="activeChip === chip.value ? 'color:#fffdf9;background:transparent' : 'color:#262831;background:#f7f5f0'"
          @click="selectChip(chip.value)"
        >
          <UIcon v-if="chip.icon" :name="chip.icon" class="size-4" />
          {{ chip.label }}
        </button>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="pending" class="flex flex-col gap-3" style="padding:0 20px 24px">
      <div
        v-for="i in 3"
        :key="i"
        class="flex items-center gap-3"
        style="background:#f7f5ef;border-radius:20px;padding:14px"
      >
        <div class="skeleton flex-none" style="width:96px;height:96px;border-radius:16px" />
        <div class="flex-1 flex flex-col gap-2">
          <div class="skeleton" style="height:11px;width:35%;border-radius:8px" />
          <div class="skeleton" style="height:14px;width:85%;border-radius:8px" />
          <div class="skeleton" style="height:11px;width:55%;border-radius:8px" />
        </div>
      </div>
    </div>

    <!-- Courses list -->
    <div v-else class="flex flex-col gap-3" style="padding:0 20px 24px">
      <NuxtLink
        v-for="(course, i) in courses"
        :key="course.slug"
        :to="`/courses/${course.slug}`"
        class="tg-press flex items-center gap-3 fade-up"
        :class="`fade-up-d${Math.min(i, 5)}`"
        style="background:#f7f5ef;border-radius:20px;padding:14px"
      >
        <div
          class="flex-none grid place-items-center overflow-hidden"
          style="width:96px;height:96px;border-radius:16px;background:#4c6ef0"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="14" stroke="#fff" stroke-width="1.8"/>
            <circle cx="20" cy="20" r="6" fill="#fff"/>
            <path d="M20 6v8M20 26v8M6 20h8M26 20h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex gap-1.5 mb-1.5">
            <span style="background:#ede9e0;color:#0f1115;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:700">Kurs</span>
          </div>
          <h3
            style="font-size:14px;font-weight:800;letter-spacing:-0.015em;color:#0f1115;margin:0 0 4px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical"
          >{{ course.title }}</h3>
          <p
            v-if="course.description"
            style="font-size:11.5px;color:#6b7280;font-weight:500;margin:0;line-height:1.35;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical"
          >{{ course.description }}</p>
        </div>

        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4c8d2" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
      </NuxtLink>

      <div v-if="!courses.length" class="flex items-center justify-center" style="padding:48px 0;color:#9aa0a8;font-size:14px;font-weight:500">
        Kurslar topilmadi
      </div>
    </div>
  </div>
</template>
