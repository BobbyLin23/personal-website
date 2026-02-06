<script setup lang="ts">
useSeoMeta({
  title: 'Blog',
  description: 'Thoughts on web development, design, and technology.',
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <UContainer class="py-10 sm:py-16">
    <!-- Page Header -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5 }"
    >
      <div class="mb-12">
        <h1 class="text-3xl font-bold tracking-tight mb-3">
          Blog
        </h1>
        <p class="text-muted">
          Thoughts on web development, design, and technology.
        </p>
      </div>
    </Motion>

    <!-- Posts grouped by year -->
    <div v-if="postsByYear.length">
      <Motion
        v-for="(group, groupIndex) in postsByYear"
        :key="group.year"
        :initial="{ opacity: 0, y: 30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 + groupIndex * 0.15 }"
      >
        <section class="mb-12 mt-6">
          <h2 class="text-xl font-semibold text-muted uppercase tracking-widest mb-4">
            {{ group.year }}
          </h2>

          <div class="space-y-1">
            <NuxtLink
              v-for="(post, postIndex) in group.posts"
              :key="post.path"
              :to="post.path"
              class="group flex items-center justify-between py-3.5 px-4 -mx-4 rounded-lg hover:bg-elevated/50 transition-colors"
            >
              <Motion
                :initial="{ opacity: 0, x: -20 }"
                :animate="{ opacity: 1, x: 0 }"
                :transition="{ duration: 0.4, delay: 0.2 + groupIndex * 0.15 + postIndex * 0.05 }"
                class="flex-1 min-w-0"
              >
                <span class="text-base font-medium group-hover:text-primary transition-colors truncate block">
                  {{ post.title }}
                </span>
              </Motion>
              <time class="text-sm text-muted ml-4 shrink-0">
                {{ formatDate(post.date) }}
              </time>
            </NuxtLink>
          </div>
        </section>
      </Motion>
    </div>
  </UContainer>
</template>
