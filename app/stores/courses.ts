export interface Lesson {
  id?: number
  title: string
  type: 'Nazariy' | 'Amaliy'
  duration: string
  free: boolean
  videoUrl?: string
  content?: string
}

export interface CourseModule {
  id?: number
  title: string
  subtitle: string
  duration: string
  lessons: Lesson[]
}

export interface Course {
  id?: number
  slug: string
  title: string
  desc: string
  description?: string
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
  coverUrl?: string
  content?: string
}

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref<Course[]>([])
  const pending = ref(false)

  async function load(force = false) {
    if (courses.value.length && !force) return
    pending.value = true
    try {
      const rows = await $fetch<any[]>('/api/courses')
      courses.value = rows.map(normalizeFromApi)
    } finally {
      pending.value = false
    }
  }

  async function addCourse(course: Course) {
    const result = await $fetch<{ slug: string }>('/api/courses', {
      method: 'POST',
      body: course,
    })
    await load(true)
    return result
  }

  function slugExists(slug: string) {
    return courses.value.some(c => c.slug === slug)
  }

  const all = computed(() => courses.value)

  return { all, courses, pending, load, addCourse, slugExists }
})

function normalizeFromApi(row: any): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    desc: row.description ?? '',
    tags: row.tags ?? [],
    level: row.level ?? '',
    levelColor: row.levelColor ?? '#22c55e',
    rating: row.rating ?? 0,
    participants: row.participants ?? 0,
    duration: row.duration ?? '',
    modules: row.modulesList?.length ?? 0,
    lessons: row.modulesList?.reduce((s: number, m: any) => s + (m.lessons?.length ?? 0), 0) ?? 0,
    modulesList: (row.modulesList ?? []).map((m: any) => ({
      id: m.id,
      title: m.title,
      subtitle: m.subtitle ?? '',
      duration: m.duration ?? '',
      lessons: (m.lessons ?? []).map((l: any) => ({
        id: l.id,
        title: l.title,
        type: l.type ?? 'Nazariy',
        duration: l.duration ?? '',
        free: l.free ?? false,
        videoUrl: l.videoUrl ?? undefined,
        content: l.content ?? undefined,
      })),
    })),
    bg: row.bg ?? '#3480f1',
    dark: row.dark ?? false,
    badge: row.badge ?? 'kurs',
    accentTitle: row.accentTitle ?? [],
    accentColor: row.accentColor ?? '#3480f1',
    image: row.coverUrl ?? undefined,
    content: row.content ?? undefined,
  }
}
