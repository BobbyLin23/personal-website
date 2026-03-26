<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    icon: 'i-lucide-home',
    to: '/',
    active: route.path === '/',
  },
  {
    label: 'Blog',
    icon: 'i-lucide-book-open',
    to: '/blog',
    active: route.path.startsWith('/blog'),
  },
  {
    label: 'Projects',
    icon: 'i-lucide-folder-git-2',
    to: '/projects',
    active: route.path.startsWith('/projects'),
  },
  {
    label: 'Weekly',
    icon: 'i-lucide-calendar',
    to: '/weekly',
    active: route.path.startsWith('/weekly'),
  },
])

const config = useRuntimeConfig()
const base = (config.app.baseURL || '/').replace(/\/$/, '') || ''
const rssItems = [[
  { label: 'All', icon: 'i-lucide-rss', href: `${base}/rss.xml`, target: '_blank' },
  { label: 'Blog', icon: 'i-lucide-book-open', href: `${base}/rss/blog.xml`, target: '_blank' },
  { label: 'Weekly', icon: 'i-lucide-calendar', href: `${base}/rss/weekly.xml`, target: '_blank' },
]]
</script>

<template>
  <UHeader title="Bobby Lin">
    <UNavigationMenu :items="navItems" />

    <template #right>
      <UDropdownMenu :items="rssItems">
        <UButton
          icon="i-lucide-rss"
          color="neutral"
          variant="ghost"
          aria-label="RSS feeds"
        />
      </UDropdownMenu>

      <UColorModeButton aria-label="Toggle color theme" />
    </template>

    <template #body>
      <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
