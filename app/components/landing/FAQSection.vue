<script setup lang="ts">
const items = [
  { q: 'Bu Telegram yopiq kanal yangi boshlovchilar uchunmi yoki tajribali foydalanuvchilar uchun hammi?', a: 'Hamma uchun. Yangi boshlovchi bo‘lsang, noldan tushunarli yo‘l xaritasini olasan. AI bilan tanish bo‘lsang, ilg‘or vositalar, yangi trendlar va fikrdoshlar muhitini topasan.' },
  { q: 'Dasturlashni bilish kerakmi?', a: 'Yo‘q. Biz ko‘rib chiqadigan aksariyat vosita va yondashuvlar dasturlashni talab qilmaydi. Murakkab AI vositalarini ham sodda va qadam-baqadam tushuntiramiz.' },
  { q: 'Ichkarida nimalar olaman?', a: 'Kurslar va qo‘llanmalar, Telegram yopiq kanal, AI vositalar tahlili, tayyor bog‘lamlar va avtomatizatsiyalar, jonli efirlar hamda jamoa bilan workshoplar.' },
  { q: 'Tadbirkor bo‘lsam, menga mos keladimi?', a: 'Ha. Biz biznes jarayonlarini avtomatlashtirish, xarajatlarni optimallashtirish va biznes uchun AI jamoalar yaratish bo‘yicha materiallarni alohida kiritganmiz.' },
  { q: 'Ishda yoki frilansda ishlasam, foydasi bormi?', a: 'Ha. Kundalik ishga AIni joriy qilish, vazifalarni tezroq bajarish va bozorda qimmatroq mutaxassis bo‘lish yo‘llarini ko‘rib chiqamiz.' },
  { q: 'Bu bepul kontentdan nimasi bilan farq qiladi?', a: 'Bepul kontent tarqoq va yuzaki bo‘ladi. Chayroom AI ichida esa strukturali materiallar, Telegram yopiq kanal, feedback va amaliyotchilar tomonidan doim yangilanadigan bilim bazasi bor.' },
  { q: 'Jonli muloqot bo‘ladimi?', a: 'Ha. Muntazam jonli efirlar, workshoplar va yopiq chat bo‘ladi. U yerda jamoa va boshqa ishtirokchilardan savollaringga javob olasan.' },
  { q: 'To‘lov qanday amalga oshiriladi?', a: 'To‘lov Click va Payme orqali amalga oshiriladi. To‘lov tasdiqlangach, kirish avtomatik faollashadi.' },
  { q: 'Obunani bekor qilsam bo‘ladimi?', a: 'Ha. Obunani istalgan vaqtda bekor qilishing mumkin, kirish huquqi to‘langan davr oxirigacha saqlanadi.' }
]

const openIndex = ref<number | null>(0)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section
    id="faq"
    class="faq-section py-26 scroll-mt-20 max-md:py-16"
  >
    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 max-md:px-5">
      <div class="grid grid-cols-[0.78fr_1.22fr] gap-18 items-start max-lg:grid-cols-1 max-lg:gap-10">
        <div class="sticky top-28 max-lg:static">
          <h2 class="faq-section-title max-md:text-[34px] max-md:leading-[38px]">
            Savol-javoblar
          </h2>
        </div>

        <div class="flex flex-col gap-0">
          <div
            v-for="(item, i) in items"
            :key="i"
            class="faq-item overflow-hidden"
          >
            <button
              class="group w-full py-6 grid grid-cols-[32px_1fr] gap-5 items-start text-left cursor-pointer max-md:grid-cols-[26px_1fr] max-md:gap-3 max-md:py-4"
              :class="i === 0 ? 'pt-0 max-md:pt-0' : ''"
              @click="toggle(i)"
            >
              <span
                :class="[
                  'faq-symbol',
                  openIndex === i ? 'is-open' : ''
                ]"
                aria-hidden="true"
              >
                <span class="faq-symbol-line" />
                <span class="faq-symbol-line faq-symbol-line--vertical" />
              </span>
              <span class="text-[24px] font-bold leading-[28px] tracking-normal text-[#14161f] max-md:text-[20px] max-md:leading-[24px]">
                {{ item.q }}
              </span>
            </button>
            <div
              :class="[
                'overflow-hidden transition-all duration-300',
                openIndex === i ? 'max-h-64' : 'max-h-0'
              ]"
            >
              <div
                :class="[
                  'pl-[52px] pr-2 pb-7 text-[24px] font-medium leading-[1.38] text-[var(--text)] transition-all duration-500 ease-out max-md:pl-[38px] max-md:text-[18px]',
                  openIndex === i ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                ]"
              >
                {{ item.a }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-section {
  background: #fffdf9;
}

.faq-section-title {
  color: #14161f;
  font-family: var(--font-inter-display);
  font-size: 48px;
  font-weight: 600;
  letter-spacing: -0.96px;
  line-height: 52.8px;
}

.faq-item + .faq-item {
  margin-top: 2px;
}

.faq-symbol {
  position: relative;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  transform-origin: center;
  transition: transform 0.72s ease;
}

.faq-symbol-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 3px;
  border-radius: 999px;
  background: #3480f1;
  transform: translate(-50%, -50%);
  transition: transform 0.72s ease, opacity 0.6s ease;
}

.faq-symbol-line--vertical {
  transform: translate(-50%, -50%) rotate(90deg);
}

.faq-symbol.is-open {
  transform: rotate(180deg);
}

.faq-symbol.is-open .faq-symbol-line--vertical {
  opacity: 0;
  transform: translate(-50%, -50%) rotate(90deg) scaleX(0.2);
}

@media (max-width: 734px) {
  .faq-symbol {
    width: 26px;
    height: 26px;
  }

  .faq-symbol-line {
    width: 18px;
    height: 2.5px;
  }
}
</style>
