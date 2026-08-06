import { createEnv } from '@t3-oss/env-nuxt'
import { z } from 'zod'

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    NUXT_DEEPSEEK_API_KEY: z.string().optional(),
    NUXT_DEEPSEEK_MODEL: z.string().default('deepseek-chat'),
    NUXT_DEEPSEEK_BASE_URL: z.url().default('https://api.deepseek.com'),
    NUXT_UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    NUXT_UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    NUXT_CACHE_BASE: z.string().default('cache'),
    STUDIO_GITHUB_CLIENT_ID: z.string().optional(),
    STUDIO_GITHUB_CLIENT_SECRET: z.string().optional(),
  },
})
