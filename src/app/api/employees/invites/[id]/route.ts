import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmployeeInvite from '@/models/EmployeeInvite';

// GET - Fetch single employee invite
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const invite = await EmployeeInvite.findById(params.id);

        if (!invite) {
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
        }

        return NextResponse.json({ invite });
    } catch (error) {
        console.error('Error fetching employee invite:', error);
        return NextResponse.json({ error: 'Failed to fetch employee invite' }, { status: 500 });
    }
}

// PATCH - Update employee invite (e.g., revoke)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { status, ...updateData } = body;

        await connectDB();

        const invite = await EmployeeInvite.findById(params.id);

        if (!invite) {
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
        }

        // Only allow status changes for pending invites
        if (status && invite.status !== 'pending') {
            return NextResponse.json(
                { error: 'Only pending invites can be modified' },
                { status: 400 }
            );
        }

        const updatedInvite = await EmployeeInvite.findByIdAndUpdate(
            params.id,
            { status, ...updateData },
            { new: true }
        );

        return NextResponse.json({
            message: 'Invite updated successfully',
            invite: updatedInvite,
        });
    } catch (error) {
        console.error('Error updating employee invite:', error);
        return NextResponse.json({ error: 'Failed to update employee invite' }, { status: 500 });
    }
}

// DELETE - Delete employee invite
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const invite = await EmployeeInvite.findById(params.id);

        if (!invite) {
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
        }

        await EmployeeInvite.findByIdAndDelete(params.id);

        return NextResponse.json({
            message: 'Invite deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting employee invite:', error);
        return NextResponse.json({ error: 'Failed to delete employee invite' }, { status: 500 });
    }
}
