<script setup lang="ts">
const colorMode = useColorMode()

const themeColor = computed(() =>
  colorMode.value === 'dark' ? '#020617' : '#ffffff',
)

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  meta: computed(() => [
    { name: 'theme-color', content: themeColor.value },
  ]),
  link: [
    { rel: 'alternate', type: 'application/rss+xml', title: 'RSS Feed', href: '/rss.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Blog RSS', href: '/rss/blog.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Weekly RSS', href: '/rss/weekly.xml' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap',
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
