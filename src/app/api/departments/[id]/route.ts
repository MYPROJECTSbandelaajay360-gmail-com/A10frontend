import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'HR'].includes(session.user.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();
        const { name, code, description, managerId, isActive } = body;

        const department = await prisma.department.update({
            where: { id },
            data: {
                name,
                code,
                description,
                managerId,
                isActive
            }
        });

        return NextResponse.json({ department });

    } catch (error) {
        console.error('Error updating department:', error);
        return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'HR'].includes(session.user.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = params;

        // Check if department has employees
        const employeeCount = await prisma.employee.count({
            where: { departmentId: id }
        });

        if (employeeCount > 0) {
            return NextResponse.json({
                error: `Cannot delete department. It has ${employeeCount} active employee(s).`
            }, { status: 400 });
        }

        await prisma.department.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Department deleted successfully' });

    } catch (error) {
        console.error('Error deleting department:', error);
        return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
    }
}
