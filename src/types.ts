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

export type { Bindings, Expense, User }