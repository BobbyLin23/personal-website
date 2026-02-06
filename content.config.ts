import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().default(false),
      }),
    }),
    projects: defineCollection({
      type: 'data',
      source: 'projects/*.yml',
      schema: z.object({
        name: z.string(),
        description: z.string(),
        icon: z.string(),
        iconBg: z.string(),
        iconColor: z.string(),
        language: z.string(),
        languageColor: z.string(),
        stars: z.number(),
        forks: z.number(),
        url: z.string().optional(),
        github: z.string().optional(),
        demo: z.string().optional(),
        featured: z.boolean().default(false),
      }),
    }),
  },
})
