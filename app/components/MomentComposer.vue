<script setup lang="ts">
import type { LinkPayload, Moment, MoviePayload } from '~/types/moments'

const props = defineProps<{
  isOwner: boolean
}>()

const emit = defineEmits<{
  published: [moment: Moment]
}>()

const { t } = useI18n()
const toast = useToast()
const { user, loggedIn } = useUserSession()
const { openLoginModal } = useLoginModal()

const content = ref('')
const images = ref<string[]>([])
const imageUrl = ref('')
const linkUrl = ref('')
const linkTitle = ref('')
const linkDescription = ref('')
const linkImage = ref('')
const movie = ref<MoviePayload | null>(null)
const submitting = ref(false)
const showMovieModal = ref(false)
const movieSearch = ref('')
const movieResults = ref<TmdbMovie[]>([])
const searchingMovie = ref(false)
const showImageInput = ref(false)
const showLinkInput = ref(false)

function toggleImageInput() {
  showImageInput.value = !showImageInput.value
  if (showImageInput.value) showLinkInput.value = false
}

function toggleLinkInput() {
  showLinkInput.value = !showLinkInput.value
  if (showLinkInput.value) showImageInput.value = false
}

interface TmdbMovie {
  id: number
  title: string
  year: string
  overview: string
  posterPath: string | null
  rating: number
  genres: string[]
}

const canSubmit = computed(() => {
  if (submitting.value) return false
  const hasText = content.value.trim().length > 0
  return (
    hasText || images.value.length > 0 || movie.value !== null || linkUrl.value.trim().length > 0
  )
})

function addImage() {
  const url = imageUrl.value.trim()
  if (!url) return
  images.value = [...images.value, url]
  imageUrl.value = ''
}

function removeImage(index: number) {
  images.value = images.value.filter((_, i) => i !== index)
}

