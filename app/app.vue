<script setup lang="ts">
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const route = useRoute()
const showNav = computed(() => ['/', '/dashboard', '/guides', '/courses'].includes(route.path))
const showSiteChrome = computed(() => route.path === '/')

onMounted(() => {
  authStore.restoreFromStorage()
  localeStore.restoreFromStorage()
})

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }
  ],
  htmlAttrs: { lang: 'ru' }
})

useSeoMeta({
  title: 'Chayroom AI — Освой ИИ и применяй его в жизни',
  description: 'Закрытое сообщество для тех, кто хочет внедрять ИИ в работу, жизнь и бизнес.'
})
</script>

<template>
  <UApp>
    <AppNav v-if="showNav" />
    <NuxtPage />
    <AppFooter />
  </UApp>
</template>
