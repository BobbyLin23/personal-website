<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const colorMode = useColorMode()
const { locale } = useI18n()

const themeColor = computed(() => (colorMode.value === 'dark' ? '#1c1917' : '#fafaf9'))

const uiLocale = computed(() => {
  const code = locale.value === 'zh' ? 'zh-CN' : 'en'
  return (locales as Record<string, any>)[code] || locales.en
})

const htmlLang = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en'))

useHead({
  htmlAttrs: {
    lang: htmlLang,
  },
  meta: computed(() => [{ name: 'theme-color', content: themeColor.value }]),
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'RSS Feed', href: '/rss.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Blog RSS', href: '/rss/blog.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Weekly RSS', href: '/rss/weekly.xml' },
  ],
})
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
