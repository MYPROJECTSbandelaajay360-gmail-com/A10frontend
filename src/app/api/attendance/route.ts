import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        // Find employee
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { employee: true }
        })

        if (!user || !user.employee) {
            return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
        }

        const employeeId = user.employee.id

        // Date range for the month
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)
        endDate.setHours(23, 59, 59, 999)

        // Fetch attendance records
        const records = await prisma.attendance.findMany({
            where: {
                employeeId: employeeId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'desc' }
        })

        // Calculate stats
        let presentDays = 0
        let absentDays = 0
        let leaveDays = 0
        let totalHours = 0

        records.forEach(record => {
            if (record.status === 'PRESENT' || record.status === 'HALF_DAY') presentDays++
            if (record.status === 'ABSENT') absentDays++
            if (record.status === 'ON_LEAVE') leaveDays++
            if (record.workingHours) totalHours += record.workingHours
        })

        // Today's status
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayRecord = await prisma.attendance.findFirst({
            where: {
                employeeId: employeeId,
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        })

        const todayStatus = {
            isCheckedIn: !!todayRecord?.checkInTime,
            isCheckedOut: !!todayRecord?.checkOutTime,
            checkInTime: todayRecord?.checkInTime,
            checkOutTime: todayRecord?.checkOutTime
        }

        // Office Config (Mock for now or fetch if SystemSetting exists)
        // Check schema for SystemSetting
        const officeConfig = {
            name: 'Main Office',
            latitude: 17.4438, // Example coords (Hyderabad)
            longitude: 78.3831,
            radius: 500
        }

        // Time Windows (Mock)
        const timeWindows = {
            checkInStart: '09:00 AM',
            checkInEnd: '10:00 AM',
            checkOutStart: '06:00 PM',
            checkOutEnd: '07:00 PM'
        }

        // Pending Checkouts (No checkout but accessed previous days)
        // Logic: Attendance with CheckIn but no CheckOut and date < today
        const pendingCheckOuts = await prisma.attendance.findMany({
            where: {
                employeeId: employeeId,
                checkInTime: { not: null },
                checkOutTime: null,
                date: { lt: today }
            }
        })

        return NextResponse.json({
            records,
            stats: {
                presentDays,
                absentDays,
                leaveDays,
                totalHours
            },
            todayStatus,
            officeConfig,
            timeWindows,
            pendingCheckOuts
        })

    } catch (error) {
        console.error('Attendance GET Error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await request.json()
        const { action, latitude, longitude } = body

        // Find employee
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { employee: true }
        })

        if (!user || !user.employee) {
            return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
        }

        const employeeId = user.employee.id
        const now = new Date()
        const today = new Date(now)
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (action === 'check-in') {
            // Check if already checked in
            const existing = await prisma.attendance.findFirst({
                where: {
                    employeeId: employeeId,
                    date: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            })

            if (existing) {
                return NextResponse.json({ error: 'Already checked in for today' }, { status: 400 })
            }

            // Create check-in
            const newRecord = await prisma.attendance.create({
                data: {
                    employeeId: employeeId,
                    date: now,
                    checkInTime: now,
                    checkInLatitude: latitude,
                    checkInLongitude: longitude,
                    status: 'PRESENT', // Initial status
                    checkInIP: request.headers.get('x-forwarded-for') || '127.0.0.1',
                    lateReason: body.lateReason,
                    hasProject: body.hasProject,
                    projectName: body.projectName
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Checked in successfully',
                checkInTime: newRecord.checkInTime
            })
        } else if (action === 'check-out') {
            // Check if checked in
            const existing = await prisma.attendance.findFirst({
                where: {
                    employeeId: employeeId,
                    date: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            })

            if (!existing || !existing.checkInTime) {
                return NextResponse.json({ error: 'Not checked in today' }, { status: 400 })
            }

            if (existing.checkOutTime) {
                return NextResponse.json({ error: 'Already checked out today' }, { status: 400 })
            }

            // Calculate hours
            const checkInTime = new Date(existing.checkInTime)
            const durationMs = now.getTime() - checkInTime.getTime()
            const workingHours = durationMs / (1000 * 60 * 60)

            // Update record
            const updatedRecord = await prisma.attendance.update({
                where: { id: existing.id },
                data: {
                    checkOutTime: now,
                    checkOutLatitude: latitude,
                    checkOutLongitude: longitude,
                    checkOutIP: request.headers.get('x-forwarded-for') || '127.0.0.1',
                    workingHours: workingHours,
                    status: workingHours >= 8 ? 'PRESENT' : workingHours >= 4 ? 'HALF_DAY' : 'PRESENT' // Simple logic
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Checked out successfully',
                checkOutTime: updatedRecord.checkOutTime
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('Attendance POST Error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
