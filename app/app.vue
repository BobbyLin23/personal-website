<script setup lang="ts">
useHead({
  link: [
    { rel: 'alternate', type: 'application/rss+xml', title: 'RSS Feed', href: '/rss.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Blog RSS', href: '/rss/blog.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Weekly RSS', href: '/rss/weekly.xml' },
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
