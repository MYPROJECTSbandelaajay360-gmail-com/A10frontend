import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'HR'].includes(session.user.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch all employees and their associated user information
        const employees = await prisma.employee.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                        createdAt: true,
                        lastLoginAt: true,
                    }
                }
            },
            orderBy: {
                firstName: 'asc'
            }
        });

        // Format the response
        const formattedUsers = employees.map(emp => ({
            _id: emp.user?.id || `no-user-${emp.id}`, // Use user ID if exists, otherwise a placeholder
            email: emp.email,
            role: emp.user?.role || 'EMPLOYEE',
            status: emp.user?.status || 'INACTIVE', // If no user, they are inactive in the system
            createdAt: emp.user?.createdAt || emp.joiningDate || emp.createdAt,
            lastLoginAt: emp.user?.lastLoginAt,
            name: `${emp.firstName} ${emp.lastName}`,
            image: emp.profileImage,
            hasAccount: !!emp.user,
            employeeId: emp.id
        }));

        return NextResponse.json({ users: formattedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
