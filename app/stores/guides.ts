export interface Guide {
  id: number
  slug: string
  title: string
  description: string | null
  content: string | null
  coverUrl: string | null
  tags: string[] | null
  bg: string | null
  accent: string | null
  badge: string | null
  isFree: boolean
  level: string | null
  publishedAt: string | null
  createdAt: string
  category: string | null
}

export const useGuidesStore = defineStore('guides', () => {
  const guides = ref<Guide[]>([])
  const pending = ref(false)

  async function fetch(force = false) {
    if (guides.value.length && !force) return
    pending.value = true
    try {
      guides.value = await $fetch<Guide[]>('/api/guides')
    } finally {
      pending.value = false
    }
  }

  async function fetchOne(slug: string): Promise<Guide> {
    return await $fetch<Guide>(`/api/guides/${slug}`)
  }

  function slugExists(slug: string) {
    return guides.value.some(g => g.slug === slug)
  }

  return { guides, pending, fetch, fetchOne, slugExists }
})
