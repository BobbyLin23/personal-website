<script setup lang="ts">
import { resumeData } from '~/data/resume'

definePageMeta({
  layout: false,
})

const { locale, locales, setLocale, t } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const config = useRuntimeConfig()

const content = computed(() => resumeData[locale.value as 'zh' | 'en'] ?? resumeData.en)

useSeoMeta({
  title: () => `${content.value.name} — ${content.value.title}`,
  description: () => content.value.experience[0]?.highlights[0]?.slice(0, 160),
})

const languageOptions = computed(() =>
  (locales.value as Array<{ code: string; name?: string }>).map((l) => ({
    code: l.code as 'en' | 'zh',
    label: l.name || l.code,
    active: l.code === locale.value,
    to: switchLocalePath(l.code as 'en' | 'zh'),
  })),
)

function printResume() {
  if (import.meta.client) window.print()
}
</script>

<template>
  <div class="resume-page">
    <div class="resume-toolbar no-print">
      <div class="resume-toolbar-inner">
        <NuxtLink :to="localePath('/')" class="resume-toolbar-link">
          <UIcon name="i-lucide-arrow-left" class="size-4" aria-hidden="true" />
          {{ t('site.name') }}
        </NuxtLink>

        <div class="resume-toolbar-actions">
          <div class="resume-lang-switch" role="group" :aria-label="t('language.switch')">
            <NuxtLink
              v-for="option in languageOptions"
              :key="option.code"
              :to="option.to"
              class="resume-lang-btn"
              :class="{ 'resume-lang-btn--active': option.active }"
              @click="setLocale(option.code)"
            >
              {{ option.label }}
            </NuxtLink>
          </div>

          <a href="/resume-zh.pdf" class="resume-print-btn" download>
            <UIcon name="i-lucide-download" class="size-4" aria-hidden="true" />
            PDF
          </a>

          <button type="button" class="resume-print-btn" @click="printResume">
            <UIcon name="i-lucide-printer" class="size-4" aria-hidden="true" />
            {{ locale === 'zh' ? '打印' : 'Print' }}
          </button>
        </div>
      </div>
    </div>

    <main class="resume-shell">
      <ResumeView :content="content" />
    </main>

    <footer v-if="config.public.siteUrl" class="resume-footer no-print">
      <a :href="`${config.public.siteUrl}${localePath('/resume')}`" class="resume-footer-link">
        {{ config.public.siteUrl }}{{ localePath('/resume') }}
      </a>
    </footer>
  </div>
</template>

<style scoped>
.resume-page {
  min-height: 100vh;
  background: #f5f5f4;
  color: #1c1917;
}

.resume-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e7e5e4;
  background: rgba(250, 250, 249, 0.92);
  backdrop-filter: blur(8px);
}

.resume-toolbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 52rem;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
}

.resume-toolbar-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: #57534e;
  text-decoration: none;
}

.resume-toolbar-link:hover {
  color: #b45309;
}

.resume-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.resume-lang-switch {
  display: inline-flex;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #fff;
}

.resume-lang-btn {
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
  color: #57534e;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;
}

.resume-lang-btn:hover {
  color: #1c1917;
  background: #fafaf9;
}

.resume-lang-btn--active {
  color: #fff;
  background: #1c1917;
}

.resume-lang-btn--active:hover {
  color: #fff;
  background: #292524;
}

.resume-print-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  background: #fff;
  font-size: 0.78rem;
  color: #44403c;
  cursor: pointer;
  text-decoration: none;
}

.resume-print-btn:hover {
  border-color: #d6d3d1;
  background: #fafaf9;
}

.resume-shell {
  max-width: 52rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

@media (min-width: 640px) {
  .resume-shell {
    padding: 2.5rem 2rem 4rem;
  }
}

.resume-footer {
  padding: 1rem 1.25rem 2rem;
  text-align: center;
}

.resume-footer-link {
  font-size: 0.75rem;
  color: #a8a29e;
  text-decoration: none;
}

.resume-footer-link:hover {
  color: #78716c;
}

@media print {
  .resume-page {
    background: #fff;
  }

  .resume-shell {
    max-width: none;
    padding: 0;
  }

  .no-print {
    display: none !important;
  }
}
</style>
