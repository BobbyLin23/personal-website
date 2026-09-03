import { queryCollection } from '@nuxt/content/server'

const locales = ['en', 'zh', 'zh-TW', 'es', 'ja', 'fr']
const staticPaths = ['/', '/about', '/blog', '/projects', '/resume', '/thoughts', '/weekly']

export default defineEventHandler(async (event) => {
  const siteUrl = getSiteUrl(event)
  const [blogItems, weeklyItems] = await Promise.all([
    queryCollection(event, 'blog').where('draft', '=', false).select('path', 'date').all(),
    queryCollection(event, 'weekly').select('path', 'date').all(),
  ])

  const contentPaths = [...blogItems, ...weeklyItems].map((item) => ({
    path: item.path,
    lastmod: item.date,
  }))
  const paths = [...staticPaths.map((path) => ({ path })), ...contentPaths]

  const urls = locales.flatMap((locale) =>
    paths.map(({ path, lastmod }) => {
      const localizedPath = path === '/' ? `/${locale}` : `/${locale}${path}`
      return `  <url>
    <loc>${escapeXml(`${siteUrl}${localizedPath}`)}</loc>${
      lastmod
        ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>`
        : ''
    }
  </url>`
    }),
  )

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
})
