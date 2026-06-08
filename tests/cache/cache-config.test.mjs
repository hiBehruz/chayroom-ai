import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'

const read = path => readFile(new URL(`../../${path}`, import.meta.url), 'utf8')

test('public GET API handlers use named Nitro cached event handlers', async () => {
  const files = [
    ['server/api/courses/index.get.ts', /name:\s*publicApiCacheNames\.courseList/],
    ['server/api/courses/[slug].get.ts', /name:\s*publicApiCacheNames\.courseDetail/],
    ['server/api/guides/index.get.ts', /name:\s*publicApiCacheNames\.guideList/],
    ['server/api/guides/[slug].get.ts', /name:\s*publicApiCacheNames\.guideDetail/],
    ['server/api/exchange-rate.get.ts', /name:\s*publicApiCacheNames\.exchangeRate/]
  ]

  for (const [path, namePattern] of files) {
    const source = await read(path)
    assert.match(source, /defineCachedEventHandler/, path)
    assert.match(source, namePattern, path)
    assert.match(source, /maxAge:\s*\d+/, path)
    assert.match(source, /getKey:/, path)
  }
})

test('Nuxt config wires Redis cache storage and conservative SWR route rules', async () => {
  const source = await read('nuxt.config.ts')

  assert.match(source, /storage:\s*{[\s\S]*cache:/)
  assert.match(source, /driver:\s*process\.env\.REDIS_URL\s*\?\s*['"]redis['"]\s*:\s*['"]memory['"]/)
  assert.match(source, /url:\s*process\.env\.REDIS_URL/)

  for (const route of ['/catalog', '/community', '/about-me', '/rules']) {
    assert.match(source, new RegExp(`['"]${route}['"]:\\s*{\\s*swr:\\s*3600\\s*}`))
  }

  for (const route of ['/guides', '/guides/**', '/courses']) {
    assert.match(source, new RegExp(`['"]${route.replace('*', '\\*')}['"]:\\s*{\\s*swr:\\s*600\\s*}`))
  }

  assert.doesNotMatch(source, /['"]\/courses\/\*\*['"]:\s*{\s*swr:/)
})

test('Docker Compose and Caddy expose the static asset cache layer', async () => {
  const compose = await read('docker-compose.yml')
  const caddy = await read('Caddyfile')

  assert.match(compose, /REDIS_URL=redis:\/\/redis:6379/)
  assert.match(caddy, /encode zstd gzip/)
  assert.match(caddy, /@immutable path \/_nuxt\/\*/)
  assert.match(caddy, /Cache-Control "public, max-age=31536000, immutable"/)
})
