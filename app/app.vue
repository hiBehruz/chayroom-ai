<script setup lang="ts">
import gsap from 'gsap'
import { shouldSyncServerSession } from './utils/auth-session.mjs'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { isMiniApp, backButton } = useTelegramApp()
const showMiniNav = computed(() => isMiniApp.value && authStore.hasSubscription)
const showNav = computed(() =>
  !isMiniApp.value && (
    ['/', '/dashboard', '/profile', '/materials', '/community', '/rules', '/about-me'].includes(route.path)
    || route.path.startsWith('/courses')
    || route.path.startsWith('/guides')
    || route.path.startsWith('/login')
  )
)

authStore.restoreFromStorage()
const handleBack = () => router.back()

onMounted(() => {
  if (isMiniApp.value) {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (tgUser && !authStore.hasSubscription) {
      void authStore.loginFromMiniApp(tgUser)
    }
    backButton.onClick(handleBack)
    return
  }

  // JWT cookie may be set (e.g. after bot-callback redirect) without cx-sub cookie.
  // Sync from server so subscription state is correct on first render.
  // Skip on /login: the login flow calls authStore.login() shortly after mount, and
  // a concurrent syncMe() that returns null user would call logout() and race with it.
  if (route.path !== '/login' && shouldSyncServerSession(authStore.user, authStore.hasSubscription)) {
    void authStore.syncMe()
  }
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

watchEffect(() => {
  if (!import.meta.client) return
  if (!isMiniApp.value) return
  if (!authStore.user) return
  if (authStore.hasSubscription) return
  if (route.path === '/dashboard' || route.path === '/login') return

  router.replace('/dashboard')
})

const MINI_HOME_PATHS = ['/dashboard']

function onPageEnter(el: Element, done: () => void) {
  if (isMiniApp.value) {
    const isHome = MINI_HOME_PATHS.includes(route.path)

    if (isHome) {
      const targets = getStaggerTargets(el)
      gsap.from(targets, {
        y: 28,
        opacity: 0,
        duration: 0.38,
        ease: 'power3.out',
        stagger: 0.04,
        clearProps: 'all',
        onComplete: done
      })
    } else {
      gsap.fromTo(el,
        { x: 24, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.28,
          ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
          clearProps: 'all',
          onComplete: done
        }
      )
    }
    return
  }

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

function onPageLeave(el: Element, done: () => void) {
  if (isMiniApp.value) {
    gsap.to(el, {
      opacity: 0,
      duration: 0.12,
      ease: 'linear',
      onComplete: done
    })
    return
  }
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

useHead(computed(() => ({
  htmlAttrs: {
    lang: 'uz',
    style: isMiniApp.value ? 'background:#fffdf9' : ''
  },
  bodyAttrs: {
    style: isMiniApp.value ? 'background:#fffdf9' : ''
  }
})))

useSeoMeta({
  title: 'Chayroom AI — AIni o\'rgan va hayotda qo\'lla',
  description: 'AI texnologiyalarini ish, hayot va biznesga joriy qilmoqchi bo\'lganlar uchun Telegram yopiq kanal.'
})
</script>

<template>
  <UApp>
    <div>
      <AppNav v-if="showNav" />

      <!-- Mini-app wrapper: constrains all pages to 390px -->
      <template v-if="isMiniApp">
        <div
          class="mini-app-frame mini-app-shell overflow-x-hidden min-h-screen pb-20"
          style="background:#fffdf9"
        >
          <NuxtPage :transition="{ css: false, onEnter: onPageEnter, onLeave: onPageLeave }" />
        </div>
        <MiniAppBottomNav v-if="showMiniNav" />
      </template>

      <template v-else>
        <NuxtPage :transition="{ css: false, onEnter: onPageEnter, onLeave: onPageLeave }" />
        <AppFooter />
      </template>
    </div>
  </UApp>
</template>
