<script setup lang="ts">
const router = useRouter()

const spaces = [
  {
    icon: 'solar:bell-bold',
    title: 'Kanal',
    desc: 'Muhim e\'lonlar, foydali postlar va klub tadbirlari. U yerda bildirishnomalarni yoqing.',
    link: null,
    linkText: null,
  },
  {
    icon: 'solar:chat-round-bold',
    title: 'Chat',
    desc: 'Ish zonasi: vibe coding, loyihalar, vazifalar, asboblar.',
    link: 'https://t.me/+example',
    linkText: 'Chatni ochish →',
  },
  {
    icon: 'solar:laptop-minimalistic-bold',
    title: 'Platforma',
    desc: 'Kurslar, gaidlar va materiallar.',
    link: 'https://chayroom.ai',
    linkText: 'Web-versiyasi →',
  },
  {
    icon: 'solar:chat-line-bold',
    title: 'Qo\'llab-quvvatlash',
    desc: 'To\'lov va kirish huquqi bo\'yicha har qanday savol uchun.',
    link: 'https://t.me/hellobehruz',
    linkText: 'Yozish →',
  },
]

const contents = [
  { icon: 'noto:open-book', title: 'Gaidlar', desc: 'Muayyan vositalardan foydalanish bo\'yicha amaliy ko\'rsatmalar.', soon: false },
  { icon: 'noto:graduation-cap', title: 'Kurslar', desc: 'Darslar va topshiriqlar bilan bosqichma-bosqich dasturlar.', soon: false },
  { icon: 'noto:sparkles', title: 'Skilllar', desc: 'Muayyan vazifa uchun muayyan ko\'nikma.', soon: true },
  { icon: 'noto:memo', title: 'Use-caselar', desc: 'Ishda va hayotda AI qo\'llanishining real misollari.', soon: true },
  { icon: 'noto:microphone', title: 'Efirlar', desc: 'Jamoa bilan jonli qo\'ng\'iroqlar, keyslarni tahlil qilish va Q&A.', soon: true },
  { icon: 'noto:hammer-and-wrench', title: 'Workshoplar', desc: 'Amaliy mashg\'ulotlar — birgalikda biror narsa yasaymiz.', soon: true },
]

const steps = [
  { n: '1', title: 'O\'zingiz haqingizda ayting', desc: 'Maqsad va darajangizga mos materiallarni tanlaymiz.' },
  { n: '2', title: 'Qoidalarni o\'qing', desc: 'Bir necha daqiqa — va hammasi tushunarli bo\'ladi.' },
  { n: '3', title: 'Katalogni oching', desc: 'Platformaning barcha materiallari bir joyda.' },
]

const tags = ['AI-agentlar', 'Vibe coding', 'Avtomatizatsiya', 'Shaxsiy assistentlar', 'Neyrotarmoqlar']

useSeoMeta({ title: 'AI Room Club haqida' })
</script>

