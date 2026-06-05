'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { loginSchema } from '@/lib/schemas'

export type LoginState = {
  error?: string
} | undefined

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // 1. Validate form
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Invalid email or password format.' }
  }

  const { email, password } = parsed.data

  // 2. Find user
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: 'Invalid credentials. Check your email and password.' }
  }

  // 3. Verify password
  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return { error: 'Invalid credentials. Check your email and password.' }
  }

  // 4. Create session
  await createSession(user.id, user.role, user.name, user.avatar)

  // 5. Redirect to dashboard
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/login')
}
