import type { NextAuthConfig } from 'next-auth'

const publicPaths = ['/login', '/register', '/', '/_next', '/favicon.ico']

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPath = publicPaths.some(p => 
        nextUrl.pathname === p || nextUrl.pathname.startsWith(p + '/')
      ) || nextUrl.pathname.startsWith('/api')

      // Protect dashboard routes
      if (!isPublicPath) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }

      // If user is already logged in and tries to go to login page, redirect to dashboard
      if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      return true
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        // User is available during sign-in
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
        ;(session.user as any).role = token.role as string
        session.user.name = token.name as string
        ;(session.user as any).avatar = token.avatar as string
        ;(session.user as any).dairyCode = token.dairyCode as string
        ;(session.user as any).adminId = token.adminId as string | null
      }
      return session
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
