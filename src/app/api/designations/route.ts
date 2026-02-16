import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const designations = await prisma.designation.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json({ designations })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch designations' }, { status: 500 })
    }
}
