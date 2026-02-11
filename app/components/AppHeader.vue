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

const currentLang = shallowRef<'en' | 'zh'>('en')

function toggleLang() {
  currentLang.value = currentLang.value === 'en' ? 'zh' : 'en'
}
</script>

<template>
  <UHeader title="Bobby Lin">
    <UNavigationMenu :items="navItems" />

    <template #right>
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        :label="currentLang === 'en' ? 'EN / 中' : '中 / EN'"
        @click="toggleLang"
      />

      <UDropdownMenu :items="rssItems">
        <UButton
          icon="i-lucide-rss"
          color="neutral"
          variant="ghost"
          aria-label="RSS"
        />
      </UDropdownMenu>

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
