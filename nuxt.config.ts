import process from 'node:process'
import { resolve } from 'node:path'
import { env as serverEnv } from './env/server'
import { env as clientEnv } from './env/client'

const upstashUrl = serverEnv.NUXT_UPSTASH_REDIS_REST_URL || serverEnv.UPSTASH_REDIS_REST_URL || ''
const upstashToken =
  serverEnv.NUXT_UPSTASH_REDIS_REST_TOKEN || serverEnv.UPSTASH_REDIS_REST_TOKEN || ''
const cacheBase = serverEnv.NUXT_CACHE_BASE

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
  ui: {
    fonts: false,
  },
  icon: {
    clientBundle: {
      scan: true,
    },
  },
  runtimeConfig: {
    deepseekApiKey: serverEnv.NUXT_DEEPSEEK_API_KEY ?? '',
    deepseekModel: serverEnv.NUXT_DEEPSEEK_MODEL,
    deepseekBaseUrl: serverEnv.NUXT_DEEPSEEK_BASE_URL,
    upstash: {
      url: upstashUrl,
      token: upstashToken,
    },
    publishSecret: serverEnv.NUXT_PUBLISH_SECRET ?? '',
    notionToken: serverEnv.NUXT_NOTION_TOKEN ?? '',
    notionDatabaseIds: serverEnv.NUXT_NOTION_DATABASE_IDS ?? '',
    githubToken: serverEnv.NUXT_GITHUB_TOKEN ?? '',
    github: {
      owner: serverEnv.NUXT_GITHUB_OWNER,
      repo: serverEnv.NUXT_GITHUB_REPO,
      branch: serverEnv.NUXT_GITHUB_BRANCH,
    },
    public: {
      siteUrl: clientEnv.NUXT_PUBLIC_SITE_URL,
    },
  },
  nitro: {
    prerender: {
      routes: ['/rss.xml', '/rss/blog.xml', '/rss/weekly.xml'],
    },
    externals: {
      inline: ['minimark', '@nuxtjs/mdc'],
    },
    serverAssets: [{ baseName: 'content-src', dir: resolve(process.cwd(), 'content') }],
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
      { code: 'zh', name: '简体中文', language: 'zh-CN', file: 'zh.json' },
      { code: 'zh-TW', name: '繁體中文', language: 'zh-TW', file: 'zh-TW.json' },
      { code: 'es', name: 'Español', language: 'es', file: 'es.json' },
      { code: 'ja', name: '日本語', language: 'ja', file: 'ja.json' },
      { code: 'fr', name: 'Français', language: 'fr', file: 'fr.json' },
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
