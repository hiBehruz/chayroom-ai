import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireAdmin } from '../../utils/admin-session'

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

  const config = useRuntimeConfig()

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey
    }
  })

  const folder = contentType.startsWith('image/') ? 'images' : 'lessons'
  const key = `${folder}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const command = new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: key,
    ContentType: contentType
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 })

  return {
    uploadUrl,
    publicUrl: `${config.r2PublicUrl}/${key}`
  }
})
