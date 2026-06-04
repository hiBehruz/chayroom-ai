// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [],
    },
  },

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      link: [],
      script: [
        { src: 'https://telegram.org/js/telegram-web-app.js' }
      ]
    }
  },

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
    public: {
      telegramBotUsername: '',
      appUrl: 'https://chayroom.uz',
      supportUsername: 'hellobehruz',
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
