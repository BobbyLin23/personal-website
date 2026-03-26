<script setup lang="ts">
const WHITESPACE_SPLIT = /\s+/

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('blog').path(route.path).first())

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings('blog', route.path, {
    fields: ['title', 'description'],
  }))

const config = useRuntimeConfig()
useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}${route.path}` : undefined,
})

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function formatFullDate(dateStr: string) {
  return fullDateFormatter.format(new Date(dateStr))
}

const readingTime = computed(() => {
  if (!page.value?.body)
    return '3 min read'
  const text = JSON.stringify(page.value.body)
  const wordCount = text.split(WHITESPACE_SPLIT).length / 3
  const minutes = Math.max(1, Math.ceil(wordCount / 200))
  return `${minutes} min read`
})

const tagColors = ['primary', 'info', 'secondary', 'success', 'warning'] as const
function getTagColor(index: number) {
  return tagColors[index % tagColors.length]
}
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <SafeMotion
      :initial="{ opacity: 0, x: -8 }"
      :animate="{ opacity: 1, x: 0 }"
      :transition="{ duration: 0.3 }"
    >
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-highlighted transition-colors mb-12"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        Back to Blog
      </NuxtLink>
    </SafeMotion>

    <div class="lg:grid lg:grid-cols-[1fr_200px] lg:gap-16">
      <article class="min-w-0">
        <SafeMotion
          :initial="{ opacity: 0, y: 16 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.1 }"
        >
          <header class="mb-12">
            <h1 class="display-heading text-3xl sm:text-4xl mb-5">
              {{ page?.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 text-sm text-muted">
              <time
                class="tabular-nums"
                :datetime="page?.date"
              >
                {{ formatFullDate(page?.date ?? '') }}
              </time>
              <span class="w-1 h-1 rounded-full bg-muted" aria-hidden="true" />
              <span>{{ readingTime }}</span>
            </div>

            <div v-if="page?.tags?.length" class="flex flex-wrap gap-2 mt-5">
              <UBadge
                v-for="(tag, index) in page?.tags"
                :key="tag"
                :label="tag"
                :color="getTagColor(index)"
                variant="subtle"
                size="sm"
              />
            </div>
          </header>
        </SafeMotion>

        <SafeMotion
          :initial="{ opacity: 0, y: 16 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.2 }"
        >
          <ContentRenderer v-if="page" :value="page" />
        </SafeMotion>
      </article>

      <aside class="hidden lg:block">
        <SafeMotion
          :initial="{ opacity: 0, x: 16 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ duration: 0.5, delay: 0.3 }"
        >
          <div class="sticky top-24">
            <UContentToc
              :links="page?.body?.toc?.links"
              title="On this page"
              highlight
              color="primary"
            />
          </div>
        </SafeMotion>
      </aside>
    </div>

    <SafeMotion
      :initial="{ opacity: 0, y: 16 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.4 }"
    >
      <UContentSurround
        :surround="(surround as any)"
        class="mt-20"
      />
    </SafeMotion>
  </UContainer>
</template>
