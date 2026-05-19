<template>
  <footer class="bg-[#efefef]">
    <div class="max-w-[1180px] mx-auto px-10 py-12 max-md:px-5 max-md:py-8">
      <div class="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 max-md:grid-cols-2 max-md:gap-6">
        <div class="max-md:col-span-2">
          <div class="font-extrabold text-lg tracking-tight mb-2">
            Chayroom <span class="brand-ai-gradient">AI</span>
          </div>
          <p class="text-sm text-cx-muted leading-relaxed max-w-[240px]">
            AI yordamida daromad qilish, uni ish va hayotga joriy etishni xohlaganlar uchun Telegram yopiq kanal.
          </p>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-[.06em] uppercase text-cx-muted mb-3.5">
            Navigatsiya
          </h4>
          <div class="flex flex-col gap-2">
            <a
              v-for="link in ['Kurslar', 'Qo‘llanmalar', 'Tariflar', 'FAQ']"
              :key="link"
              class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer"
            >
              {{ link }}
            </a>
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-[.06em] uppercase text-cx-muted mb-3.5">
            Yordam
          </h4>
          <div class="flex flex-col gap-2">
            <a class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">Telegramga yozish</a>
            <a class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">support@chayroom.ai</a>
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-[.06em] uppercase text-cx-muted mb-3.5">
            Hujjatlar
          </h4>
          <div class="flex flex-col gap-2">
            <a
              v-for="doc in ['Maxfiylik siyosati', 'Shaxsiy ma’lumotlarni qayta ishlash', 'Ommaviy oferta']"
              :key="doc"
              class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer"
            >
              {{ doc }}
            </a>
          </div>
        </div>
      </div>
      <div class="border-t border-cx-line mt-10 pt-5 flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-2">
        <span class="text-xs text-cx-faint">© 2026 Chayroom AI Club. Barcha huquqlar himoyalangan.</span>
        <span class="text-xs text-cx-faint">MVP: Telegram · Production: Click / Payme</span>
      </div>
    </div>
  </footer>
</template>
