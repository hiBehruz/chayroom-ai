# Video Upload + Player — Design Spec

**Date:** 2026-06-01  
**Status:** Approved

## Overview

Kurs darslariga qisqa video qo'shish imkoniyati. Admin panel orqali Cloudflare R2 ga yuklash, dars sahifasida Plyr.js player bilan ko'rsatish.

---

## Architecture

**Storage:** Cloudflare R2 (S3-compatible)  
**Upload pattern:** Presigned URL — browser to'g'ridan-to'g'ri R2 ga yuklaydi, server faylni ko'rmaydi  
**Player:** Plyr.js — lightweight, custom UI, speed/pip/fullscreen support  
**DB:** `lessons.video_url` allaqachon mavjud — migration kerak emas

---

## Data Flow

```
Admin panel
  → POST /api/upload/presign  { filename, contentType }
  ← { uploadUrl, publicUrl }  (presigned PUT URL, 15 min TTL)
  → PUT {uploadUrl} (browser → R2 to'g'ridan-to'g'ri)
  → lesson.videoUrl = publicUrl  (kurs saqlanayotganda)

Dars sahifasi
  → lesson.videoUrl mavjud bo'lsa Plyr player render qiladi
  → yo'q bo'lsa faqat matn content ko'rsatiladi
```

---

## Components

### 1. `server/api/upload/presign.post.ts`
- Body: `{ filename: string, contentType: string }`
- R2 `@aws-sdk/s3-request-presigner` bilan `PutObjectCommand` presign qiladi
- Qaytaradi: `{ uploadUrl: string, publicUrl: string }`
- Auth: faqat `isOwner` role

### 2. `nuxt.config.ts` — runtimeConfig
```ts
runtimeConfig: {
  r2AccountId: '',
  r2AccessKeyId: '',
  r2SecretAccessKey: '',
  r2BucketName: '',
  r2PublicUrl: '',   // https://pub-xxx.r2.dev yoki custom domain
}
```

### 3. Admin panel — `app/pages/admin/courses/new.vue`
- Har bir lesson qatoriga video upload tugmasi qo'shiladi
- Upload tugmasi bosilganda: file input ochiladi → presign so'rovi → R2 ga PUT → `lesson.videoUrl` ga URL saqlanadi
- Upload holati: loading spinner, progress %, xato xabari
- Yuklangan bo'lsa: fayl nomi + o'chirish tugmasi

### 4. `app/stores/courses.ts` — Lesson type
```ts
type Lesson = {
  // mavjudlari...
  videoUrl?: string
}
```

### 5. `app/pages/courses/[slug]/lesson/[id].vue`
- `lesson.videoUrl` mavjud bo'lsa `<video>` teg Plyr bilan wrap qilinadi
- Plyr konfiguratsiyasi: speed (0.75, 1, 1.25, 1.5, 2), pip, fullscreen, captions off
- `onMounted` da Plyr init, `onUnmounted` da destroy

---

## Constraints

- Fayl turi: faqat `video/*`
- Fayl hajmi: max 500 MB (presigned URL serverda tekshiriladi)
- Presigned URL TTL: 15 daqiqa
- R2 bucket: `chayroom-videos` (alohida, kurs rasmlari bilan aralashmasin)

---

## Out of Scope

- Video transcode / adaptive bitrate (Cloudflare Stream emas)
- Video thumbnail auto-generation
- Video progress tracking (qaysi vaqtgacha ko'rgan)
- Guides uchun video (keyingi qadam)
