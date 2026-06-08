# CI, Testing, Cache, and Storage Design

## Goal

Make every push prove the application is lint-clean, type-safe, tested, and buildable. Keep Redis-backed production caching, replace fragile deep relative server imports with Nuxt aliases, and isolate media storage behind a provider contract so Cloudflare R2 can be replaced later without changing API consumers.

## Scope

This change covers:

- current lint failures;
- server import aliases;
- unit and Nuxt integration tests;
- PostgreSQL, Redis, and S3-compatible storage services in CI;
- Redis health and cache behavior;
- storage provider abstraction;
- GitHub Actions checks for pushes and pull requests.

It does not select or migrate production media to a new provider. Existing R2 behavior remains available through the S3-compatible adapter.

## Server Aliases

Use Nuxt 4 built-in aliases instead of defining a parallel project convention:

- `#server/*` for files under `server/`;
- `~/*` for files under `app/`;
- `~~/*` only when a root-level file is genuinely required.

Deep server imports such as `../../utils/cache` and `../../../db` will be migrated to `#server/utils/cache` and `#server/db`. Relative imports within the same small module may remain when they are clearer.

Type checking and production build must verify alias resolution.

## Redis and Cache

Production continues to use Nitro storage mounted as `cache`.

- When `REDIS_URL` is present, the `cache` mount uses Redis.
- When `REDIS_URL` is absent, local builds and tests use memory storage.
- Docker Compose keeps Redis persistence and LRU eviction.
- Redis receives a healthcheck, and Nuxt waits for a healthy service.

Public list endpoints and the exchange-rate endpoint may use shared Redis caching. Personalized course and guide detail endpoints must not use a shared response cache because their payload depends on authentication and subscription state.

Mutation endpoints must invalidate the related list and detail cache keys.

## Storage Provider

Upload endpoints depend on a neutral interface rather than importing AWS SDK clients directly.

```ts
interface StorageProvider {
  put(input: PutObjectInput): Promise<{ publicUrl: string }>
  presignUpload(input: PresignUploadInput): Promise<{
    uploadUrl: string
    publicUrl: string
  }>
}
```

The first implementation is `S3StorageProvider`. It supports Cloudflare R2, MinIO, and other S3-compatible services through configuration:

- provider name;
- endpoint;
- region;
- bucket;
- public URL;
- access key;
- secret key;
- path-style option.

Current `NUXT_R2_*` variables remain temporary fallbacks so deployment behavior does not change. New generic `NUXT_STORAGE_*` variables take precedence. API response shapes remain unchanged.

CI uses MinIO to test uploads and presigned PUT requests without contacting Cloudflare.

## Test Architecture

Vitest becomes the test runner and uses multiple projects:

1. `unit`
   - Node environment.
   - Existing authentication, Telegram, cache-key, signature, and utility tests.
   - Storage key generation, configuration mapping, and provider contract tests.

2. `nuxt`
   - Nuxt Test Utils environment.
   - Application and composable behavior that requires Nuxt runtime context.

3. `integration`
   - A built or started Nuxt server with real PostgreSQL, Redis, and MinIO services.
   - Database migrations run before tests.
   - Each suite uses deterministic fixtures and cleans its own records and cache keys.

Critical integration scenarios:

- `/api/auth/me` returns an anonymous session safely;
- bot-login start/status persists state through Redis;
- public course and guide list APIs read PostgreSQL data;
- repeated public requests produce Redis cache entries;
- mutations invalidate relevant cache entries;
- storage direct upload stores an object in MinIO;
- storage presign endpoint produces a working upload URL.

Telegram, OpenAI, Tribute, Sentry, and real production storage are not contacted in CI.

## CI Pipeline

GitHub Actions runs on pushes and pull requests.

Services:

- PostgreSQL;
- Redis;
- MinIO.

Steps:

1. checkout;
2. install the pinned pnpm and Node versions;
3. `pnpm install --frozen-lockfile`;
4. `pnpm lint`;
5. `pnpm typecheck`;
6. `pnpm test:unit`;
7. database migrations;
8. `pnpm test:integration`;
9. `pnpm build`.

The workflow uses only test credentials. No local `.env` file or production secret is read.

## Error Handling and Security

- Storage configuration errors fail with a clear server-side configuration error.
- Upload content-type validation remains in the API layer.
- Filenames are normalized before provider calls.
- Presigned URLs remain short-lived.
- CI logs must not print credentials.
- Existing ignored `.env` remains outside version control.

## Acceptance Criteria

- `pnpm lint`, `pnpm typecheck`, all tests, and `pnpm build` pass locally.
- CI runs on push and pull request and includes tests.
- No deep `../../` or `../../../` imports remain for cross-directory server modules.
- Redis has Docker healthchecks and a memory fallback outside configured environments.
- Personalized detail responses remain outside shared cache.
- Upload API endpoints contain no direct `S3Client` construction.
- Current R2 deployment stays compatible.
- MinIO integration proves the storage contract without Cloudflare access.
