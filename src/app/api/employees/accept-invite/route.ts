import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmployeeInvite from '@/models/EmployeeInvite';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

        // 2. Create user account directly in MongoDB
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email: invite.email.toLowerCase() });
            if (existingUser) {
                return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const newUser = await User.create({
                name: `${invite.firstName} ${invite.lastName}`,
                email: invite.email.toLowerCase(),
                passwordHash,
                role: 'user',
                status: 'APPROVED',
                emailVerified: true,
            });

            // 3. Mark invite as accepted
            invite.status = 'accepted';
            invite.acceptedAt = new Date();
            await invite.save();
            console.log('[NextAPI] Employee Invite accepted for:', invite.email);

            return NextResponse.json({
                success: true,
                message: 'Account created successfully! You can now login.',
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                }
            });

        } catch (createError: any) {
            console.error('[NextAPI] Failed to create user account:', createError);
            return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
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
