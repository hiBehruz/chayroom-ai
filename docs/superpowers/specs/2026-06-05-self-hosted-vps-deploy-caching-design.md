# Self-Hosted VPS Redeploy + DB Cutover + Caching Design

**Date:** 2026-06-05
**Status:** Draft — pending user review
**Supersedes:** `2026-06-05-vercel-deployment-design.md`

## Context — actual server state (inspected, not assumed)

The target server `72.62.3.239` (Ubuntu 24.04, 7.8 GB RAM, 2 GB swap, Docker 29 + Compose v5) is **already running the full stack** via Docker Compose in `/app` (project `app`):

- `app-caddy-1` — serving :80/:443 (up ~2 days)
- `app-nuxt-1` — the Nuxt app (up ~16h)
- `app-postgres-1` — postgres:16-alpine on 127.0.0.1:5432 (up ~16h)
- `app-redis-1` — redis:7-alpine (up ~3 days)

Key findings that reshape the task:

1. **Live data is on Supabase, not the VPS.** Both the local and the server `.env` set `DATABASE_URL` to `aws-1-eu-central-1.pooler.supabase.com`. The running app reads/writes **Supabase**. **Pre-launch: there are no end users yet** — only author-created content (courses/guides). So the DB cutover is low-risk and downtime is not a concern; we still preserve the Supabase content and keep Supabase as backup.
2. **The VPS postgres container is a stale orphan.** It was restored from `/app/backup.sql` (a full Supabase dump from ~June 2) and contains **0 courses, 1 guide, 2 users**, newest row June 2. The app does not use it. Migrating *from* it would lose all data since June 2.
3. **Redis is running but completely unused** — no `REDIS_URL`, no caching code. This is the real gap.
4. **Deployed code is an older branch** (`redesign/top-co-style` @ `e15bc6f`), not the current `dev`. It was deployed manually (local `nuxt build` + rsync of `.output`; Dockerfile only copies `.output`). The server working tree is dirty with manual edits.

## Goal

Bring the live deployment up to date and complete it:
1. **Redeploy** the current `dev` branch to the server, switching to a clean git-driven, build-on-server flow.
2. **Cut the database over** from Supabase to the VPS Postgres container (fresh import of live Supabase data), keeping Supabase as rollback.
3. **Add three caching layers** (Redis-backed API cache, SWR public pages, Caddy static assets).

## Decisions (from brainstorming, with corrected facts)

| Decision | Choice |
|---|---|
| Deploy target | Existing VPS `72.62.3.239`, Docker Compose (keep project `app`, volumes, TLS) |
| Deploy branch | `dev` (replaces `redesign/top-co-style`) |
| Database | Migrate Supabase (live) → VPS Postgres container; switch `DATABASE_URL`; keep Supabase as backup |
| Caching | All three: API (Redis) + pages (SWR) + static (Caddy) |
| Build/deploy | Build on server (multi-stage Dockerfile + `deploy.sh`); 7.8 GB RAM is sufficient |

### Assumption confirmed at review
- **Supabase is the source of truth for live data.** The VPS postgres container's contents are stale and will be **replaced**, not used as a source.

## Architecture (target)

```
chayroom.uz, www.chayroom.uz   (DNS A → 72.62.3.239, already configured)
        │
   Caddy  :80 / :443           — auto-HTTPS, zstd/gzip, immutable cache for /_nuxt/*
        └─→ Nuxt / Nitro :3000  — node-server preset, multi-stage Docker build
               ├─→ Postgres      — container, data imported from live Supabase
               └─→ Redis         — container, backs Nitro cache + SWR
```

Single `docker-compose.yml`, project `app`, unchanged volumes (`app_postgres_data` will be reset; `caddy_data` kept to avoid TLS re-issue).

## Components

### 1. Clean up the server deploy (git-driven)
- In `/app`: fetch and switch to `dev` cleanly — `git fetch origin`, `git checkout dev`, `git reset --hard origin/dev`. `.env` is git-ignored and preserved.
- Remove manual cruft no longer needed (`._.output`, `Caddyfile.old`, locally-built `.output`, `backup.sql` once cutover verified). Do not touch `.env`.
- Keep the same compose **project name** (`app`) and the `caddy_data` volume so Let's Encrypt certs are not re-issued.

### 2. Nitro preset + multi-stage Dockerfile (build on server)
- `nuxt.config.ts` (in repo, `dev`): change `nitro.preset` from `'vercel'` → **`'node-server'`** so the multi-stage build produces `.output/server/index.mjs`.
- Replace the copy-only `Dockerfile` with a **multi-stage** build (pnpm install + `nuxt build` → slim runtime). `NODE_OPTIONS=--max-old-space-size=2048`; keep `nitro.prerender.crawlLinks: false` (already set) to avoid the prior OOM.
- Remove `.vercel/` from the repo.

### 3. docker-compose.yml updates
- **postgres**: add `healthcheck` (`pg_isready`); `POSTGRES_PASSWORD` from `.env` (new known value — volume reset, see §5); keep `postgres_data` volume (reset once).
- **redis**: `--appendonly yes --maxmemory-policy allkeys-lru`.
- **nuxt**: `build: { context: ., target: runtime }`; `env_file: .env`; `depends_on` postgres + redis `condition: service_healthy`.
- **migrator** (new, `profiles: ["tools"]`): from the `build` stage, runs `pnpm db:migrate`; invoked by `deploy.sh` for future schema changes.
- **caddy**: unchanged service; Caddyfile updated (§4c).

### 4. Caching — three layers

