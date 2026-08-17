import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
