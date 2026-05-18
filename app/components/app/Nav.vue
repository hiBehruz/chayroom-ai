<script setup lang="ts">
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const isProfileOpen = ref(false)
const route = useRoute()

const langRefs = ref<HTMLElement[]>([])
const langIndicator = ref({ left: '3px', width: '0px' })

function updateLangIndicator() {
  const idx = localeStore.locale === 'uz' ? 0 : 1
  const el = langRefs.value[idx]
  if (!el) return
  langIndicator.value = { left: el.offsetLeft + 'px', width: el.offsetWidth + 'px' }
}

function setLocale(lang: 'uz' | 'ru') {
  localeStore.setLocale(lang)
  nextTick(updateLangIndicator)
}

onMounted(() => nextTick(updateLangIndicator))

const navLinks = [
  { label: 'Курсы', href: '/courses' },
  { label: 'Гайды', href: '/guides' },
  { label: 'Панель', href: '/dashboard' },
  { label: 'Тарифы', href: '#pricing' },
  { label: 'FAQ', href: '#faq' }
]

function isActive(href: string) {
  return href.startsWith('/') && route.path === href
}

function scrollToSection(href: string) {
  if (href.startsWith('/')) { navigateTo(href); return }
  if (route.path !== '/') { navigateTo('/' + href); return }
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}

function logout() {
  isProfileOpen.value = false
  authStore.logout()
  navigateTo('/')
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cx-line/60 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
    <div class="max-w-295 mx-auto px-10">
      <div class="flex items-center h-15 gap-10">

        <!-- Logo -->
        <NuxtLink
          to="/"
          class="shrink-0 text-[15px] font-extrabold tracking-tight text-[#1a1a1a] whitespace-nowrap hover:opacity-70 transition-opacity duration-200"
        >
          Chayroom <span class="text-cx-blue">AI</span> Club
        </NuxtLink>

        <!-- Links -->
        <div class="flex gap-1 flex-1 justify-center">
          <button
            v-for="link in navLinks"
            :key="link.label"
            :class="[
              'relative px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer',
              isActive(link.href)
                ? 'text-[#1a1a1a] bg-[#f0f0f0]'
                : 'text-cx-muted hover:text-[#1a1a1a] hover:bg-[#f7f7f7]'
            ]"
            @click="scrollToSection(link.href)"
          >
            {{ link.label }}
          </button>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-2.5 shrink-0">

          <!-- Lang switcher -->
          <div class="relative flex bg-[#f0f0f0] rounded-lg p-0.75">
            <div
              class="absolute top-0.75 bottom-0.75 bg-white rounded-md shadow-sm pointer-events-none"
              :style="{ left: langIndicator.left, width: langIndicator.width, transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1)' }"
            />
            <button
              v-for="(lang, i) in (['uz', 'ru'] as const)"
              :key="lang"
              :ref="el => { if (el) langRefs[i] = el as HTMLElement }"
              :class="[
                'relative z-10 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase transition-colors duration-200',
                localeStore.locale === lang ? 'text-[#1a1a1a]' : 'text-cx-muted hover:text-cx-ink'
              ]"
              @click="setLocale(lang)"
            >
              {{ lang }}
            </button>
          </div>

          <!-- User or login -->
          <template v-if="authStore.user">
            <div class="relative">
              <button
                class="flex items-center gap-2 px-3 py-1.5 pl-1.5 rounded-full border border-cx-line hover:border-cx-blue/30 hover:shadow-sm transition-all duration-200 cursor-pointer bg-white"
                @click="isProfileOpen = !isProfileOpen"
              >
                <div class="w-7.5 h-7.5 rounded-full bg-linear-to-br from-cx-blue to-[#1A4FE0] flex items-center justify-center text-[11px] font-extrabold text-white">
                  {{ authStore.initials || authStore.user.first_name[0] }}
                </div>
                <span class="text-[13px] font-semibold">{{ authStore.displayName || authStore.user.first_name }}</span>
                <UIcon name="i-lucide-chevron-down" :class="['size-3.5 text-cx-muted transition-transform duration-200', isProfileOpen ? 'rotate-180' : '']" />
              </button>

              <Transition name="dropdown">
                <div
                  v-if="isProfileOpen"
                  class="absolute right-0 top-[calc(100%+8px)] w-55 rounded-2xl border border-cx-line bg-white/90 backdrop-blur-md p-2 shadow-lift"
                >
                  <div class="px-3 py-2 border-b border-cx-line mb-1">
                    <div class="text-sm font-bold">{{ authStore.displayName || authStore.user.first_name }}</div>
                    <div v-if="authStore.user.username" class="text-xs text-cx-muted">
                      @{{ authStore.user.username }}
                    </div>
                  </div>
                  <NuxtLink
                    to="/dashboard"
                    class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                    @click="isProfileOpen = false"
                  >
                    <UIcon name="i-lucide-layout-dashboard" class="size-4 text-cx-muted" />
                    Панель
                  </NuxtLink>
                  <button class="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-cx-muted hover:bg-gray-50 transition-colors">
                    <UIcon name="i-lucide-settings" class="size-4" />
                    Настройки профиля
                  </button>
                  <button
                    class="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    @click="logout"
                  >
                    <UIcon name="i-lucide-log-out" class="size-4" />
                    Выйти
                  </button>
                </div>
              </Transition>
            </div>
          </template>

          <template v-else>
            <NuxtLink to="/login" class="btn-primary text-[13px]! px-4! py-2!">
              <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-white shrink-0">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
              </svg>
              Войти
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
