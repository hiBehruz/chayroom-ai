# CI, Testing, Cache, and Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reliable unit and integration testing, Redis/PostgreSQL/MinIO CI services, stable server aliases, and a provider-neutral media storage layer while preserving current R2 behavior.

**Architecture:** Vitest will run Node unit tests and Nuxt integration tests as separate projects. Nitro keeps a named `cache` storage mount backed by Redis when configured and memory otherwise. Upload endpoints call a storage factory whose first provider is S3-compatible, allowing R2 in production and MinIO in CI.

**Tech Stack:** Nuxt 4, Nitro, Vitest, `@nuxt/test-utils`, PostgreSQL, Redis, MinIO, AWS SDK v3, GitHub Actions, pnpm.

---

### Task 1: Establish Vitest and Preserve Existing Unit Coverage

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: existing `*.test.mjs` files only where Vitest compatibility requires it

- [ ] **Step 1: Add test scripts before installing/configuring Vitest**

Add these scripts to `package.json`:

```json
"test": "vitest run",
"test:unit": "vitest run --project unit",
"test:nuxt": "vitest run --project nuxt",
"test:integration": "vitest run --project integration"
```

- [ ] **Step 2: Run the unit command and verify RED**

Run: `pnpm test:unit`

Expected: FAIL because `vitest` and the project configuration do not exist.

- [ ] **Step 3: Install the test dependencies**

Run:

```bash
pnpm add -D vitest @nuxt/test-utils happy-dom
```

- [ ] **Step 4: Add the multi-project Vitest configuration**

Create `vitest.config.ts` with:

```ts
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            'app/**/*.test.mjs',
            'server/**/*.test.mjs',
            'tests/unit/**/*.test.{mjs,ts}',
            'tests/cache/**/*.test.mjs'
          ]
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: ['tests/nuxt/**/*.test.ts']
        }
      }),
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          testTimeout: 60_000,
          hookTimeout: 60_000,
          fileParallelism: false
        }
      }
    ]
  }
})
```

- [ ] **Step 5: Run unit tests and make compatibility-only adjustments**

Run: `pnpm test:unit`

Expected: existing unit tests execute under Vitest. Fix imports only if Vitest reports an incompatibility; do not change tested behavior.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts app server tests
git commit -m "test: add Vitest project configuration"
```

### Task 2: Add the Provider-Neutral Storage Layer

**Files:**
- Create: `server/utils/storage/types.ts`
- Create: `server/utils/storage/config.ts`
- Create: `server/utils/storage/key.ts`
- Create: `server/utils/storage/s3.ts`
- Create: `server/utils/storage/index.ts`
- Create: `tests/unit/storage.test.ts`
- Modify: `nuxt.config.ts`
- Modify: `server/api/upload/image.post.ts`
- Modify: `server/api/upload/presign.post.ts`
- Modify: `.env.production.example`

- [ ] **Step 1: Write failing storage contract tests**

Create `tests/unit/storage.test.ts` covering:

```ts
import { describe, expect, it } from 'vitest'
import { buildStorageConfig } from '#server/utils/storage/config'
import { createStorageKey } from '#server/utils/storage/key'

describe('storage configuration', () => {
  it('prefers generic storage settings over legacy R2 settings', () => {
    const config = buildStorageConfig({
      storageEndpoint: 'http://minio:9000',
      storageBucket: 'media',
      storagePublicUrl: 'http://minio:9000/media',
      storageAccessKeyId: 'minio',
      storageSecretAccessKey: 'secret',
      storageRegion: 'us-east-1',
      storageForcePathStyle: true,
      r2AccountId: 'legacy',
      r2BucketName: 'legacy'
    })

    expect(config.endpoint).toBe('http://minio:9000')
    expect(config.bucket).toBe('media')
    expect(config.forcePathStyle).toBe(true)
  })

  it('maps legacy R2 settings when generic settings are absent', () => {
    const config = buildStorageConfig({
      r2AccountId: 'account',
      r2BucketName: 'bucket',
      r2PublicUrl: 'https://media.example.com',
      r2AccessKeyId: 'key',
      r2SecretAccessKey: 'secret'
    })

    expect(config.endpoint).toBe('https://account.r2.cloudflarestorage.com')
    expect(config.region).toBe('auto')
  })
})

