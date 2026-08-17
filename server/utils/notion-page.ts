import {
  APIErrorCode,
  Client,
  extractNotionId,
  isFullPage,
  isNotionClientError,
} from '@notionhq/client'
import type { PageObjectResponse, RichTextItemResponse } from '@notionhq/client'
import type { PublishConfig } from './publish-auth'
import type { PublishCollection, PublishFrontmatter } from './publish-markdown'
import { slugify, weeklySlug } from './publish-markdown'

const NOTION_VERSION = '2026-03-11'

export interface NotionPostPayload {
  pageId: string
  frontmatter: PublishFrontmatter
  markdown: string
  coverUrl?: string
}

export function extractPublishPageId(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined

  const data = isRecord(body.data) ? body.data : undefined
  const entity = isRecord(body.entity) ? body.entity : undefined
  const source = isRecord(body.source) ? body.source : undefined

  const candidates = [
    body.pageId,
    body.page_id,
    data?.id,
    data?.page_id,
    isRecord(data?.page) ? data.page.id : undefined,
    entity?.type === 'page' ? entity.id : undefined,
    typeof body.url === 'string' ? body.url : undefined,
    typeof data?.url === 'string' ? data.url : undefined,
  ]

  for (const candidate of candidates) {
    const id = asPageId(candidate)
    if (id) return id
  }

  if (typeof body.id === 'string') {
    const sourceIds = new Set(
      [source?.event_id, source?.automation_id, source?.action_id]
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.toLowerCase()),
    )
    if (!sourceIds.has(body.id.toLowerCase())) {
      return asPageId(body.id)
    }
  }
}

export async function loadNotionPost(
  config: PublishConfig,
  pageId: string,
): Promise<NotionPostPayload> {
  if (!config.notionToken) {
    throw createError({ statusCode: 503, statusMessage: 'Notion token is not configured' })
  }

  const notion = new Client({
    auth: config.notionToken,
    notionVersion: NOTION_VERSION,
  })

  let page: Awaited<ReturnType<typeof notion.pages.retrieve>>
  let markdownPage: Awaited<ReturnType<typeof notion.pages.retrieveMarkdown>>

  try {
    ;[page, markdownPage] = await Promise.all([
      notion.pages.retrieve({ page_id: pageId }),
      notion.pages.retrieveMarkdown({ page_id: pageId }),
    ])
  } catch (error) {
    throw mapNotionError(error)
  }

  if (!isFullPage(page)) {
    throw createError({ statusCode: 400, statusMessage: 'Notion page is incomplete' })
  }

  assertAllowedDatabase(page, config.notionDatabaseIds)

  const properties = page.properties
  const title = readTitle(properties) || headingFromMarkdown(markdownPage.markdown)
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Notion page is missing a title' })
  }

  const date = readDate(properties) || page.created_time.slice(0, 10)
  const type = readSelect(properties, ['type', 'collection'])
  const collection = resolveCollection(type, properties)
  const language = readSelect(properties, ['language', 'locale']) || undefined
  const description =
    readText(properties, ['description', 'desc', 'summary']) ||
    firstParagraph(markdownPage.markdown) ||
    title
  const slugProperty = readText(properties, ['slug'])

  let frontmatter: PublishFrontmatter
  if (collection === 'weekly') {
    const iso = isoWeekFromDate(date)
    const week = readNumber(properties, ['week']) ?? iso.week
    const year = readNumber(properties, ['year']) ?? iso.year
    frontmatter = {
      collection,
      title,
      description,
      date,
      language,
      week,
      year,
      commits: readNumber(properties, ['commits']) ?? 0,
      prs: readNumber(properties, ['prs', 'pull requests']) ?? 0,
      blogs: readNumber(properties, ['blogs']) ?? 0,
      books: readNumber(properties, ['books']) ?? 0,
      slug: slugProperty || weeklySlug(year, week),
    }
  } else {
    const tags = readMultiSelect(properties, ['tags'])
    frontmatter = {
      collection,
      title,
      description,
      date,
      language,
      tags: tags.length > 0 ? tags : undefined,
      draft: readCheckbox(properties, ['draft']) ?? false,
      slug: slugProperty || slugify(title) || `page-${page.id.replaceAll('-', '').slice(0, 8)}`,
    }
  }

  return {
    pageId: page.id,
    frontmatter,
    markdown: markdownPage.markdown || '',
    coverUrl: coverUrl(page) || readFilesUrl(properties, ['image', 'cover']),
  }
}

function assertAllowedDatabase(page: PageObjectResponse, allowedIds: string[]) {
  if (allowedIds.length === 0) return

  const parent = page.parent
  const parentIds =
    parent.type === 'database_id'
      ? [parent.database_id]
      : parent.type === 'data_source_id'
        ? [parent.data_source_id, parent.database_id]
        : []

  const allowed = new Set(allowedIds.map((id) => id.replaceAll('-', '').toLowerCase()))
  const matches = parentIds.some((id) => allowed.has(id.replaceAll('-', '').toLowerCase()))
  if (!matches) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Notion page is not in an allowed database',
    })
  }
}

