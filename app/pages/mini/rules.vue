<script setup lang="ts">
const router = useRouter()

const sections = [
  {
    icon: 'solar:chat-round-bold',
    title: 'O\'chatda nima haqida gaplashamiz',
    body: 'Chat — ish mavzulari uchun: vibe coding, loyihalar, vazifalar, AI vositalari, tahlillar va g\'oyalar.',
    note: 'Tashkiliy savollar — to\'lov, kirish va kurs mazmuni haqida — @helptreysi ga yozing. Shunday qilib chat qo\'llab-quvvatlash navbatiga aylanmaydi va mazmunli suhbatlar joyi bo\'lib qoladi.',
    bullets: [],
  },
  {
    icon: 'solar:heart-bold',
    title: 'Atmosfera',
    body: 'Biz bu yerda bir-birimizga yordam berish uchun yig\'ildik, munosabat aniqlashtirish uchun emas.',
    note: null,
    bullets: [
      'Haqorat qilmaymiz va shaxsga o\'tmaymiz.',
      'Har qanday bahsning maqsadi — yechim topish, "haq bo\'lish" emas. Haq bo\'lsang — natijadan ko\'rinadi.',
      'Kelishmasak ham do\'stona ohangni saqlaymiz.',
    ],
    footer: 'Bu hammaning yig\'ilish sababi bo\'lgan asos.',
  },
  {
    icon: 'solar:forbidden-circle-bold',
    title: 'Reklama yo\'q',
    body: 'Chatda o\'z mahsulot yoki xizmatingizni targ\'ib qilish taqiqlangan.',
    note: 'Ikki ogohlantirishdan so\'ng — qaytib kelish imkoniyatisiz hamjamiyatga kirish bekor qilinadi.',
    bullets: [],
    footer: 'Ishtirokchilar uchun chinakam foydali narsa bo\'lsa — @helptreysi ga yozing, muhokama qilamiz.',
  },
  {
    icon: 'solar:lock-bold',
    title: 'Materiallar — faqat o\'zimizniki',
    body: 'Kurslar, qo\'llanmalar, efir yozuvlari va platformadagi hamma narsa — klub a\'zolari uchun.',
    note: null,
    bullets: [
      'Materiallarni klub tashqarisiga yuborma va e\'lon qilma.',
      'Kirishingni boshqa birovga o\'tkazma.',
    ],
    footer: 'Qoidabuzarlik — hamjamiyatga kirishni bekor qilish.',
  },
]

const support = [
  {
    icon: 'solar:users-group-rounded-bold',
    title: 'Boshqalarga yordam',
    desc: 'Agar savollarga faol javob bersang va bilimingni ulashasang — vaqt o\'tib klub kuratorlaridan biriga aylanishing mumkin, o\'z imtiyozlaring bilan.',
  },
  {
    icon: 'solar:star-bold',
    title: 'Keyslar va loyihalar',
    desc: 'Klub ichida nima qurganing haqida o\'rtoqlash — ko\'rib chiqamiz, fikr bildramiz, eng yorqin hikoyalar ijtimoiy tarmoqlarimizga tushadi.',
  },
]

useSeoMeta({ title: 'Jamiyat qoidalari' })
</script>

