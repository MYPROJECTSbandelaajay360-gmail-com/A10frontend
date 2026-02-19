import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const designations = await prisma.designation.findMany({
            include: {
                _count: {
                    select: { employees: true }
                }
            },
            orderBy: {
                level: 'asc' // Assuming level 1 is highest/lowest, usually vital for hierarchy
            }
        });

        const formatted = designations.map(desg => ({
            ...desg,
            employeeCount: desg._count.employees
        }));

        return NextResponse.json({ designations: formatted });

    } catch (error) {
        console.error('Error fetching designations:', error);
        return NextResponse.json({ error: 'Failed to fetch designations' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'HR'].includes(session.user.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { name, code, description, level } = body;

        if (!name || !code) {
            return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
        }

        const existing = await prisma.designation.findFirst({
            where: {
                OR: [
                    { name: { equals: name, mode: 'insensitive' } },
                    { code: { equals: code, mode: 'insensitive' } }
                ]
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Designation with this name or code already exists' }, { status: 409 });
        }

        const designation = await prisma.designation.create({
            data: {
                name,
                code,
                description,
                level: Number(level) || 1,
                isActive: true
            }
        });

        return NextResponse.json({ designation }, { status: 201 });

    } catch (error) {
        console.error('Error creating designation:', error);
        return NextResponse.json({ error: 'Failed to create designation' }, { status: 500 });
    }
}
