import { createHash } from 'node:crypto'

interface AiInsightResponse {
  summary: string
  keyPoints: string[]
  takeaways: string[]
  audience: string
  path: string
  locale: string
  cached: boolean
}

const VALID_COLLECTIONS = new Set(['blog'])
const MAX_SOURCE_CHARS = 24_000

export default defineEventHandler(async (event): Promise<AiInsightResponse> => {
  const query = getQuery(event)
  const path = String(query.path || '').trim()
  const locale = String(query.locale || 'en').trim()
  const collection = String(query.collection || 'blog').trim()

  if (!path || !path.startsWith('/'))
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  if (!locale)
    throw createError({ statusCode: 400, statusMessage: 'Missing locale' })
  if (!VALID_COLLECTIONS.has(collection))
    throw createError({ statusCode: 400, statusMessage: 'Invalid collection' })

  const stem = path.replace(/^\//, '')
  const assetKey = `${stem}.md`

  const assets = useStorage('assets:content-src')
  const raw = await assets.getItem<string>(assetKey)
  if (!raw)
    throw createError({ statusCode: 404, statusMessage: 'Source content not found' })

  const rawText = typeof raw === 'string' ? raw : String(raw)
  const hash = createHash('sha1').update(rawText).digest('hex').slice(0, 12)
  const cacheKey = `ai-insights:${locale}:${collection}:${stem}:${hash}`
  const cache = useStorage('cache')

  const cached = await cache.getItem<AiInsightResponse>(cacheKey)
  if (cached)
    return { ...cached, cached: true }

  const { frontmatter, body } = splitFrontmatter(rawText)
  const title = getFrontmatterField(frontmatter, 'title') || ''
  const description = getFrontmatterField(frontmatter, 'description') || ''
  const tags = getFrontmatterField(frontmatter, 'tags') || ''

  const source = [
    title && `Title: ${title}`,
    description && `Description: ${description}`,
    tags && `Tags: ${tags}`,
    '',
    body,
  ].filter(Boolean).join('\n').slice(0, MAX_SOURCE_CHARS)

  const insights = await generatePostInsights(source, { targetLocale: locale })
  const payload: AiInsightResponse = {
    ...insights,
    path,
    locale,
    cached: false,
  }

  await cache.setItem(cacheKey, payload, { ttl: 60 * 60 * 24 * 90 })

  return payload
})
