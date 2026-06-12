import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { loginSchema } from '@/lib/schemas'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })
        
        if (!user) return null

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          dairyCode: user.dairyCode,
          adminId: user.adminId,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.name = user.name
        token.avatar = (user as any).avatar
        token.dairyCode = (user as any).dairyCode
        token.adminId = (user as any).adminId
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        ;(session.user as any).role = token.role
        ;(session.user as any).avatar = token.avatar
        ;(session.user as any).dairyCode = token.dairyCode
        ;(session.user as any).adminId = token.adminId
      }
      return session
    },
  },
})
