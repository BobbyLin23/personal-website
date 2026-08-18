<script setup lang="ts">
import { computed } from 'vue'
import { MdPreview } from 'md-editor-v3'
import DOMPurify from 'dompurify'
import 'md-editor-v3/lib/style.css'
import 'md-editor-v3/lib/preview.css'

interface CommentItem {
  id: string
  postPath: string
  body: string
  createdAt: number
  updatedAt: number
  userId: string
  authorName: string
  authorImage: string | null
}

const COMMENT_MAX_LENGTH = 500

const props = defineProps<{
  postPath: string
}>()

const { t, localeProperties } = useI18n()
const toast = useToast()
const { user, loggedIn } = useUserSession()
const { openLoginModal } = useLoginModal()
const colorMode = useColorMode()

const draft = ref('')
const editingId = ref<string | null>(null)
const editDraft = ref('')
const deletingComment = ref<CommentItem | null>(null)
const submitting = ref(false)
const confirmDeleteOpen = computed({
  get: () => Boolean(deletingComment.value),
  set: (value: boolean) => {
    if (!value) deletingComment.value = null
  },
})

const { data, refresh, status } = useFetch<{ comments: CommentItem[] }>('/api/comments', {
  query: computed(() => ({ postPath: props.postPath })),
  key: computed(() => `comments-${props.postPath}`),
  default: () => ({ comments: [] }),
  server: false,
})

const comments = computed(() => data.value?.comments ?? [])

const theme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))

function sanitize(html: string) {
  return DOMPurify.sanitize(html)
}

function isOwnComment(comment: CommentItem) {
  return loggedIn.value && user.value?.id === comment.userId
}

function isEdited(comment: CommentItem) {
  return comment.updatedAt > comment.createdAt
}

function formatRelativeTime(timestamp: number) {
  const delta = timestamp - Date.now()
  const abs = Math.abs(delta)
  const language = localeProperties.value.language || 'en'
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (abs < hour) return rtf.format(Math.round(delta / minute), 'minute')
  if (abs < day) return rtf.format(Math.round(delta / hour), 'hour')
  if (abs < 30 * day) return rtf.format(Math.round(delta / day), 'day')
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(timestamp))
}

function showError(key: string) {
  toast.add({
    title: t(key),
    color: 'error',
    icon: 'i-lucide-circle-alert',
  })
}

async function submitComment() {
  if (!loggedIn.value) {
    openLoginModal()
    return
  }

  const body = draft.value.trim()
  if (!body) return
  if (body.length > COMMENT_MAX_LENGTH) {
    showError('comments.tooLong')
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/comments', {
      method: 'POST',
      body: { postPath: props.postPath, body },
    })
    draft.value = ''
    await refresh()
  } catch {
    showError('comments.postError')
  } finally {
    submitting.value = false
  }
}

function startEdit(comment: CommentItem) {
  editingId.value = comment.id
  editDraft.value = comment.body
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = ''
}

async function saveEdit(comment: CommentItem) {
  const body = editDraft.value.trim()
  if (!body) return
  if (body.length > COMMENT_MAX_LENGTH) {
    showError('comments.tooLong')
    return
  }

  submitting.value = true
  try {
    await $fetch(`/api/comments/${comment.id}`, {
      method: 'PATCH',
      body: { body },
    })
    cancelEdit()
    await refresh()
  } catch {
    showError('comments.updateError')
  } finally {
    submitting.value = false
  }
}

