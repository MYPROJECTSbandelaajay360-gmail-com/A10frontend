import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Role-based access control
    const roleAccess: Record<string, string[]> = {
      '/settings': ['ADMIN', 'CEO'],
      '/employees/add': ['HR', 'ADMIN', 'CEO'],
      '/payroll/process': ['HR', 'ADMIN', 'CEO'],
      '/leave/approvals': ['MANAGER', 'HR', 'ADMIN', 'CEO'],
      '/attendance/team': ['MANAGER', 'HR', 'ADMIN', 'CEO'],
      '/reports': ['HR', 'ADMIN', 'CEO'],
    }

    // Check if the path requires specific roles
    for (const [path, roles] of Object.entries(roleAccess)) {
      if (pathname.startsWith(path)) {
        const userRole = token?.role as string
        if (!roles.includes(userRole)) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/attendance/:path*',
    '/leave/:path*',
    '/employees/:path*',
    '/payroll/:path*',
    '/holidays/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/notifications/:path*',
  ]
}
