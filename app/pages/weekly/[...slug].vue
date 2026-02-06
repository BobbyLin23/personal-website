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

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
})

function formatDateRange(dateStr: string) {
  const end = new Date(dateStr)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  const fmtFull = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const fmtShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  if (start.getFullYear() === end.getFullYear()) {
    return `${fmtShort(start)} - ${fmtFull(end)}`
  }
  return `${fmtFull(start)} - ${fmtFull(end)}`
}

function formatWeekNumber(week: number): string {
  return `W${String(week).padStart(2, '0')}`
}

const stats = computed(() => [
  { value: page.value?.commits ?? 0, label: 'Commits', color: 'text-primary' },
  { value: page.value?.prs ?? 0, label: 'PRs Merged', color: 'text-blue-500' },
  { value: page.value?.blogs ?? 0, label: 'Blog Published', color: 'text-purple-500' },
  { value: page.value?.books ?? 0, label: 'Books Read', color: 'text-orange-500' },
])
</script>

<template>
  <UContainer class="py-10 sm:py-16">
    <!-- Back Link -->
    <Motion
      :initial="{ opacity: 0, x: -10 }"
      :animate="{ opacity: 1, x: 0 }"
      :transition="{ duration: 0.3 }"
    >
      <UButton
        to="/weekly"
        variant="link"
        color="neutral"
        icon="i-lucide-arrow-left"
        label="Back to Weekly"
        class="mb-8 -ml-2.5"
      />
    </Motion>

    <!-- Article -->
    <article>
      <!-- Header -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
      >
        <header class="mb-10">
          <div class="flex items-center gap-3 mb-4">
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
          <h1 class="text-3xl font-bold tracking-tight mb-2">
            {{ page?.title }}
          </h1>
          <p class="text-muted">
            {{ page?.description }}
          </p>
        </header>
      </Motion>

      <!-- Stats Summary -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.15 }"
      >
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Motion
            v-for="(stat, index) in stats"
            :key="stat.label"
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="{ opacity: 1, scale: 1 }"
            :transition="{ duration: 0.3, delay: 0.2 + index * 0.08 }"
          >
            <div class="rounded-xl bg-elevated/50 ring ring-default p-4 text-center">
              <div class="text-2xl font-bold" :class="stat.color">
                {{ stat.value }}
              </div>
              <div class="text-xs text-muted mt-1">
                {{ stat.label }}
              </div>
            </div>
          </Motion>
        </div>
      </Motion>

      <!-- Markdown Content -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.3 }"
      >
        <ContentRenderer v-if="page" :value="page" />
      </Motion>
    </article>

    <!-- Prev / Next Navigation -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.4 }"
    >
      <UContentSurround
        :surround="(surround as any)"
        class="mt-16"
      />
    </Motion>
  </UContainer>
</template>
