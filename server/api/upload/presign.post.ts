import { requireAdmin } from '#server/utils/admin-session'
import { getStorageProvider } from '#server/utils/storage'
import { createStorageKey } from '#server/utils/storage/key'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { filename, contentType } = await readBody<{
    filename: string
    contentType: string
  }>(event)

  if (!filename || !contentType) {
    throw createError({ statusCode: 400, statusMessage: 'filename va contentType majburiy' })
  }

  if (!contentType.startsWith('video/') && !contentType.startsWith('image/')) {
    throw createError({ statusCode: 400, statusMessage: 'Faqat video yoki rasm yuklanadi' })
  }

  const key = createStorageKey(contentType, filename)

  return getStorageProvider().presignUpload({
    key,
    contentType
  })
})
