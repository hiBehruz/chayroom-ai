export interface Guide {
  slug: string
  title: string
  desc: string
  tags: string[]
  category: string
  free: boolean
  bg: string
  accent: string
  badge: string
  content: string
  image?: string
}

const STORAGE_KEY = 'cx-guides-extra'

const BASE_GUIDES: Guide[] = [
  {
    slug: 'claude-code-token-limit',
    title: "Claude Code'da tokenlarni birdan tugatib qo'ymaslik",
    desc: "Claude bilan ishlaganda tokenlarni behuda sarflamaslik bo'yicha amaliy tahlil.",
    tags: ['Claude', 'Limits', 'Claude Code'],
    category: 'Neyrotarmoqlar',
    free: true,
    bg: '#f5ede0',
    accent: '#e8b97a',
    badge: 'start',
    content: `<h2>Tokenlarni tejash asoslari</h2>
<p>Claude Code bilan ishlashda token sarfini kamaytirish uchun bir nechta asosiy qoidalar mavjud.</p>
<h3>1. Kontekstni tozalab turing</h3>
<p>Har bir yangi vazifa uchun <code>/clear</code> buyrug'ini ishlating. Bu joriy suhbat tarixini tozalab, yangi sessiya boshlaydi.</p>
<h3>2. Faqat kerakli fayllarni oching</h3>
<p>Katta loyihalarda butun reponi o'qitish o'rniga faqat zarur fayllarni ko'rsating.</p>
<h3>3. Qisqa va aniq so'rovlar yozing</h3>
<p>Uzun tavsiflar o'rniga qisqa, konkret ko'rsatmalar bering.</p>
<h3>4. Compact rejimidan foydalaning</h3>
<p><code>/compact</code> buyrug'i uzun suhbatni qisqartiradi va kontekstni saqlab qoladi.</p>`
  },
  {
    slug: 'codex-beginners',
    title: 'Yangi boshlovchilar uchun Codex',
    desc: "Codex bilan tanishish va noldan sozlash bo'yicha qo'llanma.",
    tags: ['Codex', 'ChatGPT'],
    category: 'Neyrotarmoqlar',
    free: true,
    bg: '#0d1f1a',
    accent: '#22c55e',
    badge: "qo'llanma",
    content: `<h2>OpenAI Codex nima?</h2>
<p>Codex — OpenAI'ning kod yozishga ixtisoslashgan sun'iy intellekt modeli.</p>
<h3>Boshlash uchun kerakli narsalar</h3>
<ul>
  <li>OpenAI akkaunti</li>
  <li>API kalit (platform.openai.com dan)</li>
  <li>Python yoki JavaScript bilimi (ixtiyoriy)</li>
</ul>`
  },
  {
    slug: 'claude-chatgpt-registration',
    title: "Claude / ChatGPT ro'yxatdan o'tish va to'lov yo'llari",
    desc: "Claude va ChatGPT'da akkaunt ochish hamda obunani to'lash bo'yicha amaliy yo'riqnoma.",
    tags: ['Claude', 'ChatGPT'],
    category: 'Neyrotarmoqlar',
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
</ol>
<h3>To'lov usullari (O'zbekistondan)</h3>
<ul>
  <li>Virtual karta xizmatlari (Privacy.com, Revolut)</li>
  <li>Kripto orqali to'lov</li>
</ul>`
  },
  {
    slug: 'youtube-research-ai-agent',
    title: 'YouTube research uchun AI agent',
    desc: "Claude ichida 10 daqiqada YouTube research qiladigan AI agent yarat.",
    tags: ['AI agent', 'Claude'],
    category: 'AI agentlar',
    free: false,
    bg: '#0d1117',
    accent: '#f97316',
    badge: 'start',
    content: `<h2>YouTube Research AI Agent yaratish</h2>
<p>Bu qo'llanmada biz Claude ichida YouTube kanallarini tahlil qiladigan agent yaratamiz.</p>
<h3>Prompt strukturasi</h3>
<pre><code>Siz YouTube research agentisiz. Berilgan kanal/videoni tahlil qiling.</code></pre>`
  },
  {
    slug: 'vibe-coding-guide',
    title: "Vibe coding noldan: qadam-baqadam qo'llanma",
    desc: "G'oyadan ishchi saytga qadar AI yordamida web loyiha yaratish.",
    tags: ['Vibe coding', 'AI'],
    category: 'Vibe coding',
    free: false,
    bg: '#0d1117',
    accent: '#60a5fa',
    badge: "qo'llanma",
    content: `<h2>Vibe Coding: G'oyadan saytgacha</h2>
<p>Vibe coding — kod bilmasdan AI yordamida to'liq ishchi web ilovalar yaratish usuli.</p>`
  },
  {
    slug: 'claude-beginners',
    title: 'Yangi boshlovchilar uchun Claude',
    desc: 'Tajriba va kodsiz tez start.',
    tags: ['Claude', 'Neyrotarmoqlar'],
    category: 'Neyrotarmoqlar',
    free: false,
    bg: '#111',
    accent: '#e879f9',
    badge: 'start',
    content: `<h2>Claude bilan ishlashni boshlash</h2>
<p>Claude — Anthropic tomonidan yaratilgan kuchli AI yordamchi.</p>`
  }
]

export const useGuidesStore = defineStore('guides', () => {
  const extraGuides = ref<Guide[]>([])

  function load() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) extraGuides.value = JSON.parse(raw) as Guide[]
    } catch { localStorage.removeItem(STORAGE_KEY) }
  }

  const all = computed<Guide[]>(() => [...BASE_GUIDES, ...extraGuides.value])

  function addGuide(guide: Guide) {
    extraGuides.value.push(guide)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(extraGuides.value))
    }
  }

  function updateGuide(slug: string, updated: Partial<Guide>) {
    const idx = extraGuides.value.findIndex(g => g.slug === slug)
    if (idx !== -1) {
      extraGuides.value[idx] = { ...extraGuides.value[idx], ...updated }
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(extraGuides.value))
      }
    }
  }

  function slugExists(slug: string) {
    return all.value.some(g => g.slug === slug)
  }

  return { all, extraGuides, load, addGuide, updateGuide, slugExists }
})
