'use server'

import { prisma } from '@/lib/db'
import { registerSchema } from '@/lib/schemas'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export type RegisterState = {
  error?: string
  success?: boolean
} | undefined

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' }
  }

  const { name, email, password } = parsed.data

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'An account with this email already exists. Please sign in.' }
  }

  // Hash password and create account
  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'staff',
    },
  })

  redirect('/login?registered=true')
}
