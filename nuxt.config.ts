// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@sentry/nuxt/module'
  ],

  sentry: {
    dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
    sourceMapsUploadOptions: {
      org: 'chayroom-ai',
      project: 'chayroom-nuxt',
    },
  },

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  runtimeConfig: {
    openaiApiKey: '',
    r2AccountId: '',
    r2AccessKeyId: '',
    r2SecretAccessKey: '',
    r2BucketName: '',
    r2PublicUrl: '',
    public: {
      telegramBotUsername: '',
      sentryDsn: ''
    }
  },

  routeRules: {
    '/': { prerender: true }
  },


  vite: {
    server: {
      allowedHosts: ['handcart-garage-creatable.ngrok-free.dev']
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
