import type { GitFile } from './github-content'

export type PublishCollection = 'blog' | 'weekly'

export interface BlogFrontmatter {
  collection: 'blog'
  title: string
  description: string
  date: string
  language?: string
  tags?: string[]
  image?: string
  draft: boolean
  slug: string
}

export interface WeeklyFrontmatter {
  collection: 'weekly'
  title: string
  description: string
  date: string
  language?: string
  week: number
  year: number
  commits: number
  prs: number
  blogs: number
  books: number
  slug: string
}

export type PublishFrontmatter = BlogFrontmatter | WeeklyFrontmatter

const IMAGE_RE = /!\[([^\]]*)\]\((https?:[^)\s]+)\)/g

export function slugify(input: string) {
  const slug = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return slug
}

export function weeklySlug(year: number, week: number) {
  return `${year}-w${String(week).padStart(2, '0')}`
}

export function sanitizeNotionMarkdown(markdown: string) {
  return mapNonCode(markdown, (chunk) => {
    let next = chunk
    next = stripBlockAttributes(next)
    next = next.replace(/<empty-block\s*\/>/gi, '')
    next = next.replace(/<table_of_contents\b[^>]*\/?>/gi, '')
    next = convertCallouts(next)
    next = convertDetails(next)
    next = unwrapTag(next, 'columns')
    next = unwrapTag(next, 'column')
    next = unwrapTag(next, 'synced_block')
    next = unwrapTag(next, 'synced_block_reference')
    next = convertMediaTags(next)
    next = convertMentions(next)
    next = convertNamedLinkTag(next, 'page')
    next = convertNamedLinkTag(next, 'database')
    next = convertHtmlTables(next)
    next = next.replace(/<(?:unknown|span)\b[^>]*>([\s\S]*?)<\/(?:unknown|span)>/gi, '$1')
    next = next.replace(/<(?:unknown|span)\b[^>]*\/?>/gi, '')
    next = next.replace(/<br\s*\/?>/gi, '\n')
    next = next.replace(/\n{3,}/g, '\n\n')
    return next.trim()
  }).trim()
}

export function toMarkdownDocument(frontmatter: PublishFrontmatter, body: string) {
  const fields =
    frontmatter.collection === 'blog'
      ? {
          title: frontmatter.title,
          description: frontmatter.description,
          date: frontmatter.date,
          language: frontmatter.language,
          tags: frontmatter.tags,
          image: frontmatter.image,
          draft: frontmatter.draft,
        }
      : {
          title: frontmatter.title,
          description: frontmatter.description,
          date: frontmatter.date,
          week: frontmatter.week,
          year: frontmatter.year,
          commits: frontmatter.commits,
          prs: frontmatter.prs,
          blogs: frontmatter.blogs,
          books: frontmatter.books,
          language: frontmatter.language,
        }

  return `${toYamlFrontmatter(fields)}\n${body.trim()}\n`
}

export async function rehostMarkdownImages(
  markdown: string,
  collection: PublishCollection,
  slug: string,
  extraUrls: string[] = [],
): Promise<{ markdown: string; files: GitFile[]; coverPath?: string }> {
  const files: GitFile[] = []
  const rewritten = new Map<string, string>()
  let index = 0

  async function rehost(url: string, preferredName?: string) {
    const cached = rewritten.get(url)
    if (cached) return cached

    const downloaded = await downloadImage(url)
    if (!downloaded) return url

    index += 1
    const filename = `${preferredName || String(index)}.${downloaded.ext}`
    const publicPath = `/images/${collection}/${slug}/${filename}`
    files.push({
      path: `public${publicPath}`,
      content: downloaded.bytes,
    })
    rewritten.set(url, publicPath)
    return publicPath
  }

  let next = markdown
  const matches = [...markdown.matchAll(IMAGE_RE)]
  for (const match of matches) {
    const url = match[2]
    if (!url) continue
    const publicPath = await rehost(url)
    if (publicPath !== url) {
      next = next.replaceAll(url, publicPath)
    }
  }

  let coverPath: string | undefined
  for (const [i, url] of extraUrls.entries()) {
    const publicPath = await rehost(url, i === 0 ? 'cover' : undefined)
    if (publicPath !== url && publicPath.startsWith('/')) {
      coverPath ??= publicPath
    }
  }

  return { markdown: next, files, coverPath }
}

function mapNonCode(markdown: string, mapper: (chunk: string) => string) {
  return markdown
    .split(/(```[\s\S]*?```)/)
    .map((part, index) => (index % 2 === 1 ? part : mapper(part)))
    .join('')
}

