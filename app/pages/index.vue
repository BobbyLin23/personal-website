<script setup lang="ts">
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
</script>

<template>
  <UContainer class="py-10 sm:py-16">
    <!-- Hero Section -->
    <section class="mb-16 sm:mb-20">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 mb-8">
        <!-- Avatar -->
        <Motion
          :initial="{ scale: 0, rotate: -180 }"
          :animate="{ scale: 1, rotate: 0 }"
          :transition="{ type: 'spring', stiffness: 200, damping: 15 }"
        >
          <UAvatar
            text="BL"
            size="3xl"
            :ui="{
              root: 'ring-4 ring-green-100 dark:ring-green-900/30',
              fallback: 'bg-gradient-to-br from-green-400 to-cyan-400 text-white font-bold',
            }"
          />
        </Motion>

        <div class="text-center sm:text-left">
          <Motion
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Hi, I'm <span class="gradient-text">Bobby Lin</span>
              <span class="inline-block animate-bounce">👋</span>
            </h1>
          </Motion>

          <Motion
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.5, delay: 0.4 }"
          >
            <p class="text-base sm:text-lg text-muted leading-relaxed max-w-xl">
              A passionate full-stack developer focused on building beautiful and performant web applications. Love open source, writing, and sharing knowledge.
            </p>
          </Motion>
        </div>
      </div>

      <!-- Social Links -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.6 }"
      >
        <div class="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
          <UButton
            v-for="link in socialLinks"
            :key="link.label"
            :icon="link.icon"
            :label="link.label"
            :to="link.to"
            target="_blank"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>
      </Motion>
    </section>

    <!-- Recent Blog Posts -->
    <Motion
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6, delay: 0.3 }"
    >
      <section class="mb-16 sm:mb-20">
        <div class="flex items-center justify-between mb-6 sm:mb-8">
          <h2 class="text-lg sm:text-xl font-semibold tracking-tight">
            Recent Posts
          </h2>
          <UButton
            label="View all"
            to="/blog"
            variant="link"
            trailing-icon="i-lucide-arrow-right"
            color="primary"
            size="sm"
          />
        </div>

        <div v-if="recentPosts?.length" class="space-y-1">
          <NuxtLink
            v-for="(post, index) in recentPosts"
            :key="post.path"
            :to="post.path"
            class="group flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 px-4 -mx-4 rounded-lg hover:bg-elevated/50 transition-colors"
          >
            <Motion
              :initial="{ opacity: 0, x: -20 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.4, delay: 0.4 + index * 0.1 }"
              class="flex-1 min-w-0"
            >
              <h3 class="text-sm sm:text-base font-medium group-hover:text-primary transition-colors truncate">
                {{ post.title }}
              </h3>
              <p class="text-sm text-muted mt-1 truncate">
                {{ post.description }}
              </p>
            </Motion>
            <time class="text-xs sm:text-sm text-muted mt-1 sm:mt-0 sm:ml-4 shrink-0">
              {{ post.date }}
            </time>
          </NuxtLink>
        </div>
      </section>
    </Motion>

    <!-- Featured Projects -->
    <Motion
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6, delay: 0.5 }"
    >
      <section class="mb-16 sm:mb-20">
        <div class="flex items-center justify-between mb-6 sm:mb-8">
          <h2 class="text-lg sm:text-xl font-semibold tracking-tight">
            Featured Projects
          </h2>
          <UButton
            label="View all"
            to="/projects"
            variant="link"
            trailing-icon="i-lucide-arrow-right"
            color="primary"
            size="sm"
          />
        </div>

        <div v-if="featuredProjects?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          <Motion
            v-for="(project, index) in featuredProjects"
            :key="project.id"
            class="h-full"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.4, delay: 0.6 + index * 0.15 }"
          >
            <UPageCard
              class="h-full"
              :title="project.name"
              :description="project.description"
              :icon="project.icon"
              :to="project.url"
              target="_blank"
              :ui="{
                root: 'hover-lift h-full flex flex-col',
                leading: project.iconBg,
                leadingIcon: project.iconColor,
                description: 'line-clamp-2',
              }"
            >
              <template #footer>
                <div class="flex items-center gap-3 text-xs text-muted">
                  <span class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded-full" :class="project.languageColor" />
                    {{ project.language }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-star" class="size-3" />
                    {{ project.stars }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-git-fork" class="size-3" />
                    {{ project.forks }}
                  </span>
                </div>
              </template>
            </UPageCard>
          </Motion>
        </div>
      </section>
    </Motion>
  </UContainer>
</template>
