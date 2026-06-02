<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const items = [
  {
    icon: 'i-solar-graph-up-bold',
    title: 'AI yordamida daromad qilishni xohlaysan',
    body: 'Yillar davomida qiymatini yo\'qotmaydigan va barqaror daromad keltiradigan ko\'nikma izlayapsan. O\'z loyihalaring ustida ishlash yoki boshqalarga xizmat ko\'rsatish orqali.'
  },
  {
    icon: 'i-solar-case-minimalistic-bold',
    title: 'Biznesing bor, lekin operatsion ishlar bosib ketgan',
    body: 'AI yordamida xarajatlarni qisqartirish, biznes jarayonlarini optimallashtirish yoki AI xodimlar jamoasini yaratishni xohlaysan.'
  },
  {
    icon: 'i-solar-target-bold',
    title: 'Bozorda dolzarblikni yo\'qotayotgandek his qilyapsan',
    body: 'Boshqa mutaxassislar AIni joriy qilib, ustunlik olayotganini ko\'ryapsan. Sen ham yangi vositalarni o\'zlashtirishni xohlaysan.'
  },
  {
    icon: 'i-solar-lightning-bold',
    title: 'Zamon bilan hamnafas bo\'lishni xohlaysan',
    body: 'AIni hayotingga joriy qilish vaqti kelganini his qilyapsan, lekin nimadan boshlash va bu daromadga qanday ta\'sir qilishini hali bilmayapsan.'
  }
]

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  gsap.from(sectionRef.value!.querySelectorAll('.cfy-item'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 80%', once: true },
    y: 20,
    opacity: 0,
    duration: 0.65,
    stagger: 0.1,
    ease: 'power2.out',
    clearProps: 'all'
  })

  gsap.from(sectionRef.value!.querySelectorAll('.cfy-icon'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 80%', once: true },
    scale: 0.6,
    opacity: 0,
    duration: 0.4,
    stagger: 0.1,
    delay: 0.12,
    ease: 'power2.out',
    clearProps: 'all'
  })
})
</script>

<template>
  <section
    ref="sectionRef"
    class="pt-0 pb-20 -mt-2 max-md:pb-14"
  >
    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 max-md:px-5">
      <div class="grid grid-cols-[1fr_1.3fr] gap-20 items-start max-lg:grid-cols-[1fr_1.2fr] max-lg:gap-14 max-md:grid-cols-1 max-md:gap-10">
        <!-- Left: sticky title -->
        <div class="md:sticky md:top-28">
          <h2 class="text-[40px] font-bold leading-[1.15] tracking-tight text-[#14161f] max-lg:text-[34px] max-md:text-[30px]">
            Bizning club sen uchun, agar...
          </h2>
          <a
            href="#pricing"
            class="mt-6 inline-flex origin-left cursor-pointer items-center gap-1.5 text-[18px] font-bold text-cx-blue transition-all duration-200 hover:scale-110 hover:text-[#1f66d1]"
          >
            Kirish huquqini olish
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <!-- Right: items -->
        <div class="flex flex-col gap-12 max-md:gap-10">
          <div
            v-for="item in items"
            :key="item.title"
            class="cfy-item"
          >
            <UIcon
              :name="item.icon"
              class="cfy-icon"
              aria-hidden="true"
            />
            <div class="mt-5 text-[20px] font-bold leading-tight text-[#14161f] max-md:text-[18px]">
              {{ item.title }}
            </div>
            <div class="mt-3 text-[16px] text-cx-muted leading-[1.65] max-md:text-[15px]">
              {{ item.body }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cfy-icon {
  width: 64px;
  height: 64px;
  color: #14161f;
  animation: cfy-icon-float 3.0s ease-in-out infinite;
  will-change: transform;
}

.cfy-item:nth-child(1) .cfy-icon { animation-delay: 0s; }
.cfy-item:nth-child(2) .cfy-icon { animation-delay: 0.6s; }
.cfy-item:nth-child(3) .cfy-icon { animation-delay: 1.2s; }
.cfy-item:nth-child(4) .cfy-icon { animation-delay: 1.8s; }

@keyframes cfy-icon-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  35% { transform: translateY(-3px) rotate(-5deg) scale(1.06, 0.96); }
  70% { transform: translateY(1px) rotate(3deg) scale(0.97, 1.04); }
}

@media (prefers-reduced-motion: reduce) {
  .cfy-icon { animation: none; will-change: auto; }
}
</style>