function stripBlockAttributes(markdown: string) {
  return markdown.replace(/[ \t]*\{(?:\s*[a-z-]+="[^"]*")+\s*\}/gi, '')
}

function convertCallouts(markdown: string) {
  return replaceTag(markdown, 'callout', (inner, attrs) => {
    const icon = /icon="([^"]*)"/.exec(attrs)?.[1]
    const lines = unindent(inner)
      .split('\n')
      .map((line) => line.trimEnd())
    if (icon && lines[0] !== undefined) {
      lines[0] = `${icon} ${lines[0]}`.trim()
    }
    return lines.map((line) => `> ${line}`.trimEnd()).join('\n')
  })
}

function convertDetails(markdown: string) {
  return replaceTag(markdown, 'details', (inner) => {
    const summaryMatch = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i.exec(inner)
    const summary = summaryMatch?.[1]?.trim()
    const rest = inner.replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '')
    const body = unindent(rest).trim()
    return [summary ? `**${stripTags(summary)}**` : '', body].filter(Boolean).join('\n\n')
  })
}

function convertMediaTags(markdown: string) {
  return markdown.replace(
    /<(audio|video|file|pdf)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_full, _tag: string, attrs: string, inner: string) => {
      const src = /src="([^"]+)"/.exec(attrs)?.[1]
      const caption = stripTags(inner).trim() || src || 'file'
      return src ? `[${caption}](${src})` : caption
    },
  )
}

function convertMentions(markdown: string) {
  return markdown.replace(
    /<mention-(?:user|page|database|data-source|agent)\b([^>]*)>([\s\S]*?)<\/mention-[a-z-]+>/gi,
    (_full, attrs: string, inner: string) => {
      const url = /url="([^"]+)"/.exec(attrs)?.[1]
      const label = stripTags(inner).trim()
      if (url && label) return `[${label}](${url})`
      return label
    },
  )
}

function convertNamedLinkTag(markdown: string, tag: string) {
  return replaceTag(markdown, tag, (inner, attrs) => {
    const url = /url="([^"]+)"/.exec(attrs)?.[1]
    const label = stripTags(inner).trim()
    if (url && label) return `[${label}](${url})`
    return label
  })
}

function convertHtmlTables(markdown: string) {
  return markdown.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (_full, inner: string) => {
    const rows = [...inner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
      [...row[1]!.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
        stripTags(cell[1]!).replaceAll('|', '\\|').replaceAll('\n', ' ').trim(),
      ),
    )
    if (rows.length === 0) return ''
    const header = rows[0]!
    const separator = header.map(() => '---')
    const lines = [
      `| ${header.join(' | ')} |`,
      `| ${separator.join(' | ')} |`,
      ...rows.slice(1).map((row) => `| ${row.join(' | ')} |`),
    ]
    return `\n${lines.join('\n')}\n`
  })
}

function unwrapTag(markdown: string, tag: string) {
  return replaceTag(markdown, tag, (inner) => unindent(inner).trim())
}

function replaceTag(
  markdown: string,
  tag: string,
  replacer: (inner: string, attrs: string) => string,
) {
  const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'gi')
  return markdown.replace(re, (_full, attrs: string | undefined, inner: string) =>
    replacer(inner, attrs ?? ''),
  )
}

function unindent(text: string) {
  return text.replace(/^(?:\t| {2,4})/gm, '').trim()
}

function stripTags(text: string) {
  return text.replaceAll(/<[^>]+>/g, '').trim()
}

function toYamlFrontmatter(fields: Record<string, unknown>) {
  const lines: string[] = []
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      lines.push(`${key}:`)
      for (const item of value) lines.push(`  - ${yamlScalar(item)}`)
      continue
    }
    if (typeof value === 'boolean' || typeof value === 'number') {
      lines.push(`${key}: ${value}`)
      continue
    }
    lines.push(`${key}: ${yamlScalar(value)}`)
  }
  return `---\n${lines.join('\n')}\n---`
}

function yamlScalar(value: unknown) {
  const text = String(value)
  if (/[:#{}[\],&*?!'"]|^\s|\s$|\n/.test(text)) {
    return `'${text.replaceAll("'", "''")}'`
  }
  return text
}

async function downloadImage(url: string) {
  try {
    const response = await $fetch.raw(url, {
      responseType: 'arrayBuffer',
      timeout: 20_000,
    })
    const bytes = new Uint8Array(response._data as ArrayBuffer)
    if (bytes.byteLength === 0) return null
    const contentType = String(response.headers.get('content-type') || '')
    return { bytes, ext: extensionFromContentType(contentType, url) }
  } catch {
    return null
  }
}

function extensionFromContentType(contentType: string, url: string) {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('gif')) return 'gif'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg'
  const fromUrl = /\.(png|webp|gif|jpe?g)(?:\?|$)/i.exec(url)?.[1]
  if (!fromUrl) return 'jpg'
  return fromUrl.toLowerCase() === 'jpeg' ? 'jpg' : fromUrl.toLowerCase()
}
