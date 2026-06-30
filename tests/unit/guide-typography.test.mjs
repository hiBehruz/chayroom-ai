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

test('guide content defaults to eighteen pixel body text', async () => {
  const css = await read('app/assets/css/main.css')
  const editor = await read('app/components/guides/Editor.vue')
  const guideDetail = await read('app/pages/guides/[slug].vue')

  assert.match(css, /\.rich-content,[\s\S]*\.guide-editor-body \{[\s\S]*font-size:\s*18px/)
  assert.match(css, /\.rich-content p,[\s\S]*\.guide-editor-body p \{[\s\S]*font-size:\s*18px/)
  assert.match(css, /\.rich-content ul li,[\s\S]*\.guide-editor-body ul li \{[\s\S]*font-size:\s*18px/)
  assert.match(css, /\.rich-content ol li,[\s\S]*\.guide-editor-body ol li \{[\s\S]*font-size:\s*18px/)
  assert.match(css, /\.rich-content \[data-copy-code\],[\s\S]*\.guide-editor-body \[data-copy-code\] \{[\s\S]*font-size:\s*18px/)
  assert.match(guideDetail, /\.guide-detail--mini \.guide-content :deep\(p\),[\s\S]*\.guide-detail--mini \.guide-content :deep\(li\) \{[\s\S]*font-size:\s*18px/)
  assert.match(editor, /text-\[18px\]/)
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
  assert.match(editor, /const CopyBlock = Node\.create/)
  assert.match(editor, /name:\s*'copyBlock'/)
  assert.match(editor, /content:\s*'block\+'/)
  assert.match(editor, /marks:\s*'_'/)
  assert.match(editor, /contentElement:\s*'\[data-copy-code\]'/)
  assert.match(editor, /\['div', \{ 'data-copy-code': '' \}, 0\]/)
  assert.match(editor, /const DownloadBlock = Node\.create/)
  assert.match(editor, /name:\s*'downloadBlock'/)
  assert.match(editor, /title:\s*'Eslatma'/)
  assert.match(editor, /title:\s*'Prompt'/)
  assert.match(editor, /title:\s*'Nusxalash bloki'/)
  assert.match(editor, /title="Fayl qo'shish"/)
  assert.match(css, /\.rich-content \[data-callout\],[\s\S]*\.guide-editor-body \[data-callout\]/)
  assert.match(css, /\.rich-content \[data-prompt-block\],[\s\S]*\.guide-editor-body \[data-prompt-block\]/)
  assert.match(css, /\.rich-content \[data-copy-block\],[\s\S]*\.guide-editor-body \[data-copy-block\]/)
  assert.match(css, /\.rich-content \[data-copy-button\],[\s\S]*\.guide-editor-body \[data-copy-button\]/)
  assert.match(css, /\.rich-content \[data-download-block\],[\s\S]*\.guide-editor-body \[data-download-block\]/)
  assert.match(css, /\.rich-content ol li::before,[\s\S]*border-radius:\s*999px/)
})

test('guide detail copy blocks write their content to the clipboard', async () => {
  const source = await read('app/pages/guides/[slug].vue')
  const css = await read('app/assets/css/main.css')

  assert.match(source, /function onGuideContentClick/)
  assert.match(source, /closest\('\[data-copy-toolbar\], \[data-copy-button\]'\)/)
  assert.match(source, /navigator\.clipboard\.writeText\(text\)/)
  assert.match(source, /textContent = 'Nusxa olindi'/)
  assert.match(source, /@click="onGuideContentClick"/)
  assert.match(css, /\.rich-content \[data-copy-toolbar\] \{[\s\S]*cursor:\s*pointer/)
  assert.match(css, /\.rich-content \[data-copy-code\],[\s\S]*\.guide-editor-body \[data-copy-code\] \{[\s\S]*cursor:\s*text/)
  assert.match(css, /\.rich-content \[data-copy-code\],[\s\S]*\.guide-editor-body \[data-copy-code\] \{[\s\S]*user-select:\s*text/)
  assert.match(css, /\.rich-content \[data-copy-code\] :is\(p, ul, ol\),[\s\S]*\.guide-editor-body \[data-copy-code\] :is\(p, ul, ol\)/)
  assert.match(css, /\.rich-content \[data-copy-block\]\[data-copied\]/)
})

test('guide file uploads allow archive downloads', async () => {
  const presign = await read('server/api/upload/presign.post.ts')

  assert.match(presign, /application\/zip/)
  assert.match(presign, /Fayl turi qo\\'llab-quvvatlanmaydi/)
})
