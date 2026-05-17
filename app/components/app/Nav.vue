<script setup lang="ts">
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const navLinks = [
  { label: 'Курсы', href: '#features' },
  { label: 'Гайды', href: '#guides' },
  { label: 'Тарифы', href: '#pricing' },
  { label: 'FAQ', href: '#faq' }
]

function scrollTo(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-cx-line">
    <div class="max-w-[1180px] mx-auto px-10">
      <div class="flex items-center py-4 gap-10">
        <!-- Brand -->
        <div class="flex items-center gap-[10px] shrink-0">
          <div class="w-10 h-10 bg-cx-ink rounded-[10px] flex items-center justify-center">
            <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div>
            <div class="font-extrabold text-xl tracking-tight leading-none">
              Chayroom <span class="text-cx-blue">AI</span>
            </div>
            <div class="text-[9px] font-semibold tracking-[.08em] uppercase text-cx-muted mt-0.5">
              AI Room Club
            </div>
          </div>
        </div>

        <!-- Links -->
        <div class="flex gap-7 flex-1 justify-center">
          <button
            v-for="link in navLinks"
            :key="link.label"
            class="text-sm font-medium text-cx-ink hover:opacity-50 transition-opacity duration-200 cursor-pointer"
            @click="scrollTo(link.href)"
          >
            {{ link.label }}
          </button>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-[10px] shrink-0">
          <!-- Lang switcher -->
          <div class="flex gap-0.5 bg-white border border-cx-line rounded-lg p-[3px]">
            <button
              v-for="lang in (['ru', 'uz'] as const)"
              :key="lang"
              :class="[
                'px-2 py-1 rounded-md text-[11px] font-semibold uppercase transition-colors duration-200',
                localeStore.locale === lang
                  ? 'bg-cx-ink text-white'
                  : 'text-cx-muted hover:text-cx-ink'
              ]"
              @click="localeStore.setLocale(lang)"
            >
              {{ lang }}
            </button>
          </div>

          <!-- User or login -->
          <template v-if="authStore.user">
            <div class="flex items-center gap-2 px-3 py-1.5 pl-1.5 rounded-full border border-cx-line cursor-pointer">
              <div class="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-cx-blue to-[#1A4FE0] flex items-center justify-center text-[11px] font-extrabold text-white">
                {{ authStore.user.first_name[0] }}
              </div>
              <span class="text-[13px] font-semibold">{{ authStore.user.first_name }}</span>
              <span class="text-cx-muted text-xs">▾</span>
            </div>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="px-4 py-2 rounded-full bg-cx-ink text-white text-sm font-semibold hover:bg-cx-ink-soft transition-colors duration-200"
            >
              Войти
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
