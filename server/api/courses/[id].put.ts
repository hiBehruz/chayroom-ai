export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })
  const id = getRouterParam(event, 'id')
  const db = useServerSupabase()
  const body = await readBody(event)
  const { data, error } = await db.from('courses').update(body).eq('id', id).select().single()
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
