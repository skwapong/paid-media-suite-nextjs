import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PASSWORD = 'TreasureData2024!' // Simple hardcoded password

export function middleware(request: NextRequest) {
  // Skip auth for login page, API routes, and static files
  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Check if user has valid password cookie
  const authCookie = request.cookies.get('auth')?.value

  if (authCookie === PASSWORD) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
