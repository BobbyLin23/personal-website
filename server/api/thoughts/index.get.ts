import { desc, eq, inArray } from 'drizzle-orm'
import { db } from 'hub:db'
import { user } from '#auth/schema'
import { comments, likes, posts } from '../../db/schema'
import { isSiteOwner } from '../../utils/site-owner'
import type { LinkPayload, MoviePayload } from '../../db/schema'

interface MomentAuthor {
  id: string
  name: string
  image: string | null
}

export interface Moment {
  id: string
  authorId: string
  author: MomentAuthor
  content: string
  images: string[]
  movie: MoviePayload | null
  link: LinkPayload | null
  createdAt: number
  updatedAt: number
  likeCount: number
  commentCount: number
  likedByMe: boolean
}

export default defineEventHandler(
  async (event): Promise<{ moments: Moment[]; isOwner: boolean }> => {
    const session = await getUserSession(event)
    const currentUser = session?.user ?? null

    const rows = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        images: posts.images,
        movie: posts.movie,
        link: posts.link,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(posts)
      .leftJoin(user, eq(posts.authorId, user.id))
      .orderBy(desc(posts.createdAt))

    const postIds = rows.map((row) => row.id)
    const likeRows = postIds.length
      ? await db
          .select({ postId: likes.postId, userId: likes.userId })
          .from(likes)
          .where(inArray(likes.postId, postIds))
      : []
    const commentRows = postIds.length
      ? await db
          .select({ postPath: comments.postPath })
          .from(comments)
          .where(
            inArray(
              comments.postPath,
              postIds.map((id) => `/thoughts/${id}`),
            ),
          )
      : []

    const likeCounts = new Map<string, number>()
    const likedBy = new Map<string, Set<string>>()
    for (const like of likeRows) {
      likeCounts.set(like.postId, (likeCounts.get(like.postId) ?? 0) + 1)
      const set = likedBy.get(like.postId) ?? new Set<string>()
      set.add(like.userId)
      likedBy.set(like.postId, set)
    }

    const commentCounts = new Map<string, number>()
    for (const comment of commentRows) {
      const postId = comment.postPath.replace('/thoughts/', '')
      commentCounts.set(postId, (commentCounts.get(postId) ?? 0) + 1)
    }

    const currentUserId = currentUser?.id

    return {
      moments: rows.map((row) => ({
        id: row.id,
        authorId: row.authorId,
        author: {
          id: row.authorId,
          name: row.authorName || 'Anonymous',
          image: row.authorImage ?? null,
        },
        content: row.content,
        images: Array.isArray(row.images) ? row.images : [],
        movie: row.movie ?? null,
        link: row.link ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        likeCount: likeCounts.get(row.id) ?? 0,
        commentCount: commentCounts.get(row.id) ?? 0,
        likedByMe: currentUserId ? (likedBy.get(row.id)?.has(currentUserId) ?? false) : false,
      })),
      isOwner: isSiteOwner(currentUser?.email),
    }
  },
)
