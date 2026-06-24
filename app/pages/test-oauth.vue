<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold mb-4">OAuth Test</h1>

      <div class="space-y-4">
        <button
          @click="testOAuth"
          class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test OAuth Login
        </button>

        <div v-if="status" class="p-4 rounded" :class="statusClass">
          <pre class="text-sm">{{ status }}</pre>
        </div>

        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded">
          <p class="text-red-800 font-semibold">Error:</p>
          <pre class="text-sm text-red-600 mt-2">{{ error }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const status = ref('')
const error = ref('')

const statusClass = computed(() => {
  if (error.value) return 'bg-red-50 border border-red-200'
  return 'bg-green-50 border border-green-200'
})

async function testOAuth() {
  status.value = 'Step 1: Checking if client-side...'
  error.value = ''

  try {
    if (!import.meta.client) {
      throw new Error('Not on client side')
    }

    status.value = 'Step 2: Loading OAuth composable...'
    const { openOAuthPopup, isWaiting } = useTelegramOAuth()

    status.value = 'Step 3: Opening OAuth popup...'
    const user = await openOAuthPopup()

    status.value = `Step 4: Success!\n\nUser: ${JSON.stringify(user, null, 2)}`

  } catch (e: any) {
    error.value = e.message || String(e)
    status.value = 'Failed!'
    console.error('OAuth test error:', e)
  }
}
</script>
