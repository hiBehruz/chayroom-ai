<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const activeTab = ref<'courses' | 'guides'>('courses')

const { data: courses, refresh: refreshCourses } = await useFetch('/api/courses', {
  query: { all: true }
})
const { data: guides, refresh: refreshGuides } = await useFetch('/api/guides', {
  query: { all: true }
})

async function deleteCourse(id: string) {
  if (!confirm('Удалить этот курс?')) return
  await $fetch(`/api/courses/${id}`, { method: 'DELETE' })
  refreshCourses()
}

async function deleteGuide(id: string) {
  if (!confirm('Удалить этот гайд?')) return
  await $fetch(`/api/guides/${id}`, { method: 'DELETE' })
  refreshGuides()
}

async function togglePublish(type: 'courses' | 'guides', id: string, current: boolean) {
  await $fetch(`/api/${type}/${id}`, { method: 'PUT', body: { is_published: !current } })
  type === 'courses' ? refreshCourses() : refreshGuides()
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-[28px] font-extrabold tracking-tight text-[#1a1a1a]">Панель управления</h1>
        <NuxtLink
          :to="activeTab === 'courses' ? '/admin/courses/new' : '/admin/guides/new'"
          class="btn-primary text-[13px]! px-4! py-2!"
        >
          + Добавить
        </NuxtLink>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-cx-line mb-6">
        <button
          v-for="tab in (['courses', 'guides'] as const)"
          :key="tab"
          :class="[
            'px-5 py-2.5 text-[14px] font-semibold transition-colors -mb-px border-b-2',
            activeTab === tab
              ? 'text-cx-blue border-cx-blue'
              : 'text-cx-muted border-transparent hover:text-cx-ink'
          ]"
          @click="activeTab = tab"
        >
          {{ tab === 'courses' ? 'Курсы' : 'Гайды' }}
        </button>
      </div>

      <!-- Courses list -->
      <div v-if="activeTab === 'courses'" class="flex flex-col gap-3">
        <div
          v-for="course in courses"
          :key="course.id"
          class="flex items-center gap-4 p-4 rounded-xl border border-cx-line bg-[#fafafa]"
        >
          <div
            class="w-14 h-14 rounded-lg shrink-0 bg-cover bg-center"
            :style="course.cover_url ? `background-image: url(${course.cover_url})` : `background-color: ${course.bg_color}`"
          />
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-bold text-[#1a1a1a] truncate">{{ course.title }}</p>
            <p class="text-[12px] text-cx-muted">{{ course.category }}</p>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-[12px] text-cx-muted">{{ course.is_published ? 'Опубликован' : 'Черновик' }}</span>
            <input
              type="checkbox"
              :checked="course.is_published"
              class="cursor-pointer"
              @change="togglePublish('courses', course.id, course.is_published)"
            >
          </label>
          <NuxtLink
            :to="`/admin/courses/${course.id}/edit`"
            class="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-cx-line hover:border-cx-blue hover:text-cx-blue transition-colors"
          >
            Изменить
          </NuxtLink>
          <button
            class="px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            @click="deleteCourse(course.id)"
          >
            Удалить
          </button>
        </div>
        <p v-if="!courses?.length" class="text-cx-muted text-[14px] py-8 text-center">Курсов пока нет</p>
      </div>

      <!-- Guides list -->
      <div v-if="activeTab === 'guides'" class="flex flex-col gap-3">
        <div
          v-for="guide in guides"
          :key="guide.id"
          class="flex items-center gap-4 p-4 rounded-xl border border-cx-line bg-[#fafafa]"
        >
          <div
            class="w-14 h-14 rounded-lg shrink-0"
            :style="{ backgroundColor: guide.bg_color }"
          />
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-bold text-[#1a1a1a] truncate">{{ guide.title }}</p>
            <p class="text-[12px] text-cx-muted">{{ guide.category }} · {{ guide.is_free ? 'Бесплатно' : 'По подписке' }}</p>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-[12px] text-cx-muted">{{ guide.is_published ? 'Опубликован' : 'Черновик' }}</span>
            <input
              type="checkbox"
              :checked="guide.is_published"
              class="cursor-pointer"
              @change="togglePublish('guides', guide.id, guide.is_published)"
            >
          </label>
          <NuxtLink
            :to="`/admin/guides/${guide.id}/edit`"
            class="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-cx-line hover:border-cx-blue hover:text-cx-blue transition-colors"
          >
            Изменить
          </NuxtLink>
          <button
            class="px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            @click="deleteGuide(guide.id)"
          >
            Удалить
          </button>
        </div>
        <p v-if="!guides?.length" class="text-cx-muted text-[14px] py-8 text-center">Гайдов пока нет</p>
      </div>
    </div>
  </div>
</template>
