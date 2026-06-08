import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const workflowUrl = new URL('../../.github/workflows/ci.yml', import.meta.url)

describe('CI workflow', () => {
  it('runs the full quality gate for pushes and pull requests', async () => {
    const workflow = await readFile(workflowUrl, 'utf8')

    expect(workflow).toMatch(/on:\s*\n(?:\s+.*\n)*?\s+push:/)
    expect(workflow).toMatch(/pull_request:/)
    expect(workflow).toMatch(/pnpm install --frozen-lockfile/)

    for (const command of [
      'pnpm lint',
      'pnpm typecheck',
      'pnpm test:unit',
      'pnpm test:nuxt',
      'pnpm db:migrate',
      'pnpm test:integration',
      'pnpm build'
    ]) {
      expect(workflow).toContain(command)
    }
  })

  it('provides PostgreSQL, Redis, and MinIO with test-only configuration', async () => {
    const workflow = await readFile(workflowUrl, 'utf8')

    expect(workflow).toMatch(/services:[\s\S]*postgres:/)
    expect(workflow).toMatch(/services:[\s\S]*redis:/)
    expect(workflow).toMatch(/services:[\s\S]*minio:/)
    expect(workflow).toContain('chayroom_test')
    expect(workflow).toContain('NUXT_STORAGE_ENDPOINT')
    expect(workflow).toContain('NUXT_STORAGE_FORCE_PATH_STYLE')
  })
})
