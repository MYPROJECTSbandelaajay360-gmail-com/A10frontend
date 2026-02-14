import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import LeaveRequest from '@/models/LeaveRequest';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        // 1. Find the real user "Bandela Ajay"
        const realUser = await User.findOne({
            $or: [
                { name: { $regex: /bandela/i } },
                { email: { $regex: /bandela/i } }
            ]
        });

        if (!realUser) {
            return NextResponse.json({ error: 'Could not find user Bandela Ajay to reassign requests to.' });
        }

        // 2. Find the Demo User (if exists) or just requests pointing to wrong users
        // We will just find ALL requests that are NOT belonging to Bandela and assign them to him for this fix
        const requests = await LeaveRequest.find({ user: { $ne: realUser._id } });

        let updatedCount = 0;
        for (const req of requests) {
            req.user = realUser._id;
            await req.save();
            updatedCount++;
        }

        // 3. Update the Demo User name to avoid confusion if we can't delete
        await User.updateMany(
            { name: "Demo User" },
            { $set: { name: "Bandela Ajay (Fixed)", email: realUser.email } }
        );

        return NextResponse.json({
            success: true,
            message: `Reassigned ${updatedCount} leave requests to ${realUser.name}`,
            realUser: realUser.name,
            realUserId: realUser._id
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
