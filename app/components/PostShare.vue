<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{
  title: string
  url: string
}>()

const { t } = useI18n()
const toast = useToast()

const copied = ref(false)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    toast.add({
      title: t('post.share.copied'),
      color: 'success',
      icon: 'i-lucide-check',
    })
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    toast.add({
      title: t('post.share.copyFailed'),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
}

function openShareWindow(shareUrl: string) {
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=520')
}

function shareOnX() {
  const params = new URLSearchParams({
    url: props.url,
    text: props.title,
  })
  openShareWindow(`https://twitter.com/intent/tweet?${params.toString()}`)
}

function shareOnLinkedIn() {
  const params = new URLSearchParams({ url: props.url })
  openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`)
}

async function shareNative() {
  if (!navigator.share) return
  try {
    await navigator.share({
      title: props.title,
      url: props.url,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    await copyLink()
  }
}

const canNativeShare = computed(() => import.meta.client && !!navigator.share)

const shareItems = computed<DropdownMenuItem[][]>(() => {
  const items: DropdownMenuItem[] = [
    {
      label: t('post.share.copyLink'),
      icon: copied.value ? 'i-lucide-check' : 'i-lucide-link',
      onSelect: copyLink,
    },
    {
      label: t('post.share.x'),
      icon: 'i-simple-icons-x',
      onSelect: shareOnX,
    },
    {
      label: t('post.share.linkedin'),
      icon: 'i-simple-icons-linkedin',
      onSelect: shareOnLinkedIn,
    },
  ]

  if (canNativeShare.value) {
    items.unshift({
      label: t('post.share.native'),
      icon: 'i-lucide-share',
      onSelect: shareNative,
    })
  }

  return [items]
})
</script>

<template>
  <UDropdownMenu :items="shareItems">
    <UButton
      color="neutral"
      variant="soft"
      size="xs"
      icon="i-lucide-share-2"
      :label="t('post.share.button')"
      :aria-label="t('post.share.button')"
    />
  </UDropdownMenu>
</template>
