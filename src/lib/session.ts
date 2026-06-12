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
  effectiveUserId: string
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = await auth()
  if (!session?.user) return null

  const userId = session.user.id as string
  const adminId = (session.user as any).adminId as string | null

  return {
    userId,
    role: (session.user as any).role as string,
    name: session.user.name as string,
    avatar: (session.user as any).avatar as string,
    dairyCode: (session.user as any).dairyCode as string,
    adminId,
    expiresAt: session.expires as string,
    effectiveUserId: adminId || userId,
  }
}
