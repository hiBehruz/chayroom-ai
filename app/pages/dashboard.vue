<!-- app/pages/dashboard.vue -->
<script setup lang="ts">

const authStore = useAuthStore()
const { isMiniApp } = useTelegramApp()

authStore.restoreFromStorage()

const user = computed(() => authStore.user)
const hasCourseAccess = computed(() => authStore.hasSubscription)
const isAccessModalOpen = ref(false)

useSeoMeta({ title: 'Panel — Chayroom AI' })
</script>

<template>
  <MiniAppDashboard v-if="isMiniApp" />
  <div
    v-else
    class="min-h-screen bg-cx-surface"
  >
    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 py-8 max-md:px-4">
      <!-- Paywall CTA — tepada, obuna yo'q bo'lganda -->
      <div
        v-if="!hasCourseAccess"
        class="mb-8 rounded-2xl bg-[#f7f7f5] px-10 py-8 flex items-center justify-center gap-8 paywall-enter sticky top-20 z-10 w-220.5 max-w-full mx-auto max-md:flex-col max-md:px-6 max-md:py-6 max-md:text-center max-md:gap-4"
      >
        <div class="flex flex-col items-center text-center">
          <h2 class="text-[40px] font-extrabold text-[#1a1a1a] mb-3 leading-tight">
            O'quv dashboardingni och
          </h2>
          <p class="text-[22px] text-cx-muted mb-6 max-w-md leading-snug">
            Barcha kurslarga kirish, progress kuzatuvi va sertifikatlarga ega bo'ling.
          </p>
          <NuxtLink
            :to="user ? '/#pricing' : '/login'"
            class="hero-link-btn hero-link-btn--blue paywall-btn max-md:self-center"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="size-4.5 shrink-0"
            />
            <span>To'liq kirish huquqini olish</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 shrink-0"
            />
          </NuxtLink>
          <p class="mt-3 text-[13px] text-cx-muted">
            Telegram orqali to'lov. Barcha kurs va materiallarga kirish.
          </p>
        </div>
      </div>

      <!-- Dashboard content — deactive when no subscription -->
      <div :class="!hasCourseAccess ? 'opacity-40 grayscale pointer-events-none select-none' : ''">
        <!-- Welcome -->
        <div class="mb-7 text-center">
          <h1 class="font-inter-display text-[60px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#1a1a1a] max-md:text-[28px] max-md:leading-[30.8px] max-md:tracking-[-0.56px]">
            <span class="relative inline-block">Привет,<svg
              class="absolute -bottom-1 left-[-1%] w-[102%] overflow-visible"
              viewBox="0 0 600 18"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            ><path
              d="M10,12 C150,2 450,2 590,12"
              stroke="#3480f1"
              stroke-width="5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="vector-effect:non-scaling-stroke"
            /></svg></span> {{ user?.first_name }} 👋🏻
          </h1>
          <p class="text-[15px] text-cx-muted mt-3">
            Bu yerda kurslar, qo'llanmalar va hamjamiyatingiz — barchasi bir joyda.
          </p>
        </div>

        <div class="h-px bg-[#e8e6e1] mb-10 max-md:mb-8" />

        <!-- Main grid: Telegram + Courses + Progress -->
        <div class="grid grid-cols-4 gap-5 mb-8 max-md:grid-cols-1">
          <!-- Про наше сообщество -->
          <NuxtLink
            to="/community"
            class="group rounded-2xl bg-[#f7f5ef] p-6 flex flex-col justify-between border border-transparent hover:border-[#e8e6e1] hover:shadow-[0_4px_24px_rgba(52,128,241,0.09)] transition-all duration-200 h-66 max-md:h-auto max-md:gap-6 cursor-pointer"
          >
            <div
              class="icon-wrap w-16 h-16 flex items-center justify-center rounded-2xl"
              style="background:rgba(52,128,241,0.15)"
            >
              <UIcon
                name="i-solar-users-group-rounded-bold"
                class="icon-bounce size-8"
                style="color:#3480f1"
              />
            </div>
            <div>
              <div class="flex items-start justify-between gap-2 mb-1">
                <h2 class="font-inter-display text-[20px] font-semibold leading-[1.1] tracking-[-0.01em] text-[#14161f] group-hover:text-[#3480f1] transition-colors duration-200">
                  Bizning club
                </h2>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-5 shrink-0 mt-1 text-[#bbb] group-hover:text-[#3480f1] group-hover:translate-x-0.5 transition-all duration-200"
                />
              </div>
              <p class="text-[13px] text-cx-muted leading-snug">Klub qanday ishlashi va nimalar borligini bilib oling.</p>
            </div>
          </NuxtLink>

          <!-- Наши правила -->
          <NuxtLink
            to="/rules"
            class="group rounded-2xl bg-[#f7f5ef] p-6 flex flex-col justify-between border border-transparent hover:border-[#e8e6e1] hover:shadow-[0_4px_24px_rgba(52,128,241,0.09)] transition-all duration-200 h-66 max-md:h-auto max-md:gap-6 cursor-pointer"
          >
            <div
              class="icon-wrap w-16 h-16 flex items-center justify-center rounded-2xl"
              style="background:rgba(34,197,94,0.15)"
            >
              <UIcon
                name="i-solar-shield-bold"
                class="icon-bounce size-8"
                style="color:#22c55e"
              />
            </div>
            <div>
              <div class="flex items-start justify-between gap-2 mb-1">
                <h2 class="font-inter-display text-[20px] font-semibold leading-[1.1] tracking-[-0.01em] text-[#14161f] group-hover:text-[#3480f1] transition-colors duration-200">
                  Qoidalar
                </h2>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-5 shrink-0 mt-1 text-[#bbb] group-hover:text-[#3480f1] group-hover:translate-x-0.5 transition-all duration-200"
                />
              </div>
              <p class="text-[13px] text-cx-muted leading-snug">Jamoatchilik qoidalari, ikki daqiqada o'qiladi.</p>
            </div>
          </NuxtLink>

          <!-- Расскажите о себе -->
          <NuxtLink
            to="/about-me"
            class="group rounded-2xl bg-[#f7f5ef] p-6 flex flex-col justify-between border border-transparent hover:border-[#e8e6e1] hover:shadow-[0_4px_24px_rgba(52,128,241,0.09)] transition-all duration-200 h-66 max-md:h-auto max-md:gap-6 cursor-pointer"
          >
            <div
              class="icon-wrap w-16 h-16 flex items-center justify-center rounded-2xl"
              style="background:rgba(20,184,166,0.12)"
            >
              <UIcon
                name="i-solar-user-speak-bold"
                class="icon-bounce size-8"
                style="color:#14b8a6"
              />
            </div>
            <div>
              <div class="flex items-start justify-between gap-2 mb-1">
                <h2 class="font-inter-display text-[20px] font-semibold leading-[1.1] tracking-[-0.01em] text-[#14161f] group-hover:text-[#3480f1] transition-colors duration-200">
                  O'zingiz haqingizda
                </h2>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-5 shrink-0 mt-1 text-[#bbb] group-hover:text-[#3480f1] group-hover:translate-x-0.5 transition-all duration-200"
                />
              </div>
              <p class="text-[13px] text-cx-muted leading-snug">Maqsadlaringizni ko'rsating, mos materiallar topamiz.</p>
            </div>
          </NuxtLink>

          <!-- Первый материал -->
          <NuxtLink
            to="/materials"
            class="group rounded-2xl bg-[#f7f5ef] p-6 flex flex-col justify-between border border-transparent hover:border-[#e8e6e1] hover:shadow-[0_4px_24px_rgba(52,128,241,0.09)] transition-all duration-200 h-66 max-md:h-auto max-md:gap-6 cursor-pointer"
          >
            <div
              class="icon-wrap w-16 h-16 flex items-center justify-center rounded-2xl"
              style="background:rgba(245,158,11,0.12)"
            >
              <UIcon
                name="i-solar-notes-minimalistic-bold"
                class="icon-bounce size-8"
                style="color:#f59e0b"
              />
            </div>
            <div>
              <div class="flex items-start justify-between gap-2 mb-1">
                <h2 class="font-inter-display text-[20px] font-semibold leading-[1.1] tracking-[-0.01em] text-[#14161f] group-hover:text-[#3480f1] transition-colors duration-200">
                  Birinchi material
                </h2>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-5 shrink-0 mt-1 text-[#bbb] group-hover:text-[#3480f1] group-hover:translate-x-0.5 transition-all duration-200"
                />
              </div>
              <p class="text-[13px] text-cx-muted leading-snug">Boshlash uchun tavsiya etilgan qo'llanma.</p>
            </div>
          </NuxtLink>
        </div>
      </div><!-- end dashboard content -->
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
  </div>
</template>

<style scoped>
/* Paywall CTA button */
.paywall-btn {
  gap: 8px;
  padding: 12px 20px;
  font-size: 16px;
  text-decoration: none;
}
.paywall-btn:hover  { gap: 14px; }

/* Dashboard card button */
.db-card-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #0a0a0a;
  border: 1px solid #0a0a0a;
  border-radius: 999px;
  padding: 12px 20px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(10, 10, 10, 0.12);
  transition: gap 0.2s ease, opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}
.db-card-btn:hover  { gap: 14px; opacity: 0.9; transform: scale(1.04); background: #1a1a1a; }
.db-card-btn:active { opacity: 0.7; transform: scale(0.98); }

/* Mini course card art */
.mini-art-star {
  position: absolute;
  display: block;
  background: currentColor;
  clip-path: polygon(50% 0, 62% 36%, 100% 50%, 62% 64%, 50% 100%, 38% 64%, 0 50%, 38% 36%);
}
.mini-art-star-1 { width: 22px; aspect-ratio: 1; left: 14px; bottom: 20px; }
.mini-art-star-2 { width: 14px; aspect-ratio: 1; right: 18px; top: 14px; }
.mini-art-obj {
  position: absolute;
  right: 16px;
  bottom: 20px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  transform: rotate(45deg);
  box-shadow: inset 0 0 0 4px rgba(255,253,249,0.7);
}

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
