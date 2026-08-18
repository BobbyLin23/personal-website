<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const colorMode = useColorMode()

type LocaleCode = Parameters<typeof setLocale>[0]

const colorModeIcon = computed(() =>
  colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun',
)

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: t('nav.home'),
    to: localePath('/'),
    active: route.path === localePath('/'),
  },
  {
    label: t('nav.blog'),
    to: localePath('/blog'),
    active: route.path.startsWith(localePath('/blog')),
  },
  {
    label: t('nav.projects'),
    to: localePath('/projects'),
    active: route.path.startsWith(localePath('/projects')),
  },
  {
    label: t('nav.weekly'),
    to: localePath('/weekly'),
    active: route.path.startsWith(localePath('/weekly')),
  },
  {
    label: t('nav.thoughts'),
    to: localePath('/thoughts'),
    active: route.path.startsWith(localePath('/thoughts')),
  },
  {
    label: t('nav.about'),
    to: localePath('/about'),
    active: route.path.startsWith(localePath('/about')),
  },
])

const config = useRuntimeConfig()
const base = (config.app.baseURL || '/').replace(/\/$/, '') || ''
const rssItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: t('rss.all'),
      icon: 'i-lucide-rss',
      to: `${base}/rss.xml`,
      target: '_blank',
      external: true,
    },
    {
      label: t('rss.blog'),
      icon: 'i-lucide-book-open',
      to: `${base}/rss/blog.xml`,
      target: '_blank',
      external: true,
    },
    {
      label: t('rss.weekly'),
      icon: 'i-lucide-calendar',
      to: `${base}/rss/weekly.xml`,
      target: '_blank',
      external: true,
    },
  ],
])

const languageItems = computed<DropdownMenuItem[][]>(() => [
  (locales.value as Array<{ code: LocaleCode; name?: string }>).map((l) => ({
    label: l.name || l.code,
    icon: l.code === locale.value ? 'i-lucide-check' : undefined,
    to: switchLocalePath(l.code) || undefined,
    onSelect: () => setLocale(l.code),
  })),
])

const { user, loggedIn, signOut } = useUserSession()
const { openLoginModal } = useLoginModal()

const accountItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: t('auth.logout'),
      icon: 'i-lucide-log-out',
      onSelect: () => {
        void signOut()
      },
    },
  ],
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink :to="localePath('/')" class="font-serif text-lg font-normal tracking-tight">
        {{ t('site.name') }}
      </NuxtLink>
    </template>

    <UNavigationMenu :items="navItems" />

    <template #right>
      <UDropdownMenu :items="languageItems">
        <UButton
          icon="i-lucide-languages"
          color="neutral"
          variant="ghost"
          :aria-label="t('language.switch')"
        />
      </UDropdownMenu>

      <UDropdownMenu :items="rssItems">
        <UButton
          icon="i-lucide-rss"
          color="neutral"
          variant="ghost"
          :aria-label="t('rss.ariaLabel')"
        />
      </UDropdownMenu>

      <UButton
        :icon="colorModeIcon"
        color="neutral"
        variant="ghost"
        :aria-label="t('theme.toggle')"
        @click="toggleColorMode"
      />

      <UDropdownMenu v-if="loggedIn" :items="accountItems">
        <UButton color="neutral" variant="ghost" :aria-label="t('auth.account')">
          <UAvatar
            :src="user?.image ?? undefined"
            :alt="user?.name || t('auth.account')"
            size="2xs"
          />
          <span class="hidden sm:inline max-w-24 truncate">{{ user?.name }}</span>
        </UButton>
      </UDropdownMenu>
      <UButton
        v-else
        icon="i-lucide-log-in"
        color="neutral"
        variant="ghost"
        :aria-label="t('auth.login')"
        @click="openLoginModal"
      >
        <span class="hidden sm:inline">{{ t('auth.login') }}</span>
      </UButton>
    </template>

    <template #body>
      <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
