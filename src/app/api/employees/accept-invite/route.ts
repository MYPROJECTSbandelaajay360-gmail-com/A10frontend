import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import EmployeeInvite from '@/models/EmployeeInvite';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// GET - Validate invitation token
export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

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
            return NextResponse.json({ error: 'This invitation link has expired' }, { status: 400 });
        }

        return NextResponse.json({
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
        console.error('Error validating invitation:', error);
        return NextResponse.json({ error: 'Failed to validate invitation' }, { status: 500 });
    }
}

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

        // 2. Create Prisma User + Employee so they appear in all lists
        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({ where: { email: invite.email.toLowerCase() } });
            if (existingUser) {
                return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            // Look up or create Department
            let department = await prisma.department.findFirst({ where: { name: invite.department } });
            if (!department) {
                const deptCode = invite.department.replace(/\s+/g, '').substring(0, 6).toUpperCase();
                const uniqueCode = `${deptCode}${Date.now().toString().slice(-3)}`;
                department = await prisma.department.create({
                    data: { name: invite.department, code: uniqueCode }
                });
            }

            // Look up or create Designation
            let designation = await prisma.designation.findFirst({ where: { name: invite.designation } });
            if (!designation) {
                const desigCode = invite.designation.replace(/\s+/g, '').substring(0, 6).toUpperCase();
                const uniqueCode = `${desigCode}${Date.now().toString().slice(-3)}`;
                designation = await prisma.designation.create({
                    data: { name: invite.designation, code: uniqueCode }
                });
            }

            // Create User + Employee
            const newUser = await prisma.user.create({
                data: {
                    email: invite.email.toLowerCase(),
                    password: hashedPassword,
                    role: 'EMPLOYEE',
                    status: 'ACTIVE',
                    employee: {
                        create: {
                            employeeId: invite.employeeId || `EMP${Date.now().toString().slice(-6)}`,
                            firstName: invite.firstName,
                            lastName: invite.lastName,
                            email: invite.email.toLowerCase(),
                            phone: invite.phone || '',
                            departmentId: department.id,
                            designationId: designation.id,
                            joiningDate: invite.joiningDate,
                        }
                    }
                },
                include: { employee: true }
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
                    id: newUser.id,
                    name: `${invite.firstName} ${invite.lastName}`,
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
