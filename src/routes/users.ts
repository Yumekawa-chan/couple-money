import {  Hono } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod'
import { Bindings, User } from '../types';
import { drizzle } from 'drizzle-orm/d1'
import { users_schema } from '../db/schema';

const userSchema = z.object({
  id: z.string(),
  password_hash: z.string(),
  created_at: z.string()
})

const user = new Hono<{ Bindings: Bindings }>()

// ユーザー作成
user.post('/create', zValidator('json', userSchema), async(c) => {
  const user: User = c.req.valid('json')
  const db = drizzle(c.env.DB);

  await db.insert(users_schema).values(user);

  return c.json({ user }, 201)
})

export default user;