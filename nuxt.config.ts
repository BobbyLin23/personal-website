import { resolve } from 'node:path'
import process from 'node:process'

const upstashUrl = process.env.NUXT_UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const upstashToken = process.env.NUXT_UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''
const cacheBase = process.env.NUXT_CACHE_BASE || 'cache'

function buildCacheStorage() {
  if (upstashUrl && upstashToken) {
    return {
      driver: 'upstash',
      url: upstashUrl,
      token: upstashToken,
      base: cacheBase,
    }
  }

  return { driver: 'memory' }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    deepseekApiKey: process.env.NUXT_DEEPSEEK_API_KEY || '',
    deepseekModel: process.env.NUXT_DEEPSEEK_MODEL || 'deepseek-chat',
    deepseekBaseUrl: process.env.NUXT_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    upstash: {
      url: upstashUrl,
      token: upstashToken,
    },
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
    },
  },
  nitro: {
    prerender: {
      routes: ['/rss.xml', '/rss/blog.xml', '/rss/weekly.xml'],
    },
    externals: {
      inline: ['minimark', '@nuxtjs/mdc'],
    },
    serverAssets: [
      { baseName: 'content-src', dir: resolve(process.cwd(), 'content') },
    ],
    storage: {
      cache: buildCacheStorage(),
    },
  },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxt/image',
    'motion-v/nuxt',
    'nuxt-studio',
    '@nuxtjs/i18n',
  ],
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
      { code: 'zh', name: '中文', language: 'zh-CN', file: 'zh.json' },
    ],
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
    },
  },
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
