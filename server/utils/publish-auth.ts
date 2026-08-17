import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export interface PublishConfig {
  publishSecret: string
  notionToken: string
  notionDatabaseIds: string[]
  githubToken: string
  githubOwner: string
  githubRepo: string
  githubBranch: string
  siteUrl: string
}

export function getPublishConfig(event: H3Event): PublishConfig {
  const config = useRuntimeConfig(event)
  const databaseIds = config.notionDatabaseIds
    .split(',')
    .map((id: string) => id.trim())
    .filter(Boolean)

  return {
    publishSecret: config.publishSecret,
    notionToken: config.notionToken,
    notionDatabaseIds: databaseIds,
    githubToken: config.githubToken,
    githubOwner: config.github.owner,
    githubRepo: config.github.repo,
    githubBranch: config.github.branch,
    siteUrl: String(config.public.siteUrl || '').replace(/\/$/, ''),
  }
}

export function assertPublishAuthorized(event: H3Event, config: PublishConfig) {
  if (!config.publishSecret) {
    throw createError({ statusCode: 503, statusMessage: 'Publish API is not configured' })
  }

  const provided = getHeader(event, 'x-publish-secret') ?? ''
  if (!provided || !timingSafeEqualString(provided, config.publishSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}

function timingSafeEqualString(left: string, right: string) {
  const leftHash = createHash('sha256').update(left).digest()
  const rightHash = createHash('sha256').update(right).digest()
  return timingSafeEqual(leftHash, rightHash)
}
