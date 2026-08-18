<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  onEmojiSelect?: (emoji: string) => void
}>()

const { t } = useI18n()

const open = ref(false)

const EMOJIS = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '😉',
  '😍',
  '🥰',
  '😘',
  '😜',
  '🤪',
  '🤔',
  '🤨',
  '😐',
  '😑',
  '😶',
  '😏',
  '😒',
  '🙄',
  '😴',
  '🤤',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🥳',
  '😎',
  '🤓',
  '🥺',
  '😭',
  '😱',
  '😤',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '💪',
  '👍',
  '👎',
  '👏',
  '🙌',
  '🙏',
  '🤝',
  '✌️',
  '🤞',
  '🫶',
  '❤️',
  '💔',
  '💯',
  '🔥',
  '✨',
  '🎉',
  '🎈',
  '🎂',
  '🍀',
  '🌹',
  '⭐',
  '🌟',
  '🚀',
]

function insertEmoji(emoji: string) {
  props.onEmojiSelect?.(emoji)
  open.value = false
}
</script>

<template>
  <UPopover v-model:open="open">
    <button
      type="button"
      class="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-(--ui-bg-accented) hover:text-highlighted"
      :title="t('comments.emoji')"
      :aria-label="t('comments.emoji')"
    >
      <UIcon name="i-lucide-smile" class="size-4" />
    </button>
    <template #content>
      <div class="grid w-64 grid-cols-8 gap-1 p-2">
        <button
          v-for="emoji in EMOJIS"
          :key="emoji"
          type="button"
          class="flex items-center justify-center rounded-md p-1 text-lg leading-none transition-colors hover:bg-(--ui-bg-elevated)"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </template>
  </UPopover>
</template>
