import { createHash } from 'node:crypto'

interface TranslatedPayload {
  title: string
  description: string
  date: string
  path: string
  body: any
  translated: boolean
  locale: string
  sourceLocale: string
}

const VALID_COLLECTIONS = new Set(['blog', 'weekly', 'about'])

export default defineEventHandler(async (event): Promise<TranslatedPayload> => {
  const query = getQuery(event)
  const path = getQueryString(query.path).trim()
  const locale = getQueryString(query.locale).trim()
  const collection = (getQueryString(query.collection) || 'blog').trim()

  if (!path || !path.startsWith('/')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }
  if (!locale) {
    throw createError({ statusCode: 400, statusMessage: 'Missing locale' })
  }
  if (!VALID_COLLECTIONS.has(collection)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid collection' })
  }

  const stem = path.replace(/^\//, '')
  const assetKey = `${stem}.md`

  const assets = useStorage('assets:content-src')
  const raw = await assets.getItem<string>(assetKey)

  if (!raw) {
    throw createError({ statusCode: 404, statusMessage: 'Source content not found' })
  }

  const rawText = typeof raw === 'string' ? raw : String(raw)
  const hash = createHash('sha1').update(rawText).digest('hex').slice(0, 12)
  const cacheKey = `translate:${locale}:${collection}:${stem}:${hash}`

  const cache = useStorage('cache')
  const cached = await cache.getItem<TranslatedPayload>(cacheKey)
  if (cached) return cached

  const { frontmatter, body } = splitFrontmatter(rawText)

  const originalTitle = getFrontmatterField(frontmatter, 'title') || ''
  const originalDescription = getFrontmatterField(frontmatter, 'description') || ''
  const originalDate = getFrontmatterField(frontmatter, 'date') || ''

  const [translatedTitle, translatedDescription, translatedBody] = await Promise.all([
    originalTitle
      ? translateMarkdown(originalTitle, { targetLocale: locale })
      : Promise.resolve(''),
    originalDescription
      ? translateMarkdown(originalDescription, { targetLocale: locale })
      : Promise.resolve(''),
    translateMarkdown(body, { targetLocale: locale }),
  ])

  const parsed = await parseMdToAst(translatedBody)

  const payload: TranslatedPayload = {
    title: translatedTitle,
    description: translatedDescription,
    date: originalDate,
    path,
    body: parsed.body,
    translated: true,
    locale,
    sourceLocale: 'en',
  }

  await cache.setItem(cacheKey, payload, { ttl: 60 * 60 * 24 * 30 })

  return payload
})
