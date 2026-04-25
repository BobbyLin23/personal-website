import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const FRONTMATTER_RE = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/

export interface SplitMarkdown {
  frontmatter: string
  body: string
}

export function splitFrontmatter(raw: string): SplitMarkdown {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) {
    return { frontmatter: '', body: raw }
  }
  const body = raw.slice(match[0].length)
  return { frontmatter: match[1]!, body }
}

export function getFrontmatterField(frontmatter: string, field: string): string | undefined {
  const re = new RegExp(`^${field}\\s*:\\s*(.*)$`, 'm')
  const m = frontmatter.match(re)
  if (!m)
    return undefined
  return m[1]!.trim().replace(/^['"]|['"]$/g, '')
}

export async function parseMdToAst(md: string) {
  return parseMarkdown(md, {
    toc: {
      depth: 3,
      searchDepth: 3,
    },
  })
}
