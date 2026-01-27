import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is authenticated using the new cookie names
  const accessToken = request.cookies.get('access_token')?.value
  const userData = request.cookies.get('user_data')?.value
  const authHeader = request.headers.get('authorization')

  const isAuthenticated = accessToken || userData || authHeader

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Path:', request.nextUrl.pathname)
    console.log('Middleware - Cookies:', {
      accessToken: accessToken ? 'present' : 'missing',
      userData: userData ? 'present' : 'missing',
      authHeader: authHeader ? 'present' : 'missing'
    })
    console.log('Middleware - IsAuthenticated:', isAuthenticated)
  }

  // If trying to access login page while authenticated, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && isAuthenticated) {
    console.log('Middleware - Redirecting authenticated user from login to dashboard')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If trying to access protected routes without authentication, redirect to login
  const isPublicRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/forgot-password')

  if (!isAuthenticated && !isPublicRoute) {
    console.log('Middleware - Redirecting unauthenticated user to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
