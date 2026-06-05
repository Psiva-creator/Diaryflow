'use server'

import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'

export type LoginState = {
  error?: string
} | undefined

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn('credentials', Object.fromEntries(formData))
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials. Check your email and password.' }
        default:
          return { error: 'Something went wrong.' }
      }
    }
    throw error // Important: Next.js redirects throw an error that must be rethrown
  }
}

export async function logout(): Promise<void> {
  await signOut()
}