describe('storage keys', () => {
  it('normalizes filenames and selects the media folder', () => {
    expect(createStorageKey('image/png', 'my photo.png', 123))
      .toBe('images/123-my_photo.png')
    expect(createStorageKey('video/mp4', 'lesson 1.mp4', 123))
      .toBe('lessons/123-lesson_1.mp4')
  })
})
```

- [ ] **Step 2: Run RED**

Run: `pnpm test:unit -- tests/unit/storage.test.ts`

Expected: FAIL because storage modules do not exist.

- [ ] **Step 3: Implement types, config mapping, and key generation**

Define:

```ts
export interface StorageProvider {
  put(input: PutObjectInput): Promise<{ publicUrl: string }>
  presignUpload(input: PresignUploadInput): Promise<{
    uploadUrl: string
    publicUrl: string
  }>
}
```

`buildStorageConfig()` must prefer `storage*` properties and fall back to `r2*`. `createStorageKey()` must normalize the filename and map image content to `images`, video content to `lessons`.

- [ ] **Step 4: Run GREEN**

Run: `pnpm test:unit -- tests/unit/storage.test.ts`

Expected: PASS.

- [ ] **Step 5: Implement `S3StorageProvider` and factory**

`server/utils/storage/s3.ts` owns `S3Client`, `PutObjectCommand`, and `getSignedUrl`. `server/utils/storage/index.ts` reads runtime config and returns a configured provider.

- [ ] **Step 6: Refactor upload endpoints**

Both upload endpoints must:

- keep admin and content-type validation;
- build keys with `createStorageKey()`;
- call `getStorageProvider(event)`;
- preserve `{ publicUrl }` and `{ uploadUrl, publicUrl }` response shapes;
- contain no direct `S3Client` construction.

- [ ] **Step 7: Add generic runtime config and production example variables**

Add private runtime values for endpoint, region, bucket, public URL, credentials, and force-path-style. Keep `r2*` values as legacy fallback.

- [ ] **Step 8: Verify and commit**

Run:

```bash
pnpm test:unit
pnpm typecheck
```

Commit:

```bash
git add server/utils/storage server/api/upload nuxt.config.ts .env.production.example tests/unit
git commit -m "refactor(storage): add S3-compatible provider adapter"
```

### Task 3: Make Redis Configuration Explicit and Test Cache Safety

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `docker-compose.yml`
- Modify: `server/utils/cache.ts`
- Modify: `tests/cache/cache-config.test.mjs`
- Modify: `tests/cache/cache.test.mjs`

- [ ] **Step 1: Update cache tests to express the desired behavior**

Tests must require:

```ts
driver: process.env.REDIS_URL ? 'redis' : 'memory'
```

and must assert:

- public course/guide list and exchange-rate handlers are cached;
- personalized course/guide detail handlers are not cached;
- mutations call list/detail invalidation helpers;
- Docker Redis has a healthcheck;
- Nuxt depends on `redis: condition: service_healthy`.

- [ ] **Step 2: Run RED**

Run: `pnpm test:unit -- tests/cache`

Expected: FAIL on current hard-coded Redis driver, stale detail-cache expectations, and missing Redis healthcheck.

- [ ] **Step 3: Implement cache configuration and Docker health**

Use:

```ts
cache: {
  driver: process.env.REDIS_URL ? 'redis' : 'memory',
  ...(process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {})
}
```

Add Redis healthcheck:

```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 5s
  timeout: 3s
  retries: 10
