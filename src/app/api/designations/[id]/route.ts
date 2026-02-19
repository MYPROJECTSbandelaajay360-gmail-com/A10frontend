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
        const { name, code, description, level, isActive } = body;

        const designation = await prisma.designation.update({
            where: { id },
            data: {
                name,
                code,
                description,
                level: Number(level),
                isActive
            }
        });

        return NextResponse.json({ designation });

    } catch (error) {
        console.error('Error updating designation:', error);
        return NextResponse.json({ error: 'Failed to update designation' }, { status: 500 });
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

        // Check if designation has employees
        const employeeCount = await prisma.employee.count({
            where: { designationId: id }
        });

        if (employeeCount > 0) {
            return NextResponse.json({
                error: `Cannot delete designation. It has ${employeeCount} active employee(s).`
            }, { status: 400 });
        }

        await prisma.designation.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Designation deleted successfully' });

    } catch (error) {
        console.error('Error deleting designation:', error);
        return NextResponse.json({ error: 'Failed to delete designation' }, { status: 500 });
    }
}
