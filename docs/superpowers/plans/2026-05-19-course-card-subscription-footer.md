# Course Card Subscription Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subscription-aware footer to course cards in `courses/index.vue` — unsubscribed users see a tariff block and clicking the card opens AccessModal; subscribed users see a progress block with a direct link to the course.

**Architecture:** Single-file change to `app/pages/courses/index.vue`. Add `hasSubscription` and `isAccessModalOpen` refs, add `progress` field to course data, replace the "Kursni ko'rish" NuxtLink button with a conditional footer, make the whole card a clickable div with the appropriate handler, and mount `<AppAccessModal>` at template bottom.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, Tailwind CSS v4, `@nuxt/ui` (UIcon)

---

### Task 1: Add state refs and progress field to course data

**Files:**
- Modify: `app/pages/courses/index.vue` (script section)

- [ ] **Step 1: Add `hasSubscription`, `isAccessModalOpen` refs and `progress` field**

In the `<script setup>` block, add after `const activeCategory = ref('Hammasi')`:

```ts
const hasSubscription = ref(false)
const isAccessModalOpen = ref(false)
```

In the `courses` array, add `progress: 0` to each course object:

```ts
const courses = [
  {
    slug: 'hermes-ai-agent',
    // ... existing fields ...
    progress: 0,
  },
  {
    slug: 'vibe-coding',
    // ... existing fields ...
    progress: 0,
  }
]
```

Full updated script section:

```ts
const categories = ['Hammasi', 'Vibe coding', 'AI agentlar', 'Neyrotarmoqlar', 'Kontent']
const activeCategory = ref('Hammasi')
const hasSubscription = ref(false)
const isAccessModalOpen = ref(false)

const tabRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref({ left: '6px', width: '0px' })

function updateIndicator(index: number) {
  const el = tabRefs.value[index]
  if (!el) return
  indicatorStyle.value = { left: el.offsetLeft + 'px', width: el.offsetWidth + 'px' }
}

function selectCategory(cat: string, index: number) {
  activeCategory.value = cat
  updateIndicator(index)
}

onMounted(() => nextTick(() => updateIndicator(0)))

const courses = [
  {
    slug: 'hermes-ai-agent',
    title: 'Hermes asosida AI agent yaratish va sozlash',
    desc: "Bu kursda biz noldan agent yaratamiz, unga ko'nikmalar va yaxshilanishlar qo'shamiz.",
    tags: ['AI', 'AI agent', 'Hermes'],
    category: 'AI agentlar',
    level: "Boshlang'ich",
    levelColor: '#22c55e',
    modules: 3,
    lessons: 7,
    duration: '~2h',
    bg: '#f0f4ff',
    dark: false,
    badge: 'kurs',
    accentTitle: ['AI agent', 'Hermes'],
    accentColor: '#0075DE',
    progress: 0,
  },
  {
    slug: 'vibe-coding',
    title: 'Vibe coding noldan',
    desc: 'Kod bilmasdan turib AI yordamida kerakli digital yechimlar: saytlar, vositalar va ilovalar yaratish.',
    tags: ['Vibe coding'],
    category: 'Vibe coding',
    level: "Boshlang'ich",
    levelColor: '#22c55e',
    modules: 5,
    lessons: 31,
    duration: '~8h',
    bg: '#0d1117',
    dark: true,
    badge: 'kurs',
    accentTitle: [],
    accentColor: '#f97316',
    progress: 0,
  }
]

const filtered = computed(() =>
  activeCategory.value === 'Hammasi'
    ? courses
    : courses.filter(c => c.category === activeCategory.value)
)

useSeoMeta({ title: 'Kurslar — Chayroom AI' })
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx nuxi typecheck`
Expected: no errors related to `courses/index.vue`

- [ ] **Step 3: Commit**

```bash
git add app/pages/courses/index.vue
git commit -m "feat: add subscription state and progress field to courses index"
```

---

### Task 2: Convert card div to clickable element with subscription-aware handler

**Files:**
- Modify: `app/pages/courses/index.vue` (template — outer card div)

- [ ] **Step 1: Replace outer card `<div>` with a clickable div**

Find the current outer card div in the `<TransitionGroup>`:
```html
<div
  v-for="course in filtered"
  :key="course.title"
  class="group flex flex-col overflow-hidden rounded-2xl border border-cx-line bg-[#fafafa] cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] hover:border-cx-line/60"
>
```

Replace with (add `@click` handler):
```html
<div
  v-for="course in filtered"
  :key="course.title"
  class="group flex flex-col overflow-hidden rounded-2xl border border-cx-line bg-[#fafafa] cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] hover:border-cx-line/60"
  @click="hasSubscription ? navigateTo(`/courses/${course.slug}`) : (isAccessModalOpen = true)"
>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/courses/index.vue
git commit -m "feat: make course card clickable based on subscription state"
```

---

### Task 3: Replace "Kursni ko'rish" button with conditional footer

**Files:**
- Modify: `app/pages/courses/index.vue` (template — card body footer)

