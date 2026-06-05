import postgres from 'postgres'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const DATABASE_URL = 'postgresql://postgres.clshatzqhmlkdyvueqvn:Bek125243112500@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'
const R2_ACCOUNT_ID = '1967d2deb6385328231b5fa026ce6301'
const R2_ACCESS_KEY_ID = '855f53c5c315ff41ba1f8390002285c8'
const R2_SECRET_ACCESS_KEY = '1dd6726b81a34986b85be64d0b4827ef59b8f77bcfd66b4c001b395a98342308'
const R2_BUCKET_NAME = 'chayroom-videos'
const R2_PUBLIC_URL = 'https://pub-3317d9b466194b4facad8aaf31622536.r2.dev'

const sql = postgres(DATABASE_URL)
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }
})

function base64ToBuffer(dataUrl) {
  const [header, data] = dataUrl.split(',')
  const mimeMatch = header.match(/data:([^;]+)/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const ext = mime.split('/')[1] || 'png'
  return { buffer: Buffer.from(data, 'base64'), mime, ext }
}

async function uploadToR2(buffer, mime, ext, index) {
  const key = `images/${Date.now()}-${index}.${ext}`
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mime
  }))
  return `${R2_PUBLIC_URL}/${key}`
}

async function migrateGuide(guide) {
  let content = guide.content
  const matches = [...content.matchAll(/data:image\/[^"']+/g)]

  console.log(`\nGuide "${guide.title}" — ${matches.length} ta rasm topildi`)

  let index = 0
  for (const match of matches) {
    const base64 = match[0]
    try {
      const { buffer, mime, ext } = base64ToBuffer(base64)
      const url = await uploadToR2(buffer, mime, ext, index++)
      content = content.replace(base64, url)
      console.log(`  ✓ rasm ${index} → ${url}`)
    } catch (e) {
      console.error(`  ✗ rasm ${index} xato:`, e.message)
    }
  }

  await sql`UPDATE guides SET content = ${content} WHERE id = ${guide.id}`
  console.log(`Guide "${guide.title}" yangilandi`)
}

const guides = await sql`SELECT id, title, content FROM guides WHERE content LIKE '%data:image%'`
console.log(`${guides.length} ta guide topildi`)

for (const guide of guides) {
  await migrateGuide(guide)
}

console.log('\nMigratsiya tugadi!')
await sql.end()
