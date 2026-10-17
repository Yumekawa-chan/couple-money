import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';
import { v4 as uuidv4 } from 'uuid';
import { logger } from 'hono/logger'

const app = new Hono()
app.use('*', logger())

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
  const id = uuidv4();
  const expenseWithTimestamp = { ...expense, created_at, id };


  // ここでデータベースに保存する処理
  
  return c.json({ expense: expenseWithTimestamp }, 201)
})

app.get('/expense', (c) => {

  // データベースから全ての支出データを取得する処理

  const expenses: Expense[] = [] // 仮のデータ
  return c.json({ expenses }, 200)
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
