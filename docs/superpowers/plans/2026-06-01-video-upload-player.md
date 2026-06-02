# Video Upload + Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin panel orqali Cloudflare R2 ga video yuklash va dars sahifasida Plyr.js bilan ko'rsatish.

**Architecture:** Browser presigned URL orqali to'g'ridan-to'g'ri R2 ga yuklaydi (server faylni ko'rmaydi). Dars sahifasida `lesson.videoUrl` mavjud bo'lsa Plyr.js player render qilinadi.

**Tech Stack:** `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `plyr`, Nuxt 4, Drizzle ORM (PostgreSQL)

---

## File Map

| Action | File |
|--------|------|
| Modify | `nuxt.config.ts` |
| Create | `server/api/upload/presign.post.ts` |
| Modify | `app/stores/courses.ts` |
| Create | `app/components/ui/VideoPlayer.vue` |
| Modify | `app/pages/admin/courses/new.vue` |
| Modify | `app/pages/courses/[slug]/lesson/[id].vue` |

---

## Task 1: Paketlarni o'rnatish

**Files:** —

- [ ] **Step 1: AWS SDK va Plyr o'rnatish**

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner plyr
pnpm add -D @types/plyr
```

- [ ] **Step 2: O'rnatilganini tekshirish**

```bash
grep -E "aws-sdk|plyr" package.json
```

Expected output:
```
"@aws-sdk/client-s3": "^3.x.x",
"@aws-sdk/s3-request-presigner": "^3.x.x",
"plyr": "^3.x.x",
```

---

## Task 2: R2 credentials — runtimeConfig

**Files:**
- Modify: `nuxt.config.ts`

- [ ] **Step 1: runtimeConfig ga R2 sozlamalarini qo'shish**

`nuxt.config.ts` dagi `runtimeConfig` ni shunday o'zgartiring:

```ts
runtimeConfig: {
  openaiApiKey: '',
  r2AccountId: '',
  r2AccessKeyId: '',
  r2SecretAccessKey: '',
  r2BucketName: '',
  r2PublicUrl: '',
  public: {
    telegramBotUsername: ''
  }
},
```

- [ ] **Step 2: `.env` ga placeholder qo'shish**

`.env` fayliga quyidagilarni qo'shing (`.gitignore` da ekanini tekshiring):

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=chayroom-videos
R2_PUBLIC_URL=https://pub-XXXX.r2.dev
```

- [ ] **Step 3: Commit**

```bash
git add nuxt.config.ts
git commit -m "feat(config): add Cloudflare R2 runtimeConfig"
```

---

## Task 3: Presigned URL server route

**Files:**
- Create: `server/api/upload/presign.post.ts`

- [ ] **Step 1: Faylni yarating**

```ts
// server/api/upload/presign.post.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default defineEventHandler(async (event) => {
  const { filename, contentType } = await readBody<{
    filename: string
    contentType: string
  }>(event)

  if (!filename || !contentType) {
    throw createError({ statusCode: 400, statusMessage: 'filename va contentType majburiy' })
  }

  if (!contentType.startsWith('video/')) {
    throw createError({ statusCode: 400, statusMessage: 'Faqat video fayl yuklanadi' })
  }

  const config = useRuntimeConfig()

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey,
    },
  })

  const key = `lessons/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const command = new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 }) // 15 min

  return {
    uploadUrl,
    publicUrl: `${config.r2PublicUrl}/${key}`,
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add server/api/upload/presign.post.ts
git commit -m "feat(api): add R2 presigned URL endpoint for video upload"
```

---

## Task 4: Lesson tipiga videoUrl qo'shish

**Files:**
- Modify: `app/stores/courses.ts`

- [ ] **Step 1: Lesson interfeysi ni yangilash**

`app/stores/courses.ts` da `Lesson` interfeysini toping va `videoUrl` qo'shing:

```ts
export interface Lesson {
  title: string
  type: 'Nazariy' | 'Amaliy'
  duration: string
  free: boolean
  videoUrl?: string   // ← qo'shildi
}
```

- [ ] **Step 2: Commit**

```bash
git add app/stores/courses.ts
git commit -m "feat(stores): add videoUrl to Lesson interface"
```

---

## Task 5: VideoPlayer komponenti

**Files:**
- Create: `app/components/ui/VideoPlayer.vue`