**(a) API responses — Redis-backed Nitro cache**
- Configure `nitro.storage.cache` with the unstorage **redis** driver from `REDIS_URL`. (Exact driver key/options confirmed against current Nitro docs via Context7 during implementation.)
- Wrap public GET handlers with `defineCachedEventHandler` (+ `maxAge`, `getKey`):
  - `courses/index.get.ts` (~300s), `courses/[slug].get.ts` (~300s)
  - `guides/index.get.ts` (~300s), `guides/[slug].get.ts` (~300s)
  - `exchange-rate.get.ts` (~3600s)
  - **Not cached:** `auth/me.get.ts` (per-user).
- **Invalidation** after admin mutations so edits show immediately, via a small `server/utils/cache.ts` helper:
  - courses: `index.post.ts`, `[slug].patch.ts`
  - guides: `index.post.ts`, `[slug].patch.ts`, `[slug].delete.ts`

**(b) Public pages — SWR via `routeRules`**
- `swr` only on pages with no per-user SSR data:
  - `/catalog`, `/community`, `/about-me`, `/rules` → `swr: 3600`
  - `/guides`, `/guides/**`, `/courses` (list) → `swr: 600`
  - `/` stays `prerender: true`
- Stay SSR (no SWR): `/dashboard`, `/profile`, `/admin/**`, `/login`, `/courses/*/lesson/*`, `/mini/**`.
- ⚠️ `/courses/[slug]` detail: enable SWR **only after verifying** it renders no enrollment/purchase state during SSR (a shared cached page must not leak one user's state to another).

**(c) Static assets — Caddy**
```caddyfile
chayroom.uz, www.chayroom.uz {
	encode zstd gzip
	@immutable path /_nuxt/*
	header @immutable Cache-Control "public, max-age=31536000, immutable"
	reverse_proxy nuxt:3000
}
```

### 5. Database cutover: Supabase → VPS Postgres (one-time, reversible)
Order matters; Supabase stays untouched as rollback.
1. **Set a known `POSTGRES_PASSWORD`** in the server `.env`.
2. **Reset the stale postgres volume:** `docker compose stop postgres`, remove `app_postgres_data`, `docker compose up -d postgres` → fresh init with the known password and clean `chayroom` DB. (Safe: live data is on Supabase; the volume only holds the June-2 orphan.)
3. **Dump live Supabase** — `public` schema only, `--no-owner --no-privileges` (we don't want Supabase `auth`/`storage` system schemas; the app uses Telegram auth + R2). May require Supabase's **direct** (non-pooler) connection string for `pg_dump` — obtain from the Supabase dashboard if the pooler refuses.
4. **Restore** the dump into the VPS postgres `chayroom` DB. Ensure Drizzle's migration journal table is included so future `db:migrate` is consistent.
5. **Verify parity** — compare row counts (courses, guides, users, subscriptions, categories, lessons, modules) between Supabase and the VPS DB.
6. **Switch `DATABASE_URL`** in the server `.env` to `postgres://chayroom:${POSTGRES_PASSWORD}@postgres:5432/chayroom`; restart `nuxt`; smoke-test.
7. **Keep Supabase intact**; rollback = point `DATABASE_URL` back.

### 6. Secrets / environment (server `.env`)
- Add `.env.production.example` to the repo (documented template, no secrets).
- Server `.env` changes:
  - `DATABASE_URL` → local postgres (after §5 verification)
  - `REDIS_URL=redis://redis:6379`
  - `POSTGRES_PASSWORD=<strong>`
  - `NODE_ENV=production`
  - `NUXT_PUBLIC_APP_URL=https://chayroom.uz` (already set)
- Note: the `dev` branch `.env`/runtimeConfig includes newer keys (Sentry server, Tribute tier URLs, Telegram web-app script) absent from the older deployed config — deploying `dev` brings these; confirm the server `.env` has the matching values.
- ⚠️ External callbacks already on `chayroom.uz` (Tribute webhook, Telegram) — no change expected, verify after deploy.

### 7. Deploy flow (`deploy.sh`, run on server in `/app`)
```sh
git fetch origin && git reset --hard origin/dev
docker compose --profile tools run --rm migrator   # apply pending migrations
docker compose up -d --build
docker image prune -f
```

## Risks & Rollback

| Risk | Mitigation |
|---|---|
| DB cutover data loss | Supabase untouched; `DATABASE_URL` revert is instant rollback; verify parity before switch |
| Dumping Supabase via pooler fails | Use Supabase direct connection string for `pg_dump` |
| Build OOM | 7.8 GB RAM + swap + `NODE_OPTIONS`; prerender crawl already disabled |
| SWR leaks per-user data | Conservative scoping; verify each SWR page renders no SSR user data |
| TLS re-issue / downtime | Keep compose project `app` + `caddy_data` volume; deploy is rebuild-in-place |
| `dev` config/env drift vs old deploy | Reconcile server `.env` keys against `dev` runtimeConfig before `up` |

## Out of Scope (keep it lean)
- GitHub Actions CD / image registry (build-on-server chosen).
- Monitoring beyond existing Sentry.
- Migrating to a fresh server directory / new compose project (reuse `app`).

## Success Criteria
- Server runs the current `dev` build; `https://chayroom.uz` serves it with a valid certificate.
- App reads/writes the **VPS Postgres**; row counts match Supabase pre-cutover; Supabase retained as backup.
- Cached GET endpoints serve from Redis on repeat (HIT observable); admin edits invalidate and reflect immediately.
- SWR pages serve cached HTML and revalidate; no per-user data leaks across users.
- `/_nuxt/*` carry `Cache-Control: public, max-age=31536000, immutable`; responses compressed (zstd/gzip).
- `deploy.sh` performs pull → migrate → rebuild with no manual steps.
