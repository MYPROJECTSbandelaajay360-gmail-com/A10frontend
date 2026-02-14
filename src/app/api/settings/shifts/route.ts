import { NextRequest, NextResponse } from 'next/server';
import Shift from '@/models/Shift';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const shifts = await Shift.find({}).sort({ startTime: 1 });
        return NextResponse.json({ success: true, shifts });
    } catch (error) {
        console.error('Error fetching shifts:', error);
        return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    await connectDB();
    try {
        const body = await request.json();
        const { name, startTime, endTime, workDays, color, isActive, notes } = body;

        // Basic validation
        if (!name || !startTime || !endTime) {
            return NextResponse.json({ error: 'Name and scheduling times are required' }, { status: 400 });
        }

        const newShift = await Shift.create({
            name,
            startTime,
            endTime,
            workDays: workDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            color,
            isActive: isActive ?? true,
            notes
        });

        return NextResponse.json({ success: true, shift: newShift }, { status: 201 });
    } catch (error) {
        console.error('Error creating shift:', error);
        return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
    }
}
