import { requireAdmin } from '#server/utils/admin-session'
import { getStorageProvider } from '#server/utils/storage'
import { createStorageKey } from '#server/utils/storage/key'

const DOWNLOAD_CONTENT_TYPES = new Set([
  'application/zip',
  'application/x-zip-compressed',
  'application/pdf',
  'application/octet-stream',
  'text/plain',
  'text/markdown'
])

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { filename, contentType } = await readBody<{
    filename: string
    contentType: string
  }>(event)

  if (!filename || !contentType) {
    throw createError({ statusCode: 400, statusMessage: 'filename va contentType majburiy' })
  }

  const isAllowedFile = contentType.startsWith('video/')
    || contentType.startsWith('image/')
    || DOWNLOAD_CONTENT_TYPES.has(contentType)

  if (!isAllowedFile) {
    throw createError({ statusCode: 400, statusMessage: 'Fayl turi qo\'llab-quvvatlanmaydi' })
  }

  const key = createStorageKey(contentType, filename)

  return getStorageProvider().presignUpload({
    key,
    contentType
  })
})
