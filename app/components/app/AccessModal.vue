<script setup lang="ts">
const open = defineModel<boolean>({ default: false })

const accessFeatures = [
  'Barcha kurslar va qo\'llanmalar',
  'Yopiq Chayroom AI Club chat',
  'AI vositalarini tahlil qilish',
  'Bosqichma-bosqich ko\'rsatmalar',
  'Yangi materiallarga kirish'
]

const config = useRuntimeConfig()
const tributeUrl = computed(() => config.public.tributeUrl || 'https://t.me/tribute/app?startapp=sXgF')
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
        class="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md px-5 py-8"
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
            <UIcon
              name="i-lucide-x"
              class="size-4.5"
            />
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
                    fill="#3480f1"
                    opacity="0.5"
                  />
                </g>
                <g
                  opacity="0.3373252789315302"
                  style="transform: scale(1.03733); transform-origin: 50% 50%; transform-box: fill-box;"
                >
                  <path
                    d="M102,20 L103,17 L105.5,16 L103,15 L102,12 L101,15 L98.5,16 L101,17Z"
                    fill="#3480f1"
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
            <h2
              id="access-modal-title"
              class="text-[22px] font-extrabold leading-tight tracking-tight text-[#202023]"
            >
              Kirish huquqini oling
            </h2>
            <p class="mt-2 text-[15px] leading-tight text-[#707073]">
              Telegram orqali Tribute orqali to'lov
            </p>
          </div>

          <ul class="mb-6 flex flex-col gap-3">
            <li
              v-for="feature in accessFeatures"
              :key="feature"
              class="flex items-center gap-3 text-[15px] leading-tight text-[#515154]"
            >
              <UIcon
                name="i-lucide-check"
                class="size-4.5 shrink-0 text-[#00c853]"
              />
              <span>{{ feature }}</span>
            </li>
          </ul>

          <a
            :href="tributeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="modal-buy-btn mb-2"
          >
            Telegramda sotib olish
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 shrink-0"
            />
          </a>

          <p class="text-center text-[13px] leading-tight text-[#737376]">
            Kirish to'lovdan so'ng avtomatik faollashadi
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-buy-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
  background: #3480f1;
  border: 1px solid #3480f1;
  border-radius: 999px;
  padding: 12px 20px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(52,128,241,0.28);
  transition: gap 0.2s ease, opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}
.modal-buy-btn:hover  { gap: 14px; opacity: 0.9; transform: scale(1.04); background: #2570e0; }
.modal-buy-btn:active { opacity: 0.7; transform: scale(0.98); }
</style>
