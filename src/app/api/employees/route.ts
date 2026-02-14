import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        // Basic role check
        const allowedRoles = ['HR', 'ADMIN', 'CEO', 'MANAGER']
        if (!session?.user?.email || !allowedRoles.includes(session.user.role as string)) {
            // For now, maybe allow employees to see basic list? 
            // The UI shows "Employee Management" which implies admin feature.
            // But existing code checked `canManage`.
            if (!['HR', 'ADMIN', 'CEO'].includes(session?.user?.role as string)) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
            }
        }

        const { searchParams } = new URL(req.url)
        const department = searchParams.get('department')
        const search = searchParams.get('search')

        const where: any = {}

        if (department && department !== 'ALL') {
            where.department = {
                name: department
            }
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { employeeId: { contains: search, mode: 'insensitive' } }
            ]
        }

        const employees = await prisma.employee.findMany({
            where,
            include: {
                department: true,
                designation: true,
                user: {
                    select: {
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const formattedEmployees = employees.map(emp => ({
            id: emp.id,
            employeeId: emp.employeeId,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            phone: emp.phone || '',
            department: emp.department.name,
            designation: emp.designation.name,
            joiningDate: emp.joiningDate ? emp.joiningDate.toISOString().split('T')[0] : '',
            status: emp.user?.status || 'ACTIVE',
            profileImage: emp.profileImage
        }))

        return NextResponse.json({ employees: formattedEmployees })
    } catch (error) {
        console.error('Error fetching employees:', error)
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }
}
