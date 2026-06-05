import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { requireAdmin } from '../../utils/admin-session'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const contentType = getHeader(event, 'content-type') || ''
  const filename = decodeURIComponent(getHeader(event, 'x-filename') || `image-${Date.now()}.jpg`)

  if (!contentType.startsWith('image/')) {
    throw createError({ statusCode: 400, statusMessage: 'Faqat rasm yuklanadi' })
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

  const body = await readRawBody(event, false)
  if (!body || body.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Fayl bo\'sh' })
  }

  const key = `images/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  await client.send(new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: key,
    Body: body,
    ContentType: contentType
  }))

  return { publicUrl: `${config.r2PublicUrl}/${key}` }
})
