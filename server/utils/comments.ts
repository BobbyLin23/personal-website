import { z } from 'zod'
import { COMMENT_MAX_LENGTH, COMMENT_RATE_LIMIT, COMMENT_RATE_WINDOW_MS } from '#shared/comments'

export { COMMENT_MAX_LENGTH, COMMENT_RATE_LIMIT, COMMENT_RATE_WINDOW_MS }

export const postPathSchema = z
  .string()
  .regex(/^\/(blog|weekly)\/[a-zA-Z0-9._/-]+$/, 'Invalid post path')

export function sanitizeCommentBody(value: string) {
  let result = ''
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    if (code === 9 || code === 10 || (code >= 32 && code !== 127)) {
      result += char
    }
  }
  return result.trim()
}

export const commentBodySchema = z
  .string()
  .transform(sanitizeCommentBody)
  .pipe(z.string().min(1).max(COMMENT_MAX_LENGTH))

export interface CommentPublic {
  id: string
  postPath: string
  body: string
  createdAt: number
  updatedAt: number
  userId: string
  authorName: string
  authorImage: string | null
}

export function parsePostPath(value: unknown) {
  const result = postPathSchema.safeParse(value)
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid post path' })
  }
  return result.data
}

export function parseCommentBody(value: unknown) {
  const result = commentBodySchema.safeParse(value)
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid comment' })
  }
  return result.data
}
