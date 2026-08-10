<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()

const showOriginal = ref(false)

function normalizeLocaleCode(value?: string) {
  return value?.trim().split('-')[0]?.toLowerCase() || ''
}

const { data: originalPage } = await useAsyncData('about-en', () =>
  queryCollection('about').path('/about').first(),
)

if (!originalPage.value) {
  throw createError({ statusCode: 404, statusMessage: t('about.notFound'), fatal: true })
}

const sourceLocale = computed(() => normalizeLocaleCode(originalPage.value?.language))
const currentLocale = computed(() => normalizeLocaleCode(locale.value))
const shouldTranslate = computed(() => {
  if (sourceLocale.value) return sourceLocale.value !== currentLocale.value
  return currentLocale.value !== 'en'
})

const translation = usePostTranslation({
  collection: 'about',
  path: () => '/about',
  locale: () => locale.value,
  enabled: () => shouldTranslate.value && !showOriginal.value,
})

const page = computed(() => {
  if (shouldTranslate.value && !showOriginal.value && translation.data.value?.body)
    return translation.data.value
  return originalPage.value
})

const isStreaming = computed(
  () => translation.state.value === 'streaming' || translation.state.value === 'connecting',
)
const isTranslatedView = computed(() => shouldTranslate.value && !showOriginal.value)

function toggleOriginal() {
  showOriginal.value = !showOriginal.value
}

const config = useRuntimeConfig()

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}${route.path}` : undefined,
})
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <SafeMotion
      :initial="{ opacity: 0, y: 16 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.1 }"
    >
      <header class="mb-12">
        <h1 class="display-heading text-4xl sm:text-5xl mb-4">
          {{ page?.title }}
        </h1>
        <p class="text-muted text-base sm:text-lg max-w-lg">
          {{ page?.description }}
        </p>
      </header>
    </SafeMotion>

    <div v-if="shouldTranslate" class="mb-8 flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-2 text-xs text-muted">
        <UIcon v-if="isStreaming" name="i-lucide-loader-circle" class="size-3.5 animate-spin" />
        <UIcon v-else name="i-lucide-sparkles" class="size-3.5" />
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
          :transition="{ duration: 0.5, delay: 0.2 }"
        >
          <ContentRenderer
            v-if="page"
            :key="`${isTranslatedView ? currentLocale : sourceLocale || 'source'}-${translation.state.value}`"
            :value="page as any"
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
  </UContainer>
</template>
