<script setup lang="ts">
const usagePills = [
  { key: 'learning', label: 'Ta’lim', quote: 'AI har qanday kitobni shaxsiy ustozga aylantiradi: savol ber, o‘z darajangda tushuntirish ol va tezroq o‘rgan.' },
  { key: 'content', label: 'Kontent va blog', quote: 'AI vositalari yordamida g‘oyalar top, draftlar yoz va kontent yaratishni bir necha baravar tezlashtir.' },
  { key: 'work', label: 'Ish va frilans', quote: 'Rutina vazifalarni avtomatlashtir, xat va hisobotlarni daqiqalarda tayyorla, muhim ishlarga vaqt ajrat.' },
  { key: 'business', label: 'Biznes va jamoa', quote: 'Jarayonlarni optimallashtir, jamoa uchun AI assistentlar yarat va operatsion xarajatlarni kamaytir.' },
  { key: 'sales', label: 'Sotuv va lidlar', quote: 'Sotuvchi matnlar yoz, mijozlarni tahlil qil va savdo voronkasini AI yordamida avtomatlashtir.' },
  { key: 'sites', label: 'Saytlar va servislar', quote: 'Kod bo‘yicha chuqur bilim bo‘lmasa ham to‘liq web ilovalar va landing sahifalar yig‘.' },
  { key: 'agents', label: 'AI agentlar', quote: 'Vazifalarni sening ishtirokingsiz bajaradigan avtonom AI xodimlar yarat.' },
  { key: 'travel', label: 'Sayohat', quote: 'Yo‘nalish tuzish, turar joy tanlash va yaxshi narxlarni topishda shaxsiy AI assistentdan foydalan.' },
  { key: 'health', label: 'Sog‘liq', quote: 'Ko‘rsatkichlaringni tahlil qil, ovqatlanish va mashg‘ulot rejasini AI ko‘magida tuz.' },
  { key: 'finance', label: 'Moliya', quote: 'Xarajatlarni tahlil qil, imkoniyatlarni qidir va budjetni AI yordamida rejalashtir.' },
  { key: 'research', label: 'Tadqiqot', quote: 'Katta hajmdagi ma’lumotlarni qayta ishlash, patternlarni topish va xulosa chiqarishni tezlashtir.' },
  { key: 'communication', label: 'Kommunikatsiya', quote: 'Aniq va ishontiruvchi xabarlar yoz, matnlarni tarjima qil va uslubni auditoriyaga mosla.' },
  { key: 'brand', label: 'Shaxsiy brend', quote: 'Ekspert obrazini qur, kontent strategiya yarat va o‘z sohangda kuchli mutaxassis sifatida o‘s.' }
]

const active = ref<string | null>(null)
const containerRef = ref<HTMLElement>()

function toggle(key: string) {
  active.value = active.value === key ? null : key
}

function handleDocumentClick(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    active.value = null
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onUnmounted(() => document.removeEventListener('click', handleDocumentClick))
</script>

<template>
  <section class="py-16 bg-cx-surface">
    <div class="max-w-[1180px] mx-auto px-10">
      <UiSectionDivider class="mb-10" />
      <UiSectionHeader
        title="AIni qayerda va qanday qo‘llash mumkin"
        subtitle="Hayotni yengillashtirish, loyihalarni kuchaytirish va yangi imkoniyatlar ochish uchun o‘nlab yo‘llar."
        class="mb-12"
      />
      <div ref="containerRef" class="flex flex-wrap gap-2.5 justify-center">
        <div
          v-for="pill in usagePills"
          :key="pill.key"
          class="relative"
        >
          <button
            :class="[
              'px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              active === pill.key
                ? 'ai-usage-pill-active text-white'
                : 'bg-[#f7f7f5] text-cx-ink hover:bg-[#ebebea] border border-transparent'
            ]"
            @click.stop="toggle(pill.key)"
          >
            {{ pill.label }}
          </button>

          <Transition name="slide-down">
            <div
              v-if="active === pill.key"
              class="absolute top-[calc(100%+10px)] left-0 z-30 w-65 bg-white border border-cx-line rounded-2xl p-4 shadow-lift text-left"
              @click.stop
            >
              <!-- arrow -->
              <span class="absolute -top-1.75 left-5 w-3 h-3 bg-white border-l border-t border-cx-line rotate-45" />
              <p class="text-sm leading-relaxed text-cx-ink">
                {{ pill.quote }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ai-usage-pill-active {
  border: 1px solid rgba(2, 43, 120, 0.92);
  background:
    radial-gradient(circle at 18% 18%, rgba(255,255,255,0.08), transparent 22%),
    linear-gradient(105deg, #064aaf 0%, #006fd1 38%, #064b9f 68%, #03265f 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.28) inset,
    0 -1px 0 rgba(0,14,56,0.34) inset,
    0 10px 22px rgba(0, 63, 150, 0.24);
  text-shadow: 0 1px 0 rgba(0, 20, 64, 0.2);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
