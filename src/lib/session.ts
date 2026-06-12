import 'server-only'
import { auth } from '@/auth'

export interface SessionPayload {
  userId: string
  role: string
  name: string
  avatar: string
  dairyCode: string
  adminId: string | null
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
    dairyCode: (session.user as any).dairyCode as string,
    adminId: (session.user as any).adminId as string | null,
    expiresAt: session.expires as string,
  }
}
