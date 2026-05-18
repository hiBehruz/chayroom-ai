// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    adminTelegramId: '',
    supabaseUrl: '',
    supabaseServiceKey: '',
    notionApiKey: '',
    public: {
      telegramBotUsername: '',
      adminTelegramId: ''
    }
  }
})
