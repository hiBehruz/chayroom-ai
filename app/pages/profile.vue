<script setup lang="ts">
const authStore = useAuthStore()

authStore.restoreFromStorage()

const user = computed(() => authStore.user)
const displayName = computed(() => authStore.displayName || user.value?.first_name || 'Behruz Zaripov')
const username = computed(() => user.value?.username || 'hellobehruz')
const subscriptionUntil = '8 июня 2026 г.'
const agentOptions = [
  { value: 'auto', label: 'Avto', desc: 'Ism bo‘yicha tanlanadi' },
  { value: 'male', label: 'Erkak agent', desc: 'Ko‘k pixel avatar' },
  { value: 'female', label: 'Ayol agent', desc: 'Pushti pixel avatar' }
] as const

onMounted(() => {
  authStore.activateSubscription()
})

function logout() {
  authStore.logout()
  navigateTo('/')
}

useSeoMeta({ title: 'Profil — Chayroom AI' })
</script>

<template>
  <main class="min-h-screen bg-white">
    <div class="mx-auto max-w-155 px-6 pb-14 pt-10 max-md:px-4">
      <header class="mb-7">
        <h1 class="text-[24px] font-extrabold leading-tight tracking-tight text-[#1f1f21]">
          Профиль
        </h1>
        <p class="mt-1.5 text-[14px] leading-snug text-[#6f6f72]">
          Управление аккаунтом и подпиской
        </p>
      </header>

      <section class="flex flex-col gap-4">
          <div class="rounded-[26px] bg-[#f8f8f6] p-5">
          <div class="flex items-center justify-between gap-4">
            <div class="flex min-w-0 items-center gap-4">
              <AppPixelAgentAvatar :variant="authStore.resolvedAgentVariant" size="lg" />
              <div class="min-w-0">
                <h2 class="truncate text-[17px] font-extrabold leading-tight text-[#242426]">
                  {{ displayName }}
                </h2>
                <p class="mt-1 text-[14px] leading-tight text-[#727275]">
                  @{{ username }}
                </p>
              </div>
            </div>

            <button
              class="shrink-0 rounded-full bg-[#ececea] px-4 py-2 text-[13px] font-bold leading-none text-[#242426] transition-colors hover:bg-[#dedddb] focus:outline-none"
              @click="logout"
            >
              Выйти
            </button>
          </div>
        </div>

          <div class="rounded-[26px] bg-[#f8f8f6] p-5">
          <div class="mb-4 flex items-center justify-between gap-4">
            <div>
              <div class="text-[12px] font-bold uppercase tracking-[0.08em] text-[#8a8a8d]">
                Pixel agent
              </div>
              <p class="mt-1 text-[13px] leading-tight text-[#727275]">
                Navbar avatarini tanlang
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <button
              v-for="option in agentOptions"
              :key="option.value"
              class="rounded-[18px] border p-3 text-left transition-all duration-200 focus:outline-none"
              :class="authStore.agentVariant === option.value
                ? 'border-[#0075de] bg-[#eef7ff] shadow-[0_10px_28px_rgba(0,117,222,0.14)]'
                : 'border-[#e7e7e4] bg-[#f8f8f6] hover:border-[#b9d9ff] hover:bg-white'"
              @click="authStore.setAgentVariant(option.value)"
            >
              <div class="mb-2 flex justify-center">
                <AppPixelAgentAvatar
                  :variant="option.value === 'female' ? 'female' : option.value === 'male' ? 'male' : authStore.resolvedAgentVariant"
                />
              </div>
              <div class="text-center text-[13px] font-extrabold text-[#242426]">
                {{ option.label }}
              </div>
              <div class="mt-1 text-center text-[11px] leading-tight text-[#727275]">
                {{ option.desc }}
              </div>
            </button>
          </div>
        </div>

          <div class="rounded-[26px] bg-[#f8f8f6] p-5">
          <div class="mb-4 text-[12px] font-bold uppercase tracking-[0.08em] text-[#8a8a8d]">
            Подписка
          </div>

          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 class="text-[18px] font-extrabold leading-tight text-[#242426]">
                AI Room Club
              </h2>
              <p class="mt-2 text-[14px] leading-tight text-[#707073]">
                Активна до {{ subscriptionUntil }}
              </p>
            </div>

            <span class="mt-0.5 shrink-0 rounded-full bg-[#d9f8e3] px-3 py-1.5 text-[12px] font-bold leading-none text-[#078b31]">
              Активна
            </span>
          </div>

          <a
            href="https://t.me/hellobehruz"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary btn-primary-dark mt-5 px-5 py-2.5 text-[14px]! font-medium! leading-none"
          >
            Управлять подпиской в Telegram
          </a>
        </div>
      </section>

      <!-- Owner admin panel -->
      <section v-if="authStore.isOwner" class="mt-4 flex flex-col gap-3">
        <div class="rounded-[26px] bg-[#f8f8f6] p-5">
          <div class="mb-4 text-[12px] font-bold uppercase tracking-[0.08em] text-[#8a8a8d]">
            Admin panel
          </div>
          <div class="flex flex-col gap-2.5">
            <NuxtLink
              to="/admin/guides/new"
              class="flex items-center gap-3 rounded-[16px] border border-[#e7e7e4] bg-white px-4 py-3 text-[14px] font-semibold text-[#1a1a1a] transition-all hover:border-cx-blue hover:shadow-[0_4px_16px_rgba(0,117,222,0.10)]"
            >
              <UIcon name="i-lucide-file-plus-2" class="size-4.5 text-cx-blue shrink-0" />
              Qo'llanma qo'shish
            </NuxtLink>
            <NuxtLink
              to="/admin/courses/new"
              class="flex items-center gap-3 rounded-[16px] border border-[#e7e7e4] bg-white px-4 py-3 text-[14px] font-semibold text-[#1a1a1a] transition-all hover:border-cx-blue hover:shadow-[0_4px_16px_rgba(0,117,222,0.10)]"
            >
              <UIcon name="i-lucide-circle-play" class="size-4.5 text-cx-blue shrink-0" />
              Kurs qo'shish
            </NuxtLink>
          </div>
        </div>
      </section>

      <div class="mt-7 flex justify-center">
        <NuxtLink
          to="/dashboard"
          class="text-[14px] font-medium leading-tight text-[#737376] transition-colors hover:text-[#1f1f21]"
        >
          ← Вернуться в дашборд
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
