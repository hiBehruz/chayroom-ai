export default defineEventHandler(async (event) => {
  const db = useServerSupabase()
  const query = getQuery(event)
  const showAll = query.all === 'true' && isAdminRequest(event)

  let req = db.from('guides').select('*').order('created_at', { ascending: false })
  if (!showAll) req = req.eq('is_published', true)

  const { data, error } = await req
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
