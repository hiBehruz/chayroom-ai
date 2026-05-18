<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [url: string] }>()

const uploading = ref(false)
const error = ref('')

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  error.value = ''
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await $fetch<{ url: string }>('/api/upload/image', { method: 'POST', body: form })
    emit('update:modelValue', res.url)
  } catch {
    error.value = 'Ошибка загрузки'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div>
    <div
      class="relative w-full h-36 rounded-xl border-2 border-dashed border-cx-line flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cx-blue transition-colors overflow-hidden"
      :style="modelValue ? `background-image: url(${modelValue}); background-size: cover; background-position: center;` : ''"
    >
      <div v-if="!modelValue" class="flex flex-col items-center gap-1 text-cx-muted">
        <UIcon name="i-lucide-image-up" class="size-7" />
        <span class="text-[12px]">{{ uploading ? 'Загрузка...' : 'Нажмите или перетащите' }}</span>
      </div>
      <div v-else class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <span class="text-white text-[12px] font-medium">Изменить</span>
      </div>
      <input
        type="file"
        accept="image/*"
        class="absolute inset-0 opacity-0 cursor-pointer"
        :disabled="uploading"
        @change="onFile"
      >
    </div>
    <p v-if="error" class="text-red-500 text-[12px] mt-1">{{ error }}</p>
  </div>
</template>
