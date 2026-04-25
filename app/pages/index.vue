<script setup lang="ts">
const config = useRuntimeConfig()
const { t, locale } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => `Bobby Lin - ${t('home.role')}`,
  description: () => t('home.bio'),
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}/` : undefined,
})

const { data: recentPosts } = await useAsyncData('recent-posts', () =>
  queryCollection('blog')
    .select('title', 'description', 'date', 'path', 'stem')
    .order('date', 'DESC')
    .limit(4)
    .all())

const { data: featuredProjects } = await useAsyncData('featured-projects', () =>
  queryCollection('projects')
    .where('featured', '=', true)
    .all())

const socialLinks = [
  { icon: 'i-simple-icons-github', label: 'GitHub', to: 'https://github.com/bobbylin23' },
  { icon: 'i-simple-icons-x', label: 'Twitter', to: 'https://x.com/BobbyLin23' },
  { icon: 'i-lucide-mail', label: 'Email', to: 'mailto:linzhangsheng23@gmail.com' },
]

const postDateFormatter = computed(() => new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}))

function formatPostDate(iso: string) {
  return postDateFormatter.value.format(new Date(iso))
}
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <!-- Hero Section -->
    <section class="mb-24 sm:mb-32">
      <SafeMotion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6 }"
      >
        <p class="text-sm font-medium tracking-widest uppercase text-muted mb-4">
          {{ t('home.role') }}
        </p>
      </SafeMotion>

      <SafeMotion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.7, delay: 0.1 }"
      >
        <h1 class="display-heading text-4xl sm:text-5xl lg:text-6xl mb-6">
          {{ t('site.name') }}
        </h1>
      </SafeMotion>

      <SafeMotion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.25 }"
      >
        <p class="text-base sm:text-lg text-muted leading-relaxed max-w-lg">
          {{ t('home.bio') }}
        </p>
      </SafeMotion>

      <SafeMotion
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.4 }"
      >
        <div class="flex items-center gap-3 mt-8">
          <UButton
            v-for="link in socialLinks"
            :key="link.label"
            :icon="link.icon"
            :to="link.to"
            target="_blank"
            color="neutral"
            variant="ghost"
            size="lg"
            :aria-label="link.label"
          />
        </div>
      </SafeMotion>
    </section>

    <!-- Recent Blog Posts -->
    <SafeMotion
      :initial="{ opacity: 0, y: 24 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6, delay: 0.2 }"
    >
      <section class="mb-24 sm:mb-32">
        <div class="flex items-baseline justify-between mb-8 sm:mb-10">
          <h2 class="display-heading text-2xl sm:text-3xl">
            {{ t('home.writing') }}
          </h2>
          <NuxtLink
            :to="localePath('/blog')"
            class="text-sm text-muted hover:text-primary transition-colors"
          >
            {{ t('home.viewAll') }} &rarr;
          </NuxtLink>
        </div>

        <div v-if="recentPosts?.length" class="divide-y divide-default">
          <NuxtLink
            v-for="(post, index) in recentPosts"
            :key="post.path"
            :to="localePath(post.path)"
            class="group block py-5 first:pt-0 last:pb-0"
          >
            <SafeMotion
              :initial="{ opacity: 0, x: -12 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.4, delay: 0.3 + index * 0.08 }"
            >
              <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <h3 class="text-base font-medium group-hover:text-primary transition-colors">
                  {{ post.title }}
                </h3>
                <time
                  class="text-sm text-muted shrink-0 tabular-nums"
                  :datetime="post.date"
                >
                  {{ formatPostDate(post.date) }}
                </time>
              </div>
              <p v-if="post.description" class="text-sm text-muted mt-1.5 line-clamp-1">
                {{ post.description }}
              </p>
            </SafeMotion>
          </NuxtLink>
        </div>
        <p v-else class="text-sm text-muted py-12 text-center">
          {{ t('home.noPosts') }}
        </p>
      </section>
    </SafeMotion>

    <!-- Featured Projects -->
    <SafeMotion
      :initial="{ opacity: 0, y: 24 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6, delay: 0.3 }"
    >
      <section>
        <div class="flex items-baseline justify-between mb-8 sm:mb-10">
          <h2 class="display-heading text-2xl sm:text-3xl">
            {{ t('home.projects') }}
          </h2>
          <NuxtLink
            :to="localePath('/projects')"
            class="text-sm text-muted hover:text-primary transition-colors"
          >
            {{ t('home.viewAll') }} &rarr;
          </NuxtLink>
        </div>

        <div
          v-if="featuredProjects?.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <SafeMotion
            v-for="(project, index) in featuredProjects"
            :key="project.id"
            class="h-full"
            :initial="{ opacity: 0, y: 16 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.4, delay: 0.4 + index * 0.1 }"
          >
            <NuxtLink
              :to="project.url"
              target="_blank"
              class="hover-lift group block h-full rounded-xl ring ring-default bg-default p-5"
            >
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  :class="project.iconBg"
                >
                  <UIcon :name="project.icon" class="size-4.5" :class="project.iconColor" />
                </div>
                <h3 class="font-semibold text-sm text-highlighted group-hover:text-primary transition-colors">
                  {{ project.name }}
                </h3>
              </div>
              <p class="text-sm text-muted line-clamp-2 mb-4">
                {{ project.description }}
              </p>
              <div class="flex items-center gap-3 text-xs text-muted">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full" :class="project.languageColor" />
                  {{ project.language }}
                </span>
                <span class="flex items-center gap-1 tabular-nums">
                  <UIcon name="i-lucide-star" class="size-3" aria-hidden="true" />
                  {{ project.stars }}
                </span>
              </div>
            </NuxtLink>
          </SafeMotion>
        </div>
        <p v-else class="text-sm text-muted py-12 text-center">
          {{ t('home.noProjects') }}
        </p>
      </section>
    </SafeMotion>
  </UContainer>
</template>
