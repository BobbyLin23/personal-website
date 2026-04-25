<script setup lang="ts">
const WHITESPACE_SPLIT = /\s+/
const LOCALE_PREFIX_RE = /^\/(en|zh)(?=\/|$)/

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const basePath = computed(() => {
  const p = route.path.replace(LOCALE_PREFIX_RE, '')
  return p || '/'
})

const showOriginal = ref(false)

function normalizeLocaleCode(value?: string) {
  return value?.trim().split('-')[0]?.toLowerCase() || ''
}

// Always fetch the source post via @nuxt/content (works on SSR + client).
const { data: originalPage } = await useAsyncData(
  () => `post-en-${basePath.value}`,
  () => queryCollection('blog').path(basePath.value).first(),
  { watch: [() => basePath.value] },
)

if (!originalPage.value) {
  throw createError({ statusCode: 404, statusMessage: t('post.notFound'), fatal: true })
}

const sourceLocale = computed(() => normalizeLocaleCode(originalPage.value?.language))
const currentLocale = computed(() => normalizeLocaleCode(locale.value))
const shouldTranslate = computed(() => {
  if (sourceLocale.value)
    return sourceLocale.value !== currentLocale.value
  return currentLocale.value === 'zh'
})

// Stream the translated version on the client when the source language differs.
const translation = usePostTranslation({
  collection: 'blog',
  path: () => basePath.value,
  locale: () => locale.value,
  enabled: () => shouldTranslate.value && !showOriginal.value,
})

// Reset toggle when navigating to a different post.
watch(basePath, () => {
  showOriginal.value = false
})

// What to actually render.
const page = computed(() => {
  if (shouldTranslate.value && !showOriginal.value && translation.data.value?.body) {
    return translation.data.value
  }
  return originalPage.value
})

const isStreaming = computed(() => translation.state.value === 'streaming' || translation.state.value === 'connecting')
const isTranslatedView = computed(() => shouldTranslate.value && !showOriginal.value)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings('blog', basePath.value, {
    fields: ['title', 'description'],
  }))

const config = useRuntimeConfig()
useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}${route.path}` : undefined,
})

const fullDateFormatter = computed(() => new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}))

function formatFullDate(dateStr: string) {
  if (!dateStr)
    return ''
  return fullDateFormatter.value.format(new Date(dateStr))
}

const readingTime = computed(() => {
  if (!page.value?.body)
    return t('post.readingTime', { minutes: 3 })
  const text = JSON.stringify(page.value.body)
  const wordCount = text.split(WHITESPACE_SPLIT).length / 3
  const minutes = Math.max(1, Math.ceil(wordCount / 200))
  return t('post.readingTime', { minutes })
})

const tagColors = ['primary', 'info', 'secondary', 'success', 'warning'] as const
function getTagColor(index: number) {
  return tagColors[index % tagColors.length]
}

function toggleOriginal() {
  showOriginal.value = !showOriginal.value
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
        :to="localePath('/blog')"
        class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-highlighted transition-colors mb-12"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        {{ t('post.back') }}
      </NuxtLink>
    </SafeMotion>

    <div v-if="shouldTranslate" class="mb-8 flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-2 text-xs text-muted">
        <UIcon
          v-if="isStreaming"
          name="i-lucide-loader-circle"
          class="size-3.5 animate-spin"
        />
        <UIcon
          v-else
          name="i-lucide-sparkles"
          class="size-3.5"
        />
        <span v-if="isStreaming">{{ t('post.translating') }}</span>
        <span v-else-if="isTranslatedView">{{ t('post.translatedByAi') }}</span>
        <span v-else class="opacity-60">{{ t('post.translationFailed') }}</span>
      </div>

      <UButton
        size="xs"
        color="neutral"
        variant="soft"
        :icon="showOriginal ? 'i-lucide-languages' : 'i-lucide-book-open'"
        :label="showOriginal ? t('post.showTranslation') : t('post.showOriginal')"
        @click="toggleOriginal"
      />
    </div>

    <UAlert
      v-if="translation.error.value && isTranslatedView"
      color="warning"
      variant="subtle"
      :title="t('post.translationFailed')"
      :description="translation.error.value"
      class="mb-8"
    />

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

            <div v-if="originalPage?.tags?.length" class="flex flex-wrap gap-2 mt-5">
              <UBadge
                v-for="(tag, index) in originalPage?.tags"
                :key="tag"
                :label="tag"
                :color="getTagColor(index as number)"
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
          <ContentRenderer
            v-if="page"
            :key="`${isTranslatedView ? currentLocale : sourceLocale || 'source'}-${translation.state.value}`"
            :value="(page as any)"
          />
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
              :title="t('post.toc')"
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