- [ ] **Step 1: Komponentni yarating**

```vue
<!-- app/components/ui/VideoPlayer.vue -->
<script setup lang="ts">
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

const props = defineProps<{ src: string }>()

const videoRef = ref<HTMLVideoElement | null>(null)
let player: Plyr | null = null

onMounted(() => {
  if (!videoRef.value) return
  player = new Plyr(videoRef.value, {
    controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
    settings: ['speed'],
    speed: { selected: 1, options: [0.75, 1, 1.25, 1.5, 2] },
    captions: { active: false },
  })
})

onUnmounted(() => {
  player?.destroy()
  player = null
})
</script>

<template>
  <div class="video-player-wrap rounded-2xl overflow-hidden">
    <video ref="videoRef" playsinline>
      <source :src="props.src" />
    </video>
  </div>
</template>

<style scoped>
.video-player-wrap :deep(.plyr) {
  --plyr-color-main: #3480f1;
  --plyr-border-radius: 12px;
  border-radius: 12px;
}
</style>
```

- [ ] **Step 2: Dev serverda komponent import xatosi yo'qligini tekshirish**

```bash
# Dev server logini kuzating
pnpm dev 2>&1 | grep -i "plyr\|error" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add app/components/ui/VideoPlayer.vue
git commit -m "feat(ui): add VideoPlayer component with Plyr.js"
```

---

## Task 6: Admin panelga video upload qo'shish

**Files:**
- Modify: `app/pages/admin/courses/new.vue`

- [ ] **Step 1: Lesson qatoriga upload state qo'shish**

`app/pages/admin/courses/new.vue` da `addLesson` funksiyasini toping (177-qator atrofida):

```ts
function addLesson(mi: number) {
  modulesList.value[mi].lessons.push({
    title: '',
    type: 'Nazariy',
    duration: '',
    free: false,
    videoUrl: undefined,    // ← qo'shildi
  })
}
```

- [ ] **Step 2: Upload yordamchi funksiyani qo'shish**

`<script setup>` ichiga qo'shing (boshqa funksiyalar yoniga):

```ts
// Video upload — lesson ga presigned URL orqali
const uploadingLesson = ref<string | null>(null) // "mi-li" key
const uploadError = ref<string | null>(null)

async function uploadVideo(mi: number, li: number, file: File) {
  const key = `${mi}-${li}`
  uploadingLesson.value = key
  uploadError.value = null

  try {
    const { uploadUrl, publicUrl } = await $fetch<{ uploadUrl: string; publicUrl: string }>(
      '/api/upload/presign',
      {
        method: 'POST',
        body: { filename: file.name, contentType: file.type },
      }
    )

    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    modulesList.value[mi].lessons[li].videoUrl = publicUrl
  } catch (e: any) {
    uploadError.value = e?.message ?? 'Yuklashda xato'
  } finally {
    uploadingLesson.value = null
  }
}

function onVideoFileChange(mi: number, li: number, e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadVideo(mi, li, file)
}

function removeVideo(mi: number, li: number) {
  modulesList.value[mi].lessons[li].videoUrl = undefined
}
```

- [ ] **Step 3: Lesson qatoriga video upload UI qo'shish**

Lesson qatoridagi template da (`v-for="(lesson, li) in mod.lessons"` ichida), mavjud inputlar oxiriga qo'shing — `removeLesson` tugmasidan OLDIN:

```html
<!-- Video upload -->
<div class="shrink-0 flex items-center gap-1">
  <template v-if="lesson.videoUrl">
    <span class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
      <UIcon name="i-lucide-video" class="size-3" />
      Video
    </span>
    <button
      class="grid size-5 place-items-center rounded text-red-400 hover:bg-red-50 transition-colors"
      @click="removeVideo(mi, li)"
    >
      <UIcon name="i-lucide-x" class="size-3" />
    </button>
  </template>
  <template v-else>
    <label
      class="grid size-6 place-items-center rounded-lg text-cx-line hover:text-cx-blue hover:bg-blue-50 transition-colors cursor-pointer"
      :class="{ 'animate-pulse text-cx-blue': uploadingLesson === `${mi}-${li}` }"
    >
      <UIcon
        :name="uploadingLesson === `${mi}-${li}` ? 'i-lucide-loader' : 'i-lucide-video'"
        class="size-3.5"
      />
      <input
        type="file"
        accept="video/*"
        class="hidden"
        :disabled="!!uploadingLesson"
        @change="onVideoFileChange(mi, li, $event)"
      />
    </label>
  </template>
</div>
```

