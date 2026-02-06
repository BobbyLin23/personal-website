---
title: "Introduction to Nuxt 3: The Hybrid Vue Framework"
description: Getting started with Nuxt 3, the hybrid framework that brings together SSR, SSG, and SPA in one powerful package.
date: '2024-06-15'
tags:
  - Nuxt
  - Vue
  - Framework
---

Nuxt 3 is a complete rewrite that brings Vue 3, Vite, and Nitro together for a powerful full-stack development experience.

## Key Features

### Hybrid Rendering

Nuxt 3 supports multiple rendering strategies:

```typescript
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },         // SSG
    '/blog/**': { swr: 3600 },        // ISR
    '/admin/**': { ssr: false },       // SPA
    '/api/**': { cors: true },         // API
  }
})
```

### Auto-imports

No more manual imports for Vue APIs and composables:

```vue
<script setup>
// ref, computed, watch — all auto-imported!
const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>
```

### Nitro Server Engine

Build API routes alongside your frontend:

```typescript
// server/api/hello.ts
export default defineEventHandler((event) => {
  return { message: 'Hello from Nitro!' }
})
```

## File-based Routing

Create pages by adding files to the `pages/` directory:

```
pages/
├── index.vue          → /
├── about.vue          → /about
├── blog/
│   ├── index.vue      → /blog
│   └── [slug].vue     → /blog/:slug
```

## Conclusion

Nuxt 3 is the most versatile Vue meta-framework available. Whether you need SSR, SSG, or SPA — Nuxt 3 has you covered.
