import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '../supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                           pathname.startsWith('/organizer') ||
                           pathname.startsWith('/admin')

  const isAuthRoute = pathname.startsWith('/auth/')

  // updateSession refreshes the session and returns response with cookies
  const response = await updateSession(request)

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'user'
    const dest = role === 'admin' ? '/admin' : role === 'organizer' ? '/organizer' : '/dashboard'
    
    const redirectResponse = NextResponse.redirect(new URL(dest, request.url))
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Role enforcement on protected routes
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'user'

    if (pathname.startsWith('/admin') && role !== 'admin') {
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    if (pathname.startsWith('/organizer') && role !== 'organizer' && role !== 'admin') {
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
