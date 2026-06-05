// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  devtools: { enabled: true },

  app: {
    head: {
      link: [],
      script: [
        { src: 'https://telegram.org/js/telegram-web-app.js' }
      ]
    }
  },

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
    telegramBotToken: '',
    tributeApiKey: '',
    adminTelegramIds: '',
    adminSessionPassword: '',
    adminCookieDomain: '',
    public: {
      telegramBotUsername: '',
      appUrl: 'https://chayroom.uz',
      supportUsername: 'hellobehruz',
      sentryDsn: '',
      tributeTier1MonthUrl: '',
      tributeTier3MonthUrl: '',
      tributeTier6MonthUrl: ''
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: false,
      routes: []
    }
  },

  vite: {
    server: {
      allowedHosts: ['handcart-garage-creatable.ngrok-free.dev']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
