import { requireAdmin } from '#server/utils/admin-session'
import { getStorageProvider } from '#server/utils/storage'
import { createStorageKey } from '#server/utils/storage/key'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const contentType = getHeader(event, 'content-type') || ''
  const filename = decodeURIComponent(getHeader(event, 'x-filename') || `image-${Date.now()}.jpg`)

  if (!contentType.startsWith('image/')) {
    throw createError({ statusCode: 400, statusMessage: 'Faqat rasm yuklanadi' })
  }

  const body = await readRawBody(event, false)
  if (!body || body.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Fayl bo\'sh' })
  }

  const key = createStorageKey(contentType, filename)

  return getStorageProvider().put({
    key,
    body,
    contentType
  })
})
