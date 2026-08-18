import { eq } from 'drizzle-orm'
import { db } from 'hub:db'
import { comments } from '../../db/schema'

export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing comment id' })

  const [existing] = await db.select().from(comments).where(eq(comments.id, id)).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Comment not found' })
  if (existing.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  await db.delete(comments).where(eq(comments.id, id))
  return { ok: true }
})
