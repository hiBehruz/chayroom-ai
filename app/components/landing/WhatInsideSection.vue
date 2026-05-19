<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const features = [
  { icon: 'i-lucide-wrench', title: 'Amaliy vositalar', body: 'AI bozoridagi eng dolzarb vositalarni turli maqsad va vazifalar bo‘yicha tahlil qilamiz, joriy qilish uchun chek-listlar beramiz.' },
  { icon: 'i-lucide-book-open', title: 'Kurslar va qo‘llanmalar', body: 'Biznes, ish, kontent va kundalik hayot uchun noldan boshlab qadam-baqadam yo‘riqnomalar. Faqat nazariya emas, aniq amaliy qo‘llanmalar.' },
  { icon: 'i-lucide-message-circle', title: 'Telegram yopiq kanal', body: 'Hayot va biznesda AIni ustunlikka aylantirishni istagan fikrdoshlar bilan muloqot.' },
  { icon: 'i-lucide-zap', title: 'Tayyor bog‘lamlar', body: 'Har kuni turli yechimlarni sinab ko‘ramiz va eng foydali natijalarni Telegram yopiq kanalda ulashamiz.' },
  { icon: 'i-lucide-mic', title: 'Jonli efirlar va workshoplar', body: 'Savol-javoblar, jonli uchrashuvlar va birgalikda amaliy ish qilinadigan workshoplar.' },
  { icon: 'i-lucide-rocket', title: 'AI olamidagi yangi trendlar', body: 'Sun’iy intellekt sohasidagi so‘nggi yangiliklarni birinchilardan bilasiz va eng qiziqarli vositalarni sinab ko‘rasiz.' }
]

const sectionRef = ref<HTMLElement>()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.from(sectionRef.value!.querySelectorAll('.feature-card'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    y: 24,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power2.out',
    clearProps: 'transform'
  })
})
</script>

<template>
  <section
    id="features"
    ref="sectionRef"
    class="py-16 bg-white scroll-mt-20"
  >
    <div class="max-w-[1180px] mx-auto px-10 max-md:px-5">
      <UiSectionDivider class="mb-10" />
      <div class="text-center mb-12">
        <h2 class="text-[36px] max-md:text-[24px] font-extrabold tracking-tight leading-[1.1] text-[#1a1a1a]">
          Chayroom AI ichida nimalar bor?
        </h2>
        <p class="text-[36px] max-md:text-[24px] font-extrabold tracking-tight leading-[1.1] text-[#1a1a1a]">
          Va nega biz bilan rivojlanish<br>to‘g‘ri tanlov
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        <div
          v-for="f in features"
          :key="f.title"
          v-sparkle
          class="feature-card bg-[#f7f7f5] hover:bg-[#ebebea] rounded-2xl p-8 flex flex-col gap-3 transition-all duration-200"
        >
          <div class="feature-card-icon">
            <UIcon
              :name="f.icon"
              class="size-8"
            />
          </div>
          <div class="text-[16px] font-bold leading-[1.3] text-[#1a1a1a]">
            {{ f.title }}
          </div>
          <div class="text-[13px] font-normal text-cx-muted leading-[1.7]">
            {{ f.body }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-card-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-bottom: 12px;
  color: #1a1a1a;
}
</style>
