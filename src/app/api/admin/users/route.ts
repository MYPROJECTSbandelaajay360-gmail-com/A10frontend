
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/db';


export async function GET(request: NextRequest) {
    await connectDB();

    try {
        // Fetch all users with relevant fields
        const users = await User.find({})
            .select('name email role status createdAt lastLoginAt')
            .sort({ createdAt: -1 });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
