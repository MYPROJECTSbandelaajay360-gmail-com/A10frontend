'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
    BarChart3,
    Download,
    Calendar,
    Users,
    Clock,
    Wallet,
    CalendarDays,
    FileText,
    Filter,
    Loader2,
    CheckCircle
} from 'lucide-react'

export default function ReportsPage() {
    const { data: session } = useSession()
    const [selectedReport, setSelectedReport] = useState<string | null>(null)
    const [dateRange, setDateRange] = useState({ from: '', to: '' })
    const [downloading, setDownloading] = useState<string | null>(null)
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)

    const reports = [
        {
            id: 'attendance',
            name: 'Attendance Report',
            description: 'Daily, weekly, and monthly attendance summary',
            icon: Clock,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            id: 'leave',
            name: 'Leave Report',
            description: 'Leave utilization and balance analysis',
            icon: CalendarDays,
            color: 'bg-green-100 text-green-600'
        },
        {
            id: 'payroll',
            name: 'Payroll Report',
            description: 'Salary disbursement and deduction summary',
            icon: Wallet,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            id: 'employee',
            name: 'Employee Report',
            description: 'Employee headcount and demographics',
            icon: Users,
            color: 'bg-orange-100 text-orange-600'
        },
        {
            id: 'attendance-trend',
            name: 'Attendance Trend',
            description: 'Monthly attendance patterns and trends',
            icon: BarChart3,
            color: 'bg-pink-100 text-pink-600'
        },
        {
            id: 'leave-summary',
            name: 'Leave Summary',
            description: 'Department-wise leave consumption',
            icon: FileText,
            color: 'bg-teal-100 text-teal-600'
        }
    ]

    // Mock data for attendance trend
    const attendanceData = [
        { month: 'Jan', present: 92, absent: 5, leave: 3 },
        { month: 'Feb', present: 88, absent: 7, leave: 5 },
        { month: 'Mar', present: 95, absent: 3, leave: 2 },
        { month: 'Apr', present: 90, absent: 6, leave: 4 },
        { month: 'May', present: 93, absent: 4, leave: 3 },
        { month: 'Jun', present: 91, absent: 5, leave: 4 },
    ]

    const handleDownload = async (reportId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setDownloading(reportId)
        try {
            const params = new URLSearchParams({ type: reportId })
            if (dateRange.from) params.set('from', dateRange.from)
            if (dateRange.to) params.set('to', dateRange.to)

            const res = await fetch(`/api/reports?${params.toString()}`)

            if (!res.ok) {
                const err = await res.json()
                alert(err.error || 'Failed to generate report')
                return
            }

            const blob = await res.blob()
            const disposition = res.headers.get('Content-Disposition') || ''
            const filenameMatch = disposition.match(/filename="(.+)"/)
            const filename = filenameMatch ? filenameMatch[1] : `${reportId}_report.csv`

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setDownloadSuccess(reportId)
            setTimeout(() => setDownloadSuccess(null), 2000)
        } catch (error) {
            console.error('Download failed:', error)
            alert('Download failed. Please try again.')
        } finally {
            setDownloading(null)
        }
    }

    const departmentData = [
        { name: 'Engineering', employees: 45, avgAttendance: 94 },
        { name: 'Marketing', employees: 12, avgAttendance: 91 },
        { name: 'Sales', employees: 18, avgAttendance: 89 },
        { name: 'HR', employees: 8, avgAttendance: 96 },
        { name: 'Finance', employees: 10, avgAttendance: 95 },
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-500 mt-1">Generate and download detailed reports</p>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Date Range:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        Apply Filter
                    </button>
                </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map(report => {
                    const Icon = report.icon
                    const isDownloading = downloading === report.id
                    const isSuccess = downloadSuccess === report.id
                    return (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report.id)}
                            className={`bg-white rounded-2xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${selectedReport === report.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={(e) => handleDownload(report.id, e)}
                                    disabled={isDownloading}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                    title={`Download ${report.name}`}
                                >
                                    {isDownloading ? (
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    ) : isSuccess ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Download className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                                    )}
                                </button>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mt-4">{report.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                        </div>
                    )
                })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Trend (Last 6 Months)</h3>
                    <div className="space-y-4">
                        {attendanceData.map((data, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="w-10 text-sm font-medium text-gray-600">{data.month}</span>
                                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                                        style={{ width: `${data.present}%` }}
                                    />
                                </div>
                                <span className="w-12 text-sm font-semibold text-gray-900 text-right">{data.present}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Overview</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                                    <th className="text-center py-3 text-xs font-semibold text-gray-500 uppercase">Employees</th>
                                    <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">Avg Attendance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {departmentData.map((dept, index) => (
                                    <tr key={index}>
                                        <td className="py-3 font-medium text-gray-900">{dept.name}</td>
                                        <td className="py-3 text-center text-gray-600">{dept.employees}</td>
                                        <td className="py-3 text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${dept.avgAttendance >= 95 ? 'bg-green-100 text-green-700' :
                                                dept.avgAttendance >= 90 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {dept.avgAttendance}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Generate Report Button */}
            {selectedReport && (
                <div className="flex justify-end">
                    <button
                        onClick={() => handleDownload(selectedReport)}
                        disabled={downloading === selectedReport}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {downloading === selectedReport ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Generate &amp; Download Report
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