async function deleteComment(comment: CommentItem) {
  submitting.value = true
  try {
    await $fetch(`/api/comments/${comment.id}`, { method: 'DELETE' })
    deletingComment.value = null
    await refresh()
  } catch {
    showError('comments.deleteError')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mt-16 border-t border-default pt-10" aria-labelledby="comments-title">
    <h2 id="comments-title" class="text-lg font-semibold text-highlighted mb-6">
      {{ t('comments.title') }}
    </h2>

    <div v-if="loggedIn" class="mb-8">
      <ClientOnly>
        <CommentEditor
          v-model="draft"
          :max-length="COMMENT_MAX_LENGTH"
          preview-id="comment-preview-draft"
          :placeholder="t('comments.placeholder')"
        >
          <template #actions>
            <UButton
              size="sm"
              color="primary"
              :label="t('comments.submit')"
              :loading="submitting"
              :disabled="submitting || !draft.trim()"
              @click="submitComment"
            />
          </template>
        </CommentEditor>
        <template #fallback>
          <div class="h-36 rounded-lg border border-default bg-elevated/40" />
        </template>
      </ClientOnly>
    </div>
    <button
      v-else
      type="button"
      class="mb-8 w-full rounded-lg border border-default bg-elevated/40 px-4 py-3 text-left text-sm text-muted hover:text-highlighted transition-colors"
      @click="openLoginModal"
    >
      {{ t('comments.loginToComment') }}
    </button>

    <p v-if="status === 'pending'" class="text-sm text-muted">
      {{ t('common.loading') }}
    </p>
    <UAlert
      v-else-if="status === 'error'"
      color="warning"
      variant="subtle"
      :title="t('comments.loadError')"
    />
    <p v-else-if="!comments.length" class="text-sm text-muted">
      {{ t('comments.empty') }}
    </p>
    <ul v-else class="space-y-6">
      <li v-for="comment in comments" :key="comment.id" class="flex gap-3">
        <UAvatar :src="comment.authorImage ?? undefined" :alt="comment.authorName" size="md" />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span class="font-medium text-highlighted">{{ comment.authorName }}</span>
            <time class="text-xs text-muted" :datetime="new Date(comment.createdAt).toISOString()">
              {{ formatRelativeTime(comment.createdAt) }}
            </time>
            <span v-if="isEdited(comment)" class="text-xs text-muted">
              {{ t('comments.edited') }}
            </span>
          </div>

          <ClientOnly v-if="editingId === comment.id">
            <CommentEditor
              v-model="editDraft"
              :max-length="COMMENT_MAX_LENGTH"
              :preview-id="`comment-preview-edit-${comment.id}`"
              class="mt-2"
            >
              <template #actions>
                <UButton
                  size="xs"
                  color="primary"
                  :label="t('comments.save')"
                  :loading="submitting"
                  :disabled="submitting || !editDraft.trim()"
                  @click="saveEdit(comment)"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  :label="t('comments.cancel')"
                  :disabled="submitting"
                  @click="cancelEdit"
                />
              </template>
            </CommentEditor>
            <template #fallback>
              <div class="mt-2 h-36 rounded-lg border border-default bg-elevated/40" />
            </template>
          </ClientOnly>
          <ClientOnly v-else>
            <MdPreview
              v-model="comment.body"
              :id="`comment-preview-${comment.id}`"
              :theme="theme"
              preview-theme="github"
              :sanitize="sanitize"
              :code-foldable="false"
              class="comment-preview mt-2"
            />
            <template #fallback>
              <p class="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-toned">
                {{ comment.body }}
              </p>
            </template>
          </ClientOnly>

          <div
            v-if="isOwnComment(comment) && editingId !== comment.id"
            class="mt-2 flex flex-wrap gap-2"
          >
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              :label="t('comments.edit')"
              :disabled="submitting"
              @click="startEdit(comment)"
            />
            <UButton
              size="xs"
              color="error"
              variant="ghost"
              :label="t('comments.delete')"
              :disabled="submitting"
              @click="deletingComment = comment"
            />
          </div>
        </div>
      </li>
    </ul>

    <UModal
      v-model:open="confirmDeleteOpen"
      :title="t('comments.confirmDeleteTitle')"
      :description="t('comments.confirmDelete')"
    >
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            :label="t('comments.cancel')"
            @click="deletingComment = null"
          />
          <UButton
            color="error"
            :label="t('comments.confirmDeleteAction')"
            :loading="submitting"
            :disabled="!deletingComment"
            @click="deletingComment && deleteComment(deletingComment)"
          />
        </div>
      </template>
    </UModal>
  </section>
</template>

<style scoped>
.comment-preview :deep(.md-editor-preview-wrapper) {
  padding: 0;
}

.comment-preview :deep(.md-editor-preview) {
  font-size: 0.875rem;
}

.comment-preview :deep(.md-editor-preview :where(h1, h2, h3, h4, h5, h6)) {
  font-size: 1rem;
}
</style>
