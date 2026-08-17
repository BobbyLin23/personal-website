<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const { open, closeLoginModal } = useLoginModal()
const signInSocial = useSignIn('social')

const pending = computed(() => signInSocial.status.value === 'pending')

async function login(provider: 'github' | 'google') {
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
          :loading="pending"
          :disabled="pending"
          @click="login('github')"
        />
        <UButton
          color="neutral"
          variant="subtle"
          block
          icon="i-simple-icons-google"
          :label="t('auth.google')"
          :loading="pending"
          :disabled="pending"
          @click="login('google')"
        />
      </div>
    </template>
  </UModal>
</template>
