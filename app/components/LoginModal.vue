<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const { open } = useLoginModal()
const signInSocial = useSignIn('social')

const pendingProvider = ref<'github' | 'google' | null>(null)

const pending = computed(() => pendingProvider.value !== null)

async function login(provider: 'github' | 'google') {
  pendingProvider.value = provider
  try {
    await signInSocial.execute({
      provider,
      callbackURL: route.fullPath,
    })

    if (signInSocial.error.value) {
      toast.add({
        title: t('auth.loginError'),
        color: 'error',
        icon: 'i-lucide-circle-alert',
      })
    }
  } finally {
    pendingProvider.value = null
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('auth.loginTitle')"
    :description="t('auth.loginDescription')"
  >
    <template #body>
      <div class="flex flex-col gap-3">
        <UButton
          color="neutral"
          variant="subtle"
          block
          icon="i-simple-icons-github"
          :label="t('auth.github')"
          :loading="pendingProvider === 'github'"
          :disabled="pending"
          @click="login('github')"
        />
        <UButton
          color="neutral"
          variant="subtle"
          block
          icon="i-simple-icons-google"
          :label="t('auth.google')"
          :loading="pendingProvider === 'google'"
          :disabled="pending"
          @click="login('google')"
        />
      </div>
    </template>
  </UModal>
</template>
