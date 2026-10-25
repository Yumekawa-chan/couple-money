import { Hono } from 'hono'
import type { Bindings } from '../types'
import { v4 as uuidv4 } from 'uuid';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { expenses_schema } from '../db/schema'
import type { Expense } from '../types'
import { z } from 'zod'

const expenseSchema = z.object({
  total: z.int().positive(),
  user_id: z.string(),
  spent_man: z.int().nonnegative(),
  spent_woman: z.int().nonnegative(),
  details: z.string().max(100).nullable()
})

const expense = new Hono<{ Bindings: Bindings }>()

// 支出登録
expense.post('/', zValidator('json', expenseSchema), async(c) => {
  const expense: Expense = c.req.valid('json')
  const db = drizzle(c.env.DB);

  if (expense.spent_man + expense.spent_woman !== expense.total) {
    return c.json({ error: '合計金額が一致しません！' }, 400)
  }

  const created_at = new Date().toISOString();
  const id = uuidv4();
  const expenseWithTimestamp = { ...expense, created_at, id };

  await db.insert(expenses_schema).values(expenseWithTimestamp);
  
  return c.json({ expense: expenseWithTimestamp }, 201)
})

// 支出取得
expense.get('/', async(c) => {
  const db = drizzle(c.env.DB);
  const user_id = c.req.query('user_id');

  if(!user_id) {
    return c.json({ error: 'user_idが指定されていません！' }, 400)
  }

  const expensesData = await db.select().from(expenses_schema).where(eq(expenses_schema.user_id, user_id)).all();

  return c.json({ expenses: expensesData }, 200)
})

// 支出削除
expense.delete('/:id', async(c) => {
  const { id } = c.req.param()  

  const db = drizzle(c.env.DB);
  await db.delete(expenses_schema).where(eq(expenses_schema.id,id)).run();

  return c.json({ message: `${id}のデータが削除されました！` }, 200)
  })

// 支出更新
expense.put('/:id', zValidator('json', expenseSchema), async(c) => {
  const { id } = c.req.param()
  const expense: Expense = c.req.valid('json')

  if (expense.spent_man + expense.spent_woman !== expense.total) {
    return c.json({ error: '合計金額が一致しません！' }, 400)
  }

  const db = drizzle(c.env.DB);
  await db.update(expenses_schema).set(expense).where(eq(expenses_schema.id, id)).run();

  return c.json({ message: `${id}のデータが更新されました！` }, 200)
})

export default expense;