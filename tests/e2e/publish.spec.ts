import { expect, test } from '@nuxt/test-utils/playwright'

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
