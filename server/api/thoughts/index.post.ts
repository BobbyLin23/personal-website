import { and, count, eq, gt } from 'drizzle-orm'
import { db } from 'hub:db'
import { posts } from '../../db/schema'
import { isSiteOwner } from '../../utils/site-owner'
import {
  MOMENT_PUBLISH_RATE_LIMIT,
  MOMENT_PUBLISH_RATE_WINDOW_MS,
  parseMomentInput,
} from '../../utils/moments'
import type { Moment } from './index.get'

export default defineEventHandler(async (event): Promise<{ moment: Moment }> => {
  const { user } = await requireUserSession(event)

  if (!isSiteOwner(user.email)) {
    throw createError({ statusCode: 403, statusMessage: 'Only the site owner can publish' })
  }

  const payload = await readBody(event).catch(() => null)
  const input = parseMomentInput(payload)
  const now = Date.now()

  const [recent] = await db
    .select({ value: count() })
    .from(posts)
    .where(
      and(eq(posts.authorId, user.id), gt(posts.createdAt, now - MOMENT_PUBLISH_RATE_WINDOW_MS)),
    )

  if ((recent?.value ?? 0) >= MOMENT_PUBLISH_RATE_LIMIT) {
    throw createError({ statusCode: 429, statusMessage: 'Too many moments' })
  }

  const id = crypto.randomUUID()
  await db.insert(posts).values({
    id,
    authorId: user.id,
    content: input.content,
    images: input.images,
    movie: input.movie ?? null,
    link: input.link ?? null,
    createdAt: now,
    updatedAt: now,
  })

  return {
    moment: {
      id,
      authorId: user.id,
      author: { id: user.id, name: user.name || 'Anonymous', image: user.image ?? null },
      content: input.content,
      images: input.images,
      movie: input.movie ?? null,
      link: input.link ?? null,
      createdAt: now,
      updatedAt: now,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
    },
  }
})
