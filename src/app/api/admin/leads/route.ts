
import { NextRequest, NextResponse } from 'next/server';
import Lead from '@/models/Lead';
import connectDB from '@/lib/db';
import User from '@/models/User'; // Ensure User model is registered

export async function GET(request: NextRequest) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const assignedTo = searchParams.get('assignedTo'); // Filter by agent
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let query: any = {};

        if (assignedTo) {
            // If filtering by "me", we need the agent's ID. 
            // For now, let's assume the frontend passes the ID or email.
            // If it's an email, we find the user first.
            if (assignedTo.includes('@')) {
                const user = await User.findOne({ email: assignedTo });
                if (user) {
                    query.assignedTo = user._id;
                }
            } else {
                query.assignedTo = assignedTo;
            }
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } }
            ];
        }

        const leads = await Lead.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ leads });
    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    await connectDB();

    try {
        const body = await request.json();
        const lead = await Lead.create(body);
        return NextResponse.json({ lead }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating lead:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
