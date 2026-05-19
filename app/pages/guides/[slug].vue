<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const hasSubscription = computed(() => authStore.hasSubscription)
const isAccessModalOpen = ref(false)

interface Guide {
  slug: string
  title: string
  desc: string
  tags: string[]
  free: boolean
  bg: string
  accent: string
  badge: string
  content: string
}

const allGuides: Guide[] = [
  {
    slug: 'claude-code-token-limit',
    title: "Claude Code'da tokenlarni birdan tugatib qo'ymaslik",
    desc: "Claude bilan ishlaganda tokenlarni behuda sarflamaslik bo'yicha amaliy tahlil.",
    tags: ['Claude', 'Limits', 'Claude Code'],
    free: true,
    bg: '#f5ede0',
    accent: '#e8b97a',
    badge: 'start',
    content: `<h2>Tokenlarni tejash asoslari</h2>
<p>Claude Code bilan ishlashda token sarfini kamaytirish uchun bir nechta asosiy qoidalar mavjud.</p>
<h3>1. Kontekstni tozalab turing</h3>
<p>Har bir yangi vazifa uchun <code>/clear</code> buyrug'ini ishlating. Bu joriy suhbat tarixini tozalab, yangi sessiya boshlaydi.</p>
<h3>2. Faqat kerakli fayllarni oching</h3>
<p>Katta loyihalarda butun reponi o'qitish o'rniga faqat zarur fayllarni ko'rsating. Masalan: "faqat src/components/Nav.vue ni ko'r".</p>
<h3>3. Qisqa va aniq so'rovlar yozing</h3>
<p>Uzun tavsiflar o'rniga qisqa, konkret ko'rsatmalar bering. Claude qisqa promptlarda ham yaxshi ishlaydi.</p>
<h3>4. Compact rejimidan foydalaning</h3>
<p><code>/compact</code> buyrug'i uzun suhbatni qisqartiradi va kontekstni saqlab qoladi.</p>`
  },
  {
    slug: 'codex-beginners',
    title: 'Yangi boshlovchilar uchun Codex',
    desc: "Codex bilan tanishish va noldan sozlash bo'yicha qo'llanma.",
    tags: ['Codex', 'ChatGPT'],
    free: true,
    bg: '#0d1f1a',
    accent: '#22c55e',
    badge: "qo'llanma",
    content: `<h2>OpenAI Codex nima?</h2>
<p>Codex — OpenAI'ning kod yozishga ixtisoslashgan sun'iy intellekt modeli. U tabiiy til buyruqlarini ishlaydigan kodga aylantiradi.</p>
<h3>Boshlash uchun kerakli narsalar</h3>
<ul>
  <li>OpenAI akkaunti</li>
  <li>API kalit (platform.openai.com dan)</li>
  <li>Python yoki JavaScript bilimi (ixtiyoriy)</li>
</ul>
<h3>Birinchi so'rovni yuborish</h3>
<p>ChatGPT interfeysida "Menga Python da oddiy kalkulyator yoz" deb yozing. Codex avtomatik ravishda ishlashga tayyor kod generatsiya qiladi.</p>
<h3>Foydali maslahatlar</h3>
<p>Tilni aniq belgilang: "Python 3 da", "JavaScript ES6 da". Bu aniqroq natija beradi.</p>`
  },
  {
    slug: 'claude-chatgpt-registration',
    title: "Claude / ChatGPT ro'yxatdan o'tish va to'lov yo'llari",
    desc: "Claude va ChatGPT'da akkaunt ochish hamda obunani to'lash bo'yicha amaliy yo'riqnoma.",
    tags: ['Claude', 'ChatGPT'],
    free: true,
    bg: '#111',
    accent: '#a78bfa',
    badge: 'start',
    content: `<h2>Claude va ChatGPT: akkount ochish</h2>
<h3>Claude (claude.ai)</h3>
<ol>
  <li>claude.ai saytiga kiring</li>
  <li>"Sign up" tugmasini bosing</li>
  <li>Email yoki Google akkount orqali ro'yxatdan o'ting</li>
  <li>Telefon raqamingizni tasdiqlang</li>
</ol>
<h3>ChatGPT (chat.openai.com)</h3>
<ol>
  <li>chat.openai.com ga kiring</li>
  <li>"Sign up" orqali akkount yarating</li>
  <li>Email tasdiqlang</li>
</ol>
<h3>To'lov usullari (O'zbekistondan)</h3>
<p>To'g'ridan-to'g'ri to'lov imkonsiz bo'lganda:</p>
<ul>
  <li>Virtual karta xizmatlari (Privacy.com, Revolut)</li>
  <li>Kripto orqali to'lov</li>
  <li>Do'stlar orqali to'lov</li>
</ul>`
  },
  {
    slug: 'youtube-research-ai-agent',
    title: 'YouTube research uchun AI agent',
    desc: 'Claude ichida 10 daqiqada YouTube research qiladigan AI agent yarat.',
    tags: ['AI agent', 'Claude'],
    free: false,
    bg: '#0d1117',
    accent: '#f97316',
    badge: 'start',
    content: `<h2>YouTube Research AI Agent yaratish</h2>
<p>Bu qo'llanmada biz Claude ichida YouTube kanallarini tahlil qiladigan va research qiladigan agent yaratamiz.</p>
<h3>Agent arxitekturasi</h3>
<p>Agent quyidagi qadamlarni bajaradi:</p>
<ol>
  <li>YouTube URL yoki kanal nomini qabul qiladi</li>
  <li>Video metadata va transkriptlarni tahlil qiladi</li>
  <li>Muhim fikrlarni ajratib oladi</li>
  <li>Hisobot tuzadi</li>
</ol>
<h3>Prompt strukturasi</h3>
<pre><code>Siz YouTube research agentisiz. Berilgan kanal/videoni tahlil qiling va:
1. Asosiy mavzularni aniqlang
2. Eng yaxshi kontentni ajrating
3. Raqobatchilar bilan solishtiring
4. Hisobot tayyorlang</code></pre>
<h3>Amaliyot</h3>
<p>Hermes yoki Claude Projects da yangi agent yarating va yuqoridagi promptni system message sifatida kiriting.</p>`
  },
  {
    slug: 'vibe-coding-guide',
    title: "Vibe coding noldan: qadam-baqadam qo'llanma",
    desc: "G'oyadan ishchi saytga qadar AI yordamida web loyiha yaratish.",
    tags: ['Vibe coding', 'AI'],
    free: false,
    bg: '#0d1117',
    accent: '#60a5fa',
    badge: "qo'llanma",
    content: `<h2>Vibe Coding: G'oyadan saytgacha</h2>
<p>Vibe coding — kod bilmasdan AI yordamida to'liq ishchi web ilovalar yaratish usuli.</p>
<h3>1-qadam: G'oyani aniqlashtirish</h3>
<p>Nima yaratmoqchi ekanligingizni bir gapda ifodalang: "Ovqat retseptlari saqlovchi sayt yaratmoqchiman".</p>
<h3>2-qadam: AI bilan loyihalash</h3>
<p>Claude yoki ChatGPT ga aytasiz: "Menga React va Tailwind bilan ovqat retseptlari saytini yarat. Foydalanuvchilar retsept qo'sha olsin va izlasa bo'lsin."</p>
<h3>3-qadam: Kod generatsiya</h3>
<p>AI kod generatsiya qiladi. Siz uni Cursor yoki Claude Code da ishga tushirasiz.</p>
<h3>4-qadam: Iteratsiya</h3>
<p>"Dizaynni yaxshila", "Mobil uchun moslash", "Login qo'sh" kabi buyruqlar bilan davom etasiz.</p>
<h3>5-qadam: Deploy</h3>
<p>Vercel yoki Netlify ga birlashtirish uchun: "Bu loyihani Vercel ga deploy qilishim uchun nima kerak?" deb so'rang.</p>`
  },
  {
    slug: 'claude-beginners',
    title: 'Yangi boshlovchilar uchun Claude',
    desc: 'Tajriba va kodsiz tez start.',
    tags: ['Claude', 'Neyrotarmoqlar'],
    free: false,
    bg: '#111',
    accent: '#e879f9',
    badge: 'start',
    content: `<h2>Claude bilan ishlashni boshlash</h2>
<p>Claude — Anthropic tomonidan yaratilgan kuchli AI yordamchi. Bu qo'llanma siz uchun tez start beradi.</p>
<h3>Birinchi suhbat</h3>
<p>claude.ai ga kiring va quyidagilardan birini yozing:</p>
<ul>
  <li>"Menga LinkedIn post yoz: [mavzu]"</li>
  <li>"Bu matnni inglizchaga tarjima qil: [matn]"</li>
  <li>"Kichik biznes uchun marketing rejasi tuz"</li>
</ul>
<h3>Eng yaxshi natija olish uchun</h3>
<p>Aniq bo'ling: "Post yoz" emas, "Instagram uchun 3 ta variantli post yoz, har biri 150 so'z, hashtag bilan".</p>
<h3>Foydali buyruqlar</h3>
<ul>
  <li><strong>Tarjima:</strong> "Tarjima qil: [matn]"</li>
  <li><strong>Yaxshilash:</strong> "Bu matnni takomillashtir: [matn]"</li>
  <li><strong>Tahlil:</strong> "Bu hujjatni tahlil qil va asosiy fikrlarni chiqar"</li>
</ul>`
  }
]

