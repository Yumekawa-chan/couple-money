import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';

const app = new Hono()

const expenseSchema = z.object({
  total: z.int().positive(),
  spent_man: z.int().nonnegative(),
  spent_woman: z.int().nonnegative(),
  details: z.string().max(100).nullable()
})

type Expense = {
  total: number
  spent_man: number
  spent_woman: number
  details: string | null
}

app.get('/', (c) => {
  return c.text('Hello World')
})

app.post('/expense', zValidator('json', expenseSchema), (c) => {
  const expense: Expense = c.req.valid('json')

  if (expense.spent_man + expense.spent_woman !== expense.total) {
    return c.json({ error: '合計金額が一致しません！' }, 400)
  }

  const created_at = new Date().toISOString();
  const expenseWithTimestamp = { ...expense, created_at };

  // ここでデータベースに保存する処理
  
  return c.json({ expense })
})



export default app
