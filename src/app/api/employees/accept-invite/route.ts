import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmployeeInvite from '@/models/EmployeeInvite';

export async function POST(request: Request) {
    try {
        const { token, password, confirmPassword } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and Password are required' }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // 1. Validate Employee Invite in Frontend DB
        await connectDB();
        const invite = await EmployeeInvite.findOne({ token });

        if (!invite) {
            return NextResponse.json({ error: 'Invalid or expired invitation link' }, { status: 404 });
        }

        if (invite.status !== 'pending') {
            return NextResponse.json({
                error: invite.status === 'accepted'
                    ? 'This invitation has already been used'
                    : 'This invitation is no longer valid'
            }, { status: 400 });
        }

        if (new Date(invite.expiresAt) < new Date()) {
            // Mark as expired
            invite.status = 'expired';
            await invite.save();
            return NextResponse.json({ error: 'This invitation has expired. Please contact HR for a new invite.' }, { status: 400 });
        }

        // 2. Call Backend to Create Employee Account
        try {
            const backendResponse = await fetch('http://localhost:8001/api/employees/accept-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password,
                    email: invite.email,
                    firstName: invite.firstName,
                    lastName: invite.lastName,
                    phone: invite.phone,
                    department: invite.department,
                    designation: invite.designation,
                    employeeId: invite.employeeId,
                    joiningDate: invite.joiningDate,
                    salary: invite.salary,
                    reportingManager: invite.reportingManager
                }),
            });

            const backendData = await backendResponse.json();

            if (!backendResponse.ok) {
                return NextResponse.json(
                    { error: backendData.error || 'Failed to create account' },
                    { status: backendResponse.status }
                );
            }

            // 3. Update Frontend DB Invite Status (Only if backend success)
            invite.status = 'accepted';
            invite.acceptedAt = new Date();
            await invite.save();
            console.log('[NextAPI] Employee Invite accepted for:', invite.email);

            return NextResponse.json({
                success: true,
                message: 'Account created successfully! You can now login.',
                user: backendData.user
            });

        } catch (bkError) {
            console.error('[NextAPI] Failed to contact backend:', bkError);
            return NextResponse.json({ error: 'Failed to communicate with server. Please try again.' }, { status: 502 });
        }

    } catch (error) {
        console.error('[NextAPI] Accept Employee Invite Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// GET - Validate invite token and return invite details
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        await connectDB();
        const invite = await EmployeeInvite.findOne({ token });

        if (!invite) {
            return NextResponse.json({ error: 'Invalid invitation link' }, { status: 404 });
        }

        if (invite.status !== 'pending') {
            return NextResponse.json({
                error: invite.status === 'accepted'
                    ? 'This invitation has already been used'
                    : 'This invitation is no longer valid',
                status: invite.status
            }, { status: 400 });
        }

        if (new Date(invite.expiresAt) < new Date()) {
            invite.status = 'expired';
            await invite.save();
            return NextResponse.json({ error: 'This invitation has expired', status: 'expired' }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            invite: {
                email: invite.email,
                firstName: invite.firstName,
                lastName: invite.lastName,
                department: invite.department,
                designation: invite.designation,
                employeeId: invite.employeeId
            }
        });

    } catch (error) {
        console.error('[NextAPI] Validate Employee Invite Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
