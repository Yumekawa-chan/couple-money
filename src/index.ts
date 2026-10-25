import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';
import { v4 as uuidv4 } from 'uuid';
import { logger } from 'hono/logger';
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { expenses, users } from './db/schema'
import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
}

type Expense = {
  total: number
  user_id: string
  spent_man: number
  spent_woman: number
  details: string | null
}

type User = {
  id: string
  password_hash: string
  created_at: string
}

const expenseSchema = z.object({
  total: z.int().positive(),
  user_id: z.string(),
  spent_man: z.int().nonnegative(),
  spent_woman: z.int().nonnegative(),
  details: z.string().max(100).nullable()
})

const userSchema = z.object({
  id: z.string(),
  password_hash: z.string(),
  created_at: z.string()
})

const app = new Hono<{ Bindings: Bindings }>()
app.use('*', logger())

// ルート
app.get('/', (c) => {
  return c.text('Hello World')
})

// ユーザー作成
app.post('/create-user', zValidator('json', userSchema), async(c) => {
  const user: User = c.req.valid('json')
  const db = drizzle(c.env.DB);

  await db.insert(users).values(user);

  return c.json({ user }, 201)
})

// 支出登録
app.post('/expense', zValidator('json', expenseSchema), async(c) => {
  const expense: Expense = c.req.valid('json')
  const db = drizzle(c.env.DB);

  if (expense.spent_man + expense.spent_woman !== expense.total) {
    return c.json({ error: '合計金額が一致しません！' }, 400)
  }

  const created_at = new Date().toISOString();
  const id = uuidv4();
  const expenseWithTimestamp = { ...expense, created_at, id };

  await db.insert(expenses).values(expenseWithTimestamp);
  
  return c.json({ expense: expenseWithTimestamp }, 201)
})

// 支出取得
app.get('/expense', async(c) => {
  const db = drizzle(c.env.DB);
  const user_id = c.req.query('user_id');

  if(!user_id) {
    return c.json({ error: 'user_idが指定されていません！' }, 400)
  }

  const expensesData = await db.select().from(expenses).where(eq(expenses.user_id, user_id)).all();

  return c.json({ expenses: expensesData }, 200)
})

// 支出削除
app.delete('/expense/:id', async(c) => {
  const { id } = c.req.param()  

  const db = drizzle(c.env.DB);
  await db.delete(expenses).where(eq(expenses.id,id)).run();

  return c.json({ message: `${id}のデータが削除されました！` }, 200)
  })

// 支出更新
app.put('/expense/:id', zValidator('json', expenseSchema), async(c) => {
  const { id } = c.req.param()
  const expense: Expense = c.req.valid('json')

  if (expense.spent_man + expense.spent_woman !== expense.total) {
    return c.json({ error: '合計金額が一致しません！' }, 400)
  }

  const db = drizzle(c.env.DB);
  await db.update(expenses).set(expense).where(eq(expenses.id, id)).run();

  return c.json({ message: `${id}のデータが更新されました！` }, 200)
})

export default app
