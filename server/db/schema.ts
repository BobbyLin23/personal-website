import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const comments = sqliteTable(
  'comments',
  {
    id: text('id').primaryKey(),
    postPath: text('post_path').notNull(),
    userId: text('user_id').notNull(),
    body: text('body').notNull(),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (table) => [index('comments_post_path_idx').on(table.postPath)],
)

export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(),
    authorId: text('author_id').notNull(),
    content: text('content').notNull().default(''),
    images: text('images', { mode: 'json' }).$type<string[]>().notNull().default([]),
    movie: text('movie', { mode: 'json' }).$type<MoviePayload | null>(),
    link: text('link', { mode: 'json' }).$type<LinkPayload | null>(),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (table) => [index('posts_created_at_idx').on(table.createdAt)],
)

export const likes = sqliteTable(
  'likes',
  {
    id: text('id').primaryKey(),
    postId: text('post_id').notNull(),
    userId: text('user_id').notNull(),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (table) => [
    uniqueIndex('likes_post_user_uidx').on(table.postId, table.userId),
    index('likes_post_id_idx').on(table.postId),
  ],
)

export interface MoviePayload {
  id: number
  title: string
  year: string
  overview: string
  posterPath: string | null
  rating: number
  genres: string[]
}

export interface LinkPayload {
  url: string
  title: string
  description: string
  image: string | null
  siteName: string | null
}
