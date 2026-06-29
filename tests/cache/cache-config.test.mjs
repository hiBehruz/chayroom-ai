import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'

const read = path => readFile(new URL(`../../${path}`, import.meta.url), 'utf8')

test('public list API handlers use named Nitro cached event handlers', async () => {
  const files = [
    ['server/api/courses/index.get.ts', /name:\s*publicApiCacheNames\.courseList/],
    ['server/api/guides/index.get.ts', /name:\s*publicApiCacheNames\.guideList/],
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

test('personalized detail API handlers are never shared-cached', async () => {
  for (const path of [
    'server/api/courses/[slug].get.ts',
    'server/api/guides/[slug].get.ts'
  ]) {
    const source = await read(path)
    assert.match(source, /defineEventHandler/, path)
    assert.doesNotMatch(source, /defineCachedEventHandler/, path)
  }
})

test('Nuxt config wires Redis cache storage and conservative SWR route rules', async () => {
  const source = await read('nuxt.config.ts')

  assert.match(source, /storage:\s*{[\s\S]*cache:/)
  assert.match(source, /driver:\s*process\.env\.REDIS_URL\s*\?\s*['"]redis['"]\s*:\s*['"]memory['"]/)
  assert.match(source, /process\.env\.REDIS_URL\s*\?\s*{\s*url:\s*process\.env\.REDIS_URL\s*}\s*:\s*{}/)

  for (const route of ['/catalog', '/community', '/about-me', '/rules']) {
    assert.match(source, new RegExp(`['"]${route}['"]:\\s*{\\s*swr:\\s*3600\\s*}`))
  }

  for (const route of ['/guides', '/courses']) {
    assert.match(source, new RegExp(`['"]${route.replace('*', '\\*')}['"]:\\s*{\\s*swr:\\s*600\\s*}`))
  }

  assert.doesNotMatch(source, /['"]\/guides\/\*\*['"]:\s*{\s*swr:/)
  assert.doesNotMatch(source, /['"]\/courses\/\*\*['"]:\s*{\s*swr:/)
})

test('Docker Compose waits for healthy Redis and Caddy exposes the static asset cache layer', async () => {
  const compose = await read('docker-compose.yml')
  const caddy = await read('Caddyfile')

  assert.match(compose, /REDIS_URL=redis:\/\/redis:6379/)
  assert.match(compose, /test:\s*\["CMD",\s*"redis-cli",\s*"ping"\]/)
  assert.match(compose, /redis:\s*\n\s*condition:\s*service_healthy/)
  assert.match(caddy, /encode zstd gzip/)
  assert.match(caddy, /@immutable path \/_nuxt\/\*/)
  assert.match(caddy, /Cache-Control "public, max-age=31536000, immutable"/)
})
