import { z } from 'zod'

export const MOMENT_CONTENT_MAX_LENGTH = 2000
export const MOMENT_IMAGES_MAX = 9
export const MOMENT_PUBLISH_RATE_LIMIT = 5
export const MOMENT_PUBLISH_RATE_WINDOW_MS = 60_000

export const momentContentSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().min(0).max(MOMENT_CONTENT_MAX_LENGTH))

const movieSchema = z
  .object({
    id: z.number().int(),
    title: z.string().min(1).max(300),
    year: z.string().max(10),
    overview: z.string().max(4000),
    posterPath: z.string().nullable(),
    rating: z.number().min(0).max(10),
    genres: z.array(z.string()).max(20),
  })
  .nullable()

const linkSchema = z
  .object({
    url: z.string().url(),
    title: z.string().min(1).max(300),
    description: z.string().max(2000),
    image: z.string().nullable(),
    siteName: z.string().nullable(),
  })
  .nullable()

const imageSchema = z.string().url().max(2000)

export const momentInputSchema = z
  .object({
    content: momentContentSchema.default(''),
    images: z.array(imageSchema).max(MOMENT_IMAGES_MAX).default([]),
    movie: movieSchema,
    link: linkSchema,
  })
  .refine((value) => {
    const hasText = value.content.length > 0
    const hasImage = value.images.length > 0
    const hasMovie = value.movie !== null
    const hasLink = value.link !== null
    return hasText || hasImage || hasMovie || hasLink
  }, 'A moment must contain at least one of text, image, movie, or link')

export type MomentInput = z.infer<typeof momentInputSchema>

export function parseMomentInput(value: unknown) {
  const result = momentInputSchema.safeParse(value)
  if (!result.success) {
    const message = result.error.issues[0]?.message || 'Invalid moment'
    throw createError({ statusCode: 400, statusMessage: message })
  }
  return result.data
}