const guide = allGuides.find(g => g.slug === (route.params.slug as string))

if (!guide) {
  throw createError({ statusCode: 404, statusMessage: "Qo'llanma topilmadi" })
}

useSeoMeta({ title: `${guide.title} — Chayroom AI` })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <NuxtLink to="/guides" class="hover:text-cx-ink transition-colors">Qo'llanmalar</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium truncate max-w-80">{{ guide.title }}</span>
      </div>

      <div class="max-w-[720px]">
        <!-- Tags + access badge -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span
            v-for="tag in guide.tags"
            :key="tag"
            class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
          >{{ tag }}</span>
          <span v-if="guide.free" class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-600 border border-green-100">
            <UIcon name="i-lucide-lock-keyhole-open" class="size-3" />
            Bepul
          </span>
          <span v-else-if="hasSubscription" class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-600 border border-green-100">
            <UIcon name="i-lucide-lock-keyhole-open" class="size-3" />
            Доступно по подписке
          </span>
          <span v-else class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-500 border border-red-100">
            <UIcon name="i-lucide-lock-keyhole" class="size-3" />
            По подписке
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-[30px] font-extrabold tracking-tight text-[#1a1a1a] leading-[1.2] mb-3">
          {{ guide.title }}
        </h1>

        <!-- Description -->
        <p class="text-[16px] text-cx-muted leading-[1.6] mb-8">
          {{ guide.desc }}
        </p>

        <!-- Paywall block -->
        <div v-if="!guide.free && !hasSubscription" class="flex flex-col items-center text-center py-12 px-8 rounded-2xl border border-cx-line bg-[#fafafa]">
          <div class="w-14 h-14 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-5">
            <UIcon name="i-lucide-lock" class="size-6 text-[#6f6f72]" />
          </div>
          <h2 class="text-[20px] font-extrabold text-[#1a1a1a] mb-2">
            Гайд доступен по подписке
          </h2>
          <p class="text-[14px] text-cx-muted leading-[1.6] max-w-[340px] mb-6">
            Оформите подписку AI Room Club, чтобы получить доступ к этому и другим материалам
          </p>
          <button
            class="btn-primary px-8 py-3 text-[15px]! mb-3"
            @click="isAccessModalOpen = true"
          >
            Оформить подписку
          </button>
          <NuxtLink to="/login" class="text-[13px] text-cx-muted hover:text-cx-ink transition-colors">
            Уже есть подписка? Войти
          </NuxtLink>
        </div>

        <!-- Content block -->
        <div
          v-else
          class="prose prose-sm max-w-none text-[#1a1a1a] [&_h2]:text-[20px] [&_h2]:font-extrabold [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_p]:text-[14px] [&_p]:leading-[1.7] [&_p]:mb-3 [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:text-[14px] [&_li]:leading-[1.7] [&_li]:mb-1 [&_code]:bg-[#f0f0f0] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_pre]:bg-[#1a1a1a] [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-4"
          v-html="guide.content"
        />
      </div>
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
  </div>
</template>
