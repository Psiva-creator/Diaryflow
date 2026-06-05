import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const secretKey = process.env.SESSION_SECRET
if (!secretKey) throw new Error('SESSION_SECRET environment variable is required')
const encodedKey = new TextEncoder().encode(secretKey)

export interface SessionPayload extends JWTPayload {
  userId: string
  role: string
  name: string
  avatar: string
  expiresAt: string
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch {
    console.log('Failed to verify session')
    return null
  }
}
