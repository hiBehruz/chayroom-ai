<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { isMiniApp } = useTelegramApp()

authStore.restoreFromStorage()

const { data: meData } = await useAsyncData('profile-me', () => $fetch('/api/auth/me'))
if (meData.value?.user) {
  const apiUser = meData.value.user
  authStore.setUserSession({
    id: apiUser.telegramId,
    telegramId: apiUser.telegramId,
    first_name: apiUser.firstName || authStore.user?.first_name || '',
    last_name: apiUser.lastName ?? undefined,
    username: apiUser.username ?? undefined,
    photo_url: apiUser.photoUrl ?? undefined,
    role: apiUser.role,
    hash: 'session'
  })
  console.log('[Profile] User role:', apiUser.role, 'isAdmin:', apiUser.role === 'ADMIN')
}
if (meData.value?.hasSubscription && !authStore.hasSubscription) {
  authStore.activateSubscription(meData.value.subscription ?? undefined)
}

const user = computed(() => authStore.user)
const displayName = computed(() => authStore.displayName || user.value?.first_name || '')
const username = computed(() => user.value?.username || '')

const initials = computed(() => {
  const parts = displayName.value.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
})

const ABOUT_KEY = 'chayroom_about_me'
const aboutMe = ref<{
  occupation?: string | null
  occupationIcon?: string
  occupationColor?: string
  customOccupation?: string
  goals?: { label: string, icon: string, color: string }[]
  level?: string | null
  levelIcon?: string
  levelColor?: string
}>({})

onMounted(() => {
  try {
    aboutMe.value = JSON.parse(localStorage.getItem(ABOUT_KEY) || '{}')
  } catch {
    aboutMe.value = {}
  }
  void authStore.syncMe()
})

const occupationLabel = computed(() => {
  if (!aboutMe.value.occupation) return null
  if (aboutMe.value.occupation === 'Другое') return aboutMe.value.customOccupation || 'Другое'
  return aboutMe.value.occupation
})

const levelLabels: Record<string, string> = {
  beginner: 'Boshlang\'ich',
  middle: 'O\'rta',
  experienced: 'Tajribali',
  pro: 'Professional'
}

const subscriptionExpiresAt = computed(() => {
  const iso = authStore.subscriptionExpiresAt
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })
})
const tariffLabel = computed(() => authStore.tariffLabel ?? 'Obunasiz')
const subscriptionStatusLabel = computed(() => {
  if (user.value?.role === 'ADMIN') return 'Admin'
  if (!authStore.hasSubscription) return 'Yo\'q'
  if (authStore.subscriptionCancelled) return 'Bekor qilingan'
  return 'Faol'
})
const daysLeftLabel = computed(() => {
  const n = authStore.daysLeft
  return n === null ? '—' : `${n} kun`
})
async function logout() {
  await authStore.logout()
  navigateTo('/')
}

useSeoMeta({ title: 'Profil — Chayroom AI' })
</script>

