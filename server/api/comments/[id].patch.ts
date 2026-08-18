import { eq } from 'drizzle-orm'
import { db } from 'hub:db'
import { comments } from '../../db/schema'
import type { CommentPublic } from '../../utils/comments'
import { parseCommentBody } from '../../utils/comments'

export default defineEventHandler(async (event): Promise<CommentPublic> => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing comment id' })

  const payload = await readBody(event).catch(() => null)
  const body = parseCommentBody(payload?.body)
  const now = Date.now()

  const [existing] = await db.select().from(comments).where(eq(comments.id, id)).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Comment not found' })
  if (existing.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  await db.update(comments).set({ body, updatedAt: now }).where(eq(comments.id, id))

  return {
    id: existing.id,
    postPath: existing.postPath,
    body,
    createdAt: existing.createdAt,
    updatedAt: now,
    userId: existing.userId,
    authorName: user.name || 'Anonymous',
    authorImage: user.image ?? null,
  }
})