<template>
  <div style="background:#efefef; min-height:100vh">
    <div class="w-full">

      <!-- Header -->
      <div class="px-4 pt-5 pb-3">
        <button
          class="inline-flex items-center justify-center transition-all duration-200 ease active:scale-[1.03] active:text-[#3480f1]"
          style="width:44px;height:44px;border-radius:999px;background:#f7f5ef;color:#14161f"
          @click="router.back()"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4.5" />
        </button>
      </div>

      <!-- Hero card -->
      <div class="mx-4 mb-5 rounded-[20px] overflow-hidden" style="background:#ffffff;border:1px solid #e8e6e0;box-shadow:0 2px 12px rgba(20,22,31,0.06)">
        <!-- Gradient top accent -->
        <div style="height:3px;background:linear-gradient(90deg,#3480f1,#26c6da)" />

        <div class="p-5">
          <!-- Badge -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4" style="background:rgba(52,128,241,0.12);border:1px solid rgba(52,128,241,0.2)">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#3480f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="3" y="11" width="18" height="11" rx="3" fill="#3480f1" fill-opacity="0.2" stroke="#3480f1" stroke-width="2"/>
            </svg>
            <span class="text-[11px] font-bold tracking-widest uppercase" style="color:#3480f1">Yopiq klub</span>
          </div>

          <!-- Title -->
          <h1 class="text-[28px] font-black tracking-tight leading-tight mb-3" style="color:#14161f">
            AI Room Club
          </h1>

          <!-- Description -->
          <p class="text-[14px] leading-relaxed mb-5" style="color:#70707a">
            Yopiq jamiyat, biz birga AI ni o'z hayotimizga, ishimizga va biznesimizga joriy etamiz. Vositalarni muhokama qilamiz, tajriba almashtiramiz va loyihalar yaratamiz.
          </p>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in tags"
              :key="tag"
              class="px-3 py-1.5 rounded-full text-[12px] font-medium"
              style="background:#ffffff;color:#70707a;border:1px solid #e8e6e0"
            >{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- Как устроено пространство -->
      <div class="px-4 mb-5">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="size-8 rounded-xl flex items-center justify-center" style="background:rgba(52,128,241,0.12)">
            <UIcon name="solar:widget-bold" class="size-4" style="color:#3480f1" />
          </div>
          <h2 class="text-[17px] font-bold" style="color:#14161f">Maydon qanday tuzilgan</h2>
        </div>

        <div class="space-y-2.5">
          <div
            v-for="space in spaces"
            :key="space.title"
            class="flex items-start gap-3 p-4 rounded-2xl"
            style="background:#ffffff;border:1px solid #e8e6e0"
          >
            <div class="size-9 rounded-xl flex-none flex items-center justify-center mt-0.5" style="background:#f0f5ff">
              <UIcon :name="space.icon" class="size-4.5" style="color:#3480f1" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-bold mb-0.5" style="color:#14161f">{{ space.title }}</p>
              <p class="text-[12px] leading-relaxed" style="color:#70707a">{{ space.desc }}</p>
              <a
                v-if="space.link"
                :href="space.link"
                target="_blank"
                class="inline-block mt-1.5 text-[12px] font-semibold"
                style="color:#3480f1"
              >{{ space.linkText }}</a>
            </div>
          </div>
        </div>

        <p class="text-[12px] text-center mt-3 leading-relaxed" style="color:#a0a0a8">
          Faol obuna bilan — uchala maydonga ham kirish bir vaqtda.
        </p>
      </div>

      <!-- Что внутри -->
      <div class="px-4 mb-5">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="size-8 rounded-xl flex items-center justify-center" style="background:rgba(52,128,241,0.12)">
            <UIcon name="solar:box-bold" class="size-4" style="color:#3480f1" />
          </div>
          <h2 class="text-[17px] font-bold" style="color:#14161f">Ichida nima bor</h2>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div
            v-for="item in contents"
            :key="item.title"
            class="p-4 rounded-2xl relative"
            style="background:#ffffff;border:1px solid #e8e6e0"
          >
            <span
              v-if="item.soon"
              class="absolute top-3 right-3 text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full"
              style="background:#efefef;color:#a0a0a8"
            >TEZ KUNDA</span>
            <UIcon :name="item.icon" class="size-9 mb-3 block" />
            <p class="text-[13px] font-bold mb-1" style="color:#14161f">{{ item.title }}</p>
            <p class="text-[11px] leading-relaxed" style="color:#70707a">{{ item.desc }}</p>
          </div>
        </div>
      </div>

      <!-- С чего начать -->
      <div class="px-4 mb-5">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="size-8 rounded-xl flex items-center justify-center" style="background:rgba(52,128,241,0.12)">
            <UIcon name="solar:map-point-bold" class="size-4" style="color:#3480f1" />
          </div>
          <h2 class="text-[17px] font-bold" style="color:#14161f">Qayerdan boshlash</h2>
        </div>

        <div class="space-y-2.5 mb-4">
          <div
            v-for="step in steps"
            :key="step.n"
            class="flex items-start gap-3 p-4 rounded-2xl"
            style="background:#ffffff;border:1px solid #e8e6e0"
          >
            <div
              class="size-7 rounded-full flex-none flex items-center justify-center text-[13px] font-black text-white shrink-0"
              style="background:#3480f1;margin-top:1px"
            >{{ step.n }}</div>
            <div>
              <p class="text-[14px] font-bold mb-0.5" style="color:#14161f">{{ step.title }}</p>
              <p class="text-[12px] leading-relaxed" style="color:#70707a">{{ step.desc }}</p>
            </div>
          </div>
        </div>

        <NuxtLink
          to="/catalog"
          class="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] text-white active:opacity-80 transition-opacity"
          style="background:#3480f1;box-shadow:0 6px 20px rgba(52,128,241,0.35)"
        >
          <UIcon name="solar:widget-bold" class="size-5" />
          Katalogga o'tish
        </NuxtLink>
      </div>

    </div>

    <MiniAppBottomNav />
  </div>
</template>
