# Vercel Deployment Design

**Date:** 2026-06-05  
**Status:** Approved

## Goal

Deploy the Chayroom AI Nuxt 4 app to Vercel while keeping PostgreSQL on the existing VPS, connected via PgBouncer as a connection pooler.

## Architecture

```
Vercel (Nuxt app + serverless API routes)
        ↓ DATABASE_URL (postgresql://...@72.62.3.239:6432/db)
VPS: PgBouncer :6432 (publicly accessible, SSL)
        ↓
VPS: PostgreSQL :5432 (localhost only — unchanged)
```

## Components

### 1. Restore server files
Server API routes and DB code were deleted from the local repo but still exist on the VPS at `/app/server/`. Restore from VPS via `scp` or `rsync`.

Files to restore:
- `server/api/auth/login.post.ts`
- `server/api/auth/me.get.ts`
- `server/api/courses/**`
- `server/api/guides/**`
- `server/api/translate.post.ts`
- `server/api/tribute/webhook.post.ts`
- `server/api/upload/**`
- `server/db/index.ts`
- `server/db/schema.ts`
- `server/db/migrations/**`
- `server/utils/telegram.ts`
- `server/utils/tribute-signature.ts`

### 2. Nuxt config — Vercel preset
Add `nitro.preset: 'vercel'` to `nuxt.config.ts`. This makes Nitro output Vercel-compatible serverless functions.

```ts
nitro: {
  preset: 'vercel',
  prerender: {
    crawlLinks: false,
    routes: [],
  },
},
```

### 3. VPS — PgBouncer setup
Install and configure PgBouncer on VPS:
- Bind to `0.0.0.0:6432`
- Pool mode: `transaction` (required for serverless — connections are not persistent)
- SSL enabled
- Connects internally to `127.0.0.1:5432` (PostgreSQL stays localhost-only)
- Open firewall port `6432` only (not `5432`)

### 4. Environment variables on Vercel
Set all runtime config values in Vercel dashboard under Project Settings → Environment Variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@72.62.3.239:6432/dbname` |
| `NUXT_OPENAI_API_KEY` | OpenAI key |
| `NUXT_R2_ACCOUNT_ID` | Cloudflare R2 |
| `NUXT_R2_ACCESS_KEY_ID` | Cloudflare R2 |
| `NUXT_R2_SECRET_ACCESS_KEY` | Cloudflare R2 |
| `NUXT_R2_BUCKET_NAME` | Cloudflare R2 |
| `NUXT_R2_PUBLIC_URL` | Cloudflare R2 |
| `NUXT_TELEGRAM_BOT_TOKEN` | Telegram bot |
| `NUXT_TRIBUTE_API_KEY` | Tribute |
| `NUXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Public config |
| `NUXT_PUBLIC_APP_URL` | `https://chayroom.uz` or Vercel URL |
| `NUXT_PUBLIC_SENTRY_DSN` | Sentry |
| `NUXT_PUBLIC_TRIBUTE_TIER_1_MONTH_URL` | Tribute links |
| `NUXT_PUBLIC_TRIBUTE_TIER_3_MONTH_URL` | Tribute links |
| `NUXT_PUBLIC_TRIBUTE_TIER_6_MONTH_URL` | Tribute links |

### 5. Deploy to Vercel
- Connect GitHub repo to Vercel
- Framework: Nuxt.js (auto-detected)
- Build command: `pnpm build`
- Output directory: `.output` (auto)
- Node.js version: 20.x

## Security

- PostgreSQL port `5432` stays closed to the internet
- Only PgBouncer port `6432` is exposed
- PgBouncer uses SSL (`client_tls_sslmode = require`)
- PgBouncer auth via `userlist.txt` with hashed passwords

## Success Criteria

- `pnpm build` completes with `NITRO_PRESET=vercel` or `nitro.preset: 'vercel'`
- Vercel deployment passes build
- API routes (`/api/auth/me`, `/api/courses`) respond correctly in production
- Database queries reach VPS PostgreSQL through PgBouncer
