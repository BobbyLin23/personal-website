import { and, count, eq, gt } from 'drizzle-orm'
import { db } from 'hub:db'
import { likes, posts } from '../../../db/schema'
import { LIKE_RATE_LIMIT, LIKE_RATE_WINDOW_MS } from '#shared/moments'

export default defineEventHandler(async (event): Promise<{ liked: boolean; likeCount: number }> => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing moment id' })

  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Moment not found' })

  const now = Date.now()
  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.postId, id), eq(likes.userId, user.id)))
    .limit(1)

  if (existing) {
    await db.delete(likes).where(eq(likes.id, existing.id))
  } else {
    const [recent] = await db
      .select({ value: count() })
      .from(likes)
      .where(and(eq(likes.userId, user.id), gt(likes.createdAt, now - LIKE_RATE_WINDOW_MS)))

    if ((recent?.value ?? 0) >= LIKE_RATE_LIMIT) {
      throw createError({ statusCode: 429, statusMessage: 'Too many likes' })
    }

    await db
      .insert(likes)
      .values({ id: crypto.randomUUID(), postId: id, userId: user.id, createdAt: now })
  }

  const [aggregate] = await db.select({ value: count() }).from(likes).where(eq(likes.postId, id))

  return { liked: !existing, likeCount: aggregate?.value ?? 0 }
})
