<script setup lang="ts">
import gsap from 'gsap'

const skills = [
  { num: '01', title: 'AI assistentlar bilan ishlash', body: 'ChatGPT, Claude va boshqa modellar bilan samarali muloqot qilib, kerakli natijani birinchi urinishdayoq olish.' },
  { num: '02', title: 'AI agentlar yaratish', body: 'Vazifalarni mustaqil bajaradigan avtonom agentlar qurish: izlash, yozish, nashr qilish.' },
  { num: '03', title: 'Rutina ishlarni avtomatlashtirish', body: 'Make, n8n va Zapier orqali avtomatizatsiya oqimlarini sozlab, oyiga o‘nlab soatlarni tejash.' },
  { num: '04', title: 'Kontent generatsiya qilish', body: 'Har qanday platforma uchun AI vositalari yordamida matn, rasm, video va ovoz yaratish.' },
  { num: '05', title: 'Kodsiz saytlar qurish', body: 'Vibe coding yondashuvi yordamida web ilovalar, landing sahifalar va servislar yig‘ish.' },
  { num: '06', title: 'Promptlarni professional yozish', body: 'Barqaror va oldindan kutiladigan natija beradigan system promptlar va metodologiyalarni bilish.' },
  { num: '07', title: 'AI ko‘nikmalarni monetizatsiya qilish', body: 'AI asosida xizmatlar sotish: avtomatizatsiya, kontent, agentlar va konsalting.' },
  { num: '08', title: 'AIni biznesga joriy qilish', body: 'Biznes jarayonlarida AI qo‘llash nuqtalarini topish va ularni tizimli joriy qilish.' },
  { num: '09', title: 'AI voronkalar yaratish', body: 'Birinchi kontaktdan sotuvgacha AI personalizatsiyasi bilan marketing voronkalar qurish.' }
]

const ITEMS_PER_PAGE = 2
const totalPages = computed(() => Math.ceil(skills.length / ITEMS_PER_PAGE))
const currentPage = ref(0)
const activeNum = computed(() => skills[currentPage.value * ITEMS_PER_PAGE]?.num ?? '')
const trackRef = ref<HTMLElement>()

function goToPage(page: number) {
  if (!trackRef.value) return
  const containerWidth = trackRef.value.parentElement!.offsetWidth
  gsap.to(trackRef.value, { x: -(containerWidth * page), duration: 0.5, ease: 'power2.out' })
  currentPage.value = page
}

function prev() {
  if (currentPage.value > 0) {
    goToPage(currentPage.value - 1)
  }
}

function next() {
  if (currentPage.value < totalPages.value - 1) {
    goToPage(currentPage.value + 1)
  }
}

function skillsForPage(page: number) {
  return skills.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE)
}
</script>

<template>
  <section class="py-16 bg-cx-surface">
    <div class="max-w-[1180px] mx-auto px-10 max-md:px-5">
      <UiSectionHeader
        eyebrow="Ko‘nikmalar"
        title="Telegram yopiq kanalda nimalarni o‘rganasan?"
        class="[&_h2]:text-[36px] [&>div:first-child]:text-[14px] mb-8"
      />

      <div class="flex items-center gap-4">
        <!-- Prev -->
        <button
          :class="['shrink-0 w-10 h-10 rounded-full bg-white border border-cx-line flex items-center justify-center text-base transition-colors duration-200', currentPage === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer']"
          :disabled="currentPage === 0"
          aria-label="Oldingi ko‘nikmalar"
          @click="prev"
        >
          ←
        </button>

        <div class="flex-1 overflow-hidden">
          <div
            ref="trackRef"
            class="flex"
            :style="{ width: `${totalPages * 100}%` }"
          >
            <div
              v-for="page in totalPages"
              :key="page"
              class="grid grid-cols-1 md:grid-cols-2 gap-5"
              :style="{ width: `${100 / totalPages}%` }"
            >
              <div
                v-for="skill in skillsForPage(page - 1)"
                :key="skill.num"
                v-sparkle
                class="group bg-[#f7f7f5] rounded-3xl p-8"
              >
                <div
                  :class="[
                    'text-[32px] font-extrabold transition-colors duration-500 ease-in-out mb-4',
                    skill.num === activeNum ? 'text-[#1a1a1a]' : 'text-cx-line group-hover:text-[#1a1a1a]'
                  ]"
                >
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

        <!-- Next -->
        <button
          :class="['shrink-0 w-10 h-10 rounded-full bg-white border border-cx-line flex items-center justify-center text-base transition-colors duration-200', currentPage === totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer']"
          :disabled="currentPage === totalPages - 1"
          aria-label="Keyingi ko‘nikmalar"
          @click="next"
        >
          →
        </button>
      </div>

      <!-- Dots -->
      <div class="flex gap-1.5 justify-center mt-5">
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
  </section>
</template>
