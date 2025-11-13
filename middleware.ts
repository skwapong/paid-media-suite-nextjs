import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple authentication middleware
export function middleware(request: NextRequest) {
  // Skip auth for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip auth for static files
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authToken = request.cookies.get('auth-token')?.value
  const validToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN || 'demo-access-2024'

  // If authenticated, allow access
  if (authToken === validToken) {
    return NextResponse.next()
  }

  // If not authenticated, redirect to login page
  if (request.nextUrl.pathname !== '/login') {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
