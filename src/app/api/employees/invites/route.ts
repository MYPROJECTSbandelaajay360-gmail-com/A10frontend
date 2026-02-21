import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmployeeInvite from '@/models/EmployeeInvite';
import crypto from 'crypto';

// Email service configuration
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:4007';
const SERVICE_AUTH_TOKEN = process.env.SERVICE_AUTH_TOKEN || 'HRMSPortal_Secure_Token_2024_MinLength32Chars';
const WEB_APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://musterbook.com';

// GET - Fetch all employee invites
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const invites = await EmployeeInvite.find(query).sort({ createdAt: -1 });

        return NextResponse.json({
            invites,
            total: invites.length
        });
    } catch (error) {
        console.error('Error fetching employee invites:', error);
        return NextResponse.json({ error: 'Failed to fetch employee invites' }, { status: 500 });
    }
}

// POST - Create a new employee invite
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            email,
            firstName,
            lastName,
            phone,
            department,
            designation,
            employeeId,
            salary,
            joiningDate,
            reportingManager,
            invitedBy,
            invitedByName
        } = body;

        // Validation
        if (!email || !firstName || !lastName || !department || !designation || !joiningDate) {
            return NextResponse.json(
                { error: 'Email, First Name, Last Name, Department, Designation, and Joining Date are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if there is already a pending invite for this email
        const existingInvite = await EmployeeInvite.findOne({
            email: email.toLowerCase(),
            status: 'pending',
        });

        if (existingInvite) {
            return NextResponse.json(
                { error: 'A pending invite already exists for this email.' },
                { status: 409 }
            );
        }

        // Generate unique token and set expiry (7 days)
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Generate employee ID if not provided
        const generatedEmployeeId = employeeId || `EMP${Date.now().toString().slice(-6)}`;

        const newInvite = await EmployeeInvite.create({
            email: email.toLowerCase(),
            firstName,
            lastName,
            phone,
            department,
            designation,
            employeeId: generatedEmployeeId,
            salary: salary || null,
            joiningDate: new Date(joiningDate),
            reportingManager,
            invitedBy,
            invitedByName,
            token,
            expiresAt,
            status: 'pending',
        });

        // Build invite link
        const inviteLink = `${WEB_APP_URL}/employee-invite?token=${token}`;

        // Call Email Service to send invitation email
        try {
            const emailServiceUrl = `${EMAIL_SERVICE_URL}/api/v1/email/admin-invite`;

            console.log('[NextAPI] Sending employee invite email via:', emailServiceUrl);

            const emailResponse = await fetch(emailServiceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Service-Auth': SERVICE_AUTH_TOKEN
                },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    role: designation,
                    inviteLink: inviteLink,
                    expiresAt: expiresAt.toISOString(),
                    name: `${firstName} ${lastName}`,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone || null,
                    department: department,
                    employeeId: generatedEmployeeId,
                    salary: salary || null,
                    joiningDate: joiningDate,
                    reportingManager: reportingManager || null
                })
            });

            if (!emailResponse.ok) {
                const errorText = await emailResponse.text();
                console.error('[NextAPI] Email service failed:', errorText);
                // Don't rollback - invite is still valid, just email might not have sent
                console.warn('[NextAPI] Invite created but email notification may have failed');
            } else {
                console.log('[NextAPI] Employee invite email sent successfully');
            }
        } catch (emailError) {
            console.error('[NextAPI] Failed to call email service:', emailError);
            // Don't rollback - invite is still valid
            console.warn('[NextAPI] Invite created but could not send email');
        }

        return NextResponse.json({
            message: 'Employee invite created successfully',
            invite: newInvite,
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating employee invite:', error);
        return NextResponse.json({ error: 'Failed to create employee invite' }, { status: 500 });
    }
}
