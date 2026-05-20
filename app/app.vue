<script setup lang="ts">
import gsap from 'gsap'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { isMiniApp, backButton } = useTelegramApp()
const showNav = computed(() =>
  !isMiniApp.value && (
    ['/', '/dashboard', '/profile'].includes(route.path) ||
    route.path.startsWith('/courses') ||
    route.path.startsWith('/guides') ||
    route.path.startsWith('/login')
  )
)
const contentReady = ref(false)
const contentRef = ref<HTMLElement>()

authStore.restoreFromStorage()

watch(isMiniApp, (val) => {
  if (import.meta.client) {
    document.documentElement.style.background = val ? '#17212b' : ''
    document.body.style.background = val ? '#17212b' : ''
  }
}, { immediate: true })

const handleBack = () => router.back()

onMounted(() => {
  if (!isMiniApp.value) return
  backButton.onClick(handleBack)
})

onUnmounted(() => {
  backButton.offClick(handleBack)
})

watch(() => route.path, () => {
  if (!isMiniApp.value) return
  if (route.path === '/dashboard') {
    backButton.hide()
  } else {
    backButton.show()
  }
}, { immediate: true })

function onPageEnter(el: Element, done: () => void) {
  const targets = getStaggerTargets(el)

  gsap.from(targets, {
    y: 56,
    opacity: 0,
    duration: 0.55,
    ease: 'power3.out',
    stagger: 0.09,
    clearProps: 'all',
    onComplete: done
  })
}

function onPageLeave(_el: Element, done: () => void) {
  done()
}

function getStaggerTargets(el: Element) {
  const inner = el.firstElementChild
  if (inner && inner.children.length > 1) {
    return [...inner.children]
  }
  if (el.children.length > 1) {
    return [...el.children]
  }
  return [el]
}

function onLoaderDone() {
  contentReady.value = true
  nextTick(() => {
    const el = contentRef.value
    if (!el) return

    const children = [...el.children] as HTMLElement[]
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    if (showNav.value && children[0]) {
      tl.from(children[0], { y: -56, opacity: 0, duration: 0.7 })
    }

    const rest = showNav.value ? children.slice(1) : children
    if (rest.length) {
      const targets = rest.flatMap(child => getStaggerTargets(child))
      tl.from(targets, {
        y: 40,
        opacity: 0,
        scale: 0.985,
        duration: 0.85,
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'scale'
      }, showNav.value ? '-=0.45' : '0')
    }
  })
}

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }
  ],
  htmlAttrs: { lang: 'uz' }
})

useSeoMeta({
  title: 'Chayroom AI — AIni o\'rgan va hayotda qo\'lla',
  description: 'AI texnologiyalarini ish, hayot va biznesga joriy qilmoqchi bo\'lganlar uchun Telegram yopiq kanal.'
})
</script>

<template>
  <UApp>
    <AppPageLoader @done="onLoaderDone" />

    <div
      v-show="contentReady"
      ref="contentRef"
    >
      <AppNav v-if="showNav" />
      <NuxtPage :transition="{ css: false, onEnter: onPageEnter, onLeave: onPageLeave }" />
      <AppFooter v-if="!isMiniApp" />
    </div>
  </UApp>
</template>
