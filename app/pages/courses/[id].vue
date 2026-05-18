<script setup lang="ts">
const route = useRoute()
const { data: course, error } = await useFetch(`/api/courses/${route.params.id}`)

if (error.value) throw createError({ statusCode: 404, fatal: true })

useSeoMeta({
  title: () => `${course.value?.title ?? 'Курс'} — Chayroom AI`
})
</script>

<template>
  <div v-if="course" class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Главная</NuxtLink>
        <span>/</span>
        <NuxtLink to="/courses" class="hover:text-cx-ink transition-colors">Курсы</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">{{ course.title }}</span>
      </div>

      <div class="grid grid-cols-3 gap-10">
        <!-- Main content -->
        <div class="col-span-2 flex flex-col gap-6">
          <!-- Kinescope video -->
          <div v-if="course.kinescope_video_id" class="relative w-full rounded-2xl overflow-hidden" style="aspect-ratio: 16/9">
            <iframe
              :src="`https://kinescope.io/embed/${course.kinescope_video_id}`"
              class="absolute inset-0 w-full h-full"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media;"
              allowfullscreen
            />
          </div>

          <div>
            <h1 class="text-[28px] font-extrabold tracking-tight text-[#1a1a1a] mb-3">{{ course.title }}</h1>
            <p class="text-[15px] text-cx-muted leading-relaxed">{{ course.description }}</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-4">
          <div class="rounded-2xl border border-cx-line p-5 flex flex-col gap-4 sticky top-20">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in course.tags"
                :key="tag"
                class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
              >
                {{ tag }}
              </span>
            </div>

            <div class="flex flex-col gap-2 text-[13px] text-cx-muted">
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-layout-list" class="size-4" />
                {{ course.modules_count }} модул{{ course.modules_count === 1 ? 'ь' : 'я' }}
              </span>
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-play-circle" class="size-4" />
                {{ course.lessons_count }} урок{{ course.lessons_count >= 5 ? 'ов' : 'а' }}
              </span>
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-clock" class="size-4" />
                {{ course.duration }}
              </span>
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-bar-chart-2" class="size-4" />
                <span :style="{ color: course.level_color }">{{ course.level }}</span>
              </span>
            </div>

            <button class="btn-primary w-full text-[13px]! py-2.5!">
              Получить доступ →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
