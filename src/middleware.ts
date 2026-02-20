import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Role-based access control
    const roleAccess: Record<string, string[]> = {
      '/dashboard/settings': ['ADMIN', 'CEO'],
      '/dashboard/employees/add': ['HR', 'ADMIN', 'CEO'],
      '/dashboard/payroll/process': ['HR', 'ADMIN', 'CEO'],
      '/dashboard/leave/approvals': ['MANAGER', 'HR', 'ADMIN', 'CEO'],
      '/dashboard/attendance/team': ['MANAGER', 'HR', 'ADMIN', 'CEO'],
      '/dashboard/reports': ['HR', 'ADMIN', 'CEO'],
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
  ]
}
