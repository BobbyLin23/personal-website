// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxt/image',
    'motion-v/nuxt',
    'nuxt-studio',
  ],
  css: ['~/assets/css/main.css'],
  studio: {
    repository: {
      provider: 'github',
      owner: 'BobbyLin23',
      repo: 'personal-website',
      branch: 'master',
    },
  },
})
