import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invite from '@/models/Invite';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const invites = await Invite.find().sort({ createdAt: -1 });
        return NextResponse.json({ invites });
    } catch (error) {
        console.error('Error fetching invites:', error);
        return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email, role, team, department, invitedBy } = await request.json();

        if (!email || !role) {
            return NextResponse.json(
                { error: 'Email and Role are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if there is already a pending invite for this email
        const existingInvite = await Invite.findOne({
            email: email.toLowerCase(),
            status: 'pending',
        });

        if (existingInvite) {
            return NextResponse.json(
                { error: 'A pending invite already exists for this email.' },
                { status: 409 }
            );
        }

        // Create a new invite
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        const newInvite = await Invite.create({
            email: email.toLowerCase(),
            role,
            team,
            department,
            invitedBy,
            token,
            expiresAt,
            status: 'pending',
        });

        // In a real application, you would send an email here with the link:
        // https://your-domain.com/accept-invite?token=...

        return NextResponse.json({
            message: 'Invite created successfully',
            invite: newInvite,
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating invite:', error);
        return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }
}
