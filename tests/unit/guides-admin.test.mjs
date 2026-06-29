import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'

const read = path => readFile(new URL(`../../${path}`, import.meta.url), 'utf8')

test('new guide mutation persists the selected level', async () => {
  const source = await read('server/api/guides/index.post.ts')

  assert.match(source, /level:\s*body\.level\s*\?\?\s*null/)
})

test('guide card edit action opens the existing inline edit page', async () => {
  const source = await read('app/pages/guides/index.vue')

  assert.doesNotMatch(source, /\/admin\/guides\/edit\//)
  assert.match(source, /navigateTo\('\/guides\/'\s*\+\s*guide\.slug/)
})
