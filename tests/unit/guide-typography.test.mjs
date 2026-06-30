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

test('guide blockquotes render as a minimal blue side rule', async () => {
  const css = await read('app/assets/css/main.css')
  const editor = await read('app/components/guides/Editor.vue')

  assert.match(css, /\.rich-content blockquote,[\s\S]*\.guide-editor-body blockquote \{[\s\S]*border-left:\s*4px solid #3480f1/)
  assert.match(css, /\.rich-content blockquote,[\s\S]*\.guide-editor-body blockquote \{[\s\S]*background:\s*transparent/)
  assert.match(css, /\.rich-content blockquote,[\s\S]*\.guide-editor-body blockquote \{[\s\S]*border-top:\s*0/)
  assert.match(editor, /title:\s*'Iqtibos'/)
})

test('guide editor exposes premium content blocks', async () => {
  const css = await read('app/assets/css/main.css')
  const editor = await read('app/components/guides/Editor.vue')

  assert.match(editor, /const CalloutBlock = Node\.create/)
  assert.match(editor, /name:\s*'calloutBlock'/)
  assert.match(editor, /const PromptBlock = Node\.create/)
  assert.match(editor, /name:\s*'promptBlock'/)
  assert.match(editor, /const DownloadBlock = Node\.create/)
  assert.match(editor, /name:\s*'downloadBlock'/)
  assert.match(editor, /title:\s*'Eslatma'/)
  assert.match(editor, /title:\s*'Prompt'/)
  assert.match(editor, /title="Fayl qo'shish"/)
  assert.match(css, /\.rich-content \[data-callout\],[\s\S]*\.guide-editor-body \[data-callout\]/)
  assert.match(css, /\.rich-content \[data-prompt-block\],[\s\S]*\.guide-editor-body \[data-prompt-block\]/)
  assert.match(css, /\.rich-content \[data-download-block\],[\s\S]*\.guide-editor-body \[data-download-block\]/)
  assert.match(css, /\.rich-content ol li::before,[\s\S]*border-radius:\s*999px/)
})

test('guide file uploads allow archive downloads', async () => {
  const presign = await read('server/api/upload/presign.post.ts')

  assert.match(presign, /application\/zip/)
  assert.match(presign, /Fayl turi qo\\'llab-quvvatlanmaydi/)
})
