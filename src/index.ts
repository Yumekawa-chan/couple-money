import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';
import { v4 as uuidv4 } from 'uuid';
import { logger } from 'hono/logger';
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { expenses } from './db/schema'
import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()
app.use('*', logger())

const expenseSchema = z.object({
  total: z.int().positive(),
  user_id: z.string(),
  spent_man: z.int().nonnegative(),
  spent_woman: z.int().nonnegative(),
  details: z.string().max(100).nullable()
})

type Expense = {
  total: number
  user_id: string
  spent_man: number
  spent_woman: number
  details: string | null
}

app.get('/', (c) => {
  return c.text('Hello World')
})

app.post('/expense', zValidator('json', expenseSchema), async(c) => {
  const expense: Expense = c.req.valid('json')
  const db = drizzle(c.env.DB);

  if (expense.spent_man + expense.spent_woman !== expense.total) {
    return c.json({ error: '合計金額が一致しません！' }, 400)
  }

  const created_at = new Date().toISOString();
  const id = uuidv4();
  const expenseWithTimestamp = { ...expense, created_at, id };

  // ここでデータベースに保存する処理
  await db.insert(expenses).values(expenseWithTimestamp);
  
  return c.json({ expense: expenseWithTimestamp }, 201)
})

app.get('/expense', async(c) => {

  // データベースから全ての支出データを取得する処理
  const db = drizzle(c.env.DB);
  const user_id = c.req.query('user_id');

  if(!user_id) {
    return c.json({ error: 'user_idが指定されていません！' }, 400)
  }

  const expensesData = await db.select().from(expenses).where(eq(expenses.user_id, user_id)).all();

  return c.json({ expenses: expensesData }, 200)
})

app.delete('/expense/:id', (c) => {
  const { id } = c.req.param()  

  // データベースから指定されたIDの支出データを削除する処理

  return c.json({ message: `${id}のデータが削除されました！` }, 200)
})

app.put('/expense/:id', zValidator('json', expenseSchema), (c) => {
  const { id } = c.req.param()
  const expense: Expense = c.req.valid('json')

  if (expense.spent_man + expense.spent_woman !== expense.total) {
    return c.json({ error: '合計金額が一致しません！' }, 400)
  }

  // データベースで指定されたIDの支出データを更新する処理

  return c.json({ message: `${id}のデータが更新されました！` }, 200)
})

export default app
