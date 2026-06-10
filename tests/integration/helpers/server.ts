import { setup } from '@nuxt/test-utils/e2e'

export const integrationEnv = {
  DATABASE_URL: process.env.TEST_DATABASE_URL
    || process.env.DATABASE_URL
    || 'postgres://chayroom:chayroom@127.0.0.1:55432/chayroom_test',
  REDIS_URL: process.env.TEST_REDIS_URL
    || process.env.REDIS_URL
    || 'redis://127.0.0.1:56379',
  NUXT_STORAGE_ENDPOINT: process.env.TEST_STORAGE_ENDPOINT
    || process.env.NUXT_STORAGE_ENDPOINT
    || 'http://127.0.0.1:59000',
  NUXT_STORAGE_REGION: 'us-east-1',
  NUXT_STORAGE_BUCKET: 'chayroom-test',
  NUXT_STORAGE_PUBLIC_URL: process.env.TEST_STORAGE_PUBLIC_URL
    || process.env.NUXT_STORAGE_PUBLIC_URL
    || 'http://127.0.0.1:59000/chayroom-test',
  NUXT_STORAGE_ACCESS_KEY_ID: 'minioadmin',
  NUXT_STORAGE_SECRET_ACCESS_KEY: 'minioadmin',
  NUXT_STORAGE_FORCE_PATH_STYLE: 'true',
  NUXT_TELEGRAM_BOT_TOKEN: '123456:test-secret',
  NUXT_ADMIN_TELEGRAM_IDS: '987654321',
  NUXT_ADMIN_SESSION_PASSWORD: 'integration-admin-session-password-32-chars',
  NUXT_SESSION_PASSWORD: 'integration-user-session-password-32-chars',
  NUXT_JWT_SECRET: 'integration-jwt-secret-password-32-chars',
  NUXT_PUBLIC_TELEGRAM_BOT_USERNAME: 'integration_test_bot',
  NUXT_PUBLIC_APP_URL: 'http://127.0.0.1',
  NUXT_TELEGRAM_WEBHOOK_SECRET: 'integration-webhook-secret'
} as const

export async function setupIntegrationServer() {
  Object.assign(process.env, integrationEnv)

  await setup({
    rootDir: process.cwd(),
    browser: false,
    dev: false,
    setupTimeout: 240_000,
    teardownTimeout: 60_000,
    serverStartTimeout: 90_000,
    env: integrationEnv,
    nuxtConfig: {
      devtools: { enabled: false }
    }
  })
}
