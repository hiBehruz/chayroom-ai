import { useNuxt } from 'nuxt/kit'

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
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/chayroom-favicon.ico' }
      ],
      script: [
        { src: 'https://telegram.org/js/telegram-web-app.js' }
      ],
      meta: [
        // Cache busting - browser har safar yangi versiyani yuklaydi
        { 'http-equiv': 'Cache-Control', 'content': 'no-cache, no-store, must-revalidate' },
        { 'http-equiv': 'Pragma', 'content': 'no-cache' },
        { 'http-equiv': 'Expires', 'content': '0' }
      ]
    },
    // Build hash'ni qo'shamiz - har build'da yangi URL
    buildAssetsDir: `_nuxt/${Date.now()}/`
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  runtimeConfig: {
    openaiApiKey: '',
    storageProvider: 's3',
    storageEndpoint: '',
    storageRegion: '',
    storageBucket: '',
    storagePublicUrl: '',
    storageAccessKeyId: '',
    storageSecretAccessKey: '',
    storageForcePathStyle: false,
    r2AccountId: '',
    r2AccessKeyId: '',
    r2SecretAccessKey: '',
    r2BucketName: '',
    r2PublicUrl: '',
    telegramBotToken: '',
    telegramClientSecret: '',
    telegramWebhookSecret: '',
    tributeApiKey: '',
    adminTelegramIds: '',
    adminSessionPassword: '',
    adminCookieDomain: '',
    sessionPassword: '',
    jwtSecret: '',
    public: {
      telegramBotUsername: 'chayroomai_bot',
      appUrl: 'https://chayroom.uz',
      supportUsername: 'hellobehruz',
      sentryDsn: '',
      tributeUrl: 'https://t.me/tribute/app?startapp=sXgF'
    }
  },

  routeRules: {
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
    externals: {
      inline: ['unhead']
    },
    storage: {
      cache: {
        driver: process.env.REDIS_URL ? 'redis' : 'memory',
        ...(process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {})
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

  hooks: {
    'modules:done'() {
      if (!process.env.VITEST) return

      // Nuxt Test Utils structured-clones runtime config; module-added proxies are not cloneable.
      const nuxt = useNuxt()
      nuxt.options.runtimeConfig = JSON.parse(JSON.stringify(nuxt.options.runtimeConfig))
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
