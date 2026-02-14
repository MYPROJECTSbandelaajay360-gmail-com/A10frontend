import { NextRequest, NextResponse } from 'next/server';
import LeaveType from '@/models/LeaveType';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { getToken } from 'next-auth/jwt';

async function getUserId(request: NextRequest) {
    try {
        const token = await getToken({ req: request });
        if (token?.email) {
            const user = await User.findOne({ email: token.email });
            if (user) return user._id;
        }
    } catch (e) { console.error(e); }

    // Fallback: Bandela Ajay or any user
    let user = await User.findOne({
        $or: [{ name: { $regex: /bandela/i } }, { email: { $regex: /bandela/i } }]
    });
    if (!user) user = await User.findOne({});
    return user?._id;
}

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ success: true, data: [] });

        // 1. Get all leave types
        let leaveTypes = await LeaveType.find({});

        // Seed if empty
        if (leaveTypes.length === 0) {
            console.log("No leave types found, seeding defaults...");
            const defaults = [
                { name: 'Casual Leave', code: 'CL', daysAllowed: 12, color: '#3B82F6', requiresApproval: true },
                { name: 'Sick Leave', code: 'SL', daysAllowed: 10, color: '#EF4444', requiresApproval: true },
                { name: 'Earned Leave', code: 'EL', daysAllowed: 18, color: '#10B981', requiresApproval: true },
            ];
            leaveTypes = await LeaveType.insertMany(defaults);
        }

        // 2. Get user's requests to calculate usage
        // Fetch ALL requests to calculate used vs pending
        const requests = await LeaveRequest.find({
            user: userId,
            status: { $in: ['APPROVED', 'PENDING'] }
        });

        // Map usage by LeaveType ID
        const usageMap = new Map();
        const pendingMap = new Map();

        requests.forEach(req => {
            if (req.leaveType) {
                const typeId = req.leaveType.toString();
                if (req.status === 'APPROVED') {
                    usageMap.set(typeId, (usageMap.get(typeId) || 0) + req.days);
                } else if (req.status === 'PENDING') {
                    pendingMap.set(typeId, (pendingMap.get(typeId) || 0) + req.days);
                }
            }
        });

        const balances = leaveTypes.map(lt => {
            const typeId = lt._id.toString();
            const used = usageMap.get(typeId) || 0;
            const pending = pendingMap.get(typeId) || 0;
            return {
                leaveTypeId: typeId,
                leaveType: { name: lt.name },
                allocated: lt.daysAllowed,
                used: used,
                pending: pending,
                carriedForward: 0,
                adjustment: 0,
                available: Math.max(0, lt.daysAllowed - used)
            };
        });

        return NextResponse.json({ success: true, data: balances });
    } catch (error) {
        console.error('Error fetching balances:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
