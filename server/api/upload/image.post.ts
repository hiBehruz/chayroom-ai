export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'Forbidden' })

  const formData = await readFormData(event)
  const file = formData.get('file') as File
  if (!file) throw createError({ statusCode: 400, message: 'No file provided' })

  const db = useServerSupabase()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await db.storage.from('covers').upload(filename, buffer, {
    contentType: file.type,
    upsert: false
  })
  if (error) throw createError({ statusCode: 500, message: error.message })

  const { data } = db.storage.from('covers').getPublicUrl(filename)
  return { url: data.publicUrl }
})
