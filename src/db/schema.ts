import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users_schema = sqliteTable('users', {
  id: text('id').primaryKey(),
  password_hash: text('password_hash').notNull(),
  created_at: text('created_at').notNull(),
})

export const expenses_schema = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users_schema.id),
  total: integer('total').notNull(),
  spent_man: integer('spent_man').notNull(),
  spent_woman: integer('spent_woman').notNull(),
  details: text('details'),
  created_at: text('created_at').notNull(),
})
