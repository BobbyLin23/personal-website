<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const { t, localeProperties } = useI18n()

useSeoMeta({
  title: () => t('thoughts.title'),
  description: () => t('thoughts.description'),
  ogUrl: config.public.siteUrl ? `${config.public.siteUrl}${route.path}` : undefined,
})

const { data: moments } = await useAsyncData('thoughts', async () =>
  queryCollection('thoughts').where('draft', '=', false).order('date', 'DESC').all(),
)

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(localeProperties.value.language || 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
)

const datetimeFormatter = computed(
  () =>
    new Intl.DateTimeFormat(localeProperties.value.language || 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
)

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return dateStr.includes('T')
    ? datetimeFormatter.value.format(date)
    : dateFormatter.value.format(date)
}
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <div class="mx-auto max-w-3xl">
      <SafeMotion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
      >
        <div class="mb-16">
          <h1 class="display-heading text-4xl sm:text-5xl mb-4">
            {{ t('thoughts.title') }}
          </h1>
          <p class="text-muted text-base sm:text-lg max-w-lg">
            {{ t('thoughts.description') }}
          </p>
        </div>
      </SafeMotion>

      <ol v-if="moments?.length" class="relative">
        <li
          v-for="(moment, index) in moments"
          :key="moment.path"
          class="relative ps-9 sm:ps-12 pb-8 sm:pb-10 last:pb-0"
        >
          <span aria-hidden="true" class="absolute start-0 top-0 bottom-0 w-px bg-muted" />
          <span
            aria-hidden="true"
            class="absolute -start-[5px] top-7 size-2.5 rounded-full bg-primary ring-4 ring-default"
          />

          <SafeMotion
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: Math.min(0.15 + index * 0.06, 0.45) }"
          >
            <article class="rounded-xl bg-elevated/50 ring ring-default p-5 sm:p-6">
              <time class="block text-sm text-muted tabular-nums mb-3" :datetime="moment.date">
                {{ formatDate(moment.date) }}
              </time>
              <h2 v-if="moment.title" class="font-semibold text-base sm:text-lg mb-2">
                {{ moment.title }}
              </h2>
              <ContentRenderer :value="moment as any" />
            </article>
          </SafeMotion>
        </li>
      </ol>

      <p v-else class="text-sm text-muted py-16 text-center">
        {{ t('thoughts.empty') }}
      </p>
    </div>
  </UContainer>
</template>
