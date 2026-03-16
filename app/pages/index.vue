<script setup lang="ts">
const config = useRuntimeConfig()
useSeoMeta({
  title: 'Bobby Lin - Full Stack Developer',
  description: 'A passionate full-stack developer focused on building beautiful and performant web applications. Love open source, writing, and sharing knowledge.',
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

const heroPrinciples = [
  'Production-first engineering',
  'Clear hierarchy and spacing',
  'Accessible, responsive interfaces',
]
</script>

<template>
  <UContainer class="py-8 sm:py-12">
    <section class="impeccable-hero mb-16 sm:mb-24">
      <div class="impeccable-hero-grid">
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5 }"
          class="impeccable-hero-left"
        >
          <p class="impeccable-eyebrow">
            Full-stack developer
          </p>
          <h1 class="impeccable-title">
            Bobby Lin
          </h1>
          <p class="impeccable-tagline">
            Building fast products with thoughtful interfaces.
          </p>
          <p class="impeccable-hook">
            I design and ship end-to-end products, from backend APIs to polished frontend experiences, with a strong focus on clarity, performance, and maintainability.
          </p>

          <div class="impeccable-included-box">
            <span class="impeccable-included-title">Approach</span>
            <ul class="impeccable-included-items">
              <li v-for="principle in heroPrinciples" :key="principle">
                {{ principle }}
              </li>
            </ul>
          </div>

          <div class="impeccable-cta-group">
            <UButton
              label="View projects"
              to="/projects"
              trailing-icon="i-lucide-arrow-right"
              size="md"
              class="impeccable-primary-cta"
            />
            <UButton
              label="Read blog"
              to="/blog"
              variant="ghost"
              color="neutral"
              size="md"
            />
          </div>

          <div class="impeccable-social-row">
            <UButton
              v-for="link in socialLinks"
              :key="link.label"
              :icon="link.icon"
              :label="link.label"
              :to="link.to"
              target="_blank"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </div>
        </Motion>

        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.15 }"
          class="impeccable-hero-right"
        >
          <div class="impeccable-split-comparison">
            <div class="impeccable-split-container">
              <div class="impeccable-split-pane impeccable-split-before">
                <span class="impeccable-split-badge">Before</span>
                <article class="impeccable-demo-card impeccable-demo-before">
                  <p class="impeccable-demo-title">
                    Generic portfolio
                  </p>
                  <p class="impeccable-demo-body">
                    Template copy, weak hierarchy, and unclear action.
                  </p>
                  <button class="impeccable-demo-button" type="button">
                    Get started
                  </button>
                </article>
              </div>

              <div class="impeccable-split-pane impeccable-split-after">
                <span class="impeccable-split-badge impeccable-split-badge-after">After</span>
                <article class="impeccable-demo-card impeccable-demo-after">
                  <p class="impeccable-demo-eyebrow">
                    Introducing
                  </p>
                  <p class="impeccable-demo-title">
                    Thoughtful systems
                  </p>
                  <p class="impeccable-demo-body">
                    Strong hierarchy, better spacing, and meaningful interactions.
                  </p>
                  <button class="impeccable-demo-button impeccable-demo-button-after" type="button">
                    Explore work
                  </button>
                </article>
              </div>

              <div class="impeccable-split-divider" />
            </div>

            <div class="impeccable-split-labels">
              <span>Generic output</span>
              <span>Refined design language</span>
            </div>
          </div>
        </Motion>
      </div>
    </section>

    <Motion
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6, delay: 0.3 }"
    >
      <section class="mb-16 sm:mb-20">
        <div class="impeccable-section-head">
          <h2 class="impeccable-section-title">
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

        <div v-if="recentPosts?.length" class="impeccable-list">
          <NuxtLink
            v-for="(post, index) in recentPosts"
            :key="post.path"
            :to="post.path"
            class="impeccable-post-row"
          >
            <Motion
              :initial="{ opacity: 0, x: -20 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.4, delay: 0.4 + index * 0.1 }"
              class="flex-1 min-w-0"
            >
              <h3 class="impeccable-post-title">
                {{ post.title }}
              </h3>
              <p class="impeccable-post-description">
                {{ post.description }}
              </p>
            </Motion>
            <time class="impeccable-post-time">
              {{ post.date }}
            </time>
          </NuxtLink>
        </div>
        <p v-else class="text-muted">
          No blog posts published yet.
        </p>
      </section>
    </Motion>

    <Motion
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6, delay: 0.5 }"
    >
      <section class="mb-16 sm:mb-20">
        <div class="impeccable-section-head">
          <h2 class="impeccable-section-title">
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
            class="h-full impeccable-project-card"
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
                root: 'h-full flex flex-col',
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
        <p v-else class="text-muted">
          No featured projects yet.
        </p>
      </section>
    </Motion>
  </UContainer>
</template>
