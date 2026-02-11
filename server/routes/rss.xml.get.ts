import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (event) => {
  const siteUrl = getSiteUrl(event)

  const [blogItems, weeklyItems] = await Promise.all([
    queryCollection(event, 'blog').where('draft', '=', false).order('date', 'DESC').all(),
    queryCollection(event, 'weekly').order('date', 'DESC').all(),
  ])

  const combined = [
    ...blogItems.map(i => ({ ...i, _type: 'blog' as const })),
    ...weeklyItems.map(i => ({ ...i, _type: 'weekly' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bobby Lin</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Personal website - Blog &amp; Weekly reports.</description>
    <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml"/>
    <language>en</language>
${combined.map((item) => {
  const link = `${siteUrl}${item.path}`
  const html = bodyToHtml(item.body)
  const typeLabel = item._type === 'blog' ? '[Blog]' : '[Weekly]'
  return `    <item>
      <title>${escapeXml(`${typeLabel} ${item.title}`)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(item.description)}</description>
      <content:encoded xmlns:content="http://purl.org/rss/1.0/modules/content/"><![CDATA[${html}]]></content:encoded>
      <pubDate>${formatRssDate(new Date(item.date))}</pubDate>
    </item>`
}).join('\n')}
  </channel>
</rss>`

  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  return feed
})
