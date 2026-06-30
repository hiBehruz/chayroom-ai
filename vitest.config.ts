import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#server': fileURLToPath(new URL('./server', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url))
    }
  },
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
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          testTimeout: 60_000,
          hookTimeout: 60_000,
          maxWorkers: 1,
          isolate: false,
          fileParallelism: false
        }
      }
    ]
  }
})
