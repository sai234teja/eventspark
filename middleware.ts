import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './supabase/middleware'


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                           pathname.startsWith('/organizer') ||
                           pathname.startsWith('/admin')

  const isAuthRoute = pathname.startsWith('/auth/')

  // updateSession refreshes the session and returns response with cookies, user, and role
  const { response, user, role } = await updateSession(request)

  // Unauthenticated user trying to access protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    // Copy cookies from response so session is preserved
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Authenticated user trying to access auth pages — redirect by role
  if (user && isAuthRoute) {
    const dest = role === 'admin' ? '/admin' : role === 'organizer' ? '/organizer' : '/dashboard'
    
    const redirectResponse = NextResponse.redirect(new URL(dest, request.url))
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Role enforcement on protected routes
  if (user && isProtectedRoute) {

    if (pathname.startsWith('/admin') && role !== 'admin') {
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    if (
      pathname.startsWith('/organizer') && 
      pathname !== '/organizer/register' && 
      role !== 'organizer' && 
      role !== 'admin'
    ) {
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
