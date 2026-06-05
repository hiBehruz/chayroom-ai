# Self-Hosted VPS Deployment + Caching Design

**Date:** 2026-06-05
**Status:** Draft — pending user review
**Supersedes:** `2026-06-05-vercel-deployment-design.md` (Vercel + PgBouncer plan abandoned in favor of full self-host)

## Goal

Deploy the full Chayroom AI Nuxt 4 app (front-end + Nitro backend) to a single self-hosted Ubuntu VPS using Docker Compose, move the database from Supabase onto the VPS, and add three layers of caching (API responses via Redis, public pages via SWR, static assets via Caddy).

## Key Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Deploy target | Own VPS via Docker Compose |
| Server state | New / empty Ubuntu — full bootstrap needed |
| Database | Move from Supabase → Postgres container on the VPS |
| Caching | All three layers: API (Redis) + pages (SWR) + static (Caddy) |
| Build/deploy | Build on server (multi-stage Dockerfile + `deploy.sh`), no registry/CD |

### Assumptions to confirm at review
- **Live data source of truth = Supabase.** Current `.env` `DATABASE_URL` points to `aws-1-eu-central-1.pooler.supabase.com`. Data is migrated **from Supabase**.
- The target VPS is a **fresh** box. The old Vercel spec referenced a VPS at `72.62.3.239` with its own Postgres — that box is treated as **stale/abandoned**, not the data source. If `72.62.3.239` is actually the target server or holds newer data, the migration source must change.
- We control DNS for `chayroom.uz` and can point A records to the new server IP.

## Architecture

```
chayroom.uz, www.chayroom.uz   (DNS A → VPS IP)
        │
   Caddy  :80 / :443           — auto-HTTPS (Let's Encrypt), zstd/gzip,
        │                         immutable cache headers for /_nuxt/*
        └─→ Nuxt / Nitro :3000  — node-server preset, Docker container
               ├─→ Postgres      — container, data restored from Supabase
               └─→ Redis         — container, backs Nitro cache + SWR
```

All services run via one `docker-compose.yml` on the VPS. Only Caddy exposes ports to the internet (80/443). Postgres and Redis are reachable only on the internal Docker network.

## Components

### 1. Server bootstrap (new Ubuntu)
One-time host preparation, documented in `docs/deploy.md` and/or a `scripts/bootstrap-server.sh`:
- `apt update && apt upgrade -y`
- Install Docker Engine + Compose plugin (official `get.docker.com` script)
- `ufw`: allow `22` (OpenSSH), `80`, `443`; deny everything else; enable
- Create a **2–4 GB swapfile** (Nuxt build is memory-hungry; prevents OOM during `docker build`)
- Create `/opt/chayroom`, clone the repo there, create the production `.env`

### 2. Nitro preset + multi-stage Dockerfile
- `nuxt.config.ts`: change `nitro.preset` from `'vercel'` → **`'node-server'`**. Output becomes `.output/server/index.mjs`, matching the container `CMD`.
- Remove the `.vercel/` directory (no longer used).
- Replace the current copy-only `Dockerfile` with a **multi-stage** build:

