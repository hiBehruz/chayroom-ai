<script setup lang="ts">
const route = useRoute()

const { data: guide, error } = await useFetch(`/api/guides/${route.params.id}`)
if (error.value) throw createError({ statusCode: 404, fatal: true })

const { data: blocks } = await useFetch(
  () => guide.value?.notion_page_id
    ? `/api/notion/${guide.value.notion_page_id}`
    : null
)

useSeoMeta({
  title: () => `${guide.value?.title ?? 'Гайд'} — Chayroom AI`
})
</script>

<template>
  <div v-if="guide" class="min-h-screen bg-white">
    <div class="max-w-180 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Главная</NuxtLink>
        <span>/</span>
        <NuxtLink to="/guides" class="hover:text-cx-ink transition-colors">Гайды</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium truncate max-w-60">{{ guide.title }}</span>
      </div>

      <!-- Cover -->
      <div
        class="relative h-60 rounded-2xl overflow-hidden flex items-center justify-center mb-8"
        :style="{ backgroundColor: guide.bg_color }"
      >
        <div
          class="absolute right-0 bottom-0 w-48 h-48 opacity-25"
          :style="{ background: `radial-gradient(circle at 80% 80%, ${guide.accent_color}, transparent 70%)` }"
        />
        <span
          class="absolute top-4 left-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
          :style="{ backgroundColor: guide.accent_color + '33', color: guide.accent_color }"
        >
          {{ guide.badge }}
        </span>
        <img
          v-if="guide.cover_url"
          :src="guide.cover_url"
          class="absolute inset-0 w-full h-full object-cover"
          alt=""
        >
      </div>

      <!-- Meta -->
      <div class="flex flex-wrap gap-1.5 mb-3">
        <span
          v-for="tag in guide.tags"
          :key="tag"
          class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
        >
          {{ tag }}
        </span>
      </div>

      <h1 class="text-[28px] font-extrabold tracking-tight text-[#1a1a1a] mb-2">{{ guide.title }}</h1>
      <p class="text-[15px] text-cx-muted mb-8">{{ guide.description }}</p>

      <!-- Access gate for paid content -->
      <div v-if="!guide.is_free" class="rounded-2xl border border-cx-line bg-[#f7f7f7] p-6 text-center mb-8">
        <p class="text-[15px] font-semibold text-[#1a1a1a] mb-1">Контент доступен по подписке</p>
        <p class="text-[13px] text-cx-muted mb-4">Оформите подписку, чтобы читать все гайды</p>
        <NuxtLink to="/#pricing" class="btn-primary text-[13px]! px-5! py-2!">
          Получить доступ →
        </NuxtLink>
      </div>

      <!-- Notion content -->
      <NotionContent v-if="blocks && guide.is_free" :blocks="blocks" />
    </div>
  </div>
</template>
