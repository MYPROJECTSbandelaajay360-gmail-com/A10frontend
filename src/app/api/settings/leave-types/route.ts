import { NextRequest, NextResponse } from 'next/server';
import LeaveType from '@/models/LeaveType';
import connectDB from '@/lib/db';

// GET all leave types
export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const leaveTypes = await LeaveType.find({}).sort({ name: 1 });
        return NextResponse.json({ success: true, leaveTypes });
    } catch (error) {
        console.error('Error fetching leave types:', error);
        return NextResponse.json({ error: 'Failed to fetch leave types' }, { status: 500 });
    }
}

// CREATE new leave type
export async function POST(request: NextRequest) {
    await connectDB();
    try {
        const body = await request.json();
        const { name, code, daysAllowed, description, color, requiresApproval, isActive } = body;

        // Basic validation
        if (!name || !code || daysAllowed === undefined) {
            return NextResponse.json(
                { error: 'Name, code, and days allowed are required' },
                { status: 400 }
            );
        }

        const existingType = await LeaveType.findOne({
            $or: [{ name }, { code }]
        });

        if (existingType) {
            return NextResponse.json(
                { error: 'Leave type with this name or code already exists' },
                { status: 409 }
            );
        }

        const newLeaveType = await LeaveType.create({
            name,
            code,
            daysAllowed,
            description,
            color,
            requiresApproval,
            isActive
        });

        return NextResponse.json({ success: true, leaveType: newLeaveType }, { status: 201 });
    } catch (error) {
        console.error('Error creating leave type:', error);
        return NextResponse.json({ error: 'Failed to create leave type' }, { status: 500 });
    }
}
