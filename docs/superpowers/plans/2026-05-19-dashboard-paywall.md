# Dashboard Paywall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dashboard sahifasida kurs badge'larini `free/paid` logikasiga o'tkazish va Telegram tugmasini faqat obuna bo'lganlarga ko'rsatish.

**Architecture:** Faqat `app/pages/dashboard.vue` o'zgaradi. Kurs datasi `available` maydonidan `free` maydoniga o'tadi (qo'llanmalar sahifasidagi pattern'ga mos). Badge va Telegram tugmasi `user` + `hasSubscription` holatiga qarab reaktiv render bo'ladi.

**Tech Stack:** Vue 3 (Composition API), Nuxt 4, Tailwind CSS v4

---

### Task 1: Kurs datasini `available` → `free` ga o'tkazish

**Files:**
- Modify: `app/pages/dashboard.vue:17-32`

- [ ] **Step 1: `courses` array'dagi `available` maydonini `free` bilan almashtirish**

`app/pages/dashboard.vue` script qismidagi `courses` ni quyidagicha o'zgartiring:

```ts
const courses = [
  {
    title: 'Hermes asosida AI agent yaratish va sozlash',
    desc: "Bu kursda biz noldan agent yaratamiz, unga ko'nikmalar va yaxshilanishlar qo'shamiz.",
    tags: ['AI', 'AI agent', 'Hermes'],
    free: true,
    progress: 0,
  },
  {
    title: 'Vibe coding noldan',
    desc: "Kod bilmasdan kerakli digital yechimlar: saytlar, vositalar va ilovalarni yaratish.",
    tags: ['Vibe coding'],
    free: true,
    progress: 100,
  },
]
```

- [ ] **Step 2: Vizual tekshirish**

Dev server ishga tushiring (`pnpm dev`) va `/dashboard` sahifasini oching. Sahifa xatosiz yuklanishi kerak.

- [ ] **Step 3: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "refactor: replace course.available with course.free field"
```

---

### Task 2: Kurs badge logikasini yangilash

**Files:**
- Modify: `app/pages/dashboard.vue` — kurs badge template qismi

- [ ] **Step 1: Kurs kartasidagi badge `v-if/v-else-if/v-else` ni yangilash**

Mavjud badge blokini (hozir `v-if="course.available"` va `v-else`) quyidagicha almashtiring:

```vue
<!-- Bepul kurs — har doim ochiq -->
<span
  v-if="course.free"
  class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-semibold border border-green-100"
>
  <UIcon name="i-lucide-lock-keyhole-open" class="size-3" />
  Bepul
</span>

<!-- Pullik + obuna bor -->
<span
  v-else-if="hasSubscription"
  class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-semibold border border-green-100"
>
  <UIcon name="i-lucide-lock-keyhole-open" class="size-3" />
  Mavjud
</span>

<!-- Pullik + obuna yo'q -->
<span
  v-else
  class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-[11px] font-semibold border border-red-100"
>
  <UIcon name="i-lucide-lock-keyhole" class="size-3" />
  Obuna orqali
</span>
```

- [ ] **Step 2: Vizual tekshirish — obunasiz holat**

`hasSubscription = ref(false)` (hozirgi default). `/dashboard` da:
- `free: true` kurslar → yashil "Bepul" badge ko'rinishi kerak
- Agar `free: false` kurs bo'lsa → qizil "Obuna orqali" ko'rinishi kerak

- [ ] **Step 3: Vizual tekshirish — obuna bor holat**

Vaqtincha `hasSubscription = ref(true)` ga o'zgartiring, sahifani yangilang:
- `free: false` kurslar → yashil "Mavjud" ko'rinishi kerak
- Tekshirgandan so'ng `ref(false)` ga qaytaring

- [ ] **Step 4: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat: update course badge logic — free/paid/subscribed states"
```

---

### Task 3: Telegram tugmasini obuna holatiga bog'lash

**Files:**
- Modify: `app/pages/dashboard.vue` — Telegram bo'limi template qismi

- [ ] **Step 1: Telegram bo'limidagi tugma qismini `v-if/v-else` bilan o'zgartirish**

Mavjud `<button class="btn-primary ...">Telegramga kirish</button>` qatorini quyidagicha almashtiring:

```vue
<!-- Obuna bor — kirish tugmasi -->
<template v-if="hasSubscription">
  <button class="btn-primary text-[13px]! px-5! py-2!">
    Telegramga kirish
    <UIcon name="i-lucide-external-link" class="size-3.5" />
  </button>
</template>

<!-- Obuna yo'q — qulflangan matn -->
<template v-else>
  <p class="flex items-center gap-1.5 text-[13px] text-cx-muted">
    <UIcon name="i-lucide-lock" class="size-4 shrink-0" />
    Obuna bo'lgandan keyin kirish ochiladi.
  </p>
</template>
```

- [ ] **Step 2: Vizual tekshirish — obunasiz holat**

`hasSubscription = ref(false)` bilan `/dashboard`:
- Telegram bo'limida tugma ko'rinmasligi kerak
- "Obuna bo'lgandan keyin kirish ochiladi." matni va qulf belgisi ko'rinishi kerak

- [ ] **Step 3: Vizual tekshirish — obuna bor holat**

Vaqtincha `hasSubscription = ref(true)`:
- "Telegramga kirish" tugmasi ko'rinishi kerak
- Tekshirgandan so'ng `ref(false)` ga qaytaring

- [ ] **Step 4: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat: show Telegram button only when subscribed"
```