<template>
  <div style="background:#efefef; min-height:100vh">
    <div class="w-full">

      <!-- Header -->
      <div class="flex items-center gap-3 px-4 pt-5 pb-4">
        <button
          class="inline-flex items-center justify-center flex-none transition-all duration-200 ease active:scale-[1.03] active:text-[#3480f1]"
          style="width:44px;height:44px;border-radius:999px;background:#f7f5ef;color:#14161f"
          @click="router.back()"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4.5" />
        </button>
        <h1 class="text-[26px] font-black tracking-tight leading-tight" style="color:#14161f">Qoidalar</h1>
      </div>

      <!-- Hero -->
      <div class="px-4 mb-6">
        <div class="rounded-[20px] overflow-hidden" style="background:#ffffff;border:1px solid #e8e6e0;box-shadow:0 2px 12px rgba(20,22,31,0.06)">
          <div style="height:3px;background:linear-gradient(90deg,#3480f1,#26c6da)" />
          <div class="p-5">
            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4" style="background:rgba(52,128,241,0.1);border:1px solid rgba(52,128,241,0.18)">
              <UIcon name="solar:users-group-rounded-bold" class="size-3" style="color:#3480f1" />
              <span class="text-[11px] font-bold tracking-widest uppercase" style="color:#3480f1">Hamjamiyat</span>
            </div>
            <h1 class="text-[26px] font-black tracking-tight leading-tight mb-2" style="color:#14161f">
              Bir necha oddiy tamoyil
            </h1>
            <p class="text-[14px] leading-relaxed" style="color:#70707a">
              Ular klubni qaytgisi keladigan joyga aylantirib turishga yordam beradi.
            </p>
          </div>
        </div>
      </div>

      <!-- Rule sections -->
      <div class="px-4 space-y-3 mb-6">
        <div
          v-for="(section, i) in sections"
          :key="i"
          class="rounded-[18px] overflow-hidden"
          style="background:#ffffff;border:1px solid #e8e6e0"
        >
          <!-- Section header -->
          <div class="flex items-center gap-3 px-4 pt-4 pb-3">
            <div class="size-8 rounded-xl flex-none flex items-center justify-center" style="background:#f0f5ff">
              <UIcon :name="section.icon" class="size-4" style="color:#3480f1" />
            </div>
            <p class="text-[14px] font-bold leading-snug" style="color:#14161f">{{ section.title }}</p>
          </div>

          <div class="px-4 pb-4">
            <!-- Main body -->
            <p class="text-[13px] leading-relaxed mb-3" style="color:#30313a">{{ section.body }}</p>

            <!-- Bullets -->
            <div v-if="section.bullets.length" class="space-y-2 mb-3">
              <div v-for="(bullet, bi) in section.bullets" :key="bi" class="flex items-start gap-2.5">
                <div class="size-1.5 rounded-full flex-none mt-1.5" style="background:#3480f1" />
                <p class="text-[13px] leading-relaxed" style="color:#30313a">{{ bullet }}</p>
              </div>
            </div>

            <!-- Note (muted callout) -->
            <div
              v-if="section.note"
              class="rounded-xl px-3 py-2.5 mb-3"
              style="background:#f7f5f0;border-left:3px solid #e8e6e0"
            >
              <p class="text-[12px] leading-relaxed" style="color:#70707a">{{ section.note }}</p>
            </div>

            <!-- Footer text -->
            <p v-if="section.footer" class="text-[12px] leading-relaxed" style="color:#70707a">{{ section.footer }}</p>
          </div>
        </div>
      </div>

      <!-- What we support -->
      <div class="px-4 mb-6">
        <div class="flex items-center gap-2.5 mb-3">
          <div class="size-8 rounded-xl flex items-center justify-center" style="background:rgba(76,175,130,0.12)">
            <UIcon name="solar:like-bold" class="size-4" style="color:#4caf82" />
          </div>
          <h2 class="text-[17px] font-bold" style="color:#14161f">Nima qo'llaymiz</h2>
        </div>
        <p class="text-[13px] leading-relaxed mb-4 px-1" style="color:#70707a">
          Buning uchun ayniqsa minnatdormiz:
        </p>

        <div class="space-y-2.5">
          <div
            v-for="item in support"
            :key="item.title"
            class="flex items-start gap-3 p-4 rounded-2xl"
            style="background:#ffffff;border:1px solid #e8e6e0"
          >
            <div class="size-9 rounded-xl flex-none flex items-center justify-center mt-0.5" style="background:rgba(76,175,130,0.1)">
              <UIcon :name="item.icon" class="size-[18px]" style="color:#4caf82" />
            </div>
            <div>
              <p class="text-[14px] font-bold mb-1" style="color:#14161f">{{ item.title }}</p>
              <p class="text-[12px] leading-relaxed" style="color:#70707a">{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <p class="text-[12px] text-center mt-4 leading-relaxed" style="color:#a0a0a8">
          Ana shu materiallar to'plamini tirik hamjamiyatga aylantiradi.
        </p>
      </div>

    </div>
  </div>
</template>