<template>
  <main
    class="min-h-screen"
    :class="isMiniApp ? 'bg-[#fffdf9]' : 'bg-cx-surface'"
  >
    <!-- ═══════════ MINI-APP ═══════════ -->
    <template v-if="isMiniApp">
      <div class="px-4 pt-6 pb-28">
        <div class="mb-6">
          <h1 class="text-[24px] font-extrabold leading-tight tracking-tight text-[#1f1f21]">
            Profil
          </h1>
        </div>

        <div class="flex flex-col gap-3">
          <!-- Avatar + name -->
          <div class="flex flex-col items-center gap-2 pb-2">
            <img
              v-if="user?.photo_url"
              :src="user.photo_url"
              alt=""
              class="size-20 rounded-full object-cover"
            >
            <div
              v-else
              class="size-20 rounded-full flex items-center justify-center text-white font-black text-[26px] tracking-tight"
              style="background:linear-gradient(135deg,#f97316,#ef4444)"
            >
              {{ initials }}
            </div>
            <h2 class="text-[20px] font-extrabold tracking-tight text-[#1a1a1a] mt-1">
              {{ displayName }}
            </h2>
            <p
              class="text-[14px]"
              style="color:#9aa0a8"
            >
              @{{ username }}
            </p>
          </div>

          <!-- 2×2 info grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-[#f7f5ef] rounded-[20px] p-4">
              <UIcon
                name="solar:crown-bold"
                class="size-5 mb-2"
                style="color:#f59e0b"
              />
              <p
                class="text-[10px] font-bold uppercase tracking-[0.08em] mb-1"
                style="color:#9aa0a8"
              >
                Tarif
              </p>
              <p class="text-[16px] font-extrabold tracking-tight text-[#1a1a1a]">
                {{ tariffLabel }}
              </p>
            </div>
            <div class="bg-[#f7f5ef] rounded-[20px] p-4">
              <UIcon
                name="solar:shield-check-bold"
                class="size-5 mb-2"
                style="color:#4caf82"
              />
              <p
                class="text-[10px] font-bold uppercase tracking-[0.08em] mb-1"
                style="color:#9aa0a8"
              >
                Obuna holati
              </p>
              <p class="text-[16px] font-extrabold tracking-tight text-[#1a1a1a]">
                {{ subscriptionStatusLabel }}
              </p>
            </div>
            <div class="bg-[#f7f5ef] rounded-[20px] p-4">
              <UIcon
                name="solar:calendar-bold"
                class="size-5 mb-2"
                style="color:#4c6ef0"
              />
              <p
                class="text-[10px] font-bold uppercase tracking-[0.08em] mb-1"
                style="color:#9aa0a8"
              >
                Qolgan kunlar
              </p>
              <p class="text-[16px] font-extrabold tracking-tight text-[#1a1a1a]">
                {{ daysLeftLabel }}
              </p>
            </div>
            <div class="bg-[#f7f5ef] rounded-[20px] p-4">
              <UIcon
                name="solar:card-bold"
                class="size-5 mb-2"
                style="color:#9333ea"
              />
              <p
                class="text-[10px] font-bold uppercase tracking-[0.08em] mb-1"
                style="color:#9aa0a8"
              >
                Tugash sanasi
              </p>
              <p class="text-[16px] font-extrabold tracking-tight text-[#1a1a1a]">
                {{ subscriptionExpiresAt }}
              </p>
            </div>
          </div>

          <!-- Actions card -->
          <div class="bg-[#f7f5ef] rounded-[22px] px-4">
            <a
              href="https://t.me/hellobehruz"
              target="_blank"
              rel="noopener noreferrer"
              class="tg-press-sm profile-action-btn"
            >
              <span
                class="size-7 rounded-[8px] flex-none flex items-center justify-center"
                style="background:rgba(52,128,241,0.1)"
              >
                <UIcon
                  name="solar:card-bold"
                  class="size-3.5"
                  style="color:#3480f1"
                />
              </span>
              <span class="flex-1">Obunani boshqarish</span>
              <UIcon
                name="solar:alt-arrow-right-bold"
                class="size-4 shrink-0"
                style="color:#c0c0c8"
              />
            </a>
            <div style="height:1px;background:#e8e4da" />
            <button class="tg-press-sm profile-action-btn">
              <span
                class="size-7 rounded-[8px] flex-none flex items-center justify-center"
                style="background:rgba(76,175,130,0.1)"
              >
                <UIcon
                  name="solar:users-group-rounded-bold"
                  class="size-3.5"
                  style="color:#4caf82"
                />
              </span>
              <span class="flex-1">Referal dasturi</span>
              <UIcon
                name="solar:alt-arrow-right-bold"
                class="size-4 shrink-0"
                style="color:#c0c0c8"
              />
            </button>
            <div style="height:1px;background:#e8e4da" />
            <button class="tg-press-sm profile-action-btn">
              <span
                class="size-7 rounded-[8px] flex-none flex items-center justify-center"
                style="background:rgba(52,128,241,0.1)"
              >
                <UIcon
                  name="solar:chat-round-bold"
                  class="size-3.5"
                  style="color:#3480f1"
                />
              </span>
              <span class="flex-1">Yordam</span>
              <UIcon
                name="solar:alt-arrow-right-bold"
                class="size-4 shrink-0"
                style="color:#c0c0c8"
              />
            </button>
            <div style="height:1px;background:#e8e4da" />
            <button
              class="profile-action-btn"
              disabled
            >
              <span
                class="size-7 rounded-[8px] flex-none flex items-center justify-center"
                style="background:#f5f5f3"
              >
                <UIcon
                  name="solar:robot-bold"
                  class="size-3.5"
                  style="color:#b0b0b8"
                />
              </span>
              <span
                class="flex-1"
                style="color:#a0a0a8"
              >O'z AI agentni ulash</span>
              <span
                class="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                style="color:#a0a0a8;background:#efefef"
              >TEZDA</span>
            </button>

            <!-- Admin actions -->
            <template v-if="user?.role === 'ADMIN'">
              <div style="height:1px;background:#e8e4da" />
              <NuxtLink
                to="/guides/new"
                class="tg-press-sm profile-action-btn"
              >
                <span
                  class="size-7 rounded-[8px] flex-none flex items-center justify-center"
                  style="background:rgba(251,146,60,0.1)"
                >
                  <UIcon
                    name="solar:document-add-bold"
                    class="size-3.5"
                    style="color:#fb923c"
                  />
                </span>
                <span class="flex-1">Qo'llanma qo'shish</span>
                <UIcon
                  name="solar:alt-arrow-right-bold"
                  class="size-4 shrink-0"
                  style="color:#c0c0c8"
                />
              </NuxtLink>
              <div style="height:1px;background:#e8e4da" />
              <NuxtLink
                to="/courses/new"
                class="tg-press-sm profile-action-btn"
              >
                <span
                  class="size-7 rounded-[8px] flex-none flex items-center justify-center"
                  style="background:rgba(139,92,246,0.1)"
                >
                  <UIcon
                    name="solar:library-bold"
                    class="size-3.5"
                    style="color:#8b5cf6"
                  />
                </span>
                <span class="flex-1">Kurs qo'shish</span>
                <UIcon
                  name="solar:alt-arrow-right-bold"
                  class="size-4 shrink-0"
                  style="color:#c0c0c8"
                />
              </NuxtLink>
            </template>
          </div>

          <!-- O'zim haqimda -->
          <div class="bg-[#f7f5ef] rounded-[22px] p-4">
            <div class="flex items-center justify-between mb-3">
              <span
                class="text-[11px] font-bold uppercase tracking-[0.1em]"
                style="color:#a0a0a8"
              >O'zim haqimda</span>
              <NuxtLink
                to="/mini/intro"
                class="text-[13px] font-bold"
                style="color:#3480f1"
              >O'zgartirish</NuxtLink>
            </div>
            <div class="flex flex-col gap-3">
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest mb-1.5"
                  style="color:#b0b0b8"
                >
                  Kim men
                </p>
                <div
                  class="inline-flex items-center gap-2 rounded-[12px] px-3 py-2"
                  style="background:#f8f8f6;border:1px solid #ebebea"
                >
                  <span class="text-[15px]">📚</span>
                  <span
                    class="text-[13px] font-semibold"
                    style="color:#14161f"
                  >O'qiyman, talabaman</span>
                </div>
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest mb-1.5"
                  style="color:#b0b0b8"
                >
                  AI maqsadlarim
                </p>
                <div class="flex flex-wrap gap-2">
                  <div
                    class="inline-flex items-center gap-2 rounded-[12px] px-3 py-2"
                    style="background:#f8f8f6;border:1px solid #ebebea"
                  >
                    <span class="text-[15px]">🚀</span>
                    <span
                      class="text-[13px] font-semibold"
                      style="color:#14161f"
                    >AI bilan loyiha ishga tushirish</span>
                  </div>
                  <div
                    class="inline-flex items-center gap-2 rounded-[12px] px-3 py-2"
                    style="background:#f8f8f6;border:1px solid #ebebea"
                  >
                    <span class="text-[15px]">💰</span>
                    <span
                      class="text-[13px] font-semibold"
                      style="color:#14161f"
                    >AI orqali daromad topish</span>
                  </div>
                </div>
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest mb-1.5"
                  style="color:#b0b0b8"
                >
                  Daraja
                </p>
                <div
                  class="inline-flex items-center gap-2 rounded-[12px] px-3 py-2"
                  style="background:#f8f8f6;border:1px solid #ebebea"
                >
                  <UIcon
                    name="solar:graph-up-bold"
                    class="size-4"
                    style="color:#3480f1"
                  />
                  <span
                    class="text-[13px] font-semibold"
                    style="color:#14161f"
                  >O'rta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════ DESKTOP ═══════════ -->
    <template v-else>
      <div class="mx-auto w-[1240px] max-w-[calc(100vw-40px)] px-0 pb-14 pt-12 max-md:px-4">
        <!-- User header -->
        <div class="flex flex-col items-center text-center mb-8">
          <img
            v-if="user?.photo_url"
            :src="user.photo_url"
            alt=""
            class="w-24 h-24 rounded-full object-cover mb-4"
          >
          <div
            v-else
            class="w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-[30px] tracking-tight mb-4"
            style="background:linear-gradient(135deg,#f97316,#ef4444)"
          >
            {{ initials }}
          </div>
          <h1 class="font-inter-display text-[26px] font-bold leading-tight tracking-[-0.01em] text-[#14161f]">
            {{ displayName }}
          </h1>
          <p class="text-[15px] text-cx-muted mt-1">
            @{{ username }}
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <!-- 4 stat cards -->
          <div class="grid grid-cols-4 gap-5 max-md:grid-cols-2">
            <div class="bg-[#f7f5ef] rounded-2xl p-6 flex flex-col justify-between h-48">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center"
                style="background:rgba(245,158,11,0.12)"
              >
                <UIcon
                  name="i-lucide-crown"
                  class="size-6"
                  style="color:#f59e0b"
                />
              </div>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.1em] text-cx-muted mb-1">
                  Tarif
                </p>
                <p class="text-[17px] font-bold text-[#14161f]">
                  {{ tariffLabel }}
                </p>
              </div>
            </div>
            <div class="bg-[#f7f5ef] rounded-2xl p-6 flex flex-col justify-between h-48">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center"
                style="background:rgba(34,197,94,0.12)"
              >
                <UIcon
                  name="i-lucide-shield-check"
                  class="size-6"
                  style="color:#22c55e"
                />
              </div>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.1em] text-cx-muted mb-1">
                  Obuna holati
                </p>
                <p class="text-[17px] font-bold text-[#14161f]">
                  {{ subscriptionStatusLabel }}
                </p>
              </div>
            </div>
            <div class="bg-[#f7f5ef] rounded-2xl p-6 flex flex-col justify-between h-48">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center"
                style="background:rgba(52,128,241,0.12)"
              >
                <UIcon
                  name="i-lucide-calendar"
                  class="size-6"
                  style="color:#3480f1"
                />
              </div>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.1em] text-cx-muted mb-1">
                  Kun qoldi
                </p>
                <p class="text-[17px] font-bold text-[#14161f]">
                  {{ daysLeftLabel }}
                </p>
              </div>
            </div>
            <div class="bg-[#f7f5ef] rounded-2xl p-6 flex flex-col justify-between h-48">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center"
                style="background:rgba(139,92,246,0.12)"
              >
                <UIcon
                  name="i-lucide-credit-card"
                  class="size-6"
                  style="color:#8b5cf6"
                />
              </div>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.1em] text-cx-muted mb-1">
                  Tugash sanasi
                </p>
                <p class="text-[17px] font-bold text-[#14161f]">
                  {{ subscriptionExpiresAt }}
                </p>
              </div>
            </div>
          </div>

          <!-- Action buttons 2x2 -->
          <div class="grid grid-cols-2 gap-5 max-md:grid-cols-1">
            <a
              href="https://t.me/hellobehruz"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-[#f7f5ef] rounded-2xl px-6 py-5 flex items-center gap-3 border border-transparent hover:border-[#e8e6e1] transition-all duration-200 cursor-pointer"
            >
              <UIcon
                name="i-lucide-credit-card"
                class="size-5 shrink-0 text-cx-muted"
              />
              <span class="flex-1 text-[14px] font-semibold text-[#14161f]">Obunani boshqarish</span>
              <UIcon
                name="solar:alt-arrow-right-bold"
                class="size-4 shrink-0 text-cx-muted"
              />
            </a>
            <button class="bg-[#f7f5ef] rounded-2xl px-6 py-5 flex items-center gap-3 border border-transparent hover:border-[#e8e6e1] transition-all duration-200 text-left">
              <UIcon
                name="i-lucide-gift"
                class="size-5 shrink-0 text-cx-muted"
              />
              <span class="flex-1 text-[14px] font-semibold text-[#14161f]">Referal dasturi</span>
              <UIcon
                name="solar:alt-arrow-right-bold"
                class="size-4 shrink-0 text-cx-muted"
              />
            </button>
            <button class="bg-[#f7f5ef] rounded-2xl px-6 py-5 flex items-center gap-3 border border-transparent hover:border-[#e8e6e1] transition-all duration-200 text-left">
              <UIcon
                name="i-lucide-message-circle"
                class="size-5 shrink-0 text-cx-muted"
              />
              <span class="flex-1 text-[14px] font-semibold text-[#14161f]">Yordam</span>
              <UIcon
                name="solar:alt-arrow-right-bold"
                class="size-4 shrink-0 text-cx-muted"
              />
            </button>
            <button
              class="bg-[#f7f5ef] rounded-2xl px-6 py-5 flex items-center gap-3 border border-transparent opacity-50 cursor-default text-left"
              disabled
            >
              <UIcon
                name="i-lucide-bot"
                class="size-5 shrink-0 text-cx-muted"
              />
              <span class="flex-1 text-[14px] font-semibold text-[#a0a0a8]">O'z AI agentni ulash</span>
              <span class="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#e8e6e1] text-[#a0a0a8]">TEZDA</span>
            </button>
          </div>

          <!-- Admin actions -->
          <div
            v-if="user?.role === 'ADMIN'"
            class="grid grid-cols-2 gap-5 max-md:grid-cols-1"
          >
            <NuxtLink
              to="/guides/new"
              class="bg-[#fff7ed] rounded-2xl px-6 py-5 flex items-center gap-3 border border-transparent hover:border-[#fed7aa] transition-all duration-200"
            >
              <UIcon
                name="solar:document-add-bold"
                class="size-5 shrink-0 text-[#fb923c]"
              />
              <span class="flex-1 text-[14px] font-semibold text-[#14161f]">Qo'llanma qo'shish</span>
              <UIcon
                name="solar:alt-arrow-right-bold"
                class="size-4 shrink-0 text-cx-muted"
              />
            </NuxtLink>
            <NuxtLink
              to="/courses/new"
              class="bg-[#f5f3ff] rounded-2xl px-6 py-5 flex items-center gap-3 border border-transparent hover:border-[#ddd6fe] transition-all duration-200"
            >
              <UIcon
                name="solar:library-bold"
                class="size-5 shrink-0 text-[#8b5cf6]"
              />
              <span class="flex-1 text-[14px] font-semibold text-[#14161f]">Kurs qo'shish</span>
              <UIcon
                name="solar:alt-arrow-right-bold"
                class="size-4 shrink-0 text-cx-muted"
              />
            </NuxtLink>
          </div>

          <!-- O'zim haqimda -->
          <div class="bg-[#f7f5ef] rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.1em] text-cx-muted">
                O'zim haqimda
              </p>
              <NuxtLink
                to="/about-me"
                class="text-[13px] font-bold text-[#3480f1]"
              >O'zgartirish</NuxtLink>
            </div>

            <template v-if="occupationLabel || (aboutMe.goals?.length) || aboutMe.level">
              <div class="flex flex-col gap-3">
                <div v-if="occupationLabel">
                  <p class="text-[10px] font-black uppercase tracking-widest mb-1.5 text-cx-muted">
                    Kim men
                  </p>
                  <div class="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/70 border border-[#e8e6e1]">
                    <UIcon
                      v-if="aboutMe.occupationIcon"
                      :name="aboutMe.occupationIcon"
                      class="size-4 shrink-0"
                      :style="{ color: aboutMe.occupationColor }"
                    />
                    <span class="text-[13px] font-semibold text-[#14161f]">{{ occupationLabel }}</span>
                  </div>
                </div>
                <div v-if="aboutMe.goals?.length">
                  <p class="text-[10px] font-black uppercase tracking-widest mb-1.5 text-cx-muted">
                    AI maqsadlarim
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="goal in aboutMe.goals"
                      :key="typeof goal === 'string' ? goal : goal.label"
                      class="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/70 border border-[#e8e6e1]"
                    >
                      <UIcon
                        v-if="goal.icon"
                        :name="goal.icon"
                        class="size-4 shrink-0"
                        :style="{ color: goal.color }"
                      />
                      <span class="text-[13px] font-semibold text-[#14161f]">{{ typeof goal === 'string' ? goal : goal.label }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="aboutMe.level">
                  <p class="text-[10px] font-black uppercase tracking-widest mb-1.5 text-cx-muted">
                    Daraja
                  </p>
                  <div class="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/70 border border-[#e8e6e1]">
                    <UIcon
                      v-if="aboutMe.levelIcon"
                      :name="aboutMe.levelIcon"
                      class="size-4 shrink-0"
                      :style="{ color: aboutMe.levelColor }"
                    />
                    <span class="text-[13px] font-semibold text-[#14161f]">{{ levelLabels[aboutMe.level] ?? aboutMe.level }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <p class="text-[14px] text-cx-muted">
                Hali to'ldirilmagan.
                <NuxtLink
                  to="/about-me"
                  class="text-[#3480f1] font-semibold"
                >To'ldirish →</NuxtLink>
              </p>
            </template>
          </div>

          <!-- Owner admin panel -->
          <div
            v-if="authStore.isOwner"
            class="bg-[#f7f5ef] rounded-2xl p-6 max-md:hidden"
          >
            <p class="text-[11px] font-bold uppercase tracking-[0.1em] text-cx-muted mb-4">
              Admin panel
            </p>
            <div class="grid grid-cols-2 gap-3">
              <NuxtLink
                to="/admin/guides/new"
                class="admin-link"
              >
                <UIcon
                  name="i-lucide-file-plus-2"
                  class="size-4 shrink-0"
                />
                Qo'llanma qo'shish
              </NuxtLink>
              <NuxtLink
                to="/admin/courses/new"
                class="admin-link"
              >
                <UIcon
                  name="i-lucide-circle-play"
                  class="size-4 shrink-0"
                />
                Kurs qo'shish
              </NuxtLink>
            </div>
          </div>

          <!-- Logout -->
          <button
            class="bg-[#f7f5ef] rounded-2xl px-6 py-5 flex items-center justify-center gap-2.5 border border-transparent hover:border-red-200 transition-all duration-200 w-full focus:outline-none text-red-500 font-semibold text-[14px]"
            @click="logout"
          >
            <UIcon
              name="i-lucide-log-out"
              class="size-4 shrink-0"
            />
            Chiqish
          </button>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.profile-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 4px;
  font-size: 14px;
  font-weight: 600;
  color: #14161f;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  transition: opacity 0.15s ease;
}
.profile-action-btn:active { opacity: 0.6; }
.profile-action-btn:disabled { cursor: default; }

.admin-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #3480f1;
  border: 1px solid #3480f1;
  border-radius: 999px;
  padding: 12px 20px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(52,128,241,0.18);
  transition: gap 0.2s ease, opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}
.admin-link:hover  { gap: 14px; opacity: 0.9; transform: scale(1.04); background: #2a6fe0; }
.admin-link:active { opacity: 0.7; transform: scale(0.98); }

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ef4444;
  width: fit-content;
  border: 1px solid #ef4444;
  border-radius: 999px;
  padding: 12px 20px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(239,68,68,0.18);
  transition: gap 0.2s ease, opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}
.logout-btn:hover  { gap: 14px; opacity: 0.9; transform: scale(1.04); background: #dc2626; }
.logout-btn:active { opacity: 0.7; transform: scale(0.98); }
</style>
