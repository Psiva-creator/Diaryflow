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
    dairyCode: formData.get('dairyCode') || undefined,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' }
  }

  const { name, email, password, dairyCode } = parsed.data

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'An account with this email already exists. Please sign in.' }
  }

  let adminId = null
  let role = 'admin'

  // If a dairy code is provided, this user is joining as staff
  if (dairyCode) {
    const admin = await prisma.user.findUnique({ where: { dairyCode } })
    if (!admin) {
      return { error: 'Invalid Dairy Invite Code. Please check and try again.' }
    }
    adminId = admin.id
    role = 'staff'
  }

  // Generate a friendly 6-character unique code for new admins
  let newDairyCode: string | undefined
  if (role === 'admin') {
    newDairyCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Hash password and create account
  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
      adminId,
      ...(newDairyCode && { dairyCode: newDairyCode }),
    },
  })

  redirect('/login?registered=true')
}
