<script setup lang="ts">
import { MOMENT_TMDB_IMAGE_BASE } from '#shared/moments'

interface MoviePayload {
  id: number
  title: string
  year: string
  overview: string
  posterPath: string | null
  rating: number
  genres: string[]
}

const props = defineProps<{
  movie: MoviePayload
}>()

const posterUrl = computed(() =>
  props.movie.posterPath ? `${MOMENT_TMDB_IMAGE_BASE}/w342${props.movie.posterPath}` : null,
)

function gradientChip(index: number) {
  const hues = ['33', '205', '150', '25', '340']
  return `hsl(${hues[index % hues.length]} 70% 55% / 0.16)`
}
</script>

<template>
  <a
    :href="`https://www.themoviedb.org/movie/${movie.id}`"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex gap-4 rounded-lg border border-default bg-elevated/40 p-3 transition-colors hover:border-primary/40 hover:bg-elevated/60"
  >
    <div
      v-if="posterUrl"
      class="h-28 w-20 shrink-0 overflow-hidden rounded-md bg-default ring ring-default"
    >
      <NuxtImg
        :src="posterUrl"
        :alt="movie.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
    <div v-else class="h-28 w-20 shrink-0 rounded-md bg-default ring ring-default" />

    <div class="min-w-0 flex-1">
      <div class="mb-1 flex items-baseline gap-x-2">
        <span class="text-[11px] font-medium uppercase tracking-wide text-muted"
          >TV · {{ movie.year }}</span
        >
      </div>
      <h4 class="font-semibold text-highlighted leading-snug">{{ movie.title }}</h4>
      <p class="mt-1 line-clamp-3 text-sm text-toned leading-relaxed">
        {{ movie.overview }}
      </p>
      <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="flex items-center gap-1 text-xs text-muted">
          <UIcon name="i-lucide-star" class="size-3.5 text-primary" />
          {{ movie.rating.toFixed(1) }}
        </span>
        <span v-if="movie.genres.length" class="text-xs text-muted">
          {{ movie.genres.join(' · ') }}
        </span>
      </div>
    </div>
  </a>
</template>
