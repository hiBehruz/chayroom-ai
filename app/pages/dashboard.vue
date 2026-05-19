<!-- app/pages/dashboard.vue -->
<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

const authStore = useAuthStore()

authStore.restoreFromStorage()

const user = computed(() => authStore.user)
const hasSubscription = computed(() => authStore.hasSubscription)
const hasCourseAccess = computed(() => Boolean(user.value))
const isAccessModalOpen = ref(false)

const stats = [
  { label: 'Kurslar', value: '2', icon: 'i-lucide-book-open', iconColor: 'text-cx-blue' },
  { label: "O'tilgan darslar", value: '31 / 38', icon: 'i-lucide-circle-check', iconColor: 'text-green-500' },
  { label: "O'qish soatlari", value: '8h', icon: 'i-lucide-clock', iconColor: 'text-yellow-500' },
  { label: 'Sertifikatlar', value: '0', icon: 'i-lucide-timer', iconColor: 'text-purple-500' },
]

const courses = [
  {
    title: 'Hermes asosida AI agent yaratish va sozlash',
    desc: "Bu kursda biz noldan agent yaratamiz, unga ko'nikmalar va yaxshilanishlar qo'shamiz.",
    tags: ['AI', 'AI agent', 'Hermes'],
    slug: 'hermes-ai-agent',
    free: true,
    progress: 0,
  },
  {
    title: 'Vibe coding noldan',
    desc: "Kod bilmasdan kerakli digital yechimlar: saytlar, vositalar va ilovalarni yaratish.",
    tags: ['Vibe coding'],
    slug: 'vibe-coding',
    free: true,
    progress: 100,
  },
]


