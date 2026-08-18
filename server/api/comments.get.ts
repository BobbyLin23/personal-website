import { desc, eq } from 'drizzle-orm'
import { db } from 'hub:db'
import { user } from '#auth/schema'
import { comments } from '../db/schema'
import type { CommentPublic } from '../utils/comments'
import { parsePostPath } from '../utils/comments'

export default defineEventHandler(async (event): Promise<{ comments: CommentPublic[] }> => {
  const postPath = parsePostPath(getQueryString(getQuery(event).postPath))

  const rows = await db
    .select({
      id: comments.id,
      postPath: comments.postPath,
      body: comments.body,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userId: comments.userId,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
    .where(eq(comments.postPath, postPath))
    .orderBy(desc(comments.createdAt))

  return {
    comments: rows.map((row) => ({
      id: row.id,
      postPath: row.postPath,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      userId: row.userId,
      authorName: row.authorName || 'Anonymous',
      authorImage: row.authorImage ?? null,
    })),
  }
})
