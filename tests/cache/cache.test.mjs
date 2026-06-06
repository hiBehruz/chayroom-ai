import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const read = path => readFile(new URL(`../../${path}`, import.meta.url), 'utf8')

test('cache utility defines explicit public API cache names and invalidation helpers', async () => {
  const source = await read('server/utils/cache.ts')

  for (const name of [
    'courses:list',
    'courses:detail',
    'guides:list',
    'guides:detail',
    'exchange-rate'
  ]) {
    assert.match(source, new RegExp(`['"]${name}['"]`))
  }

  assert.match(source, /invalidateCourseCache/)
  assert.match(source, /invalidateGuideCache/)
  assert.match(source, /invalidateCache/)
})

test('admin course and guide mutations invalidate related public API caches', async () => {
  const files = [
    ['server/api/courses/index.post.ts', /invalidateCourseCache\(course\.slug\)/],
    ['server/api/courses/[slug].patch.ts', /invalidateCourseCache\(slug\)/],
    ['server/api/guides/index.post.ts', /invalidateGuideCache\(guide\.slug\)/],
    ['server/api/guides/[slug].patch.ts', /invalidateGuideCache\(slug\)/],
    ['server/api/guides/[slug].delete.ts', /invalidateGuideCache\(slug\)/]
  ]

  for (const [path, pattern] of files) {
    const source = await read(path)
    assert.match(source, pattern, path)
  }
})
