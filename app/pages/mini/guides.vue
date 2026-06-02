<script setup lang="ts">
const router = useRouter()
const { data: allGuides, pending } = useAsyncData('mini-guides', () => $fetch<any[]>('/api/guides'))

const chips = ['Hammasi', 'Vibe coding', 'AI-agentlar', 'Neyrolar', 'Claude']
const activeChip = ref('Hammasi')

const guides = computed(() => allGuides.value ?? [])

useSeoMeta({ title: "Qo'llanmalar" })
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
        <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#0f1115;margin:0">Qo'llanmalar</h1>
      </div>
    </div>
    <p style="font-size:13px;color:#6b7280;font-weight:500;margin:0;padding:0 20px 14px">Amaliy qo'llanmalar va bosqichma-bosqich ko'rsatmalar.</p>

    <!-- Chip filters -->
    <div class="flex gap-2.5 overflow-x-auto" style="padding:0 20px 14px;scrollbar-width:none">
      <button
        v-for="chip in chips"
        :key="chip"
        class="flex-none tg-press-sm"
        style="height:36px;padding:0 18px;border-radius:999px;font-size:13px;font-weight:700;white-space:nowrap;border:none"
        :style="activeChip === chip
          ? 'background:#4c6ef0;color:#fff'
          : 'background:#f7f5ef;color:#0f1115;border:1px solid #e8e4da'"
        @click="activeChip = chip"
      >
        {{ chip }}
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="pending" class="flex flex-col gap-3" style="padding:0 20px 24px">
      <div
        v-for="i in 4"
        :key="i"
        class="flex items-center gap-3"
        style="background:#f7f5ef;border-radius:20px;padding:14px"
      >
        <div class="skeleton flex-none" style="width:90px;height:90px;border-radius:14px" />
        <div class="flex-1 flex flex-col gap-2">
          <div class="skeleton" style="height:14px;width:80%;border-radius:8px" />
          <div class="skeleton" style="height:11px;width:60%;border-radius:8px" />
          <div class="skeleton" style="height:11px;width:40%;border-radius:8px" />
        </div>
      </div>
    </div>

    <!-- Guides list -->
    <div v-else class="flex flex-col gap-3" style="padding:0 20px 24px">
      <NuxtLink
        v-for="(guide, i) in guides"
        :key="guide.slug"
        :to="`/guides/${guide.slug}`"
        class="tg-press flex items-center gap-3 fade-up"
        :class="`fade-up-d${Math.min(i, 5)}`"
        style="background:#f7f5ef;border-radius:20px;padding:14px"
      >
        <div
          class="flex-none grid place-items-center overflow-hidden"
          style="width:90px;height:90px;border-radius:14px;background:#0f1115"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <h3 style="font-size:14px;font-weight:800;letter-spacing:-0.015em;color:#0f1115;margin:0 0 4px;line-height:1.2">{{ guide.title }}</h3>
          <p
            v-if="guide.description"
            style="font-size:11.5px;color:#6b7280;font-weight:500;margin:0 0 6px;line-height:1.35;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical"
          >{{ guide.description }}</p>
          <span style="background:#ede9e0;color:#0f1115;padding:4px 9px;border-radius:999px;font-size:10.5px;font-weight:700">Qo'llanma</span>
        </div>

        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4c8d2" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
      </NuxtLink>

      <div v-if="!guides.length" class="flex items-center justify-center" style="padding:48px 0;color:#9aa0a8;font-size:14px;font-weight:500">
        Qo'llanmalar topilmadi
      </div>
    </div>
  </div>
</template>
