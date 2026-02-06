---
title: Getting Started with Pinia State Management
description: A practical guide to using Pinia for state management in Vue 3 applications with TypeScript support.
date: '2025-08-20'
tags:
  - Vue
  - Pinia
  - State Management
---

Pinia is the official state management library for Vue 3. It's intuitive, type-safe, and lightweight.

## Why Pinia?

- **TypeScript support** out of the box
- **Devtools integration** for debugging
- **Modular by design** — no nested modules
- **SSR compatible** with Nuxt

## Creating a Store

```typescript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
```

## Using in Components

```vue
<script setup lang="ts">
const counter = useCounterStore()
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.doubleCount }}</p>
    <button @click="counter.increment()">+1</button>
  </div>
</template>
```

## Best Practices

1. Use the **Composition API style** for stores
2. Keep stores **focused and small**
3. Use **getters** for derived state
4. Handle **async operations** in actions

> Pinia replaced Vuex as the recommended state management solution for Vue 3.

## Conclusion

Pinia makes state management in Vue 3 a joy. Its simplicity and type safety make it the clear choice for modern Vue applications.
