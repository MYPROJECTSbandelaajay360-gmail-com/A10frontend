import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, format } from 'date-fns'

// GET - Fetch calendar data for a specific month
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

        // Calculate date range for the month
        const startDate = new Date(year, month - 1, 1)
        const endDate = endOfMonth(startDate)

        // Find the user's employee record
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { employee: true }
        })

        if (!user || !user.employee) {
            return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
        }

        const employeeId = user.employee.id

        // Fetch attendance records for the month
        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'asc' }
        })

        // Fetch approved leave requests that overlap with the month
        const leaveRequests = await prisma.leaveRequest.findMany({
            where: {
                employeeId,
                status: 'APPROVED',
                OR: [
                    {
                        fromDate: { lte: endDate },
                        toDate: { gte: startDate }
                    }
                ]
            },
            include: {
                leaveType: true
            }
        })

        // Hard-coded holidays for 2026 (same as holidays page)
        // In production, you would fetch these from a database
        const holidays = [
            { id: '1', name: 'Republic Day', date: '2026-01-26', type: 'PUBLIC', description: 'National holiday celebrating the adoption of the Constitution' },
            { id: '2', name: 'Maha Shivaratri', date: '2026-03-01', type: 'RESTRICTED' },
            { id: '3', name: 'Holi', date: '2026-03-14', type: 'PUBLIC', description: 'Festival of colors' },
            { id: '4', name: 'Good Friday', date: '2026-04-03', type: 'PUBLIC' },
            { id: '5', name: 'Tamil New Year', date: '2026-04-14', type: 'OPTIONAL' },
            { id: '6', name: 'Id-ul-Fitr', date: '2026-05-25', type: 'PUBLIC', description: 'End of Ramadan' },
            { id: '7', name: 'Independence Day', date: '2026-08-15', type: 'PUBLIC', description: 'National holiday celebrating independence' },
            { id: '8', name: 'Janmashtami', date: '2026-08-23', type: 'OPTIONAL' },
            { id: '9', name: 'Ganesh Chaturthi', date: '2026-09-06', type: 'RESTRICTED' },
            { id: '10', name: 'Dussehra', date: '2026-10-06', type: 'PUBLIC', description: 'Victory of good over evil' },
            { id: '11', name: 'Diwali', date: '2026-10-25', type: 'PUBLIC', description: 'Festival of lights' },
            { id: '12', name: 'Christmas', date: '2026-12-25', type: 'PUBLIC', description: 'Christmas celebration' },
            { id: '13', name: 'New Year', date: '2026-01-01', type: 'PUBLIC', description: 'New Year celebration' },
        ]

        // Filter holidays for the requested month
        const monthHolidays = holidays.filter(h => {
            const holidayDate = new Date(h.date)
            return holidayDate.getFullYear() === year && (holidayDate.getMonth() + 1) === month
        })

        // Build calendar data structure
        const calendarData: Record<string, {
            date: string
            status: string
            type: string
            details?: any
        }> = {}

        // Add attendance records
        attendanceRecords.forEach(record => {
            const dateKey = format(record.date, 'yyyy-MM-dd')
            calendarData[dateKey] = {
                date: dateKey,
                status: record.status.toUpperCase(),
                type: 'attendance',
                details: {
                    checkIn: record.checkInTime,
                    checkOut: record.checkOutTime,
                    workingHours: record.workingHours,
                    isLate: record.isLateLogin,
                    remarks: record.remarks
                }
            }
        })

        // Add holiday markers
        monthHolidays.forEach(holiday => {
            const dateKey = holiday.date
            if (calendarData[dateKey]) {
                // Already has an attendance record, append holiday info
                calendarData[dateKey].details = {
                    ...calendarData[dateKey].details,
                    holiday: holiday
                }
            } else {
                calendarData[dateKey] = {
                    date: dateKey,
                    status: 'HOLIDAY',
                    type: 'holiday',
                    details: {
                        holiday: holiday
                    }
                }
            }
        })

        // Add leave records (expand leave ranges into individual days)
        leaveRequests.forEach(leave => {
            let currentDate = new Date(leave.fromDate)
            const lastDate = new Date(leave.toDate)

            while (currentDate <= lastDate) {
                // Only process dates within the requested month
                if (currentDate >= startDate && currentDate <= endDate) {
                    const dateKey = format(currentDate, 'yyyy-MM-dd')

                    // Skip if already marked as a holiday
                    if (!calendarData[dateKey] || calendarData[dateKey].type !== 'holiday') {
                        calendarData[dateKey] = {
                            date: dateKey,
                            status: 'LEAVE',
                            type: 'leave',
                            details: {
                                leaveType: leave.leaveType.name,
                                isHalfDay: leave.isHalfDay,
                                reason: leave.reason
                            }
                        }
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1)
            }
        })

        // Build summary statistics for the month
        const summary = {
            present: Object.values(calendarData).filter(d => d.status === 'PRESENT').length,
            wfh: Object.values(calendarData).filter(d => d.status === 'WFH').length,
            leave: Object.values(calendarData).filter(d => d.status === 'LEAVE').length,
            holiday: Object.values(calendarData).filter(d => d.status === 'HOLIDAY').length,
            absent: Object.values(calendarData).filter(d => d.status === 'ABSENT').length,
            halfDay: Object.values(calendarData).filter(d => d.status === 'HALF_DAY').length
        }

        return NextResponse.json({
            year,
            month,
            calendarData,
            holidays: monthHolidays,
            summary,
            allHolidays: holidays // For yearly view
        })
    } catch (error) {
        console.error('Error fetching calendar data:', error)
        return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 })
    }
}
