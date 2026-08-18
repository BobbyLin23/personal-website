import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

process.env.NUXT_PUBLISH_SECRET ||= 'e2e-publish-secret'
// Publish API checks these before validating the pageId; the validation tests
// fail before any real API call, so fake tokens are enough for e2e.
process.env.NUXT_GITHUB_TOKEN ||= 'e2e-github-token'
process.env.NUXT_NOTION_TOKEN ||= 'e2e-notion-token'
process.env.NUXT_BETTER_AUTH_SECRET ||= 'e2e-better-auth-secret-32chars-ok'
process.env.NUXT_AUTH_GITHUB_CLIENT_ID ||= 'e2e-github-id'
process.env.NUXT_AUTH_GITHUB_CLIENT_SECRET ||= 'e2e-github-secret'
process.env.NUXT_AUTH_GOOGLE_CLIENT_ID ||= 'e2e-google-id'
process.env.NUXT_AUTH_GOOGLE_CLIENT_SECRET ||= 'e2e-google-secret'

const isCI = process.env.CI === 'true'
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173'

// The auth client resolves its API base URL from NUXT_PUBLIC_SITE_URL; point it
// at the e2e server so session cookies issued against baseURL are honored.
process.env.NUXT_PUBLIC_SITE_URL ||= baseURL

export default defineConfig<ConfigOptions>({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  // The Nuxt app is built once by webServer below and shared by all workers,
  // so workers only run tests and can safely parallelize.
  workers: isCI ? 4 : undefined,
  reporter: isCI ? [['html', { open: 'never' }], ['github']] : [['list'], ['html']],
  webServer: {
    command:
      'pnpm exec nuxt build && HOST=127.0.0.1 PORT=4173 NODE_ENV=test pnpm exec node .output/server/index.mjs',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      host: baseURL,
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