useSeoMeta({ title: 'Panel — Chayroom AI' })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8 max-md:px-4">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium">Panel</span>
      </div>

      <!-- Paywall CTA — tepada, obuna yo'q bo'lganda -->
      <div
        v-if="!user"
        class="mb-8 rounded-2xl bg-[#f7f7f5] px-10 py-8 flex items-center justify-center gap-8 paywall-enter sticky top-20 z-10 mx-32 max-md:mx-0 max-md:flex-col max-md:px-6 max-md:py-6 max-md:text-center max-md:gap-4"
      >
        <ClientOnly>
          <div class="shrink-0 w-36 h-36">
            <DotLottieVue
              src="/animations/Door.lottie"
              :autoplay="true"
              :loop="true"
              style="width:100%;height:100%;display:block"
            />
          </div>
        </ClientOnly>
        <div class="flex flex-col items-start text-left max-md:items-center max-md:text-center">
          <h2 class="text-[20px] font-extrabold text-[#1a1a1a] mb-2">
            O'quv dashboardingni och
          </h2>
          <p class="text-[14px] text-cx-muted mb-6 max-w-sm leading-snug">
            Barcha kurslarga kirish, progress kuzatuvi va sertifikatlarga ega bo'ling.
          </p>
          <NuxtLink
            to="/login"
            class="btn-primary btn-primary-dark text-[15px]! py-3! px-6! flex items-center gap-2 max-md:self-center"
          >
            <UIcon name="i-lucide-sparkles" class="size-4" />
            To'liq kirish huquqini olish →
          </NuxtLink>
          <p class="mt-3 text-[12px] text-cx-muted">
            Telegram orqali to'lov. Barcha kurs va materiallarga kirish.
          </p>
        </div>
      </div>

      <!-- Dashboard content — deactive when no subscription -->
      <div :class="!hasCourseAccess ? 'opacity-40 grayscale pointer-events-none select-none' : ''">

      <!-- Welcome -->
      <div class="mb-7">
        <h1 class="text-[28px] font-extrabold tracking-tight text-[#1a1a1a]">
          Qaytganing bilan!
        </h1>
        <p class="text-cx-muted mt-1 text-[14px]">
          O'qishni davom ettir. Juda yaxshi harakat qilyapsan.
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 max-md:grid-cols-1 gap-4 mb-6">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-[#f7f7f5] border border-cx-line rounded-2xl p-5 flex flex-col gap-2"
        >
          <UIcon :name="stat.icon" :class="['size-5', stat.iconColor]" />
          <div class="text-[22px] font-extrabold tracking-tight text-[#1a1a1a]">
            {{ stat.value }}
          </div>
          <div class="text-[13px] text-cx-muted">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Telegram -->
      <div class="bg-[#f7f7f5] border border-cx-line rounded-2xl px-6 py-5 mb-8">
        <div class="flex items-start gap-4">
          <UIcon name="i-lucide-users-round" class="size-5 text-cx-blue mt-0.5 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-[15px] font-bold text-[#1a1a1a] mb-1">
              Telegram yopiq kanal
            </div>
            <div class="text-[13px] text-cx-muted mb-4">
              Ishtirokchilar bilan muloqot, efirlar va yangiliklar.
            </div>
            <!-- Obuna bor — kirish tugmasi -->
            <template v-if="hasCourseAccess">
              <button class="btn-primary btn-primary-dark text-[13px]! px-5! py-2!">
                Telegramga kirish
                <UIcon name="i-lucide-external-link" class="size-3.5" />
              </button>
            </template>

            <!-- Obuna yo'q — qulflangan matn -->
            <template v-else>
              <p class="flex items-center gap-1.5 text-[13px] text-cx-muted">
                <UIcon name="i-lucide-lock" class="size-4 shrink-0" />
                Obuna bo'lgandan keyin kirish ochiladi.
              </p>
            </template>
          </div>
        </div>
      </div>

      <!-- Main grid -->
      <div class="grid grid-cols-[1fr_380px] max-md:grid-cols-1 gap-6 mb-8">
        <!-- Courses -->
        <div>
          <div class="flex items-center gap-2 mb-5">
            <UIcon name="i-lucide-graduation-cap" class="size-4 text-cx-blue" />
            <h2 class="text-[15px] font-bold text-[#1a1a1a]">Mening kurslarim</h2>
          </div>
          <div class="flex flex-col gap-3">
            <NuxtLink
              v-for="course in courses"
              :key="course.title"
              :to="`/courses/${course.slug}`"
              class="group bg-[#f7f7f5] border border-cx-line rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] block"
            >
              <div class="flex items-start justify-between gap-3 mb-2">
                <span class="text-[14px] font-semibold text-[#1a1a1a] leading-[1.4]">
                  {{ course.title }}
                </span>
                <!-- Obuna yo'q — qulflangan -->
                <span
                  v-if="!hasCourseAccess"
                  class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-[11px] font-semibold border border-red-100"
                >
                  <UIcon name="i-lucide-lock-keyhole" class="size-3" />
                  Заблокировано
                </span>

                <!-- Obuna active — ochiq -->
                <span
                  v-else
                  class="shrink-0 flex items-center gap-1 text-xs font-medium text-green-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="size-4"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                  Доступно
                </span>
              </div>
              <p class="text-[12px] text-cx-muted leading-[1.6] mb-3">{{ course.desc }}</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in course.tags"
                  :key="tag"
                  class="px-3 py-1 rounded-full bg-[#EAEAE8] border border-[#D4D4D1] text-[12px] text-[#6B6B6B] font-medium"
                >{{ tag }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Right column -->
        <div class="flex flex-col gap-6">
          <!-- Progress -->
          <div>
            <div class="flex items-center gap-2 mb-5">
              <UIcon name="i-lucide-bar-chart-2" class="size-4 text-cx-blue" />
              <h2 class="text-[15px] font-bold text-[#1a1a1a]">O'qish progressi</h2>
            </div>
            <div class="bg-[#f7f7f5] border border-cx-line rounded-2xl p-5 flex flex-col gap-4">
              <div
                v-for="course in courses"
                :key="course.title"
                class="flex flex-col gap-2"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[12px] text-cx-muted truncate max-w-55">{{ course.title }}</span>
                  <span class="text-[12px] font-semibold text-cx-muted shrink-0 ml-2">{{ course.progress }}%</span>
                </div>
                <div class="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                  <div
                    class="h-full bg-cx-blue rounded-full transition-all duration-500"
                    :style="{ width: `${course.progress}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Instructor -->
          <div class="bg-[#f7f7f5] border border-cx-line rounded-2xl p-5">
            <div class="text-[10px] font-bold text-cx-muted uppercase tracking-widest mb-3">
              Instruktor
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-linear-to-br from-cx-blue to-[#1A4FE0] flex items-center justify-center text-white font-bold text-[14px] shrink-0">
                AI
              </div>
              <div>
                <div class="text-[14px] font-bold text-[#1a1a1a]">Chayroom AI Club</div>
                <div class="text-[12px] text-cx-muted">Ekspertlar jamoasi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div><!-- end dashboard content -->
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
  </div>
</template>

<style scoped>
.paywall-enter {
  animation:
    paywall-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both,
    paywall-float 5s ease-in-out 0.55s infinite;
}
@keyframes paywall-in {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes paywall-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
</style>
