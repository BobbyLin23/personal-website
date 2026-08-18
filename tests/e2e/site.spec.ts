import type { Page } from '@playwright/test'
import { expect, test } from '@nuxt/test-utils/playwright'

const aiInsightsResponse = {
  summary: '测试环境中的文章摘要。',
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

const xssComment = '<img src=x onerror=alert(1)>'
const mockedComments = {
  comments: [
    {
      id: 'comment-xss',
      postPath: '/blog/copilotkit-sourcecode-note',
      body: xssComment,
      createdAt: Date.now() - 60_000,
      updatedAt: Date.now() - 60_000,
      userId: 'user-1',
      authorName: 'Test User',
      authorImage: null,
    },
  ],
}

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

  await page.route('**/api/auth/get-session**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: 'null',
    })
  })

  await page.route('**/api/comments**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(mockedComments),
      })
      return
    }

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ statusMessage: 'Unauthorized' }),
    })
  })
}

function parseMonthYear(label: string) {
  // English: "February 2026" — Chinese: "2026年2月"
  const english = label.trim().match(/^([A-Z][a-z]+) (\d{4})$/)
  if (english) {
    const month = monthIndexes.get(english[1])
    if (month === undefined) throw new Error(`Unexpected calendar month: ${english[1]}`)
    return {
      locale: 'en' as const,
      label: `${english[1]} ${english[2]}`,
      value: Number(english[2]) * 12 + month,
    }
  }

  const chinese = label.trim().match(/^(\d{4})年(\d{1,2})月$/)
  if (chinese) {
    const year = Number(chinese[1])
    const month = Number(chinese[2]) - 1
    return {
      locale: 'zh' as const,
      label: `${year}年${month + 1}月`,
      value: year * 12 + month,
    }
  }

  throw new Error(`Unexpected calendar heading: ${label}`)
}

async function showCalendarMonth(page: Page, targetLabel: string) {
  const target = parseMonthYear(targetLabel)
  const heading = page
    .getByRole('button', { name: /(?:[A-Z][a-z]+ \d{4}|\d{4}年\d{1,2}月)/ })
    .first()

  for (let attempts = 0; attempts < 120; attempts++) {
    const current = parseMonthYear((await heading.textContent()) || '')
    if (current.value === target.value) return

    const prevName = current.locale === 'zh' ? '上个月' : 'Previous month'
    const nextName = current.locale === 'zh' ? '下个月' : 'Next month'
    await page
      .getByRole('button', {
        name: current.value > target.value ? prevName : nextName,
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
  { path: '/zh-TW', heading: 'Bobby Lin' },
  { path: '/es', heading: 'Bobby Lin' },
  { path: '/ja', heading: 'Bobby Lin' },
  { path: '/fr', heading: 'Bobby Lin' },
  { path: '/en/about', heading: 'About Me' },
  { path: '/en/blog', heading: 'Blog' },
  { path: '/es/blog', heading: 'Blog' },
  { path: '/fr/blog', heading: 'Blog' },
  { path: '/ja/blog', heading: 'ブログ' },
  { path: '/zh-TW/blog', heading: '部落格' },
  { path: '/zh/blog', heading: '博客' },
  { path: '/en/projects', heading: 'Projects' },
  { path: '/es/projects', heading: 'Proyectos' },
  { path: '/en/weekly', heading: 'Weekly' },
  { path: '/en/resume', heading: 'Lin Zhangsheng' },
  { path: '/en/thoughts', heading: 'Thoughts' },
  { path: '/zh/thoughts', heading: '随想' },
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
  await page.getByRole('menuitem', { name: '简体中文' }).click()
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
  await expect(page.getByText('链接已复制', { exact: true })).toBeVisible()
})

test('weekly calendar opens the highlighted weekly report for the active locale', async ({
  goto,
  page,
}) => {
  await goto('/zh/weekly', { waitUntil: 'hydration' })

  await showCalendarMonth(page, 'February 2026')
  await page.getByRole('button', { name: '2026年2月8日星期日' }).click()

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

  await page.getByRole('link', { name: '简体中文' }).click()
  await expect(page).toHaveURL(/\/zh\/resume$/)
  await expect(page.getByRole('heading', { level: 1, name: '林张生' })).toBeVisible()
})

test('header login opens a GitHub and Google modal', async ({ goto, page }) => {
  await goto('/en', { waitUntil: 'hydration' })

  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
})

test('rendered comments sanitize raw HTML and open login when signed out', async ({
  goto,
  page,
}) => {
  await goto('/zh/blog/copilotkit-sourcecode-note', { waitUntil: 'hydration' })

  await expect(page.getByRole('heading', { name: '评论' })).toBeVisible()

  // 评论区内的 HTML 必须经过 DOMPurify 消毒：img 保留、onerror 事件被移除
  const commentSection = page.locator('[aria-labelledby="comments-title"]')
  await expect(commentSection.locator('img[src="x"]')).toHaveCount(1)
  await expect(commentSection.locator('[onerror]')).toHaveCount(0)

  await page.getByRole('button', { name: '登录后发表评论' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: '使用 GitHub 继续' })).toBeVisible()
})
