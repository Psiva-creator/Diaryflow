import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth-crypto'

const publicPaths = ['/login', '/', '/_next', '/favicon.ico']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Allow static files and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check session
  const session = request.cookies.get('session')?.value
  const payload = await decrypt(session)

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Refresh session expiry
  const response = NextResponse.next()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  response.cookies.set('session', session!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
