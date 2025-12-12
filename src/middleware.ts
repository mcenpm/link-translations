import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ============================================
  // ADMIN ROUTES - Only admin users can access
  // ============================================
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If no token or not an admin, redirect to admin login
    if (!token || !token.isAdmin) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If logged in admin tries to access admin login page, redirect to admin dashboard
  if (pathname === '/admin/login') {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (token?.isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // ============================================
  // CUSTOMER ROUTES - Only customer users can access
  // ============================================
  if (pathname.startsWith('/customer')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Must be logged in as CUSTOMER
    if (!token || token.role !== 'CUSTOMER') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ============================================
  // LINGUIST ROUTES - Only linguist users can access
  // ============================================
  if (pathname.startsWith('/linguist')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Must be logged in as LINGUIST
    if (!token || token.role !== 'LINGUIST') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ============================================
  // CUSTOMER LOGIN PAGE - Redirect if already logged in as customer/linguist
  // ============================================
  if (pathname === '/login') {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If already logged in as customer, redirect to customer dashboard
    if (token?.role === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url))
    }
    // If already logged in as linguist, redirect to linguist dashboard
    if (token?.role === 'LINGUIST') {
      return NextResponse.redirect(new URL('/linguist/dashboard', request.url))
    }
    // Admin users should not use this login page - they stay here and can't login
    // (The credentials provider only checks User table, not AdminUser)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/customer/:path*',
    '/linguist/:path*',
    '/login',
  ],
}
