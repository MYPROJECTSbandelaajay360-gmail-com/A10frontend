import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const token = await getToken({ req: request });
        if (!token?.email) return NextResponse.json({ notifications: [] });

        const user = await User.findOne({ email: token.email });
        if (!user) return NextResponse.json({ notifications: [] });

        // Logic: Create notifications from recent updates
        // 1. Leave requests updated recently (status changed)
        // 2. Announcements (mock)

        const recentLeaves = await LeaveRequest.find({
            user: user._id,
            updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }).sort({ updatedAt: -1 }).limit(5);

        const notifications: any[] = recentLeaves.map(leave => {
            let message = '';
            if (leave.status === 'APPROVED') message = `Your leave request for ${leave.days} day(s) was approved.`;
            else if (leave.status === 'REJECTED') message = `Your leave request was rejected.`;
            else if (leave.status === 'PENDING') message = `Leave request submitted successfully.`;

            return {
                id: leave._id.toString(), // Convert to string
                title: 'Leave Update',
                message,
                time: leave.updatedAt,
                read: false, // In a real app, track read status
                type: leave.status.toLowerCase()
            };
        });

        // Add a mock system notification if list is empty, just so it's not blank
        if (notifications.length === 0) {
            notifications.push({
                id: 'welcome',
                title: 'Welcome',
                message: 'Welcome to the new HRMS Portal!',
                time: new Date(),
                read: false,
                type: 'info'
            });
        }

        return NextResponse.json({ notifications });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
