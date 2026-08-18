import { and, count, eq, gt } from 'drizzle-orm'
import { db } from 'hub:db'
import { comments } from '../db/schema'
import type { CommentPublic } from '../utils/comments'
import {
  COMMENT_RATE_LIMIT,
  COMMENT_RATE_WINDOW_MS,
  parseCommentBody,
  parsePostPath,
} from '../utils/comments'

export default defineEventHandler(async (event): Promise<CommentPublic> => {
  const { user } = await requireUserSession(event)
  const payload = await readBody(event).catch(() => null)
  const postPath = parsePostPath(payload?.postPath)
  const body = parseCommentBody(payload?.body)
  const now = Date.now()

  const [recent] = await db
    .select({ value: count() })
    .from(comments)
    .where(and(eq(comments.userId, user.id), gt(comments.createdAt, now - COMMENT_RATE_WINDOW_MS)))

  if ((recent?.value ?? 0) >= COMMENT_RATE_LIMIT) {
    throw createError({ statusCode: 429, statusMessage: 'Too many comments' })
  }

  const id = crypto.randomUUID()
  await db.insert(comments).values({
    id,
    postPath,
    userId: user.id,
    body,
    createdAt: now,
    updatedAt: now,
  })

  return {
    id,
    postPath,
    body,
    createdAt: now,
    updatedAt: now,
    userId: user.id,
    authorName: user.name || 'Anonymous',
    authorImage: user.image ?? null,
  }
})
