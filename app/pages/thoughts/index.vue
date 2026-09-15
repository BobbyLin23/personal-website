<script setup lang="ts">
import type { Moment } from '~/types/moments'

const route = useRoute()
const config = useRuntimeConfig()
const { t } = useI18n()
const toast = useToast()
const { loggedIn } = useUserSession()
const { openLoginModal } = useLoginModal()

useSeoMeta({
  title: () => t('thoughts.title'),
  description: () => t('thoughts.description'),
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}${route.path}` : undefined,
})

const { data, status } = useFetch<{ moments: Moment[]; isOwner: boolean }>('/api/thoughts', {
  key: 'thoughts-feed',
  default: () => ({ moments: [], isOwner: false }),
})

const moments = computed(() => data.value?.moments ?? [])
const isOwner = computed(() => Boolean(data.value?.isOwner))

function handleLiked(moment: Moment, liked: boolean, likeCount: number) {
  const target = moments.value.find((m) => m.id === moment.id)
  if (target) {
    target.likedByMe = liked
    target.likeCount = likeCount
  }
}

function handleCommentCount(moment: Moment, count: number) {
  const target = moments.value.find((m) => m.id === moment.id)
  if (target) target.commentCount = count
}

function handlePublished(moment: Moment) {
  moments.value.unshift(moment)
  toast.add({
    title: t('thoughts.publishLabel'),
    description: t('thoughts.publish'),
    icon: 'i-lucide-circle-check',
    color: 'success',
  })
}

function handleDeleted(moment: Moment) {
  const index = moments.value.findIndex((m) => m.id === moment.id)
  if (index !== -1) moments.value.splice(index, 1)
}
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <div class="mx-auto max-w-2xl">
      <SafeMotion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
      >
        <div class="mb-10">
          <h1 class="display-heading text-4xl sm:text-5xl mb-4">
            {{ t('thoughts.title') }}
          </h1>
          <p class="text-muted text-base sm:text-lg max-w-lg">
            {{ t('thoughts.description') }}
          </p>
        </div>
      </SafeMotion>

      <MomentComposer v-if="isOwner" :is-owner="isOwner" @published="handlePublished" />

      <p v-if="status === 'pending'" class="text-sm text-muted py-16 text-center">
        {{ t('common.loading') }}
      </p>
      <UAlert
        v-else-if="status === 'error'"
        color="warning"
        variant="subtle"
        :title="t('thoughts.publishError')"
      />
      <p v-else-if="!moments.length" class="text-sm text-muted py-16 text-center">
        {{ t('thoughts.emptyState') }}
      </p>
      <div v-else class="space-y-6">
        <SafeMotion
          v-for="(moment, index) in moments"
          :key="moment.id"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: Math.min(0.1 + index * 0.05, 0.4) }"
        >
          <MomentCard
            :moment="moment"
            :index="index"
            :is-owner="isOwner"
            @liked="handleLiked"
            @comment-count="handleCommentCount"
            @deleted="handleDeleted"
          />
        </SafeMotion>
      </div>
    </div>
  </UContainer>
</template>
