<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: t('nav.home'),
    to: localePath('/'),
    active: route.path === localePath('/'),
  },
  {
    label: t('nav.blog'),
    to: localePath('/blog'),
    active: route.path.startsWith(localePath('/blog')),
  },
  {
    label: t('nav.projects'),
    to: localePath('/projects'),
    active: route.path.startsWith(localePath('/projects')),
  },
  {
    label: t('nav.weekly'),
    to: localePath('/weekly'),
    active: route.path.startsWith(localePath('/weekly')),
  },
])

const config = useRuntimeConfig()
const base = (config.app.baseURL || '/').replace(/\/$/, '') || ''
const rssItems = computed<DropdownMenuItem[][]>(() => [[
  { label: t('rss.all'), icon: 'i-lucide-rss', to: `${base}/rss.xml`, target: '_blank' },
  { label: t('rss.blog'), icon: 'i-lucide-book-open', to: `${base}/rss/blog.xml`, target: '_blank' },
  { label: t('rss.weekly'), icon: 'i-lucide-calendar', to: `${base}/rss/weekly.xml`, target: '_blank' },
]])

const languageItems = computed<DropdownMenuItem[][]>(() => [
  (locales.value as Array<{ code: string, name?: string }>).map(l => ({
    label: l.name || l.code,
    icon: l.code === locale.value ? 'i-lucide-check' : undefined,
    to: switchLocalePath(l.code as 'en' | 'zh') || undefined,
    onSelect: () => setLocale(l.code as 'en' | 'zh'),
  })),
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink :to="localePath('/')" class="font-serif text-lg font-normal tracking-tight">
        {{ t('site.name') }}
      </NuxtLink>
    </template>

    <UNavigationMenu :items="navItems" />

    <template #right>
      <UDropdownMenu :items="languageItems">
        <UButton
          icon="i-lucide-languages"
          color="neutral"
          variant="ghost"
          :aria-label="t('language.switch')"
        />
      </UDropdownMenu>

      <UDropdownMenu :items="rssItems">
        <UButton
          icon="i-lucide-rss"
          color="neutral"
          variant="ghost"
          :aria-label="t('rss.ariaLabel')"
        />
      </UDropdownMenu>

      <UColorModeButton :aria-label="t('theme.toggle')" />
    </template>

    <template #body>
      <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
