import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Role check: Only Managers, HR, Admin can view team attendance
        if (!['MANAGER', 'HR', 'ADMIN', 'CEO'].includes(session.user.role as string)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');
        const departmentId = searchParams.get('departmentId');

        const targetDate = dateParam ? parseISO(dateParam) : new Date();
        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        // Build where clause for employees
        const employeeWhere: any = {
            status: 'ACTIVE'
        };

        // If Manager, optionally restrict to their reportees or dept?
        // For simplicity, let's allow them to see all for now, or filter by their dept if strictly required.
        // But usually "Team Attendance" implies the whole org for HR/Admin, and specific team for Manager.
        // Let's implement basic filtering.
        if (departmentId && departmentId !== 'ALL') {
            employeeWhere.departmentId = departmentId;
        }

        // Fetch employees
        const employees = await prisma.employee.findMany({
            where: employeeWhere,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeId: true,
                profileImage: true,
                designation: { select: { name: true } },
                department: { select: { name: true } }
            },
            orderBy: { firstName: 'asc' }
        });

        const employeeIds = employees.map(e => e.id);

        // Fetch Attendance for this date
        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                employeeId: { in: employeeIds },
                date: {
                    gte: start,
                    lte: end
                }
            }
        });

        // Fetch Leave Requests for this date
        // A leave covers this date if leave.fromDate <= targetDate AND leave.toDate >= targetDate
        // And status is APPROVED
        const leaves = await prisma.leaveRequest.findMany({
            where: {
                employeeId: { in: employeeIds },
                status: 'APPROVED',
                fromDate: { lte: end },
                toDate: { gte: start }
            },
            select: {
                employeeId: true,
                leaveType: { select: { name: true, code: true } },
                isHalfDay: true,
                halfDayType: true
            }
        });

        // Fetch Holidays (if any)
        const holiday = await prisma.holiday.findFirst({
            where: {
                date: {
                    gte: start,
                    lte: end
                },
                isActive: true
            }
        });

        const isHoliday = !!holiday;
        const isWeekend = [0, 6].includes(targetDate.getDay()); // 0=Sun, 6=Sat (Adjust logic as per company policy)

        // Map data
        const attendanceMap = new Map(attendanceRecords.map(r => [r.employeeId, r]));
        const leaveMap = new Map(leaves.map(l => [l.employeeId, l]));

        const results = employees.map(emp => {
            const record = attendanceMap.get(emp.id);
            const leave = leaveMap.get(emp.id);

            let status = 'ABSENT';
            let checkIn = null;
            let checkOut = null;
            let workingHours = 0;
            let remarks = '';

            if (record) {
                status = record.status;
                checkIn = record.checkInTime;
                checkOut = record.checkOutTime;
                workingHours = record.workingHours || 0;
            } else if (leave) {
                status = 'ON_LEAVE';
                remarks = `${leave.leaveType.name} ${leave.isHalfDay ? '(Half Day)' : ''}`;
            } else if (isHoliday) {
                status = 'HOLIDAY';
                remarks = holiday?.name || 'Holiday';
            } else if (isWeekend) {
                status = 'WEEKEND';
            }

            return {
                employee: {
                    id: emp.id,
                    name: `${emp.firstName} ${emp.lastName}`,
                    employeeId: emp.employeeId,
                    profileImage: emp.profileImage,
                    designation: emp.designation.name,
                    department: emp.department.name
                },
                attendance: {
                    status,
                    checkIn,
                    checkOut,
                    workingHours,
                    remarks
                }
            };
        });

        // Aggregated Stats
        const stats = {
            total: employees.length,
            present: results.filter(r => ['PRESENT', 'HALF_DAY'].includes(r.attendance.status)).length,
            absent: results.filter(r => r.attendance.status === 'ABSENT').length,
            onLeave: results.filter(r => r.attendance.status === 'ON_LEAVE').length,
            late: attendanceRecords.filter(r => r.isLateLogin).length
        };

        return NextResponse.json({
            date: targetDate.toISOString(),
            records: results,
            stats
        });

    } catch (error) {
        console.error('Error fetching team attendance:', error);
        return NextResponse.json({ error: 'Failed to fetch team attendance' }, { status: 500 });
    }
}
