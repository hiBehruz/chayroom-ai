<script setup lang="ts">
import teapotHero from '~/assets/images/herochoynak.png'

const authStore = useAuthStore()
const isProfileOpen = ref(false)
const isMobileMenuOpen = ref(false)
const route = useRoute()
const scrolled = ref(false)

const navLinks = [
  { label: 'Kurslar', href: '/courses' },
  { label: 'Qo\'llanmalar', href: '/guides' },
  { label: 'Panel', href: '/dashboard' },
  { label: 'Tariflar', href: '#pricing' },
  { label: 'FAQ', href: '#faq' }
]

function isActive(href: string) {
  return href.startsWith('/') && route.path === href
}

function scrollToSection(href: string) {
  if (href.startsWith('/')) {
    navigateTo(href)
    return
  }
  if (route.path !== '/') {
    navigateTo('/' + href)
    return
  }
  const el = document.querySelector(href)
  if (!el) return
  const navEl = document.querySelector('.nav-scroll-shell') as HTMLElement
  const navHeight = navEl ? navEl.offsetHeight : 72
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight
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
})
onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler)
})

function logout() {
  isProfileOpen.value = false
  authStore.logout()
  navigateTo('/')
}
</script>

<template>
  <!-- sticky band — white backdrop so page content doesn't bleed through -->
  <div
    :class="[
      'nav-scroll-shell sticky top-0 z-50 bg-white/96 backdrop-blur-sm px-5 py-3',
      scrolled ? 'nav-scroll-shell--scrolled' : ''
    ]"
  >
    <!-- floating pill -->
    <nav
      :class="[
        'max-w-295 mx-auto flex items-center h-13 px-4 md:px-10 gap-4 md:gap-8 rounded-2xl border transition-all duration-300',
        scrolled
          ? 'bg-white/98 backdrop-blur-2xl border-cx-line/70'
          : 'bg-white/85 backdrop-blur-xl border-cx-line/40'
      ]"
    >
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity duration-200"
      >
        <div class="relative w-9 h-9 shrink-0">
          <img
            :src="teapotHero"
            alt="Chayroom AI"
            class="logo-teapot w-9 h-9 object-contain"
          />
          <span class="logo-smoke logo-smoke-1" aria-hidden="true" />
          <span class="logo-smoke logo-smoke-2" aria-hidden="true" />
          <span class="logo-smoke logo-smoke-3" aria-hidden="true" />
        </div>
        <span class="text-[14px] font-extrabold tracking-tight whitespace-nowrap text-[#0a0a0b]">
          Chayroom <span class="brand-ai-gradient">AI</span> Club
        </span>
      </NuxtLink>

      <!-- divider -->
      <div class="hidden md:block w-px h-5 bg-cx-line shrink-0" />

      <!-- Nav links -->
      <div class="relative hidden md:flex items-center gap-0.5 flex-1 justify-center">
        <button
          v-for="link in navLinks"
          :key="link.label"
          :class="[
            'relative px-3.5 py-2 rounded-xl text-[14px] transition-colors duration-200 cursor-pointer focus:outline-none',
            isActive(link.href) ? 'text-[#0a0a0b] font-semibold' : 'text-cx-muted font-medium hover:text-[#0a0a0b]'
          ]"
          @click="scrollToSection(link.href)"
        >
          {{ link.label }}
          <span
            v-if="isActive(link.href)"
            class="nav-underline-pop absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-cx-blue"
          />
        </button>
      </div>

      <!-- divider -->
      <div class="hidden md:block w-px h-5 bg-cx-line shrink-0" />

      <!-- Right -->
      <div class="hidden md:flex items-center gap-2.5 shrink-0">
        <template v-if="authStore.user">
          <div class="relative">
            <button
              class="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-[#f2f2f0] transition-colors duration-200 cursor-pointer focus:outline-none"
              @click="isProfileOpen = !isProfileOpen"
            >
              <AppPixelAgentAvatar :variant="authStore.resolvedAgentVariant" />
              <div class="flex flex-col items-start gap-0.5">
                <span class="text-[13px] font-semibold text-[#1a1a1a] leading-none">{{ authStore.displayName || authStore.user.first_name }}</span>
                <span class="text-[11px] text-cx-muted leading-none">Profil</span>
              </div>
              <UIcon
                name="i-lucide-chevron-down"
                :class="['size-3.5 text-cx-muted transition-transform duration-200 ml-0.5', isProfileOpen ? 'rotate-180' : '']"
              />
            </button>

            <Transition name="dropdown">
              <div
                v-if="isProfileOpen"
                class="absolute right-0 top-[calc(100%+10px)] w-60 rounded-2xl border border-[#e8e8e6] bg-white p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.9)_inset]"
              >
                <!-- User header -->
                <div class="flex items-center gap-3 px-3 py-2.5 mb-1">
                  <AppPixelAgentAvatar :variant="authStore.resolvedAgentVariant" />
                  <div class="min-w-0">
                    <div class="text-[13px] font-bold text-[#1a1a1a] truncate">
                      {{ authStore.displayName || authStore.user.first_name }}
                    </div>
                    <div v-if="authStore.user.username" class="text-[11px] text-cx-muted truncate">
                      @{{ authStore.user.username }}
                    </div>
                  </div>
                </div>

                <div class="h-px bg-[#f0f0ee] mx-1 mb-1" />

                <NuxtLink
                  to="/dashboard"
                  class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-[#1a1a1a] hover:bg-[#f5f5f3] transition-colors duration-150"
                  @click="isProfileOpen = false"
                >
                  <div class="w-6 h-6 rounded-lg bg-[#f0f0ee] flex items-center justify-center shrink-0">
                    <UIcon name="i-lucide-layout-dashboard" class="size-3.5 text-[#555]" />
                  </div>
                  Panel
                </NuxtLink>

                <NuxtLink
                  to="/profile"
                  class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-[#1a1a1a] hover:bg-[#f5f5f3] transition-colors duration-150"
                  @click="isProfileOpen = false"
                >
                  <div class="w-6 h-6 rounded-lg bg-[#f0f0ee] flex items-center justify-center shrink-0">
                    <UIcon name="i-lucide-user-round" class="size-3.5 text-[#555]" />
                  </div>
                  Profil sozlamalari
                </NuxtLink>

                <div class="h-px bg-[#f0f0ee] mx-1 my-1" />

                <button
                  class="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors duration-150 focus:outline-none"
                  @click="logout"
                >
                  <div class="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <UIcon name="i-lucide-log-out" class="size-3.5 text-red-400" />
                  </div>
                  Chiqish
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <template v-else>
          <NuxtLink
            to="/login"
            class="btn-primary btn-primary-dark text-[14px]! px-4! py-2!"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-3.5 h-3.5 fill-white shrink-0"
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
          <button
            class="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-[#f2f2f0] transition-colors duration-200 cursor-pointer focus:outline-none"
            @click="isMobileMenuOpen = true"
          >
            <AppPixelAgentAvatar :variant="authStore.resolvedAgentVariant" />
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/login"
            class="btn-primary btn-primary-dark text-[13px]! px-3! py-1.5!"
          >
            Kirish
          </NuxtLink>
        </template>

        <!-- Hamburger -->
        <button
          class="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[#f2f2f0] transition-colors duration-200 focus:outline-none"
          aria-label="Menyuni ochish"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <UIcon
            :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
            class="size-5 text-[#1a1a1a]"
          />
        </button>
      </div>
    </nav>

    <!-- Mobile drawer -->
    <Transition name="mobile-drawer">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden absolute left-0 right-0 top-full bg-white border-t border-cx-line shadow-[0_16px_40px_rgba(0,0,0,0.10)] px-5 py-4 flex flex-col gap-1 z-50"
      >
        <button
          v-for="link in navLinks"
          :key="link.label"
          :class="[
            'flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-colors duration-200 text-left w-full cursor-pointer focus:outline-none',
            isActive(link.href) ? 'bg-[#f2f2f0] text-[#0a0a0b] font-semibold' : 'text-cx-muted hover:bg-[#f7f7f5] hover:text-[#0a0a0b]'
          ]"
          @click="scrollToSection(link.href); isMobileMenuOpen = false"
        >
          {{ link.label }}
        </button>

        <div class="h-px bg-cx-line my-2" />

        <template v-if="authStore.user">
          <div class="flex items-center gap-3 px-4 py-2 mb-1">
            <AppPixelAgentAvatar :variant="authStore.resolvedAgentVariant" />
            <div>
              <div class="text-[14px] font-bold text-[#1a1a1a]">{{ authStore.displayName || authStore.user.first_name }}</div>
              <div v-if="authStore.user.username" class="text-[12px] text-cx-muted">@{{ authStore.user.username }}</div>
            </div>
          </div>
          <NuxtLink
            to="/profile"
            class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[14px] font-medium text-[#1a1a1a] hover:bg-[#f7f7f5] transition-colors"
            @click="isMobileMenuOpen = false"
          >
            <UIcon name="i-lucide-user-round" class="size-4 text-cx-muted" />
            Profil sozlamalari
          </NuxtLink>
          <button
            class="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors focus:outline-none"
            @click="logout"
          >
            <UIcon name="i-lucide-log-out" class="size-4" />
            Chiqish
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/login"
            class="btn-primary btn-primary-dark text-[14px]! mx-2"
            @click="isMobileMenuOpen = false"
          >
            Kirish (Telegram)
          </NuxtLink>
        </template>
      </div>
    </Transition>
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

.logo-icon {
  background:
    radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.34), transparent 34%),
    linear-gradient(145deg, #0086f5 0%, #0057c9 54%, #073875 100%);
  box-shadow:
    0 8px 18px rgba(0, 117, 222, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}

.logo-icon::after {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  pointer-events: none;
}

.logo-steam {
  opacity: 0.72;
  stroke-dasharray: 8;
  transform-origin: center;
  animation: logo-steam-rise 2.8s ease-in-out infinite;
}

.logo-steam-2 {
  animation-delay: 0.48s;
}

.logo-spark {
  transform-origin: 18.2px 6.7px;
  animation: logo-spark-pulse 2.8s ease-in-out infinite;
}

.nav-underline-pop {
  transform-origin: center;
  animation: nav-underline-pop 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.nav-scroll-shell {
  isolation: isolate;
}


@keyframes nav-underline-pop {
  0% {
    opacity: 0;
    transform: translateX(-50%) scaleX(0.35);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scaleX(1);
  }
}

@keyframes logo-steam-rise {
  0%, 100% {
    opacity: 0.22;
    stroke-dashoffset: 8;
    transform: translateY(1px);
  }
  45% {
    opacity: 0.95;
    stroke-dashoffset: 0;
    transform: translateY(-0.5px);
  }
}

@keyframes logo-spark-pulse {
  0%, 100% {
    opacity: 0.52;
    transform: scale(0.86) rotate(0deg);
  }
  48% {
    opacity: 1;
    transform: scale(1.08) rotate(18deg);
  }
}

.logo-teapot {
  transform-origin: 52% 56%;
  animation: logo-teapot-breathe 6.5s ease-in-out infinite;
  scale: -1 1;
}

.logo-smoke {
  position: absolute;
  right: -1px;
  top: 26%;
  width: 7px;
  height: 14px;
  border-radius: 9999px;
  background: radial-gradient(ellipse at 50% 30%, rgba(140, 150, 160, 0.75), rgba(170, 180, 190, 0.35) 50%, transparent 80%);
  filter: blur(2.5px);
  opacity: 0;
  transform: translate(0, 0) scale(0.5);
  animation: logo-smoke-rise 3.6s ease-out infinite;
  pointer-events: none;
}

.logo-smoke-1 {
  animation-delay: 0s;
}

.logo-smoke-2 {
  width: 9px;
  height: 17px;
  right: 2px;
  top: 22%;
  animation-delay: 1.1s;
}

.logo-smoke-3 {
  width: 6px;
  height: 12px;
  right: -3px;
  top: 30%;
  animation-delay: 2.2s;
}

@keyframes logo-smoke-rise {
  0% {
    opacity: 0;
    transform: translate(0, 4px) scale(0.4) rotate(-8deg);
  }
  15% {
    opacity: 0.7;
  }
  45% {
    opacity: 0.45;
    transform: translate(3px, -10px) scale(0.85) rotate(6deg);
  }
  75% {
    opacity: 0.15;
    transform: translate(-2px, -20px) scale(1.2) rotate(-5deg);
  }
  100% {
    opacity: 0;
    transform: translate(2px, -28px) scale(1.5) rotate(8deg);
  }
}

.mobile-drawer-enter-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-drawer-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.mobile-drawer-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.mobile-drawer-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes logo-teapot-breathe {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  20% {
    transform: translate3d(0.5px, -2px, 0) scale(1.03);
  }
  45% {
    transform: translate3d(0, -4px, 0) scale(1.05);
  }
  65% {
    transform: translate3d(-0.5px, -2px, 0) scale(1.02);
  }
  80% {
    transform: translate3d(0, 1.5px, 0) scale(0.98);
  }
}
</style>
