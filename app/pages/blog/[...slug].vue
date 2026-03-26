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
  // Rough estimate: count text nodes in AST
  const text = JSON.stringify(page.value.body)
  const wordCount = text.split(WHITESPACE_SPLIT).length / 3 // JSON overhead factor
  const minutes = Math.max(1, Math.ceil(wordCount / 200))
  return `${minutes} min read`
})

const tagColors = ['primary', 'info', 'secondary', 'success', 'warning'] as const
function getTagColor(index: number) {
  return tagColors[index % tagColors.length]
}
</script>

<template>
  <UContainer class="py-10 sm:py-16">
    <!-- Back Link -->
    <SafeMotion
      :initial="{ opacity: 0, x: -10 }"
      :animate="{ opacity: 1, x: 0 }"
      :transition="{ duration: 0.3 }"
    >
      <UButton
        to="/blog"
        variant="link"
        color="neutral"
        icon="i-lucide-arrow-left"
        label="Back to Blog"
        class="mb-8 -ml-2.5"
      />
    </SafeMotion>

    <div class="lg:grid lg:grid-cols-[1fr_200px] lg:gap-12">
      <!-- Article -->
      <article class="min-w-0">
        <!-- Meta Header -->
        <SafeMotion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.1 }"
        >
          <header class="mb-10">
            <h1 class="text-3xl font-bold tracking-tight mb-4">
              {{ page?.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 text-sm text-muted">
              <time
                class="flex items-center gap-1.5 tabular-nums"
                :datetime="page?.date"
              >
                <UIcon name="i-lucide-calendar" class="size-3.5" aria-hidden="true" />
                {{ formatFullDate(page?.date ?? '') }}
              </time>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-clock" class="size-3.5" aria-hidden="true" />
                {{ readingTime }}
              </span>
            </div>

            <div v-if="page?.tags?.length" class="flex flex-wrap gap-2 mt-4">
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

        <!-- Content -->
        <SafeMotion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.2 }"
        >
          <ContentRenderer v-if="page" :value="page" />
        </SafeMotion>
      </article>

      <!-- TOC Sidebar (desktop) -->
      <aside class="hidden lg:block">
        <SafeMotion
          :initial="{ opacity: 0, x: 20 }"
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

    <!-- Prev / Next Navigation -->
    <SafeMotion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.4 }"
    >
      <UContentSurround
        :surround="(surround as any)"
        class="mt-16"
      />
    </SafeMotion>
  </UContainer>
</template>
