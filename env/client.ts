import { createEnv } from '@t3-oss/env-nuxt'
import { z } from 'zod'

export const env = createEnv({
  emptyStringAsUndefined: true,
  client: {
    NUXT_PUBLIC_SITE_URL: z.string().default(''),
  },
})
