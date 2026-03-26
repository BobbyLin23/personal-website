<script setup lang="ts">
const colorMode = useColorMode()

const themeColor = computed(() =>
  colorMode.value === 'dark' ? '#1c1917' : '#fafaf9',
)

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  meta: computed(() => [
    { name: 'theme-color', content: themeColor.value },
  ]),
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'RSS Feed', href: '/rss.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Blog RSS', href: '/rss/blog.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Weekly RSS', href: '/rss/weekly.xml' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400;1,9..40,500&family=Instrument+Serif:ital@0;1&display=swap',
    },
  ],
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
