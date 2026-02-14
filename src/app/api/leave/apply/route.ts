import { NextRequest, NextResponse } from 'next/server';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import LeaveType from '@/models/LeaveType';
import connectDB from '@/lib/db';
import { getToken } from 'next-auth/jwt';

// Helper to get user ID provided by next-auth or request
async function getUserId(request: NextRequest) {
    try {
        // 1. Try to get the actual logged-in user from the token
        const token = await getToken({ req: request });

        if (token && token.email) {
            // Find existing Mongoose user
            let user = await User.findOne({ email: token.email });

            // Auto-provision if missing (Sync Prisma -> Mongoose)
            if (!user) {
                console.log(`Auto-provisioning Mongoose user for ${token.email}...`);
                try {
                    user = await User.create({
                        name: token.name || "Unknown User",
                        email: token.email,
                        passwordHash: "synced_from_prisma", // Dummy
                        role: token.role || "user",
                        status: "APPROVED"
                    });
                } catch (e) {
                    console.error("Failed to auto-provision user:", e);
                }
            }

            if (user) {
                // LAZY MIGRATION: 
                // If we found a real user, check if there are "Demo User" requests and claim them
                // This fixes the issue where previous requests showed as "Demo User"
                try {
                    const demoUser = await User.findOne({ email: "demo@example.com" });
                    if (demoUser) {
                        // Find requests owned by Demo User
                        const demoRequests = await LeaveRequest.find({ user: demoUser._id });
                        if (demoRequests.length > 0) {
                            console.log(`Migrating ${demoRequests.length} demo requests to ${user.email}...`);
                            await LeaveRequest.updateMany(
                                { user: demoUser._id },
                                { $set: { user: user._id } }
                            );
                        }
                    }
                } catch (migErr) {
                    console.error("Migration failed:", migErr);
                }

                return user._id;
            }
        }
    } catch (e) {
        console.error("Token verification failed:", e);
    }

    // Fallback logic (unchanged)
    let user = await User.findOne({
        $or: [
            { name: { $regex: /bandela/i } },
            { email: { $regex: /bandela/i } }
        ]
    });

    // If specific fallback via regex fails, try any user
    if (!user) {
        user = await User.findOne({});
    }

    // If absolutely no user, create Demo
    if (!user) {
        try {
            user = await User.create({
                name: "Demo User",
                email: "demo@example.com",
                passwordHash: "hashed_password_placeholder",
                role: "user",
                status: "APPROVED"
            });
        } catch (e) { console.error(e); }
    }

    return user?._id;
}

export async function POST(request: NextRequest) {
    await connectDB();
    try {
        const body = await request.json();
        const { leaveTypeId, fromDate, toDate, reason, contactNumber, isHalfDay, halfDayType } = body;

        // Basic validation
        if (!leaveTypeId || !fromDate || !toDate || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get User (Mock or Real)
        let userId = await getUserId(request);

        if (!userId) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Calculate days
        const start = new Date(fromDate);
        const end = new Date(toDate);
        let days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;
        if (isHalfDay) days = 0.5;

        const newRequest = await LeaveRequest.create({
            user: userId,
            leaveType: leaveTypeId,
            fromDate,
            toDate,
            days,
            reason,
            status: 'PENDING',
            contactNumber,
            isHalfDay: isHalfDay || false,
            halfDayType
        });

        return NextResponse.json({ success: true, request: newRequest }, { status: 201 });
    } catch (error) {
        console.error('Error creating leave request:', error);
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    // This endpoint returns leave requests for the *current user* (My Leaves)
    await connectDB();
    try {
        let userId = await getUserId(request);

        // If still no user, just return empty list
        if (!userId) return NextResponse.json({ success: true, data: [] });

        const requests = await LeaveRequest.find({ user: userId })
            .populate('leaveType', 'name')
            .sort({ createdAt: -1 });

        // Map to format expected by frontend
        const formatted = requests.map(req => ({
            id: req._id,
            leaveType: req.leaveType ? req.leaveType : { name: 'Unknown Type' },
            fromDate: req.fromDate,
            toDate: req.toDate,
            numberOfDays: req.days,
            reason: req.reason,
            status: req.status,
            appliedOn: req.createdAt
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error fetching user leaves:', error);
        return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
    }
}
