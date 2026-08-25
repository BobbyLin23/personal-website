import { eq } from 'drizzle-orm'
import { db } from 'hub:db'
import { comments, likes, posts } from '../../../db/schema'
import { isSiteOwner } from '../../../utils/site-owner'

export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const { user } = await requireUserSession(event)

  if (!isSiteOwner(user.email)) {
    throw createError({ statusCode: 403, statusMessage: 'Only the site owner can delete moments' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing moment id' })

  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Moment not found' })

  await db.delete(likes).where(eq(likes.postId, id))
  await db.delete(comments).where(eq(comments.postPath, `/thoughts/${id}`))
  await db.delete(posts).where(eq(posts.id, id))

  return { ok: true }
})
