<script setup lang="ts">
import gsap from 'gsap'

const skills = [
  { num: '01', title: 'AI assistentlar bilan ishlash', body: 'ChatGPT, Claude va boshqa modellar bilan samarali muloqot qilib, kerakli natijani birinchi urinishdayoq olish.' },
  { num: '02', title: 'AI agentlar yaratish', body: 'Vazifalarni mustaqil bajaradigan avtonom agentlar qurish: izlash, yozish, nashr qilish.' },
  { num: '03', title: 'Rutina ishlarni avtomatlashtirish', body: 'Make, n8n va Zapier orqali avtomatizatsiya oqimlarini sozlab, oyiga o\'nlab soatlarni tejash.' },
  { num: '04', title: 'Kontent generatsiya qilish', body: 'Har qanday platforma uchun AI vositalari yordamida matn, rasm, video va ovoz yaratish.' },
  { num: '05', title: 'Kodsiz saytlar qurish', body: 'Vibe coding yondashuvi yordamida web ilovalar, landing sahifalar va servislar yig\'ish.' },
  { num: '06', title: 'Promptlarni professional yozish', body: 'Barqaror va oldindan kutiladigan natija beradigan system promptlar va metodologiyalarni bilish.' },
  { num: '07', title: 'AI ko\'nikmalarni monetizatsiya qilish', body: 'AI asosida xizmatlar sotish: avtomatizatsiya, kontent, agentlar va konsalting.' },
  { num: '08', title: 'AIni biznesga joriy qilish', body: 'Biznes jarayonlarida AI qo\'llash nuqtalarini topish va ularni tizimli joriy qilish.' },
  { num: '09', title: 'AI voronkalar yaratish', body: 'Birinchi kontaktdan sotuvgacha AI personalizatsiyasi bilan marketing voronkalar qurish.' }
]

// 3 per page on desktop (1 row); 1 per page on mobile
const itemsPerPage = ref(3)
const totalPages = computed(() => Math.ceil(skills.length / itemsPerPage.value))
const currentPage = ref(0)
const trackRef = ref<HTMLElement>()

let touchStartX = 0
function onTouchStart(e: TouchEvent) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e: TouchEvent) {
  const delta = touchStartX - e.changedTouches[0].clientX
  if (Math.abs(delta) < 40) return
  if (delta > 0) next()
  else prev()
}

function goToPage(page: number) {
  if (!trackRef.value) return
  const containerWidth = trackRef.value.parentElement!.offsetWidth
  gsap.to(trackRef.value, { x: -(containerWidth * page), duration: 0.5, ease: 'power2.out' })
  currentPage.value = page
}

function prev() { if (currentPage.value > 0) goToPage(currentPage.value - 1) }
function next() { if (currentPage.value < totalPages.value - 1) goToPage(currentPage.value + 1) }

function skillsForPage(page: number) {
  return skills.slice(page * itemsPerPage.value, page * itemsPerPage.value + itemsPerPage.value)
}

onMounted(() => {
  const update = () => {
    const next = window.innerWidth < 768 ? 1 : 3
    if (next !== itemsPerPage.value) {
      itemsPerPage.value = next
      currentPage.value = 0
      if (trackRef.value) gsap.set(trackRef.value, { x: 0 })
    }
  }
  update()
  window.addEventListener('resize', update, { passive: true })
  onUnmounted(() => window.removeEventListener('resize', update))
})
</script>

<template>
  <section class="py-16 bg-cx-surface">
    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 max-md:px-5">
      <div class="mb-8 text-center">
        <div class="mb-3 text-[14px] font-bold tracking-[0.08em] text-cx-blue uppercase">
          Ko'nikmalar
        </div>
        <h2 class="font-inter-display text-[48px] font-semibold leading-[1.1] tracking-[-0.02em] text-(--text) max-md:text-[34px]">
          Telegram yopiq kanalda nimalarni
          <span class="skills-title-underline">
            o'rganasan?
            <svg
              viewBox="0 0 260 18"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                class="skills-title-underline-path"
                d="M8,12 C70,2 190,2 252,12"
                stroke="#3480f1"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </h2>
      </div>

      <div class="relative pt-14">
        <!-- Nav arrows -->
        <template v-if="totalPages > 1">
          <button
            :class="['absolute right-16 top-0 z-10 shrink-0 w-10 h-10 rounded-full bg-cx-ink flex items-center justify-center text-base transition-colors duration-200', currentPage === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer']"
            :disabled="currentPage === 0"
            aria-label="Oldingi ko'nikmalar"
            @click="prev"
          >
            <span class="text-white">←</span>
          </button>
          <button
            :class="['absolute right-4 top-0 z-10 shrink-0 w-10 h-10 rounded-full bg-cx-ink flex items-center justify-center text-base transition-colors duration-200', currentPage === totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer']"
            :disabled="currentPage === totalPages - 1"
            aria-label="Keyingi ko'nikmalar"
            @click="next"
          >
            <span class="text-white">→</span>
          </button>
        </template>

        <div class="flex-1 overflow-hidden" @touchstart="onTouchStart" @touchend="onTouchEnd">
          <div
            ref="trackRef"
            class="flex"
            :style="{ width: `${totalPages * 100}%` }"
          >
            <div
              v-for="page in totalPages"
              :key="page"
              class="grid grid-cols-3 gap-5 max-md:grid-cols-1"
              :style="{ width: `${100 / totalPages}%` }"
            >
              <div
                v-for="skill in skillsForPage(page - 1)"
                :key="skill.num"
                class="group bg-[#fbf9f4] rounded-3xl p-8 "
              >
                <div class="text-[32px] font-extrabold text-[#1a1a1a] mb-4">
                  {{ skill.num }}
                </div>
                <div class="text-[19px] font-bold mb-2.5 leading-[1.3]">
                  {{ skill.title }}
                </div>
                <div class="text-sm text-cx-muted leading-[1.6]">
                  {{ skill.body }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dots (mobile only) -->
        <div v-if="totalPages > 1" class="flex gap-1.5 justify-center mt-5">
          <button
            v-for="i in totalPages"
            :key="i"
            :class="[
              'rounded-full transition-all duration-200 max-md:p-2 max-md:-m-2',
              currentPage === i - 1 ? 'w-5 h-2 bg-cx-ink' : 'w-2 h-2 bg-cx-line hover:bg-cx-muted'
            ]"
            :aria-label="`${i}-sahifaga o'tish`"
            @click="goToPage(i - 1)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-title-underline {
  position: relative;
  display: inline-block;
}

.skills-title-underline svg {
  position: absolute;
  right: -5%;
  bottom: -12px;
  width: 110%;
  height: 18px;
  overflow: visible;
}

.skills-title-underline-path {
  vector-effect: non-scaling-stroke;
}
</style>
