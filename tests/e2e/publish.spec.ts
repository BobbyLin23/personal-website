import { expect, test } from '@nuxt/test-utils/playwright'

const publishHeaders = { 'x-publish-secret': 'e2e-publish-secret' }

test('publish API rejects requests without a secret', async ({ goto, page }) => {
  await goto('/en', { waitUntil: 'hydration' })

  const response = await page.request.post('/api/publish', {
    data: { pageId: '00000000-0000-0000-0000-000000000000' },
  })

  expect(response.status()).toBe(401)
})

test('publish API rejects requests with an invalid secret', async ({ goto, page }) => {
  await goto('/en', { waitUntil: 'hydration' })

  const response = await page.request.post('/api/publish', {
    headers: { 'x-publish-secret': 'wrong-secret' },
    data: { pageId: '00000000-0000-0000-0000-000000000000' },
  })

  expect(response.status()).toBe(401)
})

test('publish API rejects requests with a missing pageId', async ({ goto, page }) => {
  await goto('/en', { waitUntil: 'hydration' })

  const response = await page.request.post('/api/publish', {
    headers: publishHeaders,
    data: {},
  })

  expect(response.status()).toBe(400)
})

test('publish API rejects requests with a malformed pageId', async ({ goto, page }) => {
  await goto('/en', { waitUntil: 'hydration' })

  const response = await page.request.post('/api/publish', {
    headers: publishHeaders,
    data: { pageId: 'not-a-uuid' },
  })

  expect(response.status()).toBe(400)
})