```

and change Nuxt dependency to `condition: service_healthy`.

- [ ] **Step 4: Correct cache invalidation storage mount**

`server/utils/cache.ts` must call `useStorage('cache')`, matching the cached handlers and bot-login storage.

- [ ] **Step 5: Run GREEN and commit**

Run:

```bash
pnpm test:unit -- tests/cache
pnpm typecheck
```

Commit:

```bash
git add nuxt.config.ts docker-compose.yml server/utils/cache.ts tests/cache
git commit -m "fix(cache): verify Redis fallback and invalidation"
```

### Task 4: Replace Deep Server Imports and Fix Lint

**Files:**
- Modify: server TypeScript route and API files containing `../../` or `../../../` imports
- Modify: `app/plugins/bot-login.client.ts`
- Modify: `server/api/auth/telegram.post.ts`
- Modify: `server/plugins/telegram-polling.ts`
- Create: `tests/unit/server-aliases.test.ts`

- [ ] **Step 1: Write the alias guard test**

Create a test that scans `server/**/*.{ts,js,mjs}` and fails when a cross-directory import begins with `../../` or `../../../`.

- [ ] **Step 2: Run RED**

Run: `pnpm test:unit -- tests/unit/server-aliases.test.ts`

Expected: FAIL and list current deep server imports.

- [ ] **Step 3: Migrate imports**

Use:

```ts
import { db } from '#server/db'
import { courses } from '#server/db/schema'
import { invalidateCourseCache } from '#server/utils/cache'
```

Keep package imports such as `drizzle-orm` unchanged.

- [ ] **Step 4: Fix the ten known lint errors**

Apply project style:

- operators at the start of continuation lines;
- no empty catch blocks;
- commas in inline object type members;
- prefix unused Nitro plugin callback parameter with `_`.

- [ ] **Step 5: Run GREEN and commit**

Run:

```bash
pnpm test:unit -- tests/unit/server-aliases.test.ts
pnpm lint
pnpm typecheck
```

Commit:

```bash
git add app/plugins server tests/unit/server-aliases.test.ts
git commit -m "refactor(server): use Nuxt aliases and fix lint"
```

### Task 5: Add PostgreSQL, Redis, MinIO Integration Harness

**Files:**
- Create: `tests/integration/helpers/server.ts`
- Create: `tests/integration/helpers/database.ts`
- Create: `tests/integration/auth-cache.test.ts`
- Create: `tests/integration/storage.test.ts`
- Create: `docker-compose.test.yml`
- Modify: `package.json`

- [ ] **Step 1: Write integration tests against the wished-for harness**

Tests must:

- start Nuxt with test environment variables;
- assert anonymous `/api/auth/me`;
- create bot-login state and confirm Redis contains its key;
- insert deterministic course and guide fixtures and fetch public lists;
- assert a second request produces Nitro cache keys;
- upload an image through `/api/upload/image` or the storage provider contract;
- request a presigned URL, PUT bytes to MinIO, and verify object availability.

- [ ] **Step 2: Run RED**

Run:

```bash
docker compose -f docker-compose.test.yml up -d
pnpm test:integration
```

Expected: FAIL because helpers, service configuration, migrations, and test credentials are incomplete.

- [ ] **Step 3: Add the isolated test service stack**

`docker-compose.test.yml` provides:

- PostgreSQL on an isolated host port;
- Redis on an isolated host port;
- MinIO plus a one-shot bucket creation service;
- healthchecks for all long-running services;
- fixed non-production credentials.

- [ ] **Step 4: Implement server and database helpers**

The server helper launches Nuxt/Nitro with test env and waits for HTTP readiness. The database helper runs migrations, inserts fixtures, and cleans fixture rows in dependency order.

- [ ] **Step 5: Make integration tests GREEN**

Run:

```bash
pnpm db:migrate
pnpm test:integration
```

Expected: PASS with real PostgreSQL, Redis, and MinIO.

- [ ] **Step 6: Always tear down services**

Run:

```bash
docker compose -f docker-compose.test.yml down -v
```

- [ ] **Step 7: Commit**

```bash
git add tests/integration docker-compose.test.yml package.json pnpm-lock.yaml
git commit -m "test: add database cache and storage integration coverage"
```

### Task 6: Enforce the Full Quality Gate in GitHub Actions

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `package.json`
- Modify: `README.md` or `docs/deployment/self-hosted-vps.md` only if commands need documentation

- [ ] **Step 1: Add a CI structure test**

Create or extend a unit test to require:

- `push` and `pull_request` triggers;
- frozen lockfile installation;
- lint, typecheck, unit, integration, and build steps;
- PostgreSQL, Redis, and MinIO service definitions;
- test-only environment values.

- [ ] **Step 2: Run RED**

Run: `pnpm test:unit`

Expected: FAIL because current workflow lacks pull requests, tests, build, and services.

- [ ] **Step 3: Update the workflow**

Use Node 22 and pinned pnpm. Add service health checks and environment variables for:

```yaml
DATABASE_URL: postgres://chayroom:chayroom@localhost:5432/chayroom_test
REDIS_URL: redis://localhost:6379
NUXT_STORAGE_ENDPOINT: http://localhost:9000
NUXT_STORAGE_BUCKET: chayroom-test
NUXT_STORAGE_PUBLIC_URL: http://localhost:9000/chayroom-test
NUXT_STORAGE_ACCESS_KEY_ID: minioadmin
NUXT_STORAGE_SECRET_ACCESS_KEY: minioadmin
NUXT_STORAGE_REGION: us-east-1
NUXT_STORAGE_FORCE_PATH_STYLE: "true"
```

Workflow order:

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm lint
- run: pnpm typecheck
- run: pnpm test:unit
- run: pnpm db:migrate
- run: pnpm test:integration
- run: pnpm build
```

- [ ] **Step 4: Run all local quality gates**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:nuxt
pnpm test:integration
pnpm build
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml package.json tests
git commit -m "ci: run lint typecheck tests and build"
```

### Task 7: Final Review and Delivery

**Files:**
- Review all files changed by Tasks 1-6

- [ ] **Step 1: Verify the spec acceptance criteria**

Confirm:

- no direct `S3Client` construction remains in upload endpoints;
- legacy R2 settings still map into the provider;
- personalized detail endpoints are not shared-cached;
- no cross-directory deep server imports remain;
- CI runs all quality gates on push and pull request.

- [ ] **Step 2: Run the complete verification from a clean service state**

Run:

```bash
docker compose -f docker-compose.test.yml down -v
docker compose -f docker-compose.test.yml up -d --wait
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:nuxt
pnpm db:migrate
pnpm test:integration
pnpm build
docker compose -f docker-compose.test.yml down -v
git diff --check
git status --short
```

- [ ] **Step 3: Review the final diff**

Ensure the unrelated `app/assets/images/aichoyxona_img.png` is absent from commits and no production secret appears in tracked files.
