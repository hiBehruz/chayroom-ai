<script setup lang="ts">
const route = useRoute()
const hasSubscription = ref(false)

interface Lesson {
  title: string
  type: string
  duration: string
  free: boolean
}

interface CourseModule {
  title: string
  subtitle: string
  duration: string
  lessons: Lesson[]
}

interface CourseDetail {
  slug: string
  title: string
  desc: string
  tags: string[]
  level: string
  levelColor: string
  rating: number
  participants: number
  duration: string
  modules: number
  lessons: number
  modulesList: CourseModule[]
}

const allCourses: CourseDetail[] = [
  {
    slug: 'hermes-ai-agent',
    title: 'Hermes asosida AI agent yaratish va sozlash',
    desc: "Bu kursda biz noldan agent yaratamiz, unga ko'nikmalar va yaxshilanishlar qo'shamiz.",
    tags: ['AI', 'AI agent', 'Hermes'],
    level: "Boshlang'ich",
    levelColor: '#22c55e',
    rating: 0,
    participants: 0,
    duration: '~2h',
    modules: 3,
    lessons: 7,
    modulesList: [
      {
        title: 'Agent yaratish',
        subtitle: 'Baza',
        duration: '~15m',
        lessons: [
          { title: 'Hermes asosida agent yaratish: tayyor assistant', type: 'Amaliy', duration: '15 min', free: false },
        ]
      },
      {
        title: 'Agentni yaxshilash va sozlash',
        subtitle: "Ko'nikmalar qo'shish",
        duration: '~40m',
        lessons: [
          { title: "Agentga yangi ko'nikma qo'shish", type: 'Amaliy', duration: '10 min', free: false },
          { title: 'Agentlar orasida muloqot', type: 'Nazariy', duration: '8 min', free: false },
          { title: "Ikkinchi agent qo'shish", type: 'Amaliy', duration: '12 min', free: false },
          { title: 'Agent xotirasini sozlash', type: 'Amaliy', duration: '10 min', free: false },
        ]
      },
      {
        title: 'AI Office',
        subtitle: 'Agentlar ofisi',
        duration: '~20m',
        lessons: [
          { title: 'Agentlar tizimini loyihalash', type: 'Nazariy', duration: '10 min', free: false },
          { title: 'AI Office yaratish', type: 'Amaliy', duration: '10 min', free: false },
        ]
      }
    ]
  },
  {
    slug: 'vibe-coding',
    title: 'Vibe coding noldan',
    desc: "Kod bilmasdan kerakli digital yechimlar: saytlar, vositalar va ilovalarni yaratish.",
    tags: ['Vibe coding'],
    level: "Boshlang'ich",
    levelColor: '#22c55e',
    rating: 0,
    participants: 0,
    duration: '~8h',
    modules: 5,
    lessons: 31,
    modulesList: [
      {
        title: 'Kirish va asoslar',
        subtitle: 'Baza',
        duration: '~45m',
        lessons: [
          { title: 'Vibe coding nima va u qanday ishlaydi', type: 'Nazariy', duration: '10 min', free: false },
          { title: "AI vositalarini tanlash va sozlash", type: 'Amaliy', duration: '15 min', free: false },
          { title: 'Birinchi loyihangizni boshlash', type: 'Amaliy', duration: '20 min', free: false },
        ]
      },
      {
        title: 'Sayt yaratish',
        subtitle: 'Landing page',
        duration: '~1h20m',
        lessons: [
          { title: 'Landing page strukturasi', type: 'Nazariy', duration: '10 min', free: false },
          { title: "AI yordamida dizayn yaratish", type: 'Amaliy', duration: '15 min', free: false },
          { title: "Saytga kontent qo'shish", type: 'Amaliy', duration: '12 min', free: false },
          { title: 'Mobilga moslash', type: 'Amaliy', duration: '10 min', free: false },
          { title: 'Saytni deploy qilish', type: 'Amaliy', duration: '15 min', free: false },
          { title: "Domain ulash", type: 'Amaliy', duration: '10 min', free: false },
        ]
      },
      {
        title: 'Web ilovalar',
        subtitle: 'App yaratish',
        duration: '~1h44m',
        lessons: [
          { title: 'Ilova arxitekturasi', type: 'Nazariy', duration: '12 min', free: false },
          { title: 'Frontend yaratish', type: 'Amaliy', duration: '20 min', free: false },
          { title: 'Backend logikasi', type: 'Amaliy', duration: '18 min', free: false },
          { title: "Ma'lumotlar bazasi", type: 'Amaliy', duration: '15 min', free: false },
          { title: 'Autentifikatsiya', type: 'Amaliy', duration: '12 min', free: false },
          { title: 'Ilovani deploy qilish', type: 'Amaliy', duration: '15 min', free: false },
          { title: "To'lov tizimini ulash", type: 'Amaliy', duration: '12 min', free: false },
        ]
      },
      {
        title: 'AI vositalar',
        subtitle: 'Avtomatlashtirish',
        duration: '~1h38m',
        lessons: [
          { title: "AI bilan avtomatlashtirish nima", type: 'Nazariy', duration: '8 min', free: false },
          { title: 'Telegram bot yaratish', type: 'Amaliy', duration: '20 min', free: false },
          { title: 'GPT API ulash', type: 'Amaliy', duration: '15 min', free: false },
          { title: 'n8n workflow yaratish', type: 'Amaliy', duration: '18 min', free: false },
          { title: 'Make.com bilan integratsiya', type: 'Amaliy', duration: '15 min', free: false },
          { title: "Airtable bilan ishlash", type: 'Amaliy', duration: '12 min', free: false },
          { title: 'Email avtomatlashtirish', type: 'Amaliy', duration: '10 min', free: false },
          { title: 'Notionni ulash', type: 'Amaliy', duration: '10 min', free: false },
        ]
      },
      {
        title: 'Real loyihalar',
        subtitle: 'Amaliyot',
        duration: '~2h8m',
        lessons: [
          { title: 'Portfolio sayt yaratish', type: 'Amaliy', duration: '25 min', free: false },
          { title: 'E-commerce MVP', type: 'Amaliy', duration: '30 min', free: false },
          { title: "SaaS dastur yaratish", type: 'Amaliy', duration: '30 min', free: false },
          { title: 'AI chatbot ulash', type: 'Amaliy', duration: '20 min', free: false },
          { title: "Loyihani pitchlash", type: 'Nazariy', duration: '10 min', free: false },
          { title: "Keyingi qadamlar", type: 'Nazariy', duration: '8 min', free: false },
          { title: 'Sertifikat olish', type: 'Amaliy', duration: '5 min', free: false },
        ]
      }
    ]
  }
]