```dockerfile
# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
ENV NODE_OPTIONS=--max-old-space-size=2048
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### 3. docker-compose.yml updates
- **postgres**: now actually used. Add a `healthcheck` (`pg_isready`); `POSTGRES_PASSWORD` from env; named volume for data; bound to internal network only.
- **redis**: enable `--appendonly yes` and `--maxmemory-policy allkeys-lru`; named volume.
- **nuxt**: `build: { context: ., target: runtime }`; `env_file: .env`; `depends_on` postgres + redis with `condition: service_healthy`.
- **migrator** (new, `profiles: ["tools"]`): built from the `build` stage (has `drizzle-kit`), runs `pnpm db:migrate`. Used by `deploy.sh` to apply pending schema migrations. Not started in normal `up`.
- **caddy**: unchanged service; Caddyfile updated (component 4c).

### 4. Caching — three layers

**(a) API responses — Redis-backed Nitro cache**
- Configure `nitro.storage.cache` with the unstorage **redis** driver pointed at `REDIS_URL`. (Exact driver key/options verified against current Nitro docs via Context7 during implementation.)
- Wrap public GET handlers with `defineCachedEventHandler` and a sensible `maxAge` + `getKey`:
  - `server/api/courses/index.get.ts` — list, `maxAge` ~300s, keyed by query
  - `server/api/courses/[slug].get.ts` — detail, ~300s, keyed by slug
  - `server/api/guides/index.get.ts` — list, ~300s
  - `server/api/guides/[slug].get.ts` — detail, ~300s
  - `server/api/exchange-rate.get.ts` — ~3600s (external rate)
  - **Not cached:** `server/api/auth/me.get.ts` (per-user).
- **Invalidation:** after admin mutations, clear the relevant cached entries so edits show immediately:
  - `courses/index.post.ts`, `courses/[slug].patch.ts` → clear courses cache keys
  - `guides/index.post.ts`, `guides/[slug].patch.ts`, `guides/[slug].delete.ts` → clear guides cache keys
  - A small `server/utils/cache.ts` helper centralizes key clearing (key namespace confirmed against Nitro docs).

**(b) Public pages — SWR via `routeRules`**
- Apply `swr` only to pages that render **no per-user data during SSR**:
  - `/catalog`, `/community`, `/about-me`, `/rules` → `swr: 3600`
  - `/guides`, `/guides/**` (list + detail) → `swr: 600`
  - `/courses` (list) → `swr: 600`
  - `/` stays `prerender: true` (current behavior)
- Remain SSR (no SWR): `/dashboard`, `/profile`, `/admin/**`, `/login`, `/courses/*/lesson/*`, `/mini/**`.
- ⚠️ `/courses/[slug]` detail: **verify before enabling SWR.** If it renders enrollment/purchase state during SSR, leave it SSR (a shared cached page must not leak one user's state to another). Enable SWR only if personalization is fully client-side.

**(c) Static assets — Caddy**
```caddyfile
chayroom.uz, www.chayroom.uz {
	encode zstd gzip
	@immutable path /_nuxt/*
	header @immutable Cache-Control "public, max-age=31536000, immutable"
	reverse_proxy nuxt:3000
}
```
Hashed `/_nuxt/*` assets get a 1-year immutable cache; everything else is proxied normally (HTML cache behavior governed by Nitro/SWR).

### 5. Database migration: Supabase → VPS Postgres (one-time)
- `scripts/migrate-db.sh`: run a dockerized `pg_dump` against Supabase (`--no-owner --no-privileges`) producing a single dump, then `psql`-restore it into the VPS `postgres` container.
- ⚠️ `pg_dump` may require Supabase's **direct** connection string (not the transaction pooler currently in `.env`). Obtain the direct URL/password from the Supabase dashboard for the dump step.
- Verify the Drizzle journal table (`__drizzle_migrations`) is included in the dump so future `db:migrate` runs are consistent.
- **Keep Supabase intact** until the VPS deployment is fully verified — rollback = switch `DATABASE_URL` back to Supabase. Do not delete Supabase data during this change.

### 6. Secrets / environment
- Add `.env.production.example` to the repo as a documented template (no secrets).
- The real `.env` is created on the server only (already git-ignored).
- Changes vs. the current dev `.env`:
  - `DATABASE_URL=postgres://chayroom:${POSTGRES_PASSWORD}@postgres:5432/chayroom`
  - `REDIS_URL=redis://redis:6379`
  - `POSTGRES_PASSWORD=<strong>`
  - `NUXT_PUBLIC_APP_URL=https://chayroom.uz`
  - `NODE_ENV=production`
  - Keep existing R2, OpenAI, Telegram, Tribute, Sentry values.
- ⚠️ External callbacks must point at the new domain:
  - **Tribute** webhook → `https://chayroom.uz/api/tribute/webhook`
  - **Telegram** bot domain / Mini App URL → `https://chayroom.uz`

### 7. Deploy flow (`deploy.sh`)
```sh
git pull
docker compose --profile tools run --rm migrator   # apply pending migrations
docker compose up -d --build
docker image prune -f
```

### 8. DNS + TLS
- Point `chayroom.uz` and `www.chayroom.uz` A records to the VPS IP.
- Caddy provisions Let's Encrypt certificates automatically once DNS resolves and 80/443 are reachable. Ensure DNS has propagated before the first `docker compose up`.

## Risks & Rollback

| Risk | Mitigation |
|---|---|
| Nuxt build OOM on small VPS | Swap file + `NODE_OPTIONS=--max-old-space-size` |
| SWR leaks per-user data | Conservative page scoping; verify each SWR page renders no SSR user data |
| DB migration failure / data loss | Supabase kept as live backup; `DATABASE_URL` revert is the rollback |
| TLS not issued | Confirm DNS propagation + open 80/443 before `up` |
| Wrong migration source (old VPS vs Supabase) | Confirmed at review: Supabase is source of truth |

## Out of Scope (keep it lean)
- GitHub Actions CD / image registry (build-on-server chosen).
- Additional monitoring/observability beyond existing Sentry.
- Removing the local `postgres` container (it is now the production DB).

## Success Criteria
- `docker compose up -d --build` brings up caddy + nuxt + postgres + redis; all healthy.
- `https://chayroom.uz` serves the app with a valid Let's Encrypt certificate.
- App reads/writes the VPS Postgres (data migrated from Supabase, parity verified).
- Repeated requests to cached GET endpoints are served from Redis (cache HIT observable); admin edits invalidate and reflect immediately.
- SWR pages serve cached HTML and revalidate; no per-user data leaks across users.
- `/_nuxt/*` responses carry `Cache-Control: public, max-age=31536000, immutable`; responses are compressed (zstd/gzip).
- `deploy.sh` performs a full update (pull → migrate → rebuild) with no manual steps.
