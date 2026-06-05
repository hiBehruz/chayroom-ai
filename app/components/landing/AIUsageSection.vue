<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const items = [
  { icon: 'i-solar-square-academic-cap-bold', label: 'Ta\'lim', desc: 'AI har qanday kitobni shaxsiy ustozga aylantiradi.' },
  { icon: 'i-solar-pen-bold', label: 'Kontent va blog', desc: 'G\'oyalar top, draftlar yoz, yaratishni tezlashtir.' },
  { icon: 'i-solar-case-minimalistic-bold', label: 'Ish va frilans', desc: 'Rutina vazifalarni avtomatlashtir, muhim ishlarga vaqt ajrat.' },
  { icon: 'i-solar-buildings-bold', label: 'Biznes va jamoa', desc: 'Jarayonlarni optimallashtir, AI assistentlar yarat.' },
  { icon: 'i-solar-chart-2-bold', label: 'Sotuv va lidlar', desc: 'Sotuvchi matnlar yoz, savdo voronkasini avtomatlashtir.' },
  { icon: 'i-solar-earth-bold', label: 'Saytlar va servislar', desc: 'Bilim bo\'lmasa ham to\'liq web ilovalar va landinglar yig\'.' },
  { icon: 'i-solar-cpu-bolt-bold', label: 'AI agentlar', desc: 'Avtonom AI xodimlar yarat, vazifalar o\'z-o\'zidan bajarilsin.' },
  { icon: 'i-solar-map-point-bold', label: 'Sayohat', desc: 'Yo\'nalish tuz, turar joy tanla, narxlarni AI bilan top.' },
  { icon: 'i-solar-heart-bold', label: 'Sog\'liq', desc: 'Ovqatlanish va mashg\'ulot rejasini AI ko\'magida tuz.' },
  { icon: 'i-solar-dollar-minimalistic-bold', label: 'Moliya', desc: 'Xarajatlarni tahlil qil, budjetni AI bilan rejalashtir.' },
  { icon: 'i-solar-telescope-bold', label: 'Tadqiqot', desc: 'Katta hajmdagi ma\'lumotlarni qayta ishlashni tezlashtir.' },
  { icon: 'i-solar-chat-dots-bold', label: 'Kommunikatsiya', desc: 'Aniq xabarlar yoz, tarjima qil, uslubni auditoriyaga mosla.' },
  { icon: 'i-solar-star-ring-bold', label: 'Shaxsiy brend', desc: 'Ekspert obrazini qur, kontent strategiya yarat.' }
]

const sectionRef = ref<HTMLElement>()
const activeItem = ref<typeof items[0] | null>(null)

function toggle(item: typeof items[0]) {
  activeItem.value = activeItem.value === item ? null : item
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.usage-item'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 80%', once: true },
    y: 20,
    opacity: 0,
    duration: 0.6,
    stagger: 0.06,
    ease: 'power2.out',
    clearProps: 'all'
  })
})
</script>

