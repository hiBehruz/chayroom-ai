# Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy Chayroom AI Nuxt 4 app to Vercel with existing Supabase database (no PgBouncer needed — DATABASE_URL already points to Supabase pooler).

**Architecture:** Nuxt app + serverless API routes on Vercel, Supabase Postgres as database (already in use on VPS), all env vars copied from VPS `.env`. Server files restored from git history (commit `751592a`).

**Tech Stack:** Nuxt 4, Nitro (Vercel preset), Drizzle ORM, Supabase Postgres, pnpm

---

### Task 1: Restore server files from git history

**Files:**
- Create: `server/` (entire directory — 29 files from commit `751592a`)

- [ ] **Step 1: Restore all server files from previous commit**

```bash
git checkout 751592a -- server/
```

- [ ] **Step 2: Verify files restored**

```bash
find server/ -type f | sort
```

Expected output — 29 files including:
```
server/api/auth/login.post.ts
server/api/auth/me.get.ts
server/api/courses/[slug].get.ts
server/api/courses/[slug].patch.ts
server/api/courses/index.get.ts
server/api/courses/index.post.ts
server/api/guides/[slug].delete.ts
server/api/guides/[slug].get.ts
server/api/guides/[slug].patch.ts
server/api/guides/index.get.ts
server/api/guides/index.post.ts
server/api/translate.post.ts
server/api/tribute/webhook.post.ts
server/api/upload/image.post.ts
server/api/upload/presign.post.ts
server/db/index.ts
server/db/schema.ts
server/utils/telegram.ts
server/utils/tribute-signature.ts
```

- [ ] **Step 3: Commit restored server files**

```bash
git add server/
git commit -m "feat(server): restore API routes and DB layer"
```

---

### Task 2: Add Vercel preset to nuxt.config.ts

**Files:**
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Update nitro config**

In `nuxt.config.ts`, replace:
```ts
nitro: {
  prerender: {
    crawlLinks: false,
    routes: [],
  },
},
```

With:
```ts
nitro: {
  preset: 'vercel',
  prerender: {
    crawlLinks: false,
    routes: [],
  },
},
```

- [ ] **Step 2: Verify build works locally**

```bash
pnpm build
```

Expected: build completes without errors, `.output/` directory created.

- [ ] **Step 3: Commit**

```bash
git add nuxt.config.ts
git commit -m "feat(deploy): add Vercel nitro preset"
```

---

### Task 3: Push branch and connect to Vercel

**Files:** none (Vercel dashboard config)

- [ ] **Step 1: Push dev branch to GitHub**

```bash
git push origin dev
```

- [ ] **Step 2: Open Vercel and import project**

Go to [vercel.com/new](https://vercel.com/new), click **Import Git Repository**, select the `Chayroom-AI/nuxt-app` repo.

- [ ] **Step 3: Configure project settings**

In Vercel import wizard:
- **Framework Preset:** Nuxt.js (auto-detected)
- **Root Directory:** `.` (leave default)
- **Build Command:** `pnpm build` (or leave as auto)
- **Output Directory:** `.output` (or leave as auto)
- **Node.js Version:** 20.x (set in Project Settings → General)
- **Package Manager:** pnpm (auto-detected from `pnpm-lock.yaml`)

- [ ] **Step 4: Set environment variables**

In Vercel import wizard → **Environment Variables**, add all of these (copy values from VPS `/app/.env`):

| Name | Value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres.clshatzqhmlkdyvueqvn:<password>@aws-1-eu-central-1.pooler.supabase.com:5432/postgres` |
| `NUXT_OPENAI_API_KEY` | (from VPS .env) |
| `NUXT_R2_ACCOUNT_ID` | `1967d2deb6385328231b5fa026ce6301` |
| `NUXT_R2_ACCESS_KEY_ID` | (from VPS .env) |
| `NUXT_R2_SECRET_ACCESS_KEY` | (from VPS .env) |
| `NUXT_R2_BUCKET_NAME` | `chayroom-videos` |
| `NUXT_R2_PUBLIC_URL` | `https://pub-3317d9b466194b4facad8aaf31622536.r2.dev` |
| `NUXT_TELEGRAM_BOT_TOKEN` | (from VPS .env) |
| `NUXT_TRIBUTE_API_KEY` | (from VPS .env) |
| `NUXT_PUBLIC_TELEGRAM_BOT_USERNAME` | `chayroomai_bot` |
| `NUXT_PUBLIC_APP_URL` | `https://chayroom.uz` |
| `NUXT_PUBLIC_SUPPORT_USERNAME` | `hellobehruz` |
| `NUXT_PUBLIC_SENTRY_DSN` | (from VPS .env) |
| `NUXT_PUBLIC_TRIBUTE_TIER_1MONTH_URL` | (from VPS .env) |
| `NUXT_PUBLIC_TRIBUTE_TIER_3MONTH_URL` | (from VPS .env) |
| `NUXT_PUBLIC_TRIBUTE_TIER_6MONTH_URL` | (from VPS .env) |

- [ ] **Step 5: Deploy**

Click **Deploy**. Wait for build to complete (~2-3 min).

Expected: green checkmark, Vercel preview URL available (e.g. `nuxt-app-xxx.vercel.app`).

---

### Task 4: Point domain to Vercel

**Files:** none (DNS + Vercel dashboard)

- [ ] **Step 1: Add custom domain in Vercel**

Go to Vercel Project → **Settings → Domains**, add `chayroom.uz`.

- [ ] **Step 2: Update DNS records**

In your DNS provider, set:
```
Type: A
Name: @
Value: 76.76.21.21   (Vercel's IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

- [ ] **Step 3: Verify domain is active**

In Vercel Domains page — wait for green checkmark next to `chayroom.uz` (SSL auto-provisioned, takes 1-5 min).

- [ ] **Step 4: Test production URL**

Open `https://chayroom.uz` in browser. Verify:
- App loads
- Login flow works (Telegram auth)
- API call works: open DevTools → Network, check `/api/auth/me` returns 200 or 401

---

### Task 5: Set production branch to master

**Files:** none (Vercel dashboard + git)

- [ ] **Step 1: Merge dev → master**

```bash
git checkout master
git merge dev
git push origin master
```

- [ ] **Step 2: Set production branch in Vercel**

Go to Vercel Project → **Settings → Git → Production Branch**, set to `master`.

- [ ] **Step 3: Trigger production deployment**

```bash
git push origin master
```

Vercel auto-deploys on push to `master`. Verify deployment completes in Vercel dashboard.
