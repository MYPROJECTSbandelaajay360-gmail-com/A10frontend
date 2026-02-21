import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmployeeInvite from '@/models/EmployeeInvite';
import crypto from 'crypto';

// Email service configuration
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:4007';
const SERVICE_AUTH_TOKEN = process.env.SERVICE_AUTH_TOKEN || 'HRMSPortal_Secure_Token_2024_MinLength32Chars';
const WEB_APP_URL =  'https://musterbook.com';

// POST - Resend employee invite email
export async function POST(request: NextRequest) { 
    try {
        const { inviteId } = await request.json();

        if (!inviteId) {
            return NextResponse.json(
                { error: 'Invite ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const invite = await EmployeeInvite.findById(inviteId);

        if (!invite) {
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
        }

        if (invite.status !== 'pending') {
            return NextResponse.json(
                { error: 'Only pending invites can be resent' },
                { status: 400 }
            );
        }

        // Generate new token and extend expiry
        const newToken = crypto.randomBytes(32).toString('hex');
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        invite.token = newToken;
        invite.expiresAt = newExpiresAt;
        await invite.save();

        // Build invite link
        const inviteLink = `${WEB_APP_URL}/employee-invite?token=${newToken}`;

        // Call Email Service to resend invitation email
        try {
            const emailServiceUrl = `${EMAIL_SERVICE_URL}/api/v1/email/admin-invite`;

            const emailResponse = await fetch(emailServiceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Service-Auth': SERVICE_AUTH_TOKEN
                },
                body: JSON.stringify({
                    email: invite.email,
                    role: invite.designation,
                    inviteLink: inviteLink,
                    expiresAt: newExpiresAt.toISOString(),
                    name: `${invite.firstName} ${invite.lastName}`,
                    firstName: invite.firstName,
                    lastName: invite.lastName,
                    phone: invite.phone || null,
                    department: invite.department,
                    employeeId: invite.employeeId,
                    salary: invite.salary || null,
                    joiningDate: invite.joiningDate ? invite.joiningDate.toISOString() : null,
                    reportingManager: invite.reportingManager || null
                })
            });

            if (!emailResponse.ok) {
                console.error('[NextAPI] Failed to resend employee invite email');
            } else {
                console.log('[NextAPI] Employee invite email resent successfully');
            }
        } catch (emailError) {
            console.error('[NextAPI] Failed to call email service for resend:', emailError);
        }

        return NextResponse.json({
            message: 'Invite resent successfully',
            invite,
        });

    } catch (error) {
        console.error('Error resending employee invite:', error);
        return NextResponse.json({ error: 'Failed to resend employee invite' }, { status: 500 });
    }
}
