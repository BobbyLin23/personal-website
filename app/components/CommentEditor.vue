<script setup lang="ts">
import { computed, ref } from 'vue'
import { MdEditor, MdPreview } from 'md-editor-v3'
import type { ExposeParam } from 'md-editor-v3'
import DOMPurify from 'dompurify'

const props = withDefaults(
  defineProps<{
    modelValue: string
    maxLength: number
    previewId: string
    placeholder?: string
  }>(),
  { placeholder: '' },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const colorMode = useColorMode()

const activeTab = ref<'write' | 'preview'>('write')
const editorRef = ref<ExposeParam | null>(null)

const theme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))
const remaining = computed(() => props.maxLength - props.modelValue.length)

function sanitize(html: string) {
  return DOMPurify.sanitize(html)
}

function applyInsert(
  build: (selected: string) => { text: string; selectFrom: number; selectTo: number },
) {
  const view = editorRef.value?.getEditorView()
  if (!view) return
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const { text, selectFrom, selectTo } = build(selected)
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + selectFrom, head: from + selectTo },
  })
  view.focus()
}

function wrapSelection(prefix: string, suffix = prefix) {
  applyInsert((selected) => ({
    text: `${prefix}${selected}${suffix}`,
    selectFrom: prefix.length,
    selectTo: prefix.length + selected.length,
  }))
}

function wrapQuote() {
  applyInsert((selected) => {
    const quoted =
      selected
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n') || '> '
    return { text: quoted, selectFrom: 0, selectTo: quoted.length }
  })
}

function insertLink() {
  applyInsert((selected) => {
    if (selected) {
      const text = `[${selected}](https://)`
      return {
        text,
        selectFrom: selected.length + 3,
        selectTo: selected.length + 3 + 8,
      }
    }
    const text = `[](https://)`
    return { text, selectFrom: 2, selectTo: 2 + 8 }
  })
}

function insertEmoji(emoji: string) {
  const view = editorRef.value?.getEditorView()
  if (!view) return
  view.dispatch(view.state.replaceSelection(emoji))
  view.focus()
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-default">
    <div
      class="flex items-center justify-between gap-2 border-b border-default bg-elevated/60 pl-2 pr-1.5"
    >
      <div class="flex -mb-px">
        <button
          type="button"
          class="relative -mb-px px-2.5 py-2 text-sm transition-colors"
          :class="
            activeTab === 'write'
              ? 'font-medium text-highlighted'
              : 'text-muted hover:text-highlighted'
          "
          @click="activeTab = 'write'"
        >
          {{ t('comments.write') }}
          <span v-if="activeTab === 'write'" class="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
        </button>
        <button
          type="button"
          class="relative -mb-px px-2.5 py-2 text-sm transition-colors"
          :class="
            activeTab === 'preview'
              ? 'font-medium text-highlighted'
              : 'text-muted hover:text-highlighted'
          "
          @click="activeTab = 'preview'"
        >
          {{ t('comments.preview') }}
          <span
            v-if="activeTab === 'preview'"
            class="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
          />
        </button>
      </div>

      <div class="flex items-center">
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-accented hover:text-highlighted"
            :title="t('comments.toolbar.bold')"
            :aria-label="t('comments.toolbar.bold')"
            @click="wrapSelection('**')"
          >
            <UIcon name="i-lucide-bold" class="size-4" />
          </button>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-accented hover:text-highlighted"
            :title="t('comments.toolbar.italic')"
            :aria-label="t('comments.toolbar.italic')"
            @click="wrapSelection('*')"
          >
            <UIcon name="i-lucide-italic" class="size-4" />
          </button>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-accented hover:text-highlighted"
            :title="t('comments.toolbar.quote')"
            :aria-label="t('comments.toolbar.quote')"
            @click="wrapQuote"
          >
            <UIcon name="i-lucide-text-quote" class="size-4" />
          </button>
        </div>

        <div class="mx-2 h-4 w-px bg-default" />

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-accented hover:text-highlighted"
            :title="t('comments.toolbar.code')"
            :aria-label="t('comments.toolbar.code')"
            @click="wrapSelection('`')"
          >
            <UIcon name="i-lucide-code" class="size-4" />
          </button>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-accented hover:text-highlighted"
            :title="t('comments.toolbar.link')"
            :aria-label="t('comments.toolbar.link')"
            @click="insertLink"
          >
            <UIcon name="i-lucide-link" class="size-4" />
          </button>
        </div>

        <div class="mx-2 h-4 w-px bg-default" />

        <EmojiToolbar :on-emoji-select="insertEmoji" />
      </div>
    </div>

    <div v-show="activeTab === 'write'" class="comment-write-area">
      <MdEditor
        ref="editorRef"
        :model-value="modelValue"
        :theme="theme"
        :preview="false"
        :toolbars="[]"
        :footers="[]"
        :max-length="maxLength"
        :placeholder="placeholder"
        no-upload-img
        no-prettier
        class="comment-write-editor"
        @update:model-value="(value: string) => emit('update:modelValue', value)"
      />
    </div>
    <div v-show="activeTab === 'preview'" class="h-36 overflow-y-auto bg-default px-4 py-3">
      <MdPreview
        :model-value="modelValue"
        :id="previewId"
        :theme="theme"
        preview-theme="github"
        :sanitize="sanitize"
        :code-foldable="false"
        class="comment-preview md-editor-previewOnly"
      />
    </div>

    <div
      class="flex items-center justify-between gap-3 border-t border-default bg-elevated/60 px-3 py-1.5 text-xs text-muted"
    >
      <span class="flex items-center gap-1.5">
        <UIcon name="i-lucide-file-text" class="size-3.5" />
        {{ t('comments.markdownSupported') }}
      </span>
      <span class="flex items-center gap-3">
        <span>{{ t('comments.remaining', { count: remaining }) }}</span>
        <slot name="actions" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.comment-write-editor.md-editor {
  border: none;
  background: transparent;
  height: 144px;
}

.comment-write-editor :deep(.md-editor-content) {
  flex: none;
  height: 144px;
}

.comment-write-editor :deep(.cm-editor) {
  background: transparent;
}

.comment-write-editor :deep(.cm-content) {
  padding-block: 8px;
  padding-inline: 12px;
  color: var(--ui-text-highlighted);
}

.comment-preview.md-editor {
  background: transparent;
}

.comment-preview :deep(.md-editor-preview-wrapper) {
  padding: 0;
}

.comment-preview :deep(.md-editor-preview) {
  font-size: 0.875rem;
  background: transparent;
}

.comment-preview :deep(.md-editor-preview :where(h1, h2, h3, h4, h5, h6)) {
  font-size: 1rem;
}

/* Tailwind preflight resets list markers; restore them for rendered markdown */
.comment-preview :deep(.md-editor-preview ul) {
  list-style: disc;
}

.comment-preview :deep(.md-editor-preview ol) {
  list-style: decimal;
}

.comment-preview :deep(.md-editor-preview ul ul) {
  list-style: circle;
}

.comment-preview :deep(.md-editor-preview ul ul ul) {
  list-style: square;
}
</style>