- [ ] **Step 1: Remove the existing stats row and NuxtLink button**

In the card body `<div class="flex flex-col flex-1 p-5 gap-3">`, remove these two blocks:

```html
<div class="flex items-center gap-4 text-[12px] text-cx-muted">
  <span class="flex items-center gap-1">
    <UIcon name="i-lucide-layout-list" class="size-3.5" />
    {{ course.modules }} modul
  </span>
  <span class="flex items-center gap-1">
    <UIcon name="i-lucide-play-circle" class="size-3.5" />
    {{ course.lessons }} dars
  </span>
  <span class="flex items-center gap-1">
    <UIcon name="i-lucide-clock" class="size-3.5" />
    {{ course.duration }}
  </span>
</div>

<NuxtLink
  :to="`/courses/${course.slug}`"
  class="btn-primary w-full text-[13px]! py-2.5! flex items-center justify-center gap-2"
>
  <span>Kursni ko'rish</span>
  <span class="btn-arrow">→</span>
</NuxtLink>
```

- [ ] **Step 2: Add the conditional footer in their place**

Add this block where the removed code was (after the `<p>` description):

```html
<!-- Unsubscribed footer -->
<div v-if="!hasSubscription" class="mt-auto pt-3 border-t border-cx-line">
  <div class="text-[10px] font-bold text-cx-muted uppercase tracking-widest mb-2">
    1 oylik tarifi
  </div>
  <div class="flex items-center gap-4 text-[12px] text-cx-muted mb-3">
    <span class="flex items-center gap-1">
      <UIcon name="i-lucide-layout-list" class="size-3.5" />
      {{ course.modules }} modul
    </span>
    <span class="flex items-center gap-1">
      <UIcon name="i-lucide-play-circle" class="size-3.5" />
      {{ course.lessons }} dars
    </span>
    <span class="flex items-center gap-1">
      <UIcon name="i-lucide-clock" class="size-3.5" />
      {{ course.duration }}
    </span>
  </div>
  <button
    class="btn-primary w-full text-[13px]! py-2.5! flex items-center justify-center gap-2"
    @click.stop="isAccessModalOpen = true"
  >
    <span>Kirish huquqini olish</span>
    <span class="btn-arrow">→</span>
  </button>
</div>

<!-- Subscribed footer -->
<div v-else class="mt-auto pt-3 border-t border-cx-line">
  <div class="flex items-center justify-between mb-2">
    <span class="text-[12px] font-semibold text-cx-muted">Ваш прогресс</span>
    <span class="text-[12px] font-bold text-[#1a1a1a]">{{ course.progress }}%</span>
  </div>
  <div class="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden mb-2">
    <div
      class="h-full bg-cx-blue rounded-full transition-all duration-500"
      :style="{ width: `${course.progress}%` }"
    />
  </div>
  <div class="text-[12px] text-cx-muted mb-3">
    {{ course.progress === 0 ? 0 : Math.round(course.lessons * course.progress / 100) }} из {{ course.lessons }} уроков
  </div>
  <NuxtLink
    :to="`/courses/${course.slug}`"
    class="btn-primary w-full text-[13px]! py-2.5! flex items-center justify-center gap-2"
    @click.stop
  >
    <span>{{ course.progress > 0 ? 'Davom ettirish' : 'Начать обучение' }}</span>
    <span class="btn-arrow">→</span>
  </NuxtLink>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/courses/index.vue
git commit -m "feat: add subscription-aware footer to course cards"
```

---

### Task 4: Mount AccessModal in template

**Files:**
- Modify: `app/pages/courses/index.vue` (template — bottom)

- [ ] **Step 1: Add AppAccessModal at bottom of template**

Before the closing `</div>` of the root template div (after `</div>` that closes `max-w-295`), add:

```html
<AppAccessModal v-model="isAccessModalOpen" />
```

Full template closing structure should look like:
```html
      </TransitionGroup>
    </div>
  </div>

  <AppAccessModal v-model="isAccessModalOpen" />
</template>
```

- [ ] **Step 2: Verify the page renders without errors**

Run dev server: `npm run dev`

Navigate to `/courses` and check:
1. Cards display "1 oylik tarifi" footer with modul/dars/vaqt stats
2. Clicking any card opens the AccessModal overlay
3. Clicking the "Kirish huquqini olish" button inside the card also opens modal (and doesn't double-fire with the card click due to `.stop`)
4. Modal closes when clicking outside or X

- [ ] **Step 3: Toggle `hasSubscription = true` in script temporarily and verify subscribed state**

Change `const hasSubscription = ref(false)` to `const hasSubscription = ref(true)` temporarily.

Check:
1. Cards show "Ваш прогресс 0% · 0 из N уроков" footer
2. Clicking card navigates to `/courses/slug`
3. "Начать обучение" button also navigates correctly (`.stop` prevents double navigation)

Revert back to `ref(false)` after testing.

- [ ] **Step 4: Final commit**

```bash
git add app/pages/courses/index.vue
git commit -m "feat: mount AccessModal on courses index page"
```
