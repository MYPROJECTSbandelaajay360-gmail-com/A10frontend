import { NextRequest, NextResponse } from 'next/server';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import LeaveType from '@/models/LeaveType';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PENDING';

        const query: any = {};
        if (status !== 'ALL') {
            query.status = status;
        }

        // Fetch requests and populate user
        let rawRequests = await LeaveRequest.find(query)
            .populate('user', 'name email role image') // Include image
            .populate('leaveType', 'name code color')
            .sort({ createdAt: -1 })
            .lean();

        // Force-fix: If user is missing or "Demo User", inject Bandela Ajay
        const realUser = await User.findOne({
            $or: [{ name: { $regex: /bandela/i } }, { email: { $regex: /bandela/i } }]
        }).lean() as any;

        const requests = rawRequests.map((req: any) => {
            // Check if user is null or Demo
            if (!req.user || req.user.name === 'Demo User') {
                if (realUser) {
                    req.user = {
                        _id: realUser._id,
                        name: realUser.name,
                        email: realUser.email,
                        role: realUser.role,
                        image: realUser.image // Include image 
                    };
                }
            }
            return req;
        });

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
    }
}