- [ ] **Step 4: Upload xato xabarini qo'shish**

Modul bloki (`v-for="(mod, mi) in modulesList"`) oxiriga qo'shing:

```html
<p v-if="uploadError" class="px-4 py-2 text-[12px] text-red-500">{{ uploadError }}</p>
```

- [ ] **Step 5: Commit**

```bash
git add app/pages/admin/courses/new.vue
git commit -m "feat(admin): add video upload per lesson via R2 presigned URL"
```

---

## Task 7: Dars sahifasiga Plyr player qo'shish

**Files:**
- Modify: `app/pages/courses/[slug]/lesson/[id].vue`

- [ ] **Step 1: Lesson interfeysi ga videoUrl qo'shish**

`lesson/[id].vue` ichidagi lokal `Lesson` interfeysiga (16-qator atrofida):

```ts
interface Lesson {
  title: string
  type: string
  duration: string
  free: boolean
  content: string
  videoUrl?: string   // ← qo'shildi
}
```

- [ ] **Step 2: Mavjud dars ma'lumotlariga videoUrl qo'shish (test uchun)**

`allCourses` dagi birinchi lessonni toping va test uchun `videoUrl` qo'shing:

```ts
{
  title: 'Hermes asosida agent yaratish: tayyor assistant',
  type: 'Nazariy',
  duration: '10 min',
  free: true,
  content: '<p>...</p>',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
}
```

- [ ] **Step 3: Template da video playerni qo'shish**

`<!-- Content -->` blokidan OLDIN (233-qator atrofida) qo'shing:

```html
<!-- Video player -->
<div v-if="lesson.videoUrl" class="mb-8">
  <UiVideoPlayer :src="lesson.videoUrl" />
</div>
```

- [ ] **Step 4: Browserda tekshirish**

```
http://localhost:3000/courses/hermes-ai-agent/lesson/1
```

Plyr player video bilan ko'rinishi kerak. Play, speed (1x tugmasi), fullscreen ishlashi kerak.

- [ ] **Step 5: Test videoUrl ni o'chirish**

Testdan so'ng `videoUrl` ni `allCourses` dan olib tashlang — real data DB dan keladi.

- [ ] **Step 6: Commit**

```bash
git add app/pages/courses/[slug]/lesson/[id].vue
git commit -m "feat(lesson): add Plyr.js video player when lesson.videoUrl is set"
```

---

## Task 8: Cloudflare R2 bucket sozlash (qo'lda)

Quyidagi amallar Cloudflare dashboard da bajariladi:

- [ ] **Step 1:** `https://dash.cloudflare.com` ga kiring → R2 Object Storage
- [ ] **Step 2:** Yangi bucket yarating: `chayroom-videos`
- [ ] **Step 3:** Bucket → Settings → Public Access → **Enable**
- [ ] **Step 4:** R2 → Manage API Tokens → Create token (Object Read & Write)
- [ ] **Step 5:** `.env` ga olingan credentials ni kiriting:
  ```
  R2_ACCOUNT_ID=...
  R2_ACCESS_KEY_ID=...
  R2_SECRET_ACCESS_KEY=...
  R2_BUCKET_NAME=chayroom-videos
  R2_PUBLIC_URL=https://pub-XXXX.r2.dev
  ```
- [ ] **Step 6:** Dev serverda presign endpoint ni test qilish:
  ```bash
  curl -X POST http://localhost:3000/api/upload/presign \
    -H "Content-Type: application/json" \
    -d '{"filename":"test.mp4","contentType":"video/mp4"}'
  ```
  Expected: `{ uploadUrl: "https://...", publicUrl: "https://..." }`

---

## Task 9: Yakuniy test

- [ ] Admin panelga kiring `/admin/courses/new`
- [ ] Modul qo'shing → Dars qo'shing → Video tugmasini bosing → mp4 tanlang
- [ ] Yuklash tugagandan so'ng "Video" yashil matn ko'rinishi kerak
- [ ] Kursni saqlang
- [ ] `/courses/[slug]/lesson/1` ga o'ting — Plyr player ko'rinishi kerak
- [ ] Speed, pip, fullscreen tugmalarini tekshiring
