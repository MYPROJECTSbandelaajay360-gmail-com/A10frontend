import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // define "today"
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch all employees with related data
        const employees = await prisma.employee.findMany({
            include: {
                department: true,
                designation: true,
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                },
                // Fetch attendance for today
                attendanceRecords: {
                    where: {
                        date: {
                            gte: today,
                            lt: tomorrow
                        }
                    }
                },
                // Fetch approved leave requests overlapping today
                leaveRequests: {
                    where: {
                        status: 'APPROVED',
                        fromDate: { lte: now },
                        toDate: { gte: today }
                    }
                }
            }
        });

        // Process data
        const processedEmployees = employees.map(emp => {
            let status = 'ABSENT';
            let timeInfo = '';
            let durationInfo = '';
            let metaInfo = '';

            // 1. Check Leave
            const onLeave = emp.leaveRequests.length > 0;
            if (onLeave) {
                status = 'LEAVE';
                const leave = emp.leaveRequests[0];
                metaInfo = `until ${new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            }

            // 2. Check Attendance
            const attendance = emp.attendanceRecords[0];
            if (attendance) {
                if (attendance.checkInTime) {
                    // Determine simplified status
                    // If status is specifically set to WFH in DB, use it. Otherwise default to PRESENT.
                    if (attendance.status === 'WFH') status = 'WFH';
                    else if (attendance.status === 'BREAK') status = 'BREAK';
                    else status = 'PRESENT';

                    // Time formatting
                    const checkIn = new Date(attendance.checkInTime);
                    timeInfo = `Since ${checkIn.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

                    if (attendance.checkOutTime) {
                        // If checked out, they might be "Left" but for virtual office we usually show "Present" or "Left"
                        // Maybe "Checked Out" status? For now keep PRESENT but show duration.
                        const checkOut = new Date(attendance.checkOutTime);
                        const diffMs = checkOut.getTime() - checkIn.getTime();
                        const hrs = Math.floor(diffMs / 3600000);
                        const mins = Math.floor((diffMs % 3600000) / 60000);
                        durationInfo = `${hrs}h ${mins}m`;
                    } else {
                        // Live duration
                        const diffMs = now.getTime() - checkIn.getTime();
                        const hrs = Math.floor(diffMs / 3600000);
                        const mins = Math.floor((diffMs % 3600000) / 60000);
                        durationInfo = `${hrs}h ${mins}m`;
                    }
                }
            }

            // Fallback for demo/missing images
            const image = emp.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.firstName + ' ' + emp.lastName)}&background=random`;

            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                role: emp.designation?.name || 'Employee',
                department: emp.department?.name || 'General',
                image,
                status,
                time: timeInfo,
                duration: durationInfo,
                meta: metaInfo,
                // Helper for leadership filtering
                isLeader: emp.designation?.name.match(/(Chief|Head|Manager|Director|Lead)/i) || emp.department?.name === 'Management'
            };
        });

        // Grouping
        const leadership = processedEmployees.filter(e => e.isLeader);
        const nonLeaders = processedEmployees.filter(e => !e.isLeader);

        // Group non-leaders by department
        const departments: Record<string, any[]> = {};
        nonLeaders.forEach(emp => {
            if (!departments[emp.department]) departments[emp.department] = [];
            departments[emp.department].push(emp);
        });

        // Stats Calculation
        const total = processedEmployees.length;
        const presentCount = processedEmployees.filter(e => e.status === 'PRESENT' || e.status === 'WFH').length;
        const wfhCount = processedEmployees.filter(e => e.status === 'WFH').length;
        const wfoCount = presentCount - wfhCount;

        // Late logins (after 9:30 AM)
        let lateCount = 0;
        processedEmployees.forEach(emp => {
            if (emp.time.includes('Since')) {
                // Parse time roughly or check attendance record actual time
                // This is string parsing, but safer to do in the loop above if needed.
                // Simplified:
            }
        });

        // Calculate average login time
        let totalLoginMinutes = 0;
        let loginCount = 0;
        employees.forEach(emp => {
            const att = emp.attendanceRecords[0];
            if (att?.checkInTime) {
                const d = new Date(att.checkInTime);
                totalLoginMinutes += d.getHours() * 60 + d.getMinutes();
                loginCount++;
            }
        });

        let avgLoginTime = "N/A";
        if (loginCount > 0) {
            const avgMins = Math.floor(totalLoginMinutes / loginCount);
            const hrs = Math.floor(avgMins / 60);
            const mins = avgMins % 60;
            const ampm = hrs >= 12 ? 'PM' : 'AM';
            const hrs12 = hrs % 12 || 12;
            avgLoginTime = `${hrs12}:${mins.toString().padStart(2, '0')} ${ampm}`;
        }

        return NextResponse.json({
            leadership,
            departments,
            stats: {
                total,
                present: presentCount,
                presentPercentage: total > 0 ? Math.round((presentCount / total) * 100) : 0,
                avgLoginTime,
                lateEntries: 0, // Implement real logic if strictly needed
                wfoPercentage: presentCount > 0 ? Math.round((wfoCount / presentCount) * 100) : 0,
                wfhPercentage: presentCount > 0 ? Math.round((wfhCount / presentCount) * 100) : 0,
            }
        });

    } catch (error) {
        console.error('Virtual Office API Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
