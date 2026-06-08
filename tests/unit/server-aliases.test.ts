import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const serverRoot = new URL('../../server/', import.meta.url)

describe('server imports', () => {
  it('uses Nuxt aliases for cross-directory modules', async () => {
    const violations: string[] = []

    for (const file of await sourceFiles(serverRoot.pathname)) {
      const source = await readFile(file, 'utf8')
      const imports = source.matchAll(/(?:from\s+|import\()['"](\.\.\/\.\.\/[^'"]*)['"]/g)

      for (const match of imports) {
        violations.push(`${relative(serverRoot.pathname, file)}: ${match[1]}`)
      }
    }

    expect(violations).toEqual([])
  })
})

async function sourceFiles(directory: string): Promise<string[]> {
  const files: string[] = []

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await sourceFiles(path))
    } else if (['.ts', '.js', '.mjs'].includes(extname(entry.name))) {
      files.push(path)
    }
  }

  return files
}
