<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('weekly').path(route.path).first())

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Weekly not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings('weekly', route.path, {
    fields: ['title', 'description', 'date', 'week'],
  }))

const config = useRuntimeConfig()
useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}${route.path}` : undefined,
})

const fmtFull = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})
const fmtShort = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
})

function formatDateRange(dateStr: string) {
  const end = new Date(dateStr)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  if (start.getFullYear() === end.getFullYear()) {
    return `${fmtShort.format(start)} - ${fmtFull.format(end)}`
  }
  return `${fmtFull.format(start)} - ${fmtFull.format(end)}`
}

function formatWeekNumber(week: number): string {
  return `W${String(week).padStart(2, '0')}`
}

const stats = computed(() => [
  { value: page.value?.commits ?? 0, label: 'Commits', color: 'text-amber-600 dark:text-amber-400' },
  { value: page.value?.prs ?? 0, label: 'PRs Merged', color: 'text-sky-600 dark:text-sky-400' },
  { value: page.value?.blogs ?? 0, label: 'Blog Published', color: 'text-violet-600 dark:text-violet-400' },
  { value: page.value?.books ?? 0, label: 'Books Read', color: 'text-rose-600 dark:text-rose-400' },
])
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <SafeMotion
      :initial="{ opacity: 0, x: -8 }"
      :animate="{ opacity: 1, x: 0 }"
      :transition="{ duration: 0.3 }"
    >
      <NuxtLink
        to="/weekly"
        class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-highlighted transition-colors mb-12"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        Back to Weekly
      </NuxtLink>
    </SafeMotion>

    <article>
      <SafeMotion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
      >
        <header class="mb-12">
          <div class="flex items-center gap-3 mb-5">
            <UBadge
              :label="formatWeekNumber(page?.week ?? 0)"
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
        <ContentRenderer v-if="page" :value="page" />
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
