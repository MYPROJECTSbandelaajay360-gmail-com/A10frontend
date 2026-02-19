import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET single user
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: { employee: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const formattedUser = {
            _id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            name: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email.split('@')[0],
        };

        return NextResponse.json({ user: formattedUser });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

// UPDATE user (Role, Status, etc.)
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'HR'].includes(session.user.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { role, status } = body;

        // Validation - Roles match Prisma system
        const validRoles = ['ADMIN', 'HR', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE'];
        if (role && !validRoles.includes(role.toUpperCase())) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: {
                ...(role && { role: role.toUpperCase() }),
                ...(status && { status }),
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// DELETE user
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only ADMIN can delete users' }, { status: 403 });
        }

        await prisma.user.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
