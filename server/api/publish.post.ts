export interface PublishResult {
  ok: true
  collection: 'blog' | 'weekly'
  path: string
  url: string
  commitSha: string
}

export default defineEventHandler(async (event): Promise<PublishResult> => {
  const config = getPublishConfig(event)
  assertPublishAuthorized(event, config)

  if (!config.githubToken) {
    throw createError({ statusCode: 503, statusMessage: 'GitHub token is not configured' })
  }
  if (!config.notionToken) {
    throw createError({ statusCode: 503, statusMessage: 'Notion token is not configured' })
  }

  const body = await readBody(event).catch(() => null)
  const pageId = extractPublishPageId(body)
  if (!pageId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing Notion page id' })
  }

  const post = await loadNotionPost(config, pageId)
  const sanitized = sanitizeNotionMarkdown(post.markdown)
  const extraUrls = post.coverUrl ? [post.coverUrl] : []
  const rehosted = await rehostMarkdownImages(
    sanitized,
    post.frontmatter.collection,
    post.frontmatter.slug,
    extraUrls,
  )

  const frontmatter =
    post.frontmatter.collection === 'blog'
      ? { ...post.frontmatter, image: rehosted.coverPath || post.frontmatter.image }
      : post.frontmatter

  const markdown = toMarkdownDocument(frontmatter, rehosted.markdown)
  const contentPath = `content/${frontmatter.collection}/${frontmatter.slug}.md`
  const files = [{ path: contentPath, content: markdown }, ...rehosted.files]
  const commitSha = await commitGithubFiles(
    config,
    files,
    `content: publish ${frontmatter.collection}/${frontmatter.slug}`,
  )

  const publicPath = `/${frontmatter.collection}/${frontmatter.slug}`
  const url = config.siteUrl ? `${config.siteUrl}/en${publicPath}` : publicPath

  return {
    ok: true,
    collection: frontmatter.collection,
    path: publicPath,
    url,
    commitSha,
  }
})
