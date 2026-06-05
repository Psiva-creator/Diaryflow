import 'server-only'
import { cookies } from 'next/headers'
import { encrypt, decrypt, type SessionPayload } from '@/lib/auth-crypto'

// Re-export for convenience
export { type SessionPayload } from '@/lib/auth-crypto'
export { decrypt } from '@/lib/auth-crypto'

export async function createSession(userId: string, role: string, name: string, avatar: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({
    userId,
    role,
    name,
    avatar,
    expiresAt: expiresAt.toISOString(),
  })

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  return decrypt(session)
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
