<script setup lang="ts">
const config = useRuntimeConfig()
const { t, locale } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('blog.title'),
  description: () => t('blog.description'),
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}/blog` : undefined,
})

const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection('blog')
    .select('title', 'date', 'path', 'stem')
    .order('date', 'DESC')
    .all())

const postsByYear = computed(() => {
  if (!posts.value)
    return []

  const grouped = new Map<string, typeof posts.value>()
  for (const post of posts.value) {
    const year = post.date.slice(0, 4)
    if (!grouped.has(year)) {
      grouped.set(year, [])
    }
    grouped.get(year)!.push(post)
  }

  return Array.from(grouped.entries()).map(([year, items]) => ({
    year,
    posts: items,
  }))
})

const listDateFormatter = computed(() => new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
  month: '2-digit',
  day: '2-digit',
}))

function formatDate(dateStr: string) {
  return listDateFormatter.value.format(new Date(dateStr))
}
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <SafeMotion
      :initial="{ opacity: 0, y: 16 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5 }"
    >
      <div class="mb-16">
        <h1 class="display-heading text-4xl sm:text-5xl mb-4">
          {{ t('blog.title') }}
        </h1>
        <p class="text-muted text-base sm:text-lg max-w-lg">
          {{ t('blog.description') }}
        </p>
      </div>
    </SafeMotion>

    <div v-if="postsByYear.length">
      <SafeMotion
        v-for="(group, groupIndex) in postsByYear"
        :key="group.year"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 + groupIndex * 0.1 }"
      >
        <section class="mb-14">
          <h2 class="text-sm font-medium text-muted tracking-widest uppercase mb-6">
            {{ group.year }}
          </h2>

          <div class="divide-y divide-default">
            <NuxtLink
              v-for="post in group.posts"
              :key="post.path"
              :to="localePath(post.path)"
              class="group flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <span class="text-base font-medium group-hover:text-primary transition-colors truncate">
                {{ post.title }}
              </span>
              <time
                class="text-sm text-muted shrink-0 tabular-nums"
                :datetime="post.date"
              >
                {{ formatDate(post.date) }}
              </time>
            </NuxtLink>
          </div>
        </section>
      </SafeMotion>
    </div>

    <p v-else class="text-sm text-muted py-16 text-center">
      {{ t('blog.empty') }}
    </p>
  </UContainer>
</template>
