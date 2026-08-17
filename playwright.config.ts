import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

process.env.NUXT_PUBLISH_SECRET ||= 'e2e-publish-secret'
process.env.NUXT_BETTER_AUTH_SECRET ||= 'e2e-better-auth-secret-32chars-ok'
process.env.NUXT_AUTH_GITHUB_CLIENT_ID ||= 'e2e-github-id'
process.env.NUXT_AUTH_GITHUB_CLIENT_SECRET ||= 'e2e-github-secret'
process.env.NUXT_AUTH_GOOGLE_CLIENT_ID ||= 'e2e-google-id'
process.env.NUXT_AUTH_GOOGLE_CLIENT_SECRET ||= 'e2e-google-secret'

export default defineConfig<ConfigOptions>({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['list'], ['html']],
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
