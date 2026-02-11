import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (event) => {
  const siteUrl = getSiteUrl(event)
  const items = await queryCollection(event, 'blog')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all()

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bobby Lin - Blog</title>
    <link>${escapeXml(`${siteUrl}/blog`)}</link>
    <description>Thoughts on web development, design, and technology.</description>
    <atom:link href="${escapeXml(`${siteUrl}/rss/blog.xml`)}" rel="self" type="application/rss+xml"/>
    <language>en</language>
${items.map((item) => {
  const link = `${siteUrl}${item.path}`
  const html = bodyToHtml(item.body)
  return `    <item>
      <title>${escapeXml(item.title)}</title>
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
