import 'server-only'
import { auth } from '@/auth'

export interface SessionPayload {
  userId: string
  role: string
  name: string
  avatar: string
  expiresAt: string
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = await auth()
  if (!session?.user) return null

  return {
    userId: session.user.id as string,
    role: (session.user as any).role as string,
    name: session.user.name as string,
    avatar: (session.user as any).avatar as string,
    expiresAt: session.expires as string,
  }
}
