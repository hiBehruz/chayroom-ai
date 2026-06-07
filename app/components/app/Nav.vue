<script setup lang="ts">
const authStore = useAuthStore()
const isProfileOpen = ref(false)
const isMobileMenuOpen = ref(false)
const route = useRoute()
const scrolled = ref(false)
const SECTION_SCROLL_KEY = 'cx-scroll-target'

const navLinks = [
  { label: 'Panel', href: '/dashboard' },
  { label: 'Tariflar', href: '#pricing' },
  { label: 'FAQ', href: '#faq' }
]

function isActive(href: string) {
  return href.startsWith('/') && route.path === href
}

async function goToHomeTop() {
  if (route.path !== '/') {
    if (import.meta.client) {
      sessionStorage.removeItem(SECTION_SCROLL_KEY)
      window.location.assign('/')
      return
    }
    await navigateTo({ path: '/' })
    return
  }

  if (import.meta.client) {
    sessionStorage.removeItem(SECTION_SCROLL_KEY)
    window.history.replaceState({}, '', '/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function scrollToSection(href: string) {
  if (href.startsWith('/')) {
    navigateTo(href)
    return
  }
  if (route.path !== '/') {
    if (import.meta.client) {
      sessionStorage.setItem(SECTION_SCROLL_KEY, href)
      window.location.assign('/')
      return
    }
    await navigateTo({ path: '/' })
    return
  }
  await nextTick()
  requestAnimationFrame(() => doScroll(href))
}

function doScroll(href: string) {
  const el = document.querySelector(href)
  if (!el) return
  if (import.meta.client && window.location.hash) {
    window.history.replaceState({}, '', '/')
  }
  const navEl = document.querySelector('.nav-scroll-shell') as HTMLElement
  const navHeight = navEl ? navEl.offsetHeight : 72
  const sectionOffset = href === '#about' ? 96 : 0
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight - sectionOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

watch(route, () => {
  isProfileOpen.value = false
  isMobileMenuOpen.value = false
})

let scrollHandler: () => void
onMounted(() => {
  scrollHandler = () => {
    scrolled.value = window.scrollY > 16
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })

  const pendingSection = sessionStorage.getItem(SECTION_SCROLL_KEY)
  if (route.path === '/' && pendingSection) {
    sessionStorage.removeItem(SECTION_SCROLL_KEY)
    requestAnimationFrame(() => doScroll(pendingSection))
  }
})
onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <div
    :class="[
      'nav-scroll-shell sticky top-0 z-10000 px-5 py-3',
      scrolled ? 'nav-scroll-shell--scrolled' : ''
    ]"
  >
    <nav
      class="mx-auto flex w-[1240px] max-w-[calc(100vw-48px)] h-12 items-center px-0 gap-4 md:gap-8 transition-all duration-300"
    >
      <!-- Logo -->
      <NuxtLink
        to="/"
        :prefetch="false"
        class="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity duration-200"
      >
        <span class="nav-logo-mark">
          <UIcon
            name="i-ph-brain-fill"
            class="size-[17px]"
          />
        </span>
        <span class="nav-text text-[28px] font-extrabold whitespace-nowrap">
          Chayroom AI Club
        </span>
      </NuxtLink>

      <!-- Nav links -->
      <div class="relative ml-auto hidden shrink-0 items-center gap-0.5 md:flex">
        <!-- Club haqida -->
        <button
          class="nav-text relative px-3.5 py-2 rounded-xl cursor-pointer focus:outline-none"
          @click="goToHomeTop"
        >
          Club haqida
        </button>

        <!-- Materiallar link -->
        <NuxtLink
          to="/materials"
          :class="[
            'nav-text px-3.5 py-2 rounded-xl focus:outline-none',
            isActive('/materials') ? 'font-semibold' : ''
          ]"
        >
          Materiallar
        </NuxtLink>

        <button
          v-for="link in navLinks"
          :key="link.label"
          :class="[
            'nav-text relative px-3.5 py-2 rounded-xl cursor-pointer focus:outline-none',
            isActive(link.href) ? 'font-semibold' : ''
          ]"
          @click="scrollToSection(link.href)"
        >
          {{ link.label }}
        </button>
      </div>

      <!-- Right -->
      <div class="hidden md:flex items-center gap-2.5 shrink-0">
        <template v-if="authStore.user">
          <NuxtLink
            to="/profile"
            class="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#14161f] hover:opacity-90 transition-opacity duration-200 cursor-pointer"
          >
            <img
              v-if="authStore.user?.photo_url"
              :src="authStore.user.photo_url"
              class="size-8 rounded-full object-cover shrink-0"
              alt=""
            >
            <AppPixelAgentAvatar
              v-else
              :variant="authStore.resolvedAgentVariant"
            />
            <div class="flex flex-col items-start gap-0.5">
              <span class="text-[13px] font-semibold text-white leading-none">{{ authStore.displayName || authStore.user.first_name }}</span>
              <span class="text-[11px] text-white/60 leading-none">Profil</span>
            </div>
          </NuxtLink>
        </template>

        <template v-else>
          <NuxtLink
            to="/login"
            class="nav-login-btn"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-4 h-4 fill-white shrink-0"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
            </svg>
            Kirish
          </NuxtLink>
        </template>
      </div>

      <!-- Mobile right -->
      <div class="flex md:hidden items-center gap-2 ml-auto shrink-0">
        <template v-if="authStore.user">
          <NuxtLink
            to="/profile"
            class="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-[#f2f2f0] transition-colors duration-200"
          >
            <img
              v-if="authStore.user?.photo_url"
              :src="authStore.user.photo_url"
              class="size-8 rounded-full object-cover shrink-0"
              alt=""
            >
            <AppPixelAgentAvatar
              v-else
              :variant="authStore.resolvedAgentVariant"
            />
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink
            to="/login"
            class="nav-login-btn"
          >
            Kirish
          </NuxtLink>
        </template>

        <!-- Hamburger -->
        <button
          class="hamburger-button relative z-10000 flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[#f2f2f0] transition-colors duration-200 focus:outline-none active:scale-90"
          style="transition: background 0.2s ease, transform 0.18s cubic-bezier(0.34,1.56,0.64,1)"
          :aria-label="isMobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <div
            :class="['hamburger-icon', isMobileMenuOpen && 'is-open']"
            aria-hidden="true"
          >
            <span class="hb-wrap hb-wrap-top"><span class="hb-bar" /></span>
            <span class="hb-bar hb-mid" />
            <span class="hb-wrap hb-wrap-bot"><span class="hb-bar" /></span>
          </div>
        </button>
      </div>
    </nav>

    <!-- Mobile fullscreen menu -->
    <Teleport to="body">
      <Transition :duration="0">
        <div
          v-if="isMobileMenuOpen"
          class="md:hidden fixed inset-0 bg-[#f7f5ef] z-[9999] flex flex-col items-center justify-center gap-1"
        >
          <button
            class="text-[22px] font-semibold text-[#14161f] py-3 px-8 focus:outline-none active:scale-95"
            @click="goToHomeTop(); isMobileMenuOpen = false"
          >
            Club haqida
          </button>
          <NuxtLink
            to="/materials"
            class="text-[22px] font-semibold text-[#14161f] py-3 px-8"
            @click="isMobileMenuOpen = false"
          >
            Materiallar
          </NuxtLink>
          <button
            v-for="link in navLinks"
            :key="link.label"
            class="text-[22px] font-semibold text-[#14161f] py-3 px-8 focus:outline-none active:scale-95"
            @click="scrollToSection(link.href); isMobileMenuOpen = false"
          >
            {{ link.label }}
          </button>
          <NuxtLink
            v-if="authStore.user"
            to="/profile"
            class="text-[22px] font-semibold text-[#14161f] py-3 px-8"
            @click="isMobileMenuOpen = false"
          >
            Profil
          </NuxtLink>
          <NuxtLink
            v-else
            to="/login"
            class="text-[22px] font-semibold text-[#14161f] py-3 px-8"
            @click="isMobileMenuOpen = false"
          >
            Kirish
          </NuxtLink>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dropdown-enter-active {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.34, 1.48, 0.64, 1);
}
.dropdown-leave-active {
  transition: opacity 0.16s ease, transform 0.16s cubic-bezier(0.4, 0, 1, 1);
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}

