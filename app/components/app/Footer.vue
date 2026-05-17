<template>
  <footer class="border-t border-cx-line">
    <div class="max-w-[1180px] mx-auto px-10 py-12">
      <div class="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
        <div>
          <div class="font-extrabold text-lg tracking-tight mb-2">
            Chayroom <span class="text-cx-blue">AI</span>
          </div>
          <p class="text-sm text-cx-muted leading-relaxed max-w-[240px]">
            Закрытое сообщество для тех, кто хочет зарабатывать с помощью ИИ, внедрять его в работу и жизнь.
          </p>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-[.06em] uppercase text-cx-muted mb-3.5">Навигация</h4>
          <div class="flex flex-col gap-2">
            <a v-for="link in ['Курсы', 'Гайды', 'Тарифы', 'FAQ']" :key="link"
              class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">
              {{ link }}
            </a>
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-[.06em] uppercase text-cx-muted mb-3.5">Поддержка</h4>
          <div class="flex flex-col gap-2">
            <a class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">Написать в Telegram</a>
            <a class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">support@airoomclub.ru</a>
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-[.06em] uppercase text-cx-muted mb-3.5">Документы</h4>
          <div class="flex flex-col gap-2">
            <a v-for="doc in ['Политика конфиденциальности', 'Обработка персональных данных', 'Оферта']"
              :key="doc"
              class="text-sm text-cx-muted hover:text-cx-ink transition-colors duration-200 cursor-pointer">
              {{ doc }}
            </a>
          </div>
        </div>
      </div>
      <div class="border-t border-cx-line mt-10 pt-5 flex justify-between items-center">
        <span class="text-xs text-cx-faint">© 2026 Chayroom AI Club</span>
        <span class="text-xs text-cx-faint">Оплата через Tribute · Telegram</span>
      </div>
    </div>
  </footer>
</template>
