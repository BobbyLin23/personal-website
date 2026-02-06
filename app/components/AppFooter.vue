<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        &copy; {{ currentYear }} Bobby Lin. All rights reserved.
      </p>
    </template>

    <template #right>
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com"
        target="_blank"
        aria-label="GitHub"
      />
      <UButton
        icon="i-simple-icons-x"
        color="neutral"
        variant="ghost"
        to="https://x.com"
        target="_blank"
        aria-label="X"
      />
      <UButton
        icon="i-lucide-rss"
        color="neutral"
        variant="ghost"
        to="/rss.xml"
        aria-label="RSS"
      />
    </template>
  </UFooter>
</template>
