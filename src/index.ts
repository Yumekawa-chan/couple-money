import { Hono } from 'hono'
import { logger } from 'hono/logger';
import type { Bindings } from './types'
import users from './routes/users'
import expenses from './routes/expenses'


const app = new Hono<{ Bindings: Bindings }>()
app.use('*', logger())

// ルート
app.get('/', (c) => {
  return c.text('Hello World')
})

// ユーザー関連のルート
app.route('/users', users)

// 支出関連のルート
app.route('/expenses', expenses)


export default app
