export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()

  if (!config.supabaseUrl) {
    const found = DEMO_GUIDES.find(g => g.id === id)
    if (!found) throw createError({ statusCode: 404, message: 'Guide not found' })
    return found
  }

  const db = useServerSupabase()
  const { data, error } = await db.from('guides').select('*').eq('id', id).single()
  if (error) throw createError({ statusCode: 404, message: 'Guide not found' })
  return data
})
