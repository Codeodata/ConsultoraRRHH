import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/api/auth']

const ADMIN_ROUTES = ['/users', '/api/users']
const RRHH_OR_ADMIN_ROUTES = [
  '/companies',
  '/services',
  '/documents',
  '/api/companies',
  '/api/services',
  '/api/documents',
  '/api/upload',
]

export default auth(function middleware(req: NextRequest & { auth: any }) {
  const { nextUrl, auth: session } = req as any
  const pathname = nextUrl.pathname

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))

  if (isPublicRoute) {
    if (session && pathname === '/login') {
      const role = session.user?.role
      if (role === 'CLIENT') {
        return NextResponse.redirect(new URL('/portal', nextUrl))
      }
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  const role = session.user?.role

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  if (isAdminRoute && role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  const isPortalRoute = pathname.startsWith('/portal')
  if (isPortalRoute && role !== 'CLIENT') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  const isDashboardRoute = pathname.startsWith('/dashboard') || RRHH_OR_ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  if (isDashboardRoute && role === 'CLIENT') {
    return NextResponse.redirect(new URL('/portal', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
}