.nav-logo-mark {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: #f5f0ea;
  background: #0f0e16;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 1px 4px rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}

.nav-text {
  color: #14161f;
  font-family: var(--font-inter), 'Inter Fallback', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.nav-text:hover {
  color: #3480f1;
}

.nav-scroll-shell {
  isolation: isolate;
  position: sticky;
  background: rgba(255, 253, 249, 0.96);
  backdrop-filter: blur(16px);
  transition: background 0.22s ease, box-shadow 0.22s ease;
}

.nav-scroll-shell::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background: rgba(20, 22, 31, 0.12);
  opacity: 0;
  transform: scaleX(0.98);
  transform-origin: center;
  transition: opacity 0.22s ease, transform 0.22s ease;
  pointer-events: none;
}

.nav-scroll-shell--scrolled {
  background: rgba(255, 253, 249, 0.98);
  box-shadow: 0 1px 0 rgba(20, 22, 31, 0.04);
}

.nav-scroll-shell--scrolled::after {
  opacity: 1;
  transform: scaleX(1);
}

.backdrop-fade-enter-active {
  transition: opacity 0.2s ease;
}
.backdrop-fade-leave-active {
  transition: opacity 0.15s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.hamburger-icon {
  position: relative;
  width: 18px;
  height: 14px;
}
.hb-wrap {
  position: absolute;
  left: 0;
  width: 100%;
  top: calc(50% - 0.875px);
  transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hb-wrap-top { transform: translateY(-4.5px); }
.hb-wrap-bot { transform: translateY(4.5px); }

.hamburger-button:hover .hb-wrap-top,
.hamburger-button:hover .hb-wrap-bot,
.hamburger-icon.is-open .hb-wrap-top,
.hamburger-icon.is-open .hb-wrap-bot {
  transform: translateY(0);
}

.hb-bar {
  display: block;
  width: 100%;
  height: 1.75px;
  background: #14161f;
  border-radius: 1px;
  transform-origin: center;
  transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.16s ease;
}

.hb-mid {
  position: absolute;
  left: 0;
  top: calc(50% - 0.875px);
  transition: transform 0.2s ease, opacity 0.14s ease;
}

.hamburger-button:hover .hb-wrap-top .hb-bar,
.hamburger-icon.is-open .hb-wrap-top .hb-bar {
  transform: rotate(45deg);
}
.hamburger-button:hover .hb-mid,
.hamburger-icon.is-open .hb-mid {
  opacity: 0;
  transform: scaleX(0);
}
.hamburger-button:hover .hb-wrap-bot .hb-bar,
.hamburger-icon.is-open .hb-wrap-bot .hb-bar {
  transform: rotate(-45deg);
}

.nav-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #3480f1;
  border: 1px solid #3480f1;
  border-radius: 999px;
  padding: 8px 14px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(52,128,241,0.18);
  transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}
.nav-login-btn:hover  { opacity: 0.9; transform: scale(1.04); background: #256fe0; }
.nav-login-btn:active { opacity: 0.7; transform: scale(0.98); }
</style>
