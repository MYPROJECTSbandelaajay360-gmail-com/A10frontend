import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invite from '@/models/Invite';
import crypto from 'crypto';

// Email service configuration
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:4007';
const SERVICE_AUTH_TOKEN = process.env.SERVICE_AUTH_TOKEN || 'HRMSPortal_Secure_Token_2024_MinLength32Chars';
const WEB_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010';

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

        // Build invite link
        const inviteLink = `${WEB_APP_URL}/accept-invite?token=${token}`;

        // Call Email Service to send admin invite email
        try {
            const emailServiceUrl = `${EMAIL_SERVICE_URL}/api/v1/email/admin-invite`;

            console.log('[NextAPI] Sending admin invite email via:', emailServiceUrl);

            const emailResponse = await fetch(emailServiceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Service-Auth': SERVICE_AUTH_TOKEN
                },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    role,
                    inviteLink,
                    expiresAt: expiresAt.toISOString(),
                    team,
                    department
                })
            });

            if (!emailResponse.ok) {
                const errorText = await emailResponse.text();
                console.error('[NextAPI] Email service failed:', errorText);

                // Rollback: delete the invite we just created so the user can try again
                await Invite.findByIdAndDelete(newInvite._id);

                return NextResponse.json(
                    { error: `Failed to send invite email: ${errorText}` },
                    { status: 500 }
                );
            } else {
                console.log('[NextAPI] Admin invite email sent successfully');
            }
        } catch (emailError) {
            console.error('[NextAPI] Failed to call email service:', emailError);
            // Rollback on connection error too
            await Invite.findByIdAndDelete(newInvite._id);
            return NextResponse.json(
                { error: 'Failed to connect to email service. Please ensure the email service is running.' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            message: 'Invite created successfully',
            invite: newInvite,
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating invite:', error);
        return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }
}
