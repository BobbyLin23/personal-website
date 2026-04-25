<script setup lang="ts">
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

const { data: originalPage } = await useAsyncData(
  () => `weekly-en-${basePath.value}`,
  () => queryCollection('weekly').path(basePath.value).first(),
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

const translation = usePostTranslation({
  collection: 'weekly',
  path: () => basePath.value,
  locale: () => locale.value,
  enabled: () => shouldTranslate.value && !showOriginal.value,
})

watch(basePath, () => {
  showOriginal.value = false
})

const page = computed(() => {
  if (shouldTranslate.value && !showOriginal.value && translation.data.value?.body)
    return translation.data.value
  return originalPage.value
})

const isStreaming = computed(() => translation.state.value === 'streaming' || translation.state.value === 'connecting')
const isTranslatedView = computed(() => shouldTranslate.value && !showOriginal.value)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings('weekly', basePath.value, {
    fields: ['title', 'description', 'date', 'week'],
  }))

const config = useRuntimeConfig()
useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}${route.path}` : undefined,
})

const fmtFull = computed(() => new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}))
const fmtShort = computed(() => new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
  month: 'long',
  day: 'numeric',
}))

function formatDateRange(dateStr: string) {
  if (!dateStr)
    return ''
  const end = new Date(dateStr)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  if (start.getFullYear() === end.getFullYear()) {
    return `${fmtShort.value.format(start)} - ${fmtFull.value.format(end)}`
  }
  return `${fmtFull.value.format(start)} - ${fmtFull.value.format(end)}`
}

function formatWeekNumber(week: number): string {
  return `W${String(week).padStart(2, '0')}`
}

const stats = computed(() => [
  { value: originalPage.value?.commits ?? 0, label: t('weekly.commits'), color: 'text-amber-600 dark:text-amber-400' },
  { value: originalPage.value?.prs ?? 0, label: t('weekly.prs'), color: 'text-sky-600 dark:text-sky-400' },
  { value: originalPage.value?.blogs ?? 0, label: t('weekly.blogs'), color: 'text-violet-600 dark:text-violet-400' },
  { value: originalPage.value?.books ?? 0, label: t('weekly.books'), color: 'text-rose-600 dark:text-rose-400' },
])

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
        :to="localePath('/weekly')"
        class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-highlighted transition-colors mb-12"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        {{ t('weekly.back') }}
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

    <article>
      <SafeMotion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
      >
        <header class="mb-12">
          <div class="flex items-center gap-3 mb-5">
            <UBadge
              :label="formatWeekNumber(originalPage?.week ?? 0)"
              color="primary"
              variant="subtle"
              size="lg"
            />
            <span class="text-sm text-muted">
              {{ formatDateRange(page?.date ?? '') }}
            </span>
          </div>
          <h1 class="display-heading text-3xl sm:text-4xl mb-3">
            {{ page?.title }}
          </h1>
          <p class="text-muted text-base sm:text-lg">
            {{ page?.description }}
          </p>
        </header>
      </SafeMotion>

      <SafeMotion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.15 }"
      >
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <SafeMotion
            v-for="(stat, index) in stats"
            :key="stat.label"
            :initial="{ opacity: 0, scale: 0.95 }"
            :animate="{ opacity: 1, scale: 1 }"
            :transition="{ duration: 0.3, delay: 0.2 + index * 0.06 }"
          >
            <div class="rounded-xl bg-elevated/50 ring ring-default p-4 text-center">
              <div class="text-2xl font-bold tabular-nums" :class="stat.color">
                {{ stat.value }}
              </div>
              <div class="text-xs text-muted mt-1">
                {{ stat.label }}
              </div>
            </div>
          </SafeMotion>
        </div>
      </SafeMotion>

      <SafeMotion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.3 }"
      >
        <ContentRenderer
          v-if="page"
          :key="`${isTranslatedView ? currentLocale : sourceLocale || 'source'}-${translation.state.value}`"
          :value="(page as any)"
        />
      </SafeMotion>
    </article>

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
