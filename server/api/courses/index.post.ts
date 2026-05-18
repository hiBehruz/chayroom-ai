export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })
  const db = useServerSupabase()
  const body = await readBody(event)
  const { data, error } = await db.from('courses').insert(body).select().single()
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
