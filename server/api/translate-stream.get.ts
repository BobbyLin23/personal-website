import { createHash } from 'node:crypto'
import { createEventStream } from 'h3'

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

const VALID_COLLECTIONS = new Set(['blog', 'weekly'])
const PARSE_DEBOUNCE_MS = 500

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const path = String(query.path || '').trim()
  const locale = String(query.locale || '').trim()
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
  const cacheKey = `translate:${locale}:${collection}:${stem}:${hash}`
  const cache = useStorage('cache')

  const stream = createEventStream(event)
  const controller = new AbortController()
  let closed = false

  const safePush = async (eventName: string, data: unknown) => {
    if (closed)
      return
    try {
      await stream.push({ event: eventName, data: JSON.stringify(data) })
    }
    catch {
      closed = true
    }
  }

  stream.onClosed(async () => {
    closed = true
    controller.abort()
    try {
      await stream.close()
    }
    catch {}
  })

  ;(async () => {
    try {
      const cached = await cache.getItem<TranslatedPayload>(cacheKey)
      if (cached) {
        await safePush('cached', cached)
        await safePush('done', cached)
        await stream.close()
        return
      }

      const { frontmatter, body } = splitFrontmatter(rawText)
      const originalTitle = getFrontmatterField(frontmatter, 'title') || ''
      const originalDescription = getFrontmatterField(frontmatter, 'description') || ''
      const originalDate = getFrontmatterField(frontmatter, 'date') || ''

      const metaSource = [
        originalTitle && `Title: ${originalTitle}`,
        originalDescription && `Description: ${originalDescription}`,
      ].filter(Boolean).join('\n')

      let translatedTitle = originalTitle
      let translatedDescription = originalDescription

      if (metaSource) {
        try {
          const translatedMeta = await translateMarkdown(metaSource, { targetLocale: locale })
          translatedTitle = extractField(translatedMeta, /^(?:Title|标题)[ \t]*[:：](.+)$/m) || originalTitle
          translatedDescription = extractField(translatedMeta, /^(?:Description|描述|简介)[ \t]*[:：](.+)$/m) || originalDescription
        }
        catch {
          // keep originals on meta failure
        }
      }

      await safePush('meta', {
        title: translatedTitle,
        description: translatedDescription,
        date: originalDate,
      })

      let lastEmit = 0
      let lastAccumulatedLen = 0
      let parseInFlight: Promise<void> | null = null

      const emitChunk = async (accumulated: string) => {
        if (parseInFlight)
          return
        parseInFlight = (async () => {
          try {
            const parsed = await parseMdToAst(accumulated)
            await safePush('chunk', { body: parsed.body })
          }
          catch {
            // ignore mid-parse errors
          }
          finally {
            parseInFlight = null
          }
        })()
      }

      const finalText = await streamTranslateMarkdown(
        body,
        { targetLocale: locale, signal: controller.signal },
        async (_delta, accumulated) => {
          if (closed)
            return
          const now = Date.now()
          if (now - lastEmit < PARSE_DEBOUNCE_MS)
            return
          if (accumulated.length === lastAccumulatedLen)
            return
          lastEmit = now
          lastAccumulatedLen = accumulated.length
          await emitChunk(accumulated)
        },
      )

      // Wait for any in-flight parse to settle before emitting final.
      if (parseInFlight)
        await parseInFlight

      const finalParsed = await parseMdToAst(finalText)
      const payload: TranslatedPayload = {
        title: translatedTitle,
        description: translatedDescription,
        date: originalDate,
        path,
        body: finalParsed.body,
        translated: true,
        locale,
        sourceLocale: 'en',
      }

      await cache.setItem(cacheKey, payload, { ttl: 60 * 60 * 24 * 30 })
      await safePush('done', payload)
      await stream.close()
    }
    catch (err: any) {
      await safePush('error', { message: err?.statusMessage || err?.message || 'Translation failed' })
      try {
        await stream.close()
      }
      catch {}
    }
  })()

  return stream.send()
})

function extractField(text: string, re: RegExp): string | undefined {
  if (!text)
    return undefined
  const m = text.match(re)
  return m?.[1]?.trim()
}
