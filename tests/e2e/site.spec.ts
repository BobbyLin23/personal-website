import type { Page } from '@playwright/test'
import { expect, test } from '@nuxt/test-utils/playwright'

const aiInsightsResponse = {
  summary: '测试环境中的文章摘要。',
  keyPoints: ['页面可以加载文章内容', 'AI 洞察区域使用确定性响应'],
  takeaways: ['E2E 测试不依赖外部模型服务'],
  audience: 'For readers checking the blog UI.',
  path: '/blog/copilotkit-sourcecode-note',
  locale: 'zh',
  cached: false,
}

const monthIndexes = new Map(
  [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ].map((month, index) => [month, index]),
)

async function mockAppApis(page: Page) {
  await page.route('**/api/ai-insights**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(aiInsightsResponse),
    })
  })

  await page.route('**/api/translate-stream**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'text/event-stream; charset=utf-8',
      },
      body: 'event: error\ndata: {"message":"Translation disabled in E2E"}\n\n',
    })
  })
}

function parseMonthYear(label: string) {
  const match = label.trim().match(/^([A-Z][a-z]+) (\d{4})$/)
  if (!match) throw new Error(`Unexpected calendar heading: ${label}`)

  const month = monthIndexes.get(match[1])
  if (month === undefined) throw new Error(`Unexpected calendar month: ${match[1]}`)

  return {
    label: `${match[1]} ${match[2]}`,
    value: Number(match[2]) * 12 + month,
  }
}

async function showCalendarMonth(page: Page, targetLabel: string) {
  const target = parseMonthYear(targetLabel)
  const heading = page.getByRole('button', { name: /^[A-Z][a-z]+ \d{4}$/ }).first()

  for (let attempts = 0; attempts < 120; attempts++) {
    const current = parseMonthYear((await heading.textContent()) || '')
    if (current.label === target.label) return

    await page
      .getByRole('button', {
        name: current.value > target.value ? 'Previous month' : 'Next month',
      })
      .click()
  }

  throw new Error(`Could not navigate calendar to ${targetLabel}`)
}

test.beforeEach(async ({ context, page }) => {
  await context.grantPermissions(['clipboard-write'])
  await mockAppApis(page)
})

const smokeRoutes = [
  { path: '/en', heading: 'Bobby Lin' },
  { path: '/zh', heading: 'Bobby Lin' },
  { path: '/en/blog', heading: 'Blog' },
  { path: '/en/projects', heading: 'Projects' },
  { path: '/en/weekly', heading: 'Weekly' },
  { path: '/en/resume', heading: 'Lin Zhangsheng' },
]

for (const route of smokeRoutes) {
  test(`renders ${route.path}`, async ({ goto, page }) => {
    await goto(route.path, { waitUntil: 'hydration' })

    await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible()
  })
}

test('header controls switch locale, expose RSS links, and persist color mode', async ({
  goto,
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.addInitScript(() => {
    if (!localStorage.getItem('nuxt-color-mode')) {
      localStorage.setItem('nuxt-color-mode', 'light')
    }
  })

  await goto('/en', { waitUntil: 'hydration' })

  await page.getByRole('button', { name: 'Language' }).click()
  await page.getByRole('menuitem', { name: '中文' }).click()
  await expect(page).toHaveURL(/\/zh\/?$/)
  await expect(page.getByText('专注于构建美观、高性能的 Web 应用')).toBeVisible()

  await goto('/en', { waitUntil: 'hydration' })
  await page.getByRole('button', { name: 'RSS feeds' }).click()
  await expect(page.getByRole('menuitem', { name: 'All' })).toHaveAttribute('href', /\/rss\.xml$/)
  await expect(page.getByRole('menuitem', { name: 'Blog' })).toHaveAttribute(
    'href',
    /\/rss\/blog\.xml$/,
  )
  await expect(page.getByRole('menuitem', { name: 'Weekly' })).toHaveAttribute(
    'href',
    /\/rss\/weekly\.xml$/,
  )
  await page.keyboard.press('Escape')

  const html = page.locator('html')
  await expect(html).not.toHaveClass(/dark/)
  await page.getByRole('button', { name: 'Toggle color theme' }).click()
  await expect(html).toHaveClass(/dark/)

  await page.reload()
  await expect(html).toHaveClass(/dark/)
})

test('blog detail renders content, mocked AI insights, and share copy feedback', async ({
  goto,
  page,
}) => {
  await goto('/zh/blog/copilotkit-sourcecode-note', { waitUntil: 'hydration' })

  await expect(page.getByRole('heading', { level: 1, name: 'CopilotKit 源码学习' })).toBeVisible()
  await expect(page.getByText('CopilotKit 是一个用于将 AI Copilot')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'AI 洞察' })).toBeVisible()
  await expect(page.getByText(aiInsightsResponse.summary)).toBeVisible()

  await page.getByRole('button', { name: '分享' }).click()
  await page.getByRole('menuitem', { name: '复制链接' }).click()
  await expect(page.getByText('链接已复制')).toBeVisible()
})

test('weekly calendar opens the highlighted weekly report for the active locale', async ({
  goto,
  page,
}) => {
  await goto('/zh/weekly', { waitUntil: 'hydration' })

  await showCalendarMonth(page, 'February 2026')
  await page.getByRole('button', { name: 'Sunday, February 8, 2026' }).click()

  await expect(page).toHaveURL(/\/zh\/weekly\/2026-w06$/)
  await expect(page.getByRole('heading', { name: 'Week 6 Report' })).toBeVisible()
})

test('projects and resume expose expected links and resume actions', async ({ goto, page }) => {
  await goto('/en/projects', { waitUntil: 'hydration' })

  await expect(page.getByRole('heading', { name: 'Calora' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Source Code' }).first()).toHaveAttribute(
    'href',
    'https://github.com/chestnut-studio/calora',
  )

  await goto('/en/resume', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { level: 1, name: 'Lin Zhangsheng' })).toBeVisible()

  await expect(page.getByRole('link', { name: 'PDF' })).toHaveAttribute('href', '/resume-zh.pdf')
  await expect(page.getByRole('link', { name: 'PDF' })).toHaveAttribute('download', '')

  await page.evaluate(() => {
    ;(window as Window & { __printCalled?: boolean }).__printCalled = false
    window.print = () => {
      ;(window as Window & { __printCalled?: boolean }).__printCalled = true
    }
  })
  await page.getByRole('button', { name: 'Print' }).click()
  await expect
    .poll(() => page.evaluate(() => (window as Window & { __printCalled?: boolean }).__printCalled))
    .toBe(true)

  await page.getByRole('link', { name: '中文' }).click()
  await expect(page).toHaveURL(/\/zh\/resume$/)
  await expect(page.getByRole('heading', { level: 1, name: '林张生' })).toBeVisible()
})
