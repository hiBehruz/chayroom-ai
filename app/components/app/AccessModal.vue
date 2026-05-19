<script setup lang="ts">
const open = defineModel<boolean>({ default: false })

const accessFeatures = [
  'Все курсы и гайды',
  'Закрытый чат AI Room Club',
  'Разборы AI-инструментов',
  'Пошаговые инструкции',
  'Доступ к новым материалам'
]
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 py-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-modal-title"
        @click.self="open = false"
      >
        <div class="modal-card relative w-full max-w-sm rounded-2xl bg-[#f7f7f5] p-7 shadow-2xl">
          <button
            class="absolute right-5 top-5 grid size-7 place-items-center rounded-full text-[#6f6f72] transition-colors hover:bg-[#f1f1f1] hover:text-[#1f1f21] focus:outline-none"
            aria-label="Modalni yopish"
            @click="open = false"
          >
            <UIcon name="i-lucide-x" class="size-4.5" />
          </button>

          <div class="mb-7 flex justify-center">
            <div class="relative mt-1">
              <svg
                class="access-modal-icon w-28"
                viewBox="0 0 120 80"
                fill="none"
                style="opacity: 1; transform: none;"
                aria-hidden="true"
              >
                <path
                  d="M28,40 C28,30 36,22 46,22 C56,22 64,30 64,40 C64,50 56,58 46,58 C36,58 28,50 28,40Z"
                  stroke="#1a1a1a"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  fill="none"
                />
                <circle
                  cx="46"
                  cy="38"
                  r="5"
                  stroke="#1a1a1a"
                  stroke-width="2"
                  fill="none"
                />
                <line
                  x1="46"
                  y1="43"
                  x2="46"
                  y2="50"
                  stroke="#1a1a1a"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M64,40 L98,40"
                  stroke="#1a1a1a"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <path
                  d="M86,40 L86,48 M92,40 L92,46 M98,40 L98,48"
                  stroke="#1a1a1a"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <g
                  opacity="0.40319119916821367"
                  style="transform: scale(1.00319); transform-origin: 50% 50%; transform-box: fill-box;"
                >
                  <path
                    d="M16,18 L17.5,13 L21,11.5 L17.5,10 L16,5 L14.5,10 L11,11.5 L14.5,13Z"
                    fill="#0075de"
                    opacity="0.5"
                  />
                </g>
                <g
                  opacity="0.3373252789315302"
                  style="transform: scale(1.03733); transform-origin: 50% 50%; transform-box: fill-box;"
                >
                  <path
                    d="M102,20 L103,17 L105.5,16 L103,15 L102,12 L101,15 L98.5,16 L101,17Z"
                    fill="#0075de"
                    opacity="0.4"
                  />
                </g>
                <circle
                  cx="80"
                  cy="25"
                  r="2"
                  fill="#1a1a1a"
                  opacity="0.15"
                  style="transform: translateY(-2.79674px); transform-origin: 50% 50%; transform-box: fill-box;"
                />
              </svg>
            </div>
          </div>

          <div class="mb-5 text-center">
            <h2 id="access-modal-title" class="text-[22px] font-extrabold leading-tight tracking-tight text-[#202023]">
              Получи доступ
            </h2>
            <p class="mt-2 text-[15px] leading-tight text-[#707073]">
              Оплата через Tribute в Telegram
            </p>
          </div>

          <ul class="mb-6 flex flex-col gap-3">
            <li
              v-for="feature in accessFeatures"
              :key="feature"
              class="flex items-center gap-3 text-[15px] leading-tight text-[#515154]"
            >
              <UIcon name="i-lucide-check" class="size-4.5 shrink-0 text-[#00c853]" />
              <span>{{ feature }}</span>
            </li>
          </ul>

          <a
            href="https://t.me/hellobehruz"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary btn-primary-dark w-full px-5! py-3.5! text-[16px]!"
          >
            Купить в Telegram
            <UIcon name="i-lucide-arrow-right" class="size-5" />
          </a>

          <p class="mt-4 text-center text-[13px] leading-tight text-[#737376]">
            Доступ активируется автоматически после оплаты
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-card {
  animation:
    modal-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both,
    modal-float 5s ease-in-out 0.45s infinite;
}

@keyframes modal-in {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes modal-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

.access-modal-icon {
  animation: access-icon-float 2.6s ease-in-out infinite;
  transform-origin: center;
}

@keyframes access-icon-float {
  0%, 100% {
    transform: translateY(0) rotate(-2deg) scale(1);
  }

  50% {
    transform: translateY(-5px) rotate(2deg) scale(1.04);
  }
}
</style>
