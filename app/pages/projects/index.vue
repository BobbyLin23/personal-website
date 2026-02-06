<script setup lang="ts">
useSeoMeta({
  title: 'Projects',
  description: 'Open source projects and tools I\'ve built or contributed to.',
})

const { data: projects } = await useAsyncData('all-projects', () =>
  queryCollection('projects').all())

if (!projects.value) {
  throw createError({ statusCode: 404, statusMessage: 'Projects not found', fatal: true })
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
          Projects
        </h1>
        <p class="text-muted">
          Open source projects and tools I've built or contributed to.
        </p>
      </div>
    </Motion>

    <!-- Projects Grid -->
    <div v-if="projects?.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Motion
        v-for="(project, index) in projects"
        :key="project.id"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: 0.1 + index * 0.1 }"
      >
        <div class="hover-lift group rounded-xl ring ring-default bg-default p-6 h-full flex flex-col">
          <!-- Top: Icon + Name + Links -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                :class="project.iconBg"
              >
                <UIcon :name="project.icon" class="size-5" :class="project.iconColor" />
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

          <!-- Description -->
          <p class="text-sm text-muted mb-4 flex-1">
            {{ project.description }}
          </p>

          <!-- Footer: Language + Stars + Forks -->
          <div class="flex items-center gap-3 text-xs text-muted">
            <span class="flex items-center gap-1.5">
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
        </div>
      </Motion>
    </div>
  </UContainer>
</template>
