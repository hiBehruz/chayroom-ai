<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const cards = [
  { num: '01', icon: 'i-lucide-trending-up', title: 'AI yordamida daromad qilishni xohlaysan', body: 'Yillar davomida qiymatini yo‘qotmaydigan va barqaror daromad keltiradigan ko‘nikma izlayapsan. O‘z loyihalaring ustida ishlash yoki boshqalarga xizmat ko‘rsatish orqali.' },
  { num: '02', icon: 'i-lucide-briefcase-business', title: 'Biznesing bor, lekin operatsion ishlar bosib ketgan', body: 'AI yordamida xarajatlarni qisqartirish, biznes jarayonlarini optimallashtirish yoki AI xodimlar jamoasini yaratishni xohlaysan.' },
  { num: '03', icon: 'i-lucide-radar', title: 'Bozorda dolzarblikni yo‘qotayotgandek his qilyapsan', body: 'Boshqa mutaxassislar AIni joriy qilib, ustunlik olayotganini ko‘ryapsan. Sen ham yangi vositalarni o‘zlashtirishni xohlaysan.' },
  { num: '04', icon: 'i-lucide-clock-3', title: 'Zamon bilan hamnafas bo‘lishni xohlaysan', body: 'AIni hayotingga joriy qilish vaqti kelganini his qilyapsan, lekin nimadan boshlash va bu daromadga qanday ta’sir qilishini hali bilmayapsan.' }
]

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.club-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 24,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power2.out',
    clearProps: 'transform'
  })
})
</script>

<template>
  <section
    ref="sectionRef"
    class="pt-0 pb-16 -mt-2"
  >
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionDivider class="mb-10" />
      <UiSectionHeader
        title="Bizning klub sen uchun, agar..."
        subtitle="Biz AIni haqiqiy ustunlik sifatida ishlatmoqchi bo‘lganlar uchun muhit yaratdik."
        class="mb-10"
      />
      <div class="grid grid-cols-2 gap-5">
        <div
          v-for="card in cards"
          :key="card.num"
          v-sparkle
          class="club-card bg-[#f7f7f5] hover:bg-[#ebebea] rounded-3xl p-8 min-h-57.5 transition-all duration-200"
        >
          <div
            class="club-card-icon"
            aria-hidden="true"
          >
            <UIcon
              :name="card.icon"
              class="size-8"
            />
          </div>
          <div class="text-lg font-bold mb-2.5 leading-[1.3]">
            {{ card.title }}
          </div>
          <div class="text-sm text-cx-muted leading-[1.6]">
            {{ card.body }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.club-card-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-bottom: 18px;
  color: #1a1a1a;
}
</style>
