---
title: How I Built My Blog with Nuxt Content
description: A step-by-step guide to setting up a blog with Nuxt Content v3, including markdown rendering, syntax highlighting, and SEO optimization.
date: '2025-11-15'
tags:
  - Nuxt
  - Nuxt Content
  - Blog
---

Setting up a blog with Nuxt Content v3 is a breeze. In this post, I'll walk you through the entire process from scratch.

## Why Nuxt Content?

Nuxt Content provides a file-based CMS that lets you write in Markdown while enjoying the full power of Vue components. Key advantages include:

- **File-based**: Write content in Markdown, YAML, or JSON
- **Vue Components in Markdown**: Use Vue components directly in your content
- **Auto-generated API**: Query your content with a MongoDB-like API
- **Full-text search**: Built-in search capabilities

## Setting Up

First, install the module:

```bash
pnpm add @nuxt/content
```

Then configure it in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    highlight: {
      theme: 'github-dark'
    }
  }
})
```

## Content Collections

Define your collections in `content.config.ts`:

```typescript
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
      }),
    }),
  },
})
```

## Querying Content

Use `queryCollection` to fetch your blog posts:

```vue
<script setup lang="ts">
const { data: posts } = await useAsyncData('posts', () =>
  queryCollection('blog')
    .order('date', 'DESC')
    .all()
)
</script>
```

> Nuxt Content v3 brings a completely new API that's more intuitive and powerful than v2.

## Conclusion

Nuxt Content is the perfect choice for developers who want a simple yet powerful blogging solution. Give it a try!
