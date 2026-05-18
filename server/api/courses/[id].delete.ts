export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })
  const id = getRouterParam(event, 'id')
  const db = useServerSupabase()
  const { error } = await db.from('courses').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { success: true }
})
