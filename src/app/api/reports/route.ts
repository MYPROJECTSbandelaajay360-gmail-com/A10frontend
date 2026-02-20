import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

function escapeCSV(val: any): string {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

function toCSV(headers: string[], rows: any[][]): string {
    const headerLine = headers.map(escapeCSV).join(',')
    const dataLines = rows.map(row => row.map(escapeCSV).join(','))
    return [headerLine, ...dataLines].join('\n')
}

function formatDate(date: Date | null | undefined): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const from = searchParams.get('from')
        const to = searchParams.get('to')

        const dateFrom = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const dateTo = to ? new Date(to + 'T23:59:59') : new Date()

        let csv = ''
        let filename = ''

        switch (type) {
            case 'attendance': {
                const records = await prisma.attendance.findMany({
                    where: {
                        date: { gte: dateFrom, lte: dateTo }
                    },
                    include: {
                        employee: {
                            include: { department: true, designation: true }
                        }
                    },
                    orderBy: { date: 'desc' }
                })

                const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Designation', 'Check In', 'Check Out', 'Status', 'Working Hours', 'Overtime']
                const rows = records.map(r => [
                    formatDate(r.date),
                    r.employee.employeeId,
                    `${r.employee.firstName} ${r.employee.lastName}`,
                    r.employee.department.name,
                    r.employee.designation.name,
                    r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('en-IN') : '',
                    r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString('en-IN') : '',
                    r.status,
                    r.workingHours ? `${r.workingHours.toFixed(1)}h` : '',
                    r.overtime ? `${r.overtime.toFixed(1)}h` : ''
                ])

                csv = toCSV(headers, rows)
                filename = `attendance_report_${dateFrom.toISOString().slice(0, 10)}_to_${dateTo.toISOString().slice(0, 10)}.csv`
                break
            }

            case 'leave': {
                const records = await prisma.leaveRequest.findMany({
                    where: {
                        OR: [
                            { fromDate: { gte: dateFrom, lte: dateTo } },
                            { toDate: { gte: dateFrom, lte: dateTo } }
                        ]
                    },
                    include: {
                        employee: {
                            include: { department: true, designation: true }
                        },
                        leaveType: true
                    },
                    orderBy: { createdAt: 'desc' }
                })

                const headers = ['Employee ID', 'Employee Name', 'Department', 'Leave Type', 'From Date', 'To Date', 'Days', 'Half Day', 'Status', 'Reason', 'Applied On']
                const rows = records.map(r => [
                    r.employee.employeeId,
                    `${r.employee.firstName} ${r.employee.lastName}`,
                    r.employee.department.name,
                    r.leaveType.name,
                    formatDate(r.fromDate),
                    formatDate(r.toDate),
                    r.numberOfDays,
                    r.isHalfDay ? 'Yes' : 'No',
                    r.status,
                    r.reason || '',
                    formatDate(r.appliedAt)
                ])

                csv = toCSV(headers, rows)
                filename = `leave_report_${dateFrom.toISOString().slice(0, 10)}_to_${dateTo.toISOString().slice(0, 10)}.csv`
                break
            }

            case 'payroll': {
                const records = await prisma.payrollRecord.findMany({
                    where: {
                        AND: [
                            { year: { gte: dateFrom.getFullYear() } },
                            { year: { lte: dateTo.getFullYear() } }
                        ]
                    },
                    include: {
                        employee: {
                            include: { department: true, designation: true }
                        }
                    },
                    orderBy: [{ year: 'desc' }, { month: 'desc' }]
                })

                const headers = ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Month/Year', 'Working Days', 'Present Days', 'Basic Salary', 'Gross Earnings', 'Total Deductions', 'Net Salary', 'Status']
                const rows = records.map(r => [
                    r.employee.employeeId,
                    `${r.employee.firstName} ${r.employee.lastName}`,
                    r.employee.department.name,
                    r.employee.designation.name,
                    `${r.month}/${r.year}`,
                    r.totalWorkingDays,
                    r.presentDays,
                    r.basicSalary,
                    r.grossEarnings,
                    r.totalDeductions,
                    r.netSalary,
                    r.status
                ])

                csv = toCSV(headers, rows)
                filename = `payroll_report_${dateFrom.toISOString().slice(0, 10)}_to_${dateTo.toISOString().slice(0, 10)}.csv`
                break
            }

            case 'employee': {
                const employees = await prisma.employee.findMany({
                    include: {
                        department: true,
                        designation: true,
                        user: { select: { status: true, role: true } }
                    },
                    orderBy: { firstName: 'asc' }
                })

                const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Designation', 'Employment Type', 'Joining Date', 'Gender', 'City', 'State', 'Status', 'Role']
                const rows = employees.map(e => [
                    e.employeeId,
                    e.firstName,
                    e.lastName,
                    e.email,
                    e.phone || '',
                    e.department.name,
                    e.designation.name,
                    e.employmentType,
                    formatDate(e.joiningDate),
                    e.gender || '',
                    e.city || '',
                    e.state || '',
                    e.user.status,
                    e.user.role
                ])

                csv = toCSV(headers, rows)
                filename = `employee_report_${new Date().toISOString().slice(0, 10)}.csv`
                break
            }

            case 'attendance-trend': {
                // Monthly aggregation of attendance
                const records = await prisma.attendance.findMany({
                    where: {
                        date: { gte: dateFrom, lte: dateTo }
                    },
                    select: {
                        date: true,
                        status: true
                    }
                })

                // Group by month
                const monthMap: Record<string, { total: number; present: number; absent: number; leave: number; late: number }> = {}
                records.forEach(r => {
                    const month = new Date(r.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
                    if (!monthMap[month]) monthMap[month] = { total: 0, present: 0, absent: 0, leave: 0, late: 0 }
                    monthMap[month].total++
                    const status = (r.status || '').toUpperCase()
                    if (status === 'PRESENT' || status === 'ON_TIME') monthMap[month].present++
                    else if (status === 'ABSENT') monthMap[month].absent++
                    else if (status === 'ON_LEAVE' || status === 'LEAVE') monthMap[month].leave++
                    else if (status === 'LATE') { monthMap[month].late++; monthMap[month].present++ }
                    else monthMap[month].present++
                })

                const headers = ['Month', 'Total Records', 'Present', 'Absent', 'On Leave', 'Late', 'Attendance %']
                const rows = Object.entries(monthMap).map(([month, data]) => [
                    month,
                    data.total,
                    data.present,
                    data.absent,
                    data.leave,
                    data.late,
                    data.total > 0 ? `${((data.present / data.total) * 100).toFixed(1)}%` : '0%'
                ])

                csv = toCSV(headers, rows)
                filename = `attendance_trend_${dateFrom.toISOString().slice(0, 10)}_to_${dateTo.toISOString().slice(0, 10)}.csv`
                break
            }

            case 'leave-summary': {
                // Department-wise leave summary
                const departments = await prisma.department.findMany({
                    include: {
                        employees: {
                            include: {
                                leaveRequests: {
                                    where: {
                                        OR: [
                                            { fromDate: { gte: dateFrom, lte: dateTo } },
                                            { toDate: { gte: dateFrom, lte: dateTo } }
                                        ]
                                    }
                                },
                                leaveBalances: true
                            }
                        }
                    }
                })

                const headers = ['Department', 'Total Employees', 'Total Leave Requests', 'Approved', 'Pending', 'Rejected', 'Total Days Taken']
                const rows = departments.map(dept => {
                    const allRequests = dept.employees.flatMap(e => e.leaveRequests)
                    const approved = allRequests.filter(r => r.status === 'APPROVED')
                    const pending = allRequests.filter(r => r.status === 'PENDING')
                    const rejected = allRequests.filter(r => r.status === 'REJECTED')
                    const totalDays = approved.reduce((sum, r) => sum + r.numberOfDays, 0)

                    return [
                        dept.name,
                        dept.employees.length,
                        allRequests.length,
                        approved.length,
                        pending.length,
                        rejected.length,
                        totalDays
                    ]
                })

                csv = toCSV(headers, rows)
                filename = `leave_summary_${dateFrom.toISOString().slice(0, 10)}_to_${dateTo.toISOString().slice(0, 10)}.csv`
                break
            }

            default:
                return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
        }

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            }
        })
    } catch (error) {
        console.error('Error generating report:', error)
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }
}
