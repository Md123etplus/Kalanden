import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const user = request.cookies.get('user')

  // Allow access to course pages without authentication
  if (request.nextUrl.pathname.startsWith('/courses')) {
    return NextResponse.next()
  }

  // If there's a session and user data, allow access to all routes
  if (session && user) {
    return NextResponse.next()
  }

  // If there's no session or user data, only allow access to public routes
  const publicRoutes = ['/login', '/signup', '/']
  if (!publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}

