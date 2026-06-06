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
    sessionPassword: '',
    public: {
      telegramBotUsername: 'chayroomai_bot',
      appUrl: 'https://chayroom.uz',
      supportUsername: 'hellobehruz',
      sentryDsn: '',
      tributeUrl: 'https://t.me/tribute/app?startapp=sXgF'
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/catalog': { swr: 3600 },
    '/community': { swr: 3600 },
    '/about-me': { swr: 3600 },
    '/rules': { swr: 3600 },
    '/guides': { swr: 600 },
    '/guides/**': { swr: 600 },
    '/courses': { swr: 600 }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    preset: 'node-server',
    storage: {
      cache: {
        driver: process.env.REDIS_URL ? 'redis' : 'memory',
        url: process.env.REDIS_URL
      }
    },
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
