<script setup lang="ts">
interface LinkPayload {
  url: string
  title: string
  description: string
  image: string | null
  siteName: string | null
}

const props = defineProps<{
  link: LinkPayload
}>()

const host = computed(() => {
  try {
    return new URL(props.link.url).hostname.replace(/^www\./, '')
  } catch {
    return props.link.siteName ?? ''
  }
})
</script>

<template>
  <a
    :href="link.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex gap-4 rounded-lg border border-default bg-elevated/40 p-3 transition-colors hover:border-primary/40 hover:bg-elevated/60"
  >
    <div class="min-w-0 flex-1">
      <div class="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
        {{ host }}
      </div>
      <h4 class="font-semibold text-highlighted leading-snug">{{ link.title }}</h4>
      <p v-if="link.description" class="mt-1 line-clamp-2 text-sm text-toned leading-relaxed">
        {{ link.description }}
      </p>
    </div>
    <div
      v-if="link.image"
      class="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-default ring ring-default"
    >
      <NuxtImg
        :src="link.image"
        :alt="link.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  </a>
</template>
