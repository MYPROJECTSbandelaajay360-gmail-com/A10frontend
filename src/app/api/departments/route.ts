import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: { employees: true }
                },
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Fetch manager details manually if needed or structure response
        // For now, simpler is better. We might want manager name if managerId exists.
        // Let's enhance the query to include manager if possible?
        // The schema has managerId but no relation defined back to Employee for 'manager' in Department model
        // Wait, looking at schema:
        // model Department { ... managerId String? @db.ObjectId ... }
        // It doesn't have a direct relation field `manager @relation...`.
        // So we have to fetch manaagers separately or map them.

        // Let's fetch all employees who are managers to map names? Or just return IDs and let frontend handle?
        // Better: let's fetch managers.

        const managerIds = departments.map(d => d.managerId).filter(Boolean) as string[];
        const managers = await prisma.employee.findMany({
            where: {
                id: { in: managerIds }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true
            }
        });

        const managerMap = new Map(managers.map(m => [m.id, m]));

        const formattedDepts = departments.map(dept => ({
            ...dept,
            manager: dept.managerId ? managerMap.get(dept.managerId) : null,
            employeeCount: dept._count.employees
        }));

        return NextResponse.json({ departments: formattedDepts });

    } catch (error) {
        console.error('Error fetching departments:', error);
        return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'HR'].includes(session.user.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { name, code, description, managerId } = body;

        if (!name || !code) {
            return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
        }

        const existing = await prisma.department.findFirst({
            where: {
                OR: [
                    { name: { equals: name, mode: 'insensitive' } },
                    { code: { equals: code, mode: 'insensitive' } }
                ]
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Department with this name or code already exists' }, { status: 409 });
        }

        const department = await prisma.department.create({
            data: {
                name,
                code,
                description,
                managerId: managerId || null,
                isActive: true
            }
        });

        return NextResponse.json({ department }, { status: 201 });

    } catch (error) {
        console.error('Error creating department:', error);
        return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
    }
}
