<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const features = [
  { icon: "i-solar-settings-minimalistic-bold", title: "Amaliy vositalar", body: "AI bozoridagi eng dolzarb vositalarni turli maqsad va vazifalar bo’yicha tahlil qilamiz, joriy qilish uchun chek-listlar beramiz.", href: '/materials' },
  { icon: "i-solar-book-bookmark-bold", title: "Kurslar va gaidlar", body: "Biznes, ish, kontent va kundalik hayot uchun noldan boshlab qadam-baqadam yo‘riqnomalar. Faqat nazariya emas, aniq amaliy qo‘llanmalar." },
  { icon: "i-solar-chat-dots-bold", title: "Yopiq chat AI Room Club", body: "Hayot va biznesda AIni ustunlikka aylantirishni istagan fikrdoshlar bilan muloqot." },
  { icon: "i-solar-earth-bold", title: "AI olamidan yangi trendlar", body: "Sun‘iy intellekt sohasidagi so‘nggi yangiliklarni birinchilardan bilasiz va eng qiziqarli vositalarni sinab ko‘rasiz." },
  { icon: "i-solar-microphone-bold", title: "Jonli efirlar va workshoplar", body: "Savol-javoblar, jonli uchrashuvlar va birgalikda amaliy ish qilinadigan workshoplar." },
  { icon: "i-solar-widget-bold", title: "Tayyor bog‘lamlar", body: "Har kuni turli yechimlarni sinab ko‘ramiz va eng foydali natijalarni Telegram yopiq kanalda ulashamiz." }
]

const NuxtLinkComponent = resolveComponent('NuxtLink')
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

  gsap.from(sectionRef.value!.querySelectorAll('.feature-icon'), {
    scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true },
    scale: 0.65,
    opacity: 0,
    duration: 0.45,
    stagger: 0.1,
    delay: 0.08,
    ease: 'power2.out',
    clearProps: 'all'
  })
})
</script>

<template>
  <section
    id="features"
    ref="sectionRef"
    class="py-16 scroll-mt-20"
  >
    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 max-md:px-5">
      <div class="text-center mb-12">
        <h2 class="font-inter-display text-[48px] font-semibold leading-[1.1] tracking-[-0.02em] text-(--text) max-md:text-[28px] max-md:leading-[30.8px] max-md:tracking-[-0.56px]">
          Chayroom AI ichida nimalar bor?<br>
          Va nega biz bilan <span class="what-inside-underline">rivojlanish<svg viewBox="0 0 220 18" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M8,12 C60,2 160,2 212,12" stroke="#3480f1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="vector-effect:non-scaling-stroke"/></svg></span> to'g'ri tanlov
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        <component
          :is="f.href ? NuxtLinkComponent : 'div'"
          v-for="f in features"
          :key="f.title"
          :to="f.href || undefined"
          class="feature-card bg-[#fbf9f4] hover:bg-[#f4f1e9] rounded-2xl p-8 flex flex-col gap-3 transition-all duration-200 "
          :class="f.href ? 'cursor-pointer' : ''"
        >
          <div class="size-16 mb-4 text-[#0f1117]">
            <UIcon
              :name="f.icon"
              class="feature-icon size-16"
            />
          </div>
          <div class="text-[20px] font-bold leading-[1.2] text-(--text)">
            {{ f.title }}
          </div>
          <div class="text-[15px] font-normal text-cx-muted leading-[1.65]">
            {{ f.body }}
          </div>
        </component>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-icon {
  animation: feature-icon-float 3.2s ease-in-out infinite;
  will-change: transform;
}

.feature-card:nth-child(1) .feature-icon { animation-delay: 0s; }
.feature-card:nth-child(2) .feature-icon { animation-delay: 0.45s; }
.feature-card:nth-child(3) .feature-icon { animation-delay: 0.9s; }
.feature-card:nth-child(4) .feature-icon { animation-delay: 1.35s; }
.feature-card:nth-child(5) .feature-icon { animation-delay: 0.22s; }
.feature-card:nth-child(6) .feature-icon { animation-delay: 0.67s; }

@keyframes feature-icon-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  35% { transform: translateY(-3px) rotate(-4deg) scale(1.05, 0.97); }
  70% { transform: translateY(1px) rotate(3deg) scale(0.97, 1.03); }
}

@media (prefers-reduced-motion: reduce) {
  .feature-icon { animation: none; will-change: auto; }
}

.what-inside-underline {
  position: relative;
  display: inline-block;
}

.what-inside-underline svg {
  position: absolute;
  bottom: -10px;
  left: -3%;
  width: 106%;
  height: 18px;
  overflow: visible;
}

</style>
