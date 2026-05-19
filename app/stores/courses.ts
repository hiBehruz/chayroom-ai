export interface Lesson {
  title: string
  type: 'Nazariy' | 'Amaliy'
  duration: string
  free: boolean
}

export interface CourseModule {
  title: string
  subtitle: string
  duration: string
  lessons: Lesson[]
}

export interface Course {
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
  bg: string
  dark: boolean
  badge: string
  accentTitle: string[]
  accentColor: string
  image?: string
}

const STORAGE_KEY = 'cx-courses-extra'

const BASE_COURSES: Course[] = [
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
    bg: '#f0f4ff',
    dark: false,
    badge: 'kurs',
    accentTitle: ['AI agent', 'Hermes'],
    accentColor: '#0075DE',
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
    bg: '#0d1117',
    dark: true,
    badge: 'kurs',
    accentTitle: [],
    accentColor: '#f97316',
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
    ]
  }
]

export const useCoursesStore = defineStore('courses', () => {
  const extraCourses = ref<Course[]>([])

  function load() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) extraCourses.value = JSON.parse(raw) as Course[]
    } catch { localStorage.removeItem(STORAGE_KEY) }
  }

  const all = computed<Course[]>(() => [...BASE_COURSES, ...extraCourses.value])

  function addCourse(course: Course) {
    extraCourses.value.push(course)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(extraCourses.value))
    }
  }

  function slugExists(slug: string) {
    return all.value.some(c => c.slug === slug)
  }

  return { all, extraCourses, load, addCourse, slugExists }
})
