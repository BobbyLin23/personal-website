import type { H3Event } from 'h3'
import { stringify } from 'minimark/stringify'

export function getSiteUrl(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const siteUrl = config.public.siteUrl as string | undefined
  if (siteUrl)
    return siteUrl.replace(/\/$/, '')
  const url = getRequestURL(event)
  return `${url.protocol}//${url.host}`
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function formatRssDate(date: Date): string {
  return date.toUTCString()
}

export function bodyToHtml(body: { value?: unknown[] } | null | undefined): string {
  if (!body?.value?.length)
    return ''
  try {
    return stringify({ type: 'minimark', value: body.value as never[] }, { format: 'text/html' })
  }
  catch {
    return ''
  }
}
