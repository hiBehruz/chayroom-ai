<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const error = ref('')

const { data: course } = await useFetch(`/api/courses/${route.params.id}`)

async function handleSubmit(data: Record<string, unknown>) {
  error.value = ''
  try {
    await $fetch(`/api/courses/${route.params.id}`, { method: 'PUT', body: data })
    router.push('/admin')
  } catch {
    error.value = 'Ошибка при сохранении'
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <div class="flex items-center gap-3 mb-8">
        <NuxtLink to="/admin" class="text-cx-muted hover:text-cx-ink transition-colors">← Назад</NuxtLink>
        <h1 class="text-[24px] font-extrabold tracking-tight text-[#1a1a1a]">Редактировать курс</h1>
      </div>
      <p v-if="error" class="text-red-500 text-[13px] mb-4">{{ error }}</p>
      <AdminCourseForm v-if="course" :initial-data="course" @submit="handleSubmit" />
    </div>
  </div>
</template>
