<script setup lang="ts">
const config = useRuntimeConfig()
useSeoMeta({
  title: 'Projects',
  description: 'Open source projects and tools I\'ve built or contributed to.',
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}/projects` : undefined,
})

const { data: projects } = await useAsyncData('all-projects', () =>
  queryCollection('projects').all())
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
          Projects
        </h1>
        <p class="text-muted text-base sm:text-lg max-w-lg">
          Open source projects and tools I've built or contributed to.
        </p>
      </div>
    </SafeMotion>

    <div
      v-if="projects && projects.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      <SafeMotion
        v-for="(project, index) in projects"
        :key="project.id"
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: 0.1 + index * 0.08 }"
      >
        <div class="hover-lift group rounded-xl ring ring-default bg-default p-6 h-full flex flex-col">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :class="project.iconBg"
              >
                <UIcon :name="project.icon" class="size-4.5" :class="project.iconColor" />
              </div>
              <h3 class="font-semibold text-base text-highlighted group-hover:text-primary transition-colors">
                {{ project.name }}
              </h3>
            </div>
            <div class="flex items-center gap-1">
              <UButton
                v-if="project.github"
                :to="project.github"
                target="_blank"
                icon="i-simple-icons-github"
                color="neutral"
                variant="ghost"
                size="xs"
                aria-label="Source Code"
              />
              <UButton
                v-if="project.demo"
                :to="project.demo"
                target="_blank"
                icon="i-lucide-external-link"
                color="neutral"
                variant="ghost"
                size="xs"
                aria-label="Live Demo"
              />
            </div>
          </div>

          <p class="text-sm text-muted mb-4 flex-1">
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
            <span class="flex items-center gap-1 tabular-nums">
              <UIcon name="i-lucide-git-fork" class="size-3" aria-hidden="true" />
              {{ project.forks }}
            </span>
          </div>
        </div>
      </SafeMotion>
    </div>

    <p
      v-else-if="projects && projects.length === 0"
      class="text-sm text-muted py-16 text-center"
    >
      No projects listed yet.
    </p>
  </UContainer>
</template>
