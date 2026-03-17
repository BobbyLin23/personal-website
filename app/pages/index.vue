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

const quickFacts = [
  { icon: 'i-lucide-code-2', label: 'Core stack', value: 'Nuxt, Vue, TypeScript, Node.js' },
  { icon: 'i-lucide-bot', label: 'Current focus', value: 'AI-assisted developer experience and tooling' },
  { icon: 'i-lucide-map-pin', label: 'Work mode', value: 'Remote-friendly collaboration' },
]
</script>

<template>
  <UContainer class="py-8 sm:py-12">
    <section class="home-hero mb-16 sm:mb-24">
      <div class="home-hero-grid">
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5 }"
          class="home-hero-left"
        >
          <p class="home-eyebrow">
            Full-stack developer
          </p>
          <h1 class="home-title">
            Bobby Lin
          </h1>
          <p class="home-tagline">
            Building fast products with thoughtful interfaces.
          </p>
          <p class="home-hook">
            I design and ship end-to-end products, from backend APIs to polished frontend experiences, with a strong focus on clarity, performance, and maintainability.
          </p>

          <div class="home-details-box">
            <span class="home-details-title">Approach</span>
            <ul class="home-details-items">
              <li v-for="principle in heroPrinciples" :key="principle">
                {{ principle }}
              </li>
            </ul>
          </div>

          <div class="home-cta-group">
            <UButton
              label="View projects"
              to="/projects"
              trailing-icon="i-lucide-arrow-right"
              size="md"
              class="home-primary-cta"
            />
            <UButton
              label="Read blog"
              to="/blog"
              variant="ghost"
              color="neutral"
              size="md"
            />
          </div>

          <div class="home-social-row">
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
          class="home-hero-right"
        >
          <div class="home-profile-panel">
            <article class="home-profile-card">
              <p class="home-profile-eyebrow">
                At a glance
              </p>
              <h2 class="home-profile-title">
                What I build
              </h2>
              <p class="home-profile-body">
                Product-focused web apps, developer tools, and reliable backend services that scale with team and user needs.
              </p>
              <ul class="home-highlights-list">
                <li v-for="fact in quickFacts" :key="fact.label" class="home-highlights-item">
                  <UIcon :name="fact.icon" class="home-highlights-icon" />
                  <div>
                    <p class="home-highlights-label">
                      {{ fact.label }}
                    </p>
                    <p class="home-highlights-value">
                      {{ fact.value }}
                    </p>
                  </div>
                </li>
              </ul>
              <div class="home-profile-actions">
                <UButton
                  label="Open GitHub"
                  icon="i-simple-icons-github"
                  to="https://github.com/bobbylin23"
                  target="_blank"
                  size="sm"
                />
                <UButton
                  label="Email me"
                  icon="i-lucide-mail"
                  to="mailto:linzhangsheng23@gmail.com"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                />
              </div>
            </article>
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
        <div class="home-section-head">
          <h2 class="home-section-title">
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

        <div v-if="recentPosts?.length" class="home-list">
          <NuxtLink
            v-for="(post, index) in recentPosts"
            :key="post.path"
            :to="post.path"
            class="home-post-row"
          >
            <Motion
              :initial="{ opacity: 0, x: -20 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.4, delay: 0.4 + index * 0.1 }"
              class="flex-1 min-w-0"
            >
              <h3 class="home-post-title">
                {{ post.title }}
              </h3>
              <p class="home-post-description">
                {{ post.description }}
              </p>
            </Motion>
            <time class="home-post-time">
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
        <div class="home-section-head">
          <h2 class="home-section-title">
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
            class="h-full home-project-card"
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
