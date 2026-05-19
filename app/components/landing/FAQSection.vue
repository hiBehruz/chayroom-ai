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
    class="py-16 scroll-mt-20"
  >
    <div class="max-w-295 mx-auto px-10 max-md:px-5">
      <UiSectionHeader
        eyebrow=""
        title="Ko‘p so‘raladigan savollar"

        class="mb-10"
      />
      <div class="flex flex-col gap-1 max-w-195 mx-auto">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="border-b border-cx-line overflow-hidden"
        >
          <button
            class="w-full px-6 py-5 font-semibold text-[15px] flex justify-between items-center text-left cursor-pointer max-md:px-4 max-md:py-4 max-md:text-[14px]"
            @click="toggle(i)"
          >
            {{ item.q }}
            <span :class="['text-lg text-cx-muted transition-transform duration-200', openIndex === i ? 'rotate-180' : '']">▾</span>
          </button>
          <div
            :class="[
              'overflow-hidden transition-all duration-300',
              openIndex === i ? 'max-h-40' : 'max-h-0'
            ]"
          >
            <div class="px-6 pb-5 text-sm text-cx-muted leading-[1.6]">
              {{ item.a }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
