import { NextRequest, NextResponse } from 'next/server';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import connectDB from '@/lib/db';

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    await connectDB();
    try {
        const body = await request.json();
        const { status, adminComments } = body;

        // Validation
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const leaveRequest = await LeaveRequest.findById(params.id);
        if (!leaveRequest) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        if (leaveRequest.status !== 'PENDING') {
            return NextResponse.json({ error: 'Leave request is already processed' }, { status: 400 });
        }

        leaveRequest.status = status;
        leaveRequest.adminComments = adminComments;
        await leaveRequest.save();

        // Optionally send email/notification to user here
        // TODO: Notification logic

        return NextResponse.json({ success: true, request: leaveRequest });
    } catch (error) {
        console.error('Error processing leave request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
