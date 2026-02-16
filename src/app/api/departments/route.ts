import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const departments = await prisma.department.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json({ departments })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
    }
}