const course = allCourses.find(c => c.slug === (route.params.slug as string))

if (!course) {
  throw createError({ statusCode: 404, statusMessage: 'Kurs topilmadi' })
}

const openModules = ref<Set<number>>(new Set([0]))

function toggleModule(index: number) {
  const next = new Set(openModules.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  openModules.value = next
}

useSeoMeta({ title: `${course.title} — Chayroom AI` })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-295 mx-auto px-10 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6">
        <NuxtLink to="/" class="hover:text-cx-ink transition-colors">Bosh sahifa</NuxtLink>
        <span>/</span>
        <NuxtLink to="/courses" class="hover:text-cx-ink transition-colors">Kurslar</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium truncate max-w-80">{{ course.title }}</span>
      </div>

      <div class="grid grid-cols-[1fr_340px] gap-8 items-start">
        <!-- LEFT COLUMN -->
        <div>
          <!-- Course header card -->
          <div class="rounded-2xl border border-cx-line bg-[#f8f8fa] p-6 mb-8">
            <h1 class="text-[24px] font-extrabold tracking-tight text-[#1a1a1a] leading-[1.25] mb-2">
              {{ course.title }}
            </h1>
            <p class="text-[14px] text-cx-muted leading-[1.6] mb-4">{{ course.desc }}</p>

            <!-- Stats row -->
            <div class="flex items-center gap-5 text-[13px] text-cx-muted mb-4">
              <span class="flex items-center gap-1">
                <span class="text-yellow-400 text-[14px]">★</span>
                {{ course.rating }} (0 sharh)
              </span>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-users" class="size-3.5" />
                {{ course.participants }}+ ishtirokchi
              </span>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-clock" class="size-3.5" />
                {{ course.duration }}
              </span>
            </div>

            <!-- Tags + level -->
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="tag in course.tags"
                :key="tag"
                class="px-2.5 py-0.5 rounded-full border border-cx-line text-[11px] text-cx-muted font-medium bg-white"
              >{{ tag }}</span>
              <span
                class="px-3 py-0.5 rounded-full text-[11px] font-bold"
                :style="{ backgroundColor: course.levelColor + '22', color: course.levelColor, border: `1px solid ${course.levelColor}44` }"
              >{{ course.level }}</span>
            </div>
          </div>

          <!-- Course content -->
          <h2 class="text-[18px] font-extrabold text-[#1a1a1a] mb-4">Kurs tarkibi</h2>

          <div class="flex flex-col gap-3">
            <div
              v-for="(mod, modIndex) in course.modulesList"
              :key="modIndex"
              class="rounded-2xl border border-cx-line overflow-hidden"
            >
              <!-- Module header -->
              <button
                class="w-full flex items-center gap-3 px-5 py-4 bg-[#f8f8fa] hover:bg-[#f0f0f4] transition-colors duration-150 text-left cursor-pointer focus:outline-none"
                @click="toggleModule(modIndex)"
              >
                <span class="text-[12px] font-semibold text-cx-muted shrink-0">Modul {{ modIndex + 1 }}</span>
                <UIcon name="i-lucide-lock" class="size-3.5 text-cx-muted shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="text-[14px] font-bold text-[#1a1a1a]">{{ mod.title }}</div>
                  <div class="text-[12px] text-cx-muted">{{ mod.subtitle }}</div>
                </div>
                <div class="flex items-center gap-3 text-[12px] text-cx-muted shrink-0">
                  <span>{{ mod.lessons.length }} dars</span>
                  <span>{{ mod.duration }}</span>
                </div>
                <UIcon
                  :name="openModules.has(modIndex) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="size-4 text-cx-muted shrink-0"
                />
              </button>

              <!-- Lessons list -->
              <div v-if="openModules.has(modIndex)">
                <div
                  v-for="(lesson, lessonIndex) in mod.lessons"
                  :key="lessonIndex"
                  class="flex items-center gap-3 px-5 py-3 border-t border-cx-line"
                >
                  <UIcon
                    :name="(!lesson.free && !hasSubscription) ? 'i-lucide-lock' : 'i-lucide-play-circle'"
                    class="size-4 shrink-0"
                    :class="(!lesson.free && !hasSubscription) ? 'text-cx-muted' : 'text-cx-blue'"
                  />
                  <span class="flex-1 text-[13px] text-[#1a1a1a]">
                    {{ lessonIndex + 1 }}. {{ lesson.title }}
                  </span>
                  <span class="text-[12px] text-cx-muted shrink-0 mr-3">{{ lesson.type }}</span>
                  <span class="flex items-center gap-1 text-[12px] text-cx-muted shrink-0">
                    <UIcon name="i-lucide-clock" class="size-3" />
                    {{ lesson.duration }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT SIDEBAR -->
        <div class="sticky top-24 flex flex-col gap-4">
          <!-- Stats card -->
          <div class="rounded-2xl border border-cx-line bg-[#f8f8fa] p-5">
            <div class="grid grid-cols-3 gap-3 text-center divide-x divide-cx-line">
              <div>
                <div class="text-[22px] font-extrabold text-[#1a1a1a]">{{ course.modules }}</div>
                <div class="text-[12px] text-cx-muted mt-0.5">Modullar</div>
              </div>
              <div>
                <div class="text-[22px] font-extrabold text-[#1a1a1a]">{{ course.lessons }}</div>
                <div class="text-[12px] text-cx-muted mt-0.5">Darslar</div>
              </div>
              <div>
                <div class="text-[22px] font-extrabold text-[#1a1a1a]">{{ course.duration }}</div>
                <div class="text-[12px] text-cx-muted mt-0.5">Vaqt</div>
              </div>
            </div>
          </div>

          <!-- CTA card -->
          <div v-if="!hasSubscription" class="rounded-2xl border border-cx-line bg-white p-6 shadow-lift">
            <div class="text-[15px] font-bold text-[#1a1a1a] mb-1">
              Chayroom AI Club'ga to'liq kirish
            </div>
            <div class="text-[13px] text-cx-muted mb-4">
              Barcha kurslarga bitta obuna bilan kirish
            </div>
            <button
              class="btn-primary w-full text-[14px]! py-3! mb-5"
              @click="navigateTo('/#pricing')"
            >
              Kirish huquqini olish
            </button>
            <div class="text-[11px] font-bold text-cx-muted uppercase tracking-wide mb-3">
              Nima kiradi:
            </div>
            <ul class="flex flex-col gap-2.5">
              <li
                v-for="item in [
                  'Barcha joriy va kelajakdagi kurslar',
                  `Bepul qo'llanmalar va materiallar`,
                  'Prompt va vositalar bazasi',
                  'Yopiq Telegram guruh',
                  'Efirlar va tahlillarga kirish'
                ]"
                :key="item"
                class="flex items-start gap-2 text-[13px] text-[#1a1a1a]"
              >
                <UIcon name="i-lucide-check" class="size-3.5 text-green-500 shrink-0 mt-0.5" />
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