function resolveCollection(
  type: string | undefined,
  properties: PageObjectResponse['properties'],
): PublishCollection {
  const normalized = type?.trim().toLowerCase()
  if (normalized === 'weekly') return 'weekly'
  if (normalized === 'blog') return 'blog'
  if (
    readNumber(properties, ['week']) !== undefined &&
    readNumber(properties, ['year']) !== undefined
  ) {
    return 'weekly'
  }
  return 'blog'
}

function readTitle(properties: PageObjectResponse['properties']) {
  const named = readRichText(findProperty(properties, ['title', 'name']))
  if (named) return named

  for (const property of Object.values(properties)) {
    if (property.type === 'title') return richTextToPlain(property.title)
  }
}

function readText(properties: PageObjectResponse['properties'], names: string[]) {
  const property = findProperty(properties, names)
  if (!property) return undefined
  if (property.type === 'rich_text') return richTextToPlain(property.rich_text) || undefined
  if (property.type === 'title') return richTextToPlain(property.title) || undefined
  if (property.type === 'select') return property.select?.name
  if (property.type === 'url') return property.url || undefined
}

function readSelect(properties: PageObjectResponse['properties'], names: string[]) {
  const property = findProperty(properties, names)
  if (!property) return undefined
  if (property.type === 'select') return property.select?.name
  if (property.type === 'status') return property.status?.name
  if (property.type === 'rich_text') return richTextToPlain(property.rich_text) || undefined
}

function readMultiSelect(properties: PageObjectResponse['properties'], names: string[]) {
  const property = findProperty(properties, names)
  if (property?.type === 'multi_select') return property.multi_select.map((item) => item.name)
  if (property?.type === 'rich_text') {
    return richTextToPlain(property.rich_text)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function readDate(properties: PageObjectResponse['properties']) {
  const property = findProperty(properties, ['date', 'published', 'published at', 'published_at'])
  if (property?.type === 'date') return property.date?.start?.slice(0, 10)
}

function readCheckbox(properties: PageObjectResponse['properties'], names: string[]) {
  const property = findProperty(properties, names)
  if (property?.type === 'checkbox') return property.checkbox
}

function readNumber(properties: PageObjectResponse['properties'], names: string[]) {
  const property = findProperty(properties, names)
  if (property?.type === 'number' && typeof property.number === 'number') return property.number
}

function readFilesUrl(properties: PageObjectResponse['properties'], names: string[]) {
  const property = findProperty(properties, names)
  if (property?.type !== 'files' || property.files.length === 0) return undefined
  const file = property.files[0]
  if (!file) return undefined
  if (file.type === 'external') return file.external.url
  if (file.type === 'file') return file.file.url
}

function findProperty(properties: PageObjectResponse['properties'], names: string[]) {
  const entries = Object.entries(properties)
  for (const name of names) {
    const match = entries.find(([key]) => key.toLowerCase() === name.toLowerCase())
    if (match) return match[1]
  }
}

function readRichText(property: PageObjectResponse['properties'][string] | undefined) {
  if (!property) return undefined
  if (property.type === 'rich_text') return richTextToPlain(property.rich_text) || undefined
  if (property.type === 'title') return richTextToPlain(property.title) || undefined
}

function richTextToPlain(items: RichTextItemResponse[]) {
  return items
    .map((item) => item.plain_text)
    .join('')
    .trim()
}

function coverUrl(page: PageObjectResponse) {
  if (!page.cover) return undefined
  if (page.cover.type === 'external') return page.cover.external.url
  if (page.cover.type === 'file') return page.cover.file.url
}

function headingFromMarkdown(markdown: string) {
  const match = /^#\s+(.+)$/m.exec(markdown)
  return match?.[1]?.replace(/\{[^}]*\}\s*$/, '').trim()
}

function firstParagraph(markdown: string) {
  const withoutHeading = markdown.replace(/^#\s+.+$/m, '')
  const paragraph = withoutHeading
    .split(/\n{2,}/)
    .map((block) => block.replaceAll(/<[^>]+>/g, '').trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('```'))
  return paragraph?.replaceAll('\n', ' ').slice(0, 280)
}

function isoWeekFromDate(date: string) {
  const value = new Date(`${date}T00:00:00Z`)
  const utc = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return { week, year: utc.getUTCFullYear() }
}

function asPageId(value: unknown) {
  if (typeof value !== 'string') return undefined
  return extractNotionId(value) ?? undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mapNotionError(error: unknown) {
  if (isNotionClientError(error)) {
    if (error.code === APIErrorCode.ObjectNotFound) {
      return createError({ statusCode: 404, statusMessage: 'Notion page not found' })
    }
    if (
      error.code === APIErrorCode.Unauthorized ||
      error.code === APIErrorCode.RestrictedResource
    ) {
      return createError({ statusCode: 502, statusMessage: 'Notion API authorization failed' })
    }
  }
  return createError({ statusCode: 502, statusMessage: 'Failed to fetch Notion page' })
}
