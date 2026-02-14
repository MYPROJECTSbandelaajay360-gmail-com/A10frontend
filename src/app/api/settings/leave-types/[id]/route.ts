import { NextRequest, NextResponse } from 'next/server';
import LeaveType from '@/models/LeaveType';
import connectDB from '@/lib/db';

// Update leave type
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const params = await props.params;
        const body = await request.json();
        const updatedLeaveType = await LeaveType.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });

        if (!updatedLeaveType) {
            return NextResponse.json({ error: 'Leave type not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, leaveType: updatedLeaveType });
    } catch (error) {
        console.error('Error updating leave type:', error);
        return NextResponse.json({ error: 'Failed to update leave type' }, { status: 500 });
    }
}

// Delete leave type
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const params = await props.params;
        const deletedLeaveType = await LeaveType.findByIdAndDelete(params.id);

        if (!deletedLeaveType) {
            return NextResponse.json({ error: 'Leave type not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Leave type deleted successfully' });
    } catch (error) {
        console.error('Error deleting leave type:', error);
        return NextResponse.json({ error: 'Failed to delete leave type' }, { status: 500 });
    }
}
