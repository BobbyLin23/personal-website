<script setup lang="ts">
import type { Moment } from '~/types/moments'

const props = defineProps<{
  moment: Moment
  index: number
  isOwner?: boolean
}>()

const emit = defineEmits<{
  liked: [moment: Moment, liked: boolean, likeCount: number]
  'comment-count': [moment: Moment, count: number]
  deleted: [moment: Moment]
}>()

const { t, localeProperties } = useI18n()
const toast = useToast()
const { loggedIn } = useUserSession()
const { openLoginModal } = useLoginModal()

const likePending = ref(false)
const showComments = ref(false)
const showDeleteModal = ref(false)
const deletePending = ref(false)

const locale = computed(() => localeProperties.value.language || 'en')

function formatRelativeTime(timestamp: number) {
  const delta = timestamp - Date.now()
  const abs = Math.abs(delta)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (abs < minute) return t('thoughts.justNow')
  if (abs < hour) return t('thoughts.minutesAgo', { count: Math.round(abs / minute) })
  if (abs < day) return t('thoughts.hoursAgo', { count: Math.round(abs / hour) })
  if (abs < 30 * day) return t('thoughts.daysAgo', { count: Math.round(abs / day) })

  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(new Date(timestamp))
}

async function toggleLike() {
  if (!loggedIn.value) {
    openLoginModal()
    return
  }
  if (likePending.value) return
  likePending.value = true
  try {
    const result = await $fetch<{ liked: boolean; likeCount: number }>(
      `/api/thoughts/${props.moment.id}/like`,
      { method: 'POST' },
    )
    emit('liked', props.moment, result.liked, result.likeCount)
  } catch {
    toast.add({
      title: t('thoughts.publishError'),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    likePending.value = false
  }
}

function toggleComments() {
  if (!loggedIn.value) {
    openLoginModal()
    return
  }
  showComments.value = !showComments.value
}

async function deleteMoment() {
  if (deletePending.value) return
  deletePending.value = true
  try {
    await $fetch(`/api/thoughts/${props.moment.id}`, { method: 'DELETE' })
    showDeleteModal.value = false
    toast.add({
      title: t('thoughts.deleteSuccess'),
      icon: 'i-lucide-circle-check',
      color: 'success',
    })
    emit('deleted', props.moment)
  } catch {
    toast.add({
      title: t('thoughts.deleteError'),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    deletePending.value = false
  }
}
</script>

<template>
  <article
    class="rounded-xl bg-elevated/50 ring ring-default p-5 sm:p-6 transition-shadow hover:shadow-sm"
  >
    <header class="mb-3 flex items-center gap-3">
      <UAvatar :src="moment.author.image ?? undefined" :alt="moment.author.name" size="md" />
      <div class="min-w-0">
        <div class="flex items-center gap-x-2">
          <span class="font-medium text-highlighted">{{ moment.author.name }}</span>
          <time
            class="text-xs text-muted tabular-nums"
            :datetime="new Date(moment.createdAt).toISOString()"
          >
            {{ formatRelativeTime(moment.createdAt) }}
          </time>
        </div>
      </div>
      <UButton
        v-if="isOwner"
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-lucide-trash-2"
        class="ml-auto text-muted hover:text-error"
        :aria-label="t('thoughts.delete')"
        @click="showDeleteModal = true"
      />
    </header>

    <div
      v-if="moment.content"
      class="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-toned"
    >
      {{ moment.content }}
    </div>

    <div v-if="moment.images.length" class="mt-3 grid gap-2">
      <template v-if="moment.images.length === 1">
        <NuxtImg
          :src="moment.images[0]"
          :alt="`Image from ${moment.author.name}`"
          class="aspect-video w-full max-w-md rounded-lg object-cover ring ring-default"
          loading="lazy"
        />
      </template>
      <template v-else-if="moment.images.length <= 4">
        <div class="grid grid-cols-2 gap-2">
          <NuxtImg
            v-for="image in moment.images.slice(0, 4)"
            :key="image"
            :src="image"
            :alt="`Image from ${moment.author.name}`"
            class="aspect-square rounded-lg object-cover ring ring-default"
            loading="lazy"
          />
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-3 gap-2">
          <NuxtImg
            v-for="image in moment.images.slice(0, 9)"
            :key="image"
            :src="image"
            :alt="`Image from ${moment.author.name}`"
            class="aspect-square rounded-lg object-cover ring ring-default"
            loading="lazy"
          />
        </div>
      </template>
    </div>

    <div v-if="moment.movie" class="mt-3">
      <MovieCard :movie="moment.movie" />
    </div>

    <div v-if="moment.link" class="mt-3">
      <LinkCard :link="moment.link" />
    </div>

    <footer class="mt-4 flex items-center justify-between border-t border-default pt-3">
      <div class="flex items-center gap-4 text-sm">
        <button
          type="button"
          class="flex items-center gap-1.5 transition-colors"
          :class="moment.likedByMe ? 'text-primary' : 'text-muted hover:text-highlighted'"
          @click="toggleLike"
        >
          <UIcon
            :name="moment.likedByMe ? 'i-lucide-heart' : 'i-lucide-heart'"
            class="size-4"
            :class="{ 'fill-current': moment.likedByMe }"
          />
          <span class="tabular-nums">{{ moment.likeCount || '' }}</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 text-muted transition-colors hover:text-highlighted"
          @click="toggleComments"
        >
          <UIcon name="i-lucide-message-circle" class="size-4" />
          <span class="tabular-nums">{{ moment.commentCount || '' }}</span>
        </button>
      </div>
    </footer>

    <ClientOnly v-if="showComments">
      <div class="mt-4 border-t border-default pt-4">
        <PostComments
          :post-path="`/thoughts/${moment.id}`"
          @count="($event: number) => emit('comment-count', moment, $event)"
        />
      </div>
      <template #fallback>
        <div class="mt-4 h-24 rounded-lg border border-default bg-elevated/40" />
      </template>
    </ClientOnly>

    <UModal v-model:open="showDeleteModal" :title="t('thoughts.deleteConfirmTitle')">
      <template #body>
        <p class="text-sm text-toned">{{ t('thoughts.deleteConfirmDescription') }}</p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            :label="t('thoughts.cancel')"
            :disabled="deletePending"
            @click="showDeleteModal = false"
          />
          <UButton
            size="sm"
            color="error"
            :label="t('thoughts.delete')"
            :loading="deletePending"
            @click="deleteMoment"
          />
        </div>
      </template>
    </UModal>
  </article>
</template>
