<script setup lang="ts">
const authStore = useAuthStore()

authStore.restoreFromStorage()

const user = computed(() => authStore.user)
const displayName = computed(() => authStore.displayName || user.value?.first_name || 'Behruz Zaripov')
const username = computed(() => user.value?.username || 'hellobehruz')

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
    <div class="mx-auto max-w-[760px] px-8 py-10">
      <header class="mb-9">
        <h1 class="text-[34px] font-extrabold leading-none tracking-tight text-[#1f1f21]">
          Профиль
        </h1>
        <p class="mt-3 text-[18px] leading-tight text-[#6f6f72]">
          Управление аккаунтом и подпиской
        </p>
      </header>

      <section class="flex flex-col gap-6">
        <div class="rounded-[22px] border border-[#dedede] bg-white px-7 py-7 shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
          <div class="flex items-center justify-between gap-6">
            <div class="min-w-0">
              <h2 class="text-[19px] font-bold leading-tight text-[#242426]">
                {{ displayName }}
              </h2>
              <p class="mt-1.5 text-[17px] leading-tight text-[#727275]">
                @{{ username }}
              </p>
            </div>

            <button
              class="shrink-0 rounded-full bg-[#dedddb] px-5 py-3 text-[16px] font-bold leading-none text-[#242426] transition-colors hover:bg-[#d1d0ce] focus:outline-none"
              @click="logout"
            >
              Выйти
            </button>
          </div>
        </div>

        <div class="rounded-[22px] border border-[#dedede] bg-white px-7 py-7 shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
          <div class="mb-6 text-[17px] font-medium uppercase tracking-[0.06em] text-[#707073]">
            Подписка
          </div>

          <div class="flex items-start justify-between gap-6">
            <div class="min-w-0">
              <h2 class="text-[19px] font-bold leading-tight text-[#242426]">
                AI Room Club
              </h2>
              <p class="mt-2.5 text-[17px] leading-tight text-[#707073]">
                Активна до 8 июня 2026 г.
              </p>
            </div>

            <span class="mt-1 shrink-0 rounded-full bg-[#d9f8e3] px-4 py-2 text-[14px] font-bold leading-none text-[#078b31]">
              Активна
            </span>
          </div>

          <button class="mt-7 rounded-full bg-[#e8f2ff] px-6 py-3 text-[17px] font-medium leading-none text-[#0075de] transition-colors hover:bg-[#ddecff] focus:outline-none">
            Управлять подпиской в Telegram
          </button>
        </div>
      </section>

      <div class="mt-9 flex justify-center">
        <NuxtLink
          to="/dashboard"
          class="text-[17px] font-medium leading-tight text-[#737376] transition-colors hover:text-[#1f1f21]"
        >
          ← Вернуться в дашборд
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