async function searchMovie() {
  const query = movieSearch.value.trim()
  if (!query) return
  searchingMovie.value = true
  try {
    const result = await $fetch<{ results: TmdbMovie[] }>('/api/tmdb/search', {
      query: { query },
    })
    movieResults.value = result.results ?? []
  } catch {
    movieResults.value = []
    toast.add({ title: t('thoughts.movieNotFound'), color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    searchingMovie.value = false
  }
}

function selectMovie(selected: TmdbMovie) {
  movie.value = selected
  showMovieModal.value = false
}

function removeMovie() {
  movie.value = null
}

async function publish() {
  if (!loggedIn.value) {
    openLoginModal()
    return
  }

  const payload: {
    content: string
    images: string[]
    movie: MoviePayload | null
    link: LinkPayload | null
  } = {
    content: content.value.trim(),
    images: images.value,
    movie: movie.value,
    link: null,
  }

  const linkUrlTrimmed = linkUrl.value.trim()
  if (linkUrlTrimmed) {
    payload.link = {
      url: linkUrlTrimmed,
      title: linkTitle.value.trim() || linkUrlTrimmed,
      description: linkDescription.value.trim(),
      image: linkImage.value.trim() || null,
      siteName: null,
    }
  }

  submitting.value = true
  try {
    const result = await $fetch<{ moment: Moment }>('/api/thoughts', {
      method: 'POST',
      body: payload,
    })
    emit('published', result.moment)
    content.value = ''
    images.value = []
    imageUrl.value = ''
    linkUrl.value = ''
    linkTitle.value = ''
    linkDescription.value = ''
    linkImage.value = ''
    movie.value = null
  } catch (error) {
    const isRateLimited =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error as { status: unknown }).status === 429
    toast.add({
      title: t(isRateLimited ? 'thoughts.publishRateLimited' : 'thoughts.publishError'),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="isOwner" class="mb-10 rounded-xl bg-elevated/50 ring ring-default p-5 sm:p-6">
    <div class="mb-3 flex items-center gap-3">
      <UAvatar :src="user?.image ?? undefined" :alt="user?.name ?? 'Me'" size="md" />
      <span class="font-medium text-highlighted">{{ t('thoughts.publishLabel') }}</span>
    </div>

    <UTextarea
      v-model="content"
      :placeholder="t('thoughts.placeholder')"
      :maxlength="2000"
      :rows="3"
      autoresize
      class="mb-4 w-full"
    />

    <div v-if="images.length" class="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
      <div v-for="(image, index) in images" :key="image" class="group relative">
        <NuxtImg
          :src="image"
          :alt="`Image ${index + 1}`"
          class="aspect-square rounded-lg object-cover ring ring-default"
        />
        <button
          type="button"
          class="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
          :aria-label="t('thoughts.removeAttachment')"
          @click="removeImage(index)"
        >
          <UIcon name="i-lucide-x" class="size-3.5" />
        </button>
      </div>
    </div>

    <div v-if="movie" class="mb-4">
      <MovieCard :movie="movie" />
      <button
        type="button"
        class="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-error"
        @click="removeMovie"
      >
        <UIcon name="i-lucide-x" class="size-3.5" />
        {{ t('thoughts.removeMovie') }}
      </button>
    </div>

    <div v-if="linkUrl" class="mb-4">
      <LinkCard
        :link="{
          url: linkUrl,
          title: linkTitle || linkUrl,
          description: linkDescription,
          image: linkImage || null,
          siteName: null,
        }"
      />
      <button
        type="button"
        class="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-error"
        @click="linkUrl = ''"
      >
        <UIcon name="i-lucide-x" class="size-3.5" />
        {{ t('thoughts.remove') }}
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <UButton
        size="sm"
        color="neutral"
        icon="i-lucide-image"
        :label="t('thoughts.addImage')"
        :variant="showImageInput ? 'solid' : 'subtle'"
        @click="toggleImageInput"
      />
      <UButton
        size="sm"
        color="neutral"
        variant="subtle"
        icon="i-lucide-film"
        :label="t('thoughts.addMovie')"
        @click="showMovieModal = true"
      />
      <UButton
        size="sm"
        color="neutral"
        icon="i-lucide-link"
        :label="t('thoughts.addLink')"
        :variant="showLinkInput ? 'solid' : 'subtle'"
        @click="toggleLinkInput"
      />

      <div class="flex-1" />

      <UButton
        size="sm"
        color="primary"
        :label="t('thoughts.submit')"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="publish"
      />
    </div>

    <div v-if="showImageInput" class="mt-3 flex gap-2">
      <UInput
        v-model="imageUrl"
        :placeholder="t('thoughts.imageUrl')"
        class="flex-1"
        @keyup.enter="addImage"
      />
      <UButton size="sm" :label="t('thoughts.addImageAction')" @click="addImage" />
    </div>

    <div
      v-if="showLinkInput"
      class="mt-3 space-y-2 rounded-lg border border-default bg-default/40 p-3"
    >
      <UInput v-model="linkUrl" :placeholder="t('thoughts.linkUrl')" />
      <UInput v-model="linkTitle" :placeholder="t('thoughts.linkTitle')" />
      <UInput v-model="linkDescription" placeholder="Description" />
      <UInput v-model="linkImage" :placeholder="t('thoughts.imageUrl')" />
    </div>

    <UModal v-model:open="showMovieModal" :title="t('thoughts.addMovie')">
      <template #body>
        <div class="flex gap-2">
          <UInput
            v-model="movieSearch"
            :placeholder="t('thoughts.movieSearchPlaceholder')"
            class="flex-1"
            @keyup.enter="searchMovie"
          />
          <UButton
            size="sm"
            :label="t('thoughts.movieSearch')"
            :loading="searchingMovie"
            @click="searchMovie"
          />
        </div>
        <ul class="mt-4 space-y-2">
          <li v-for="result in movieResults" :key="result.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg border border-default p-2 text-left transition-colors hover:border-primary/40 hover:bg-elevated/60"
              @click="selectMovie(result)"
            >
              <NuxtImg
                v-if="result.posterPath"
                :src="`https://image.tmdb.org/t/p/w92${result.posterPath}`"
                :alt="result.title"
                class="h-16 w-12 shrink-0 rounded object-cover ring ring-default"
              />
              <div class="min-w-0">
                <div class="font-medium text-highlighted">{{ result.title }}</div>
                <div class="text-xs text-muted">
                  {{ result.year }} · {{ result.rating.toFixed(1) }}
                </div>
              </div>
            </button>
          </li>
          <li
            v-if="!searchingMovie && !movieResults.length && movieSearch"
            class="text-sm text-muted"
          >
            {{ t('thoughts.movieNoResults') }}
          </li>
        </ul>
      </template>
    </UModal>
  </div>
</template>
