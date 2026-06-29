import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'

const read = path => readFile(new URL(`../../${path}`, import.meta.url), 'utf8')

test('guide typography preserves intentional blank paragraphs from the editor', async () => {
  const source = await read('app/assets/css/main.css')

  assert.match(source, /\.rich-content p:empty::before/)
  assert.match(source, /\.guide-editor-body p:empty::before/)
  assert.match(source, /min-height:\s*1\.7em/)
})

test('mini guide content keeps readable paragraph spacing', async () => {
  const source = await read('app/pages/guides/[slug].vue')

  assert.match(source, /guide-detail--mini \.guide-content :deep\(p\)[\s\S]*margin-bottom:\s*22px/)
})
