# Dashboard Paywall — Dizayn Spesifikatsiyasi

**Sana:** 2026-05-19
**Mavzu:** Dashboard sahifasida kurs va Telegram bo'limlarini obuna holatiga qarab ko'rsatish

---

## Muammo

Dashboard sahifasida barcha foydalanuvchilar — obunasiz ham — Telegram guruhiga kirish tugmasini va kurslarni "Mavjud" sifatida ko'rmoqda. Bu noto'g'ri UX: foydalanuvchi nimaga pul to'lash kerakligini tushunmaydi.

---

## Maqsad

- Obunasiz foydalanuvchiga nima yopiqligini aniq ko'rsatish
- Qo'llanmalar sahifasidagi `free: true/false` pattern'ga mos kelish
- Telegram guruhiga faqat obuna bo'lganlar kirishi

---

## Kurs Badge Logikasi

Har bir kursga `free: boolean` maydoni qo'shiladi (`available` o'chiriladi).

| `free` | Obuna holati | Badge |
|--------|-------------|-------|
| `true` | istalgan | Yashil, ochiq qulf — "Bepul" |
| `false` | obuna yo'q | Qizil, yopiq qulf — "Obuna orqali" |
| `false` | obuna bor | Yashil, ochiq qulf — "Mavjud" |

**Hozirgi kurslar:**
- `Hermes asosida AI agent yaratish` → `free: true`
- `Vibe coding noldan` → `free: true`

Badge ikonkalari qo'llanmalar sahifasidagi bilan bir xil:
- Bepul: `i-lucide-lock-keyhole-open` (yashil)
- Obuna orqali: `i-lucide-lock-keyhole` (qizil)
- Mavjud (obuna bilan): `i-lucide-lock-keyhole-open` (yashil)

---

## Telegram Bo'limi

Obuna holati asosida ikki xil ko'rinish:

**Obunasiz:**
```
[lock icon]  Telegramdagi yopiq hamjamiyat
             Obuna bo'lgandan keyin kirish ochiladi.
```
Tugma yo'q. Faqat matn va qulf belgisi.

**Obuna bor:**
```
[users icon]  Telegramdagi yopiq hamjamiyat
              Ishtirokchilar bilan muloqot, efirlar va yangiliklar.
              [Telegramga kirish →]
```

---

## Texnik O'zgarishlar

### `dashboard.vue` — script

```ts
const courses = [
  {
    title: 'Hermes asosida AI agent yaratish va sozlash',
    desc: "...",
    tags: ['AI', 'AI agent', 'Hermes'],
    free: true,   // available o'rniga
    progress: 0,
  },
  {
    title: 'Vibe coding noldan',
    desc: "...",
    tags: ['Vibe coding'],
    free: true,
    progress: 100,
  },
]
```

### `dashboard.vue` — template (kurs badge)

```vue
<!-- free: true — har doim bepul -->
<span v-if="course.free" class="... text-green-600">
  <UIcon name="i-lucide-lock-keyhole-open" />
  Bepul
</span>

<!-- free: false, obuna bor -->
<span v-else-if="hasSubscription" class="... text-green-600">
  <UIcon name="i-lucide-lock-keyhole-open" />
  Mavjud
</span>

<!-- free: false, obuna yo'q -->
<span v-else class="... text-red-500">
  <UIcon name="i-lucide-lock-keyhole" />
  Obuna orqali
</span>
```

### `dashboard.vue` — template (Telegram tugmasi)

```vue
<!-- Obuna bor -->
<template v-if="hasSubscription">
  <button class="btn-primary ...">
    Telegramga kirish
    <UIcon name="i-lucide-external-link" />
  </button>
</template>

<!-- Obuna yo'q -->
<template v-else>
  <p class="text-[13px] text-cx-muted flex items-center gap-1.5">
    <UIcon name="i-lucide-lock" class="size-4" />
    Obuna bo'lgandan keyin kirish ochiladi.
  </p>
</template>
```

---

## Scope Chegarasi

- Faqat `dashboard.vue` o'zgaradi
- `hasSubscription` holati hozir `ref(false)` — backend integratsiyasi keyingi bosqichda
- Guides sahifasiga tegmaydi

---

## Muvaffaqiyat Mezoni

- Obunasiz foydalanuvchi `free: false` kurslarni "Obuna orqali" ko'radi
- Obunasiz foydalanuvchi Telegram tugmasini ko'rmaydi
- `free: true` kurslar har doim "Bepul" ko'rinadi
- Obuna bo'lgandan keyin hamma narsa to'liq ochiladi
