# Self-hosted VPS deploy (Docker Compose)

Chayroom AI ni o'z serveringizga (VPS) Docker orqali to'liq self-hosted holatda
ishga tushirish bo'yicha qadam-baqadam yo'riqnoma. Stack: **Postgres + Redis +
Nuxt + Caddy** (avtomatik HTTPS). Build serverda Docker ichida bo'ladi — serverda
Node yoki pnpm o'rnatish shart emas, faqat Docker kerak.

## 0. Talablar

- Ubuntu/Debian VPS, root yoki sudo huquqi bilan.
- **Docker + Docker Compose plugin** o'rnatilgan:
  ```bash
  curl -fsSL https://get.docker.com | sh
  docker compose version   # ishlashini tekshiring
  ```
- DNS A-yozuvlari serveringiz IP'siga ishora qilsin:
  - `chayroom.uz` → SERVER_IP
  - `www.chayroom.uz` → SERVER_IP
- 80 va 443 portlari ochiq (Caddy ulardan TLS sertifikat oladi).

## 1. Kodni serverga olib kelish

Repozitoriy private bo'lgani uchun GitHub token yoki deploy key ishlating:

```bash
git clone https://github.com/hiBehruz/chayroom-ai.git
cd chayroom-ai/nuxt-app
git checkout dev      # yoki deploy qilinadigan branch
```

> Eslatma: ilova kodi `nuxt-app/` ichida — barcha quyidagi buyruqlar shu papkada bajariladi.

## 2. `.env` ni tayyorlash

```bash
cp .env.production.example .env
```

`.env` ni tahrirlab, barcha qiymatlarni to'ldiring. Maxsus diqqat:

- `POSTGRES_PASSWORD` — kuchli parol qo'ying. `DATABASE_URL` ni **qo'lda yozmang**:
  uni docker-compose avtomatik `postgres://chayroom:${POSTGRES_PASSWORD}@postgres:5432/chayroom`
  ko'rinishida yasaydi.
- `REDIS_URL` ni ham yozish shart emas — compose `redis://redis:6379` ni o'zi beradi.
- `NUXT_ADMIN_SESSION_PASSWORD` — kamida 32 belgi. Yaratish:
  ```bash
  node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))"
  ```
- `NUXT_PUBLIC_APP_URL=https://chayroom.uz`

> `.env` git'ga tushmaydi (`.gitignore` da) va Docker image ichiga ham kirmaydi
> (`.dockerignore` da) — u faqat runtime'da konteynerga uzatiladi.

## 3. Bazani ko'tarish va migratsiyalarni qo'llash

Avval Postgres + Redis ni ishga tushiramiz:

```bash
docker compose up -d postgres redis
```

Postgres "healthy" bo'lgach (bir necha soniya), migratsiyalarni qo'llaymiz —
bu Docker ichida ishlaydigan bir martalik buyruq (drizzle-kit):

```bash
docker compose --profile migrate run --rm migrate
```

Bu `pnpm db:migrate` ni `source` build bosqichida ishga tushiradi va
`server/db/migrations` dagi barcha SQL'larni bazaga qo'llaydi.

## 4. Ilova va Caddy ni ishga tushirish

```bash
docker compose up -d --build
```

Bu nuxt image'ni build qiladi (Docker ichida: `pnpm install` + `pnpm build` →
`.output`), so'ng Caddy bilan birga ishga tushiradi. Caddy `chayroom.uz` va
`www.chayroom.uz` uchun Let's Encrypt'dan TLS sertifikatini avtomatik oladi.

## 5. Tekshirish

```bash
docker compose ps                 # hamma servis "running"/"healthy" bo'lsin
docker compose logs -f nuxt       # ilova loglari
curl -I https://chayroom.uz       # 200/3xx qaytishi kerak
```

Brauzerda `https://chayroom.uz` va admin uchun `https://chayroom.uz/admin`
ni oching.

## 6. Yangilash (redeploy)

```bash
git pull
docker compose --profile migrate run --rm migrate   # yangi migratsiya bo'lsa
docker compose up -d --build nuxt
```

## 7. Backup (Postgres)

```bash
docker compose exec postgres pg_dump -U chayroom chayroom > backup_$(date +%F).sql
```

Tiklash:
```bash
cat backup_YYYY-MM-DD.sql | docker compose exec -T postgres psql -U chayroom -d chayroom
```

## 8. Muammolarni hal qilish

- **Caddy HTTPS olmayapti:** DNS A-yozuvlari to'g'ri serverga ishora qilishini va
  80/443 ochiqligini tekshiring. `docker compose logs caddy`.
- **nuxt baza ulanmayapti:** `.env` dagi `POSTGRES_PASSWORD` postgres bilan bir xilmi;
  `docker compose logs nuxt` va `docker compose logs postgres`.
- **migrate "connection refused":** postgres hali healthy bo'lmagan — bir necha soniya
  kutib qayta urinib ko'ring (`migrate` servis postgres healthy bo'lishini kutadi).
- **Build prerender'da yiqildi:** bosh sahifa (`/`) statik prerender bo'ladi va bazaga
  murojaat qilmaydi; agar boshqa route qo'shsangiz va u build paytida DB so'rasa,
  o'sha route uchun `routeRules` da prerender'ni o'chiring.

## Arxitektura eslatmasi

- Nitro preset = `node-server` (Dockerfile `node .output/server/index.mjs` ni ishga tushiradi).
- `DATABASE_URL`/`REDIS_URL` docker-compose `environment` orqali majburlab beriladi —
  shuning uchun `.env` dagi tasodifiy qiymat ularni buzmaydi.
- Admin panel path-based: `https://chayroom.uz/admin` (alohida subdomain emas).
