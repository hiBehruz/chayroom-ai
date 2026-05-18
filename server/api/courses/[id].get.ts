export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = useServerSupabase()
  const { data, error } = await db.from('courses').select('*').eq('id', id).single()
  if (error) throw createError({ statusCode: 404, message: 'Course not found' })
  return data
})
