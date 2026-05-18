# Kurs Detail Sahifasi — Dizayn Spesifikatsiyasi

**Sana:** 2026-05-19
**Mavzu:** Har bir kurs uchun alohida detail sahifa — modul accordion, dars ro'yxati, obuna sidebar

---

## Maqsad

Foydalanuvchi `courses.vue` yoki `dashboard.vue` dan kursni bosganda `/courses/[slug]` sahifasiga o'tadi. U yerda kurs tarkibi (modullar, darslar), statistika va obuna CTA ko'rsatiladi. Obuna yo'q bo'lsa darslar qulflangan ko'rinadi.

---

## Route

**Fayl:** `app/pages/courses/[slug].vue`

**URL pattern:** `/courses/hermes-ai-agent`, `/courses/vibe-coding`

Nuxt 4 dynamic route — `useRoute().params.slug` orqali joriy kurs topiladi.

---

## Ma'lumot Strukturasi

### `courses.vue` va `[slug].vue` da umumiy kurs obyekti

Mavjud kurs obyektiga qo'shiladigan yangi maydonlar:

```ts
interface Lesson {
  title: string      // "Hermes agentni noldan yaratish"
  type: string       // "Amaliy" | "Nazariy"
  duration: string   // "15 min"
  free: boolean      // true = har doim ochiq, false = obuna kerak
}

interface Module {
  title: string      // "Agent yaratish"
  subtitle: string   // "Baza"
  lessons: Lesson[]
}

interface Course {
  // mavjud maydonlar
  slug: string             // "hermes-ai-agent"
  title: string
  desc: string
  tags: string[]
  category: string
  level: string
  levelColor: string
  modules: number          // modul soni (ro'yxat uchun)
  lessons: number          // dars soni (ro'yxat uchun)
  duration: string
  bg: string
  dark: boolean
  badge: string
  accentTitle: string[]
  accentColor: string

  // yangi maydonlar
  rating: number           // 0
  participants: number     // 0
  modulesList: Module[]    // to'liq modul/dars ma'lumoti
}
```

### Hermes kursi `modulesList`

```ts
modulesList: [
  {
    title: 'Agent yaratish',
    subtitle: 'Baza',
    lessons: [
      { title: 'Hermes asosida agent yaratish: tayyor assistant', type: 'Amaliy', duration: '15 min', free: false }
    ]
  },
  {
    title: 'Agentni yaxshilash va sozlash',
    subtitle: "Ko'nikmalar qo'shish",
    lessons: [
      { title: "Agentga yangi ko'nikma qo'shish", type: 'Amaliy', duration: '10 min', free: false },
      { title: 'Agentlar orasida muloqot', type: 'Nazariy', duration: '8 min', free: false },
      { title: "Ikkinchi agent qo'shish", type: 'Amaliy', duration: '12 min', free: false },
      { title: 'Agent xotirasini sozlash', type: 'Amaliy', duration: '10 min', free: false },
    ]
  },
  {
    title: 'AI Office',
    subtitle: "IIAgentlar ofisi",
    lessons: [
      { title: 'Agentlar tizimini loyihalash', type: 'Nazariy', duration: '10 min', free: false },
      { title: 'AI Office yaratish', type: 'Amaliy', duration: '10 min', free: false },
    ]
  }
]
```

### Vibe Coding kursi `modulesList`

Vibe coding kursining modullarini xuddi shu formatda qo'shish (31 ta dars, 5 ta modul, ~8h).

---

## Sahifa Tartibi

```
Breadcrumb: Bosh sahifa / Kurslar / [Kurs nomi]

┌──────────────────────────────────┬───────────────────┐
│ HEADER KARTA (rounded-2xl, bg)   │ SIDEBAR (sticky)  │
│  • Kurs nomi (bold, katta)       │                   │
│  • Desc (muted)                  │ Stats karta:      │
│  • ⭐ rating  👥 parts  ⏱ time  │  3 modul          │
│  • Tag pills + level badge       │  7 dars           │
│                                  │  ~2h vaqt         │
├──────────────────────────────────┤                   │
│ "Kurs tarkibi" sarlavha          │ Obuna CTA karta:  │
│                                  │  "To'liq kirish"  │
│ [Modul 1] ▲ (ochiq by default)  │  narx             │
│   🔒 1. Dars nomi   Amaliy 15m  │  [Kirish tugmasi] │
│                                  │  Nima kiradi:     │
│ [Modul 2] ▼ (yopiq)             │  ✓ ...            │
│ [Modul 3] ▼ (yopiq)             │                   │
└──────────────────────────────────┴───────────────────┘
```

---

## Komponentlar

### Header karta
- `rounded-2xl border border-cx-line bg-[#f8f8fa]` container
- Chap: title (`text-[26px] font-extrabold`), desc, rating/participants/duration row, tags + level badge
- O'ng: kurs preview visual (courses.vue dagi header vizual — kichikroq versiyasi)
- Rating: `⭐ 0 (0 sharh)`, participants: `👥 0+ ishtirokchi`, duration: `⏱ ~2h`

### Modul Accordion
- Har bir modul: `rounded-2xl border border-cx-line` karta
- Header qismi (bosish mumkin): modul raqami + lock icon + nomi + subtitle + dars soni/vaqt + expand/collapse chevron
- Expanded holat: darslar ro'yxati (separator bilan)
- Dars qatori: `🔒` (agar `!lesson.free && !hasSubscription`) + dars nomi + type (muted) + duration (muted, o'ngda)
- `openModules: ref<Set<number>>` — ochiq modullar indekslari. Default: `new Set([0])` (birinchi modul ochiq)

### Sidebar (sticky)
- `sticky top-24` (nav height + padding)
- **Stats karta:** 3 ustun — Modullar, Darslar, Vaqt
- **Obuna CTA karta:** `border border-cx-line rounded-2xl p-6`
  - Sarlavha: "Chayroom AI Club'ga to'liq kirish"
  - Narx: katta font
  - Tugma: `btn-primary w-full` → `navigateTo('/#pricing')`
  - Nima kiradi ro'yxati (✓ checkmark, yashil): kurslar, materiallar, Telegram, efirlar

### Navigation
- `courses.vue` dagi karta tugmasi `<NuxtLink :to="\`/courses/${course.slug}\`">` ga o'zgaradi
- `dashboard.vue` dagi kurs kartalari ham xuddi shu link

---

## Obuna Logikasi

- `hasSubscription = ref(false)` (hozir hardcoded, kelajakda auth store ga ulanadi)
- `lesson.free: false && !hasSubscription` → lock icon ko'rsatiladi, dars kliklanmaydi
- `lesson.free: true` → hamma uchun ochiq (keyinroq preview uchun)
- Sidebar CTA faqat `!hasSubscription` bo'lganda to'liq ko'rinadi

---

## Fayllar

| Fayl | O'zgarish |
|------|-----------|
| `app/pages/courses/[slug].vue` | Yangi fayl — kurs detail sahifasi |
| `app/pages/courses.vue` | `slug` maydoni + `modulesList` qo'shiladi, karta tugmasi NuxtLink ga o'zgaradi |
| `app/pages/dashboard.vue` | Kurs kartalari NuxtLink ga o'zgaradi |

---

## Muvaffaqiyat Mezoni

- `/courses/hermes-ai-agent` va `/courses/vibe-coding` ishlaydi
- Noto'g'ri slug → 404 (Nuxt default)
- Modul accordion ochiladi/yopiladi
- Obunasiz: darslar qulflangan (`🔒` icon)
- Sidebar sticky ishlaydi
- `courses.vue` va `dashboard.vue` linklardan o'tish ishlaydi