<template>
  <div>
    <section
      ref="sectionRef"
      class="bg-[#0d0f17] pt-72 pb-44 relative overflow-hidden max-md:pt-44 max-md:pb-28"
    >
      <!-- Top arch -->
      <div class="absolute top-0 left-0 right-0 pointer-events-none select-none">
        <svg
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          class="w-full h-64 max-md:h-36"
        >
          <path
            d="M0,100 C380,0 1080,80 1440,180 L1440,0 L0,0 Z"
            fill="#fffdf9"
          />
        </svg>
      </div>

      <!-- Bottom arch -->
      <div class="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          class="w-full h-40 max-md:h-24"
        >
          <path
            d="M0,80 C380,160 1080,160 1440,40 L1440,160 L0,160 Z"
            fill="#fffdf9"
          />
        </svg>
      </div>

      <div class="w-300 max-w-[calc(100%-80px)] mx-auto max-md:max-w-[calc(100%-48px)] relative">
        <!-- Blue sparkle decorations -->
        <div
          class="absolute top-0 left-0 pointer-events-none select-none max-md:hidden"
          style="width: 83px; height: 64px;"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="83"
            height="64"
            fill="none"
            viewBox="0 0 83 64"
          >
            <path
              stroke="#3480f1"
              stroke-linejoin="round"
              stroke-width="4"
              d="M7.616 3.48c3.104 6.709-1.489 11.933-4.173 13.707 7.927-3.505 9.077-1.185 13.865 4.259-2.644-8.759.546-8.61 4.297-13.299-7.617 2.3-9.261.574-13.989-4.666ZM50.508 7.778C51.605 27.196 35.31 35.53 27.025 37.27c22.789-.898 23.355 5.89 29.8 23.847 2.011-23.989 9.671-20.537 23.39-28.376-20.864-1.75-23.216-7.565-29.707-24.963Z"
            />
          </svg>
        </div>
        <div
          class="absolute top-2 right-0 pointer-events-none select-none max-md:hidden"
          style="width: 26px; height: 26px;"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="none"
            viewBox="0 0 26 26"
          >
            <path
              stroke="#3480f1"
              stroke-linejoin="round"
              stroke-width="4"
              d="M20.459 2.158C14.843 9.955 5.995 8.09 2.273 6.182c9.03 6.74 7.137 9.523 4.029 18.421 8.23-8.586 10.099-4.879 17.803-3.624-7.468-7.158-6.563-10.122-3.646-18.821Z"
            />
          </svg>
        </div>

        <div class="text-center mb-14 max-md:mb-10">
          <h2 class="text-white text-[42px] font-bold tracking-[-0.02em] leading-[1.1] mb-3 max-md:text-[28px] max-md:leading-[30.8px] max-md:tracking-[-0.56px]">
            AIni qayerda va qanday qo'llash mumkin
          </h2>
          <p class="text-[#6b7280] text-[18px] leading-relaxed max-w-150 mx-auto max-md:text-[16px]">
            Hayotni yengillashtirish, loyihalarni kuchaytirish va yangi imkoniyatlar ochish uchun o'nlab yo'llar.
          </p>
        </div>

        <div class="grid grid-cols-4 gap-2 max-lg:grid-cols-3 max-md:grid-cols-2 max-md:gap-1.5 usage-grid">
          <button
            v-for="item in items"
            :key="item.label"
            class="usage-item flex items-start gap-4 px-5 py-5 rounded-2xl transition-all duration-200 text-left cursor-pointer active:scale-[0.98] max-md:px-4 max-md:py-4"
            :class="activeItem === item
              ? 'bg-[#1c1f2e] border border-[#3480f1]/40'
              : 'bg-transparent border border-transparent hover:bg-white/4 hover:border-[#3480f1]/15'"
            @click="toggle(item)"
          >
            <div class="shrink-0 flex items-center justify-center">
              <UIcon
                :name="item.icon"
                class="usage-icon size-9 text-white/80"
              />
            </div>
            <div>
              <div class="text-white font-bold text-[17px] leading-tight mb-1.5 max-md:text-[15px]">
                {{ item.label }}
              </div>
              <div class="text-[#5e6677] text-[13px] leading-[1.6]">
                {{ item.desc }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.usage-icon {
  animation: usage-icon-float 3.0s ease-in-out infinite;
  will-change: transform;
}

.usage-grid .usage-item:nth-child(4n+1) .usage-icon { animation-delay: 0s; }
.usage-grid .usage-item:nth-child(4n+2) .usage-icon { animation-delay: 0.55s; }
.usage-grid .usage-item:nth-child(4n+3) .usage-icon { animation-delay: 1.1s; }
.usage-grid .usage-item:nth-child(4n+4) .usage-icon { animation-delay: 1.65s; }

@keyframes usage-icon-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  35% { transform: translateY(-3px) rotate(-4deg) scale(1.06, 0.96); }
  70% { transform: translateY(1px) rotate(3deg) scale(0.97, 1.04); }
}

@media (prefers-reduced-motion: reduce) {
  .usage-icon { animation: none; will-change: auto; }
}
</style>
