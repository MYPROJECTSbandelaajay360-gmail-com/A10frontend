'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import {
    BarChart3,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Download,
    Search,
    Filter,
    Users,
    CalendarDays,
    TrendingUp,
    Building2,
    Loader2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import Link from 'next/link'

// ===================== TYPES =====================
interface KPIs {
    totalRequests: number
    approved: number
    rejected: number
    pending: number
    cancelled: number
    totalDays: number
    avgDaysPerRequest: number
}

interface MonthlyTrend {
    month: number
    monthName: string
    total: number
    approved: number
    rejected: number
    pending: number
    totalDays: number
}

interface DeptBreakdown {
    name: string
    count: number
    days: number
}

interface LeaveTypeBreakdown {
    name: string
    code: string
    count: number
    days: number
}

interface EmployeeSummary {
    employeeId: string
    name: string
    department: string
    designation: string
    totalRequests: number
    approvedDays: number
    pendingDays: number
    rejectedDays: number
}

interface Department {
    id: string
    name: string
}

interface ReportData {
    kpis: KPIs
    monthlyTrends: MonthlyTrend[]
    departmentBreakdown: DeptBreakdown[]
    leaveTypeBreakdown: LeaveTypeBreakdown[]
    employeeSummary: EmployeeSummary[]
    departments: Department[]
    filters: { year: number; department: string }
}

// ===================== COLORS =====================
const LEAVE_TYPE_COLORS = [
    { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50', ring: 'ring-blue-500' },
    { bg: 'bg-rose-500', text: 'text-rose-500', light: 'bg-rose-50', ring: 'ring-rose-500' },
    { bg: 'bg-violet-500', text: 'text-violet-500', light: 'bg-violet-50', ring: 'ring-violet-500' },
    { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50', ring: 'ring-amber-500' },
    { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50', ring: 'ring-emerald-500' },
    { bg: 'bg-cyan-500', text: 'text-cyan-500', light: 'bg-cyan-50', ring: 'ring-cyan-500' },
]

const DEPT_COLORS = [
    'from-blue-500 to-indigo-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-cyan-500 to-sky-600',
    'from-fuchsia-500 to-pink-600',
    'from-lime-500 to-green-600',
]

// ===================== COMPONENT =====================
export default function LeaveReportsPage() {
    const { data: session, status: authStatus } = useSession()
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedDept, setSelectedDept] = useState('all')

    // Employee table
    const [empSearch, setEmpSearch] = useState('')
    const [sortField, setSortField] = useState<'name' | 'approvedDays' | 'totalRequests'>('approvedDays')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    // Year options 
    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

    // ---- FETCH ----
    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            setLoading(false)
            setError('Please sign in to view leave reports.')
            return
        }
        if (authStatus === 'authenticated' && (session as any)?.accessToken) {
            fetchReports()
        }
    }, [session, authStatus, selectedYear, selectedDept])

    const fetchReports = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = (session as any)?.accessToken
            const params = new URLSearchParams({ year: selectedYear.toString() })
            if (selectedDept !== 'all') params.append('department', selectedDept)
            const res = await fetch(`http://127.0.0.1:8001/api/leave/reports?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) {
                const errJson = await res.json().catch(() => null)
                throw new Error(errJson?.error || `HTTP ${res.status}`)
            }
            const json = await res.json()
            setReportData(json.data)
        } catch (err: any) {
            console.error('Failed to fetch leave reports', err)
            setError(err.message || 'Connection error. Please ensure the backend is running.')
        } finally {
            setLoading(false)
        }
    }

    // ---- EMPLOYEE TABLE LOGIC ----
    const filteredEmployees = useMemo(() => {
        if (!reportData) return []
        let list = [...reportData.employeeSummary]
        if (empSearch) {
            const q = empSearch.toLowerCase()
            list = list.filter(e =>
                e.name.toLowerCase().includes(q) ||
                e.department.toLowerCase().includes(q) ||
                e.employeeId.toLowerCase().includes(q)
            )
        }
        list.sort((a, b) => {
            const aVal = a[sortField]
            const bVal = b[sortField]
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
            }
            return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
        })
        return list
    }, [reportData, empSearch, sortField, sortDir])

    const totalPages = Math.ceil(filteredEmployees.length / pageSize)
    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const toggleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('desc')
        }
        setCurrentPage(1)
    }

    // ---- CSV EXPORT ----
    const exportCSV = () => {
        if (!reportData) return
        const headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Total Requests', 'Approved Days', 'Pending Days', 'Rejected Days']
        const rows = reportData.employeeSummary.map(e => [
            e.employeeId, e.name, e.department, e.designation,
            e.totalRequests, e.approvedDays, e.pendingDays, e.rejectedDays
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `leave_report_${selectedYear}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    // ---- ERROR STATE ----
    if (error && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-red-100 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Unable to load reports</h2>
                <p className="text-gray-500 max-w-md">{error}</p>
                <button
                    onClick={fetchReports}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    Try Again
                </button>
            </div>
        )
    }

    // ---- HELPERS ----
    const maxMonthlyTotal = reportData ? Math.max(...reportData.monthlyTrends.map(t => t.total), 1) : 1
    const maxDeptCount = reportData ? Math.max(...reportData.departmentBreakdown.map(d => d.count), 1) : 1
    const totalLeaveTypeCount = reportData ? reportData.leaveTypeBreakdown.reduce((s, t) => s + t.count, 0) : 1

    return (
        <div className="space-y-6">
            {/* ==================== HEADER ==================== */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leave Reports</h1>
                    <p className="text-gray-500 mt-1">Comprehensive leave analytics and insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/leave"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                        <CalendarDays className="w-4 h-4" />
                        My Leaves
                    </Link>
                    <button
                        onClick={exportCSV}
                        disabled={!reportData || reportData.employeeSummary.length === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ==================== FILTERS ==================== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">Year</label>
                        <select
                            value={selectedYear}
                            onChange={e => { setSelectedYear(parseInt(e.target.value)); setCurrentPage(1) }}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">Department</label>
                        <select
                            value={selectedDept}
                            onChange={e => { setSelectedDept(e.target.value); setCurrentPage(1) }}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[160px]"
                        >
                            <option value="all">All Departments</option>
                            {reportData?.departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ==================== KPI CARDS ==================== */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse h-28" />
                    ))}
                </div>
            ) : reportData && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Requests', value: reportData.kpis.totalRequests, icon: FileText, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
                        { label: 'Approved', value: reportData.kpis.approved, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
                        { label: 'Rejected', value: reportData.kpis.rejected, icon: XCircle, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' },
                        { label: 'Pending', value: reportData.kpis.pending, icon: Clock, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
                        { label: 'Avg Days/Req', value: reportData.kpis.avgDaysPerRequest, icon: TrendingUp, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
                    ].map((kpi, i) => {
                        const Icon = kpi.icon
                        return (
                            <div key={i} className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} shadow-lg flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ==================== CHARTS ROW ==================== */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse h-80" />
                    ))}
                </div>
            ) : reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Trend Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                Monthly Leave Trends
                            </h3>
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{selectedYear}</span>
                        </div>
                        <div className="flex items-end gap-1.5 h-48">
                            {reportData.monthlyTrends.map((m, i) => {
                                const heightPct = maxMonthlyTotal > 0 ? (m.total / maxMonthlyTotal) * 100 : 0
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                        <span className="text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {m.total}
                                        </span>
                                        <div className="w-full relative" style={{ height: '160px' }}>
                                            <div
                                                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-md transition-all duration-500 hover:from-blue-600 hover:to-indigo-500 cursor-pointer"
                                                style={{ height: `${Math.max(heightPct, 2)}%` }}
                                                title={`${m.monthName}: ${m.total} requests (${m.totalDays} days)\nApproved: ${m.approved} | Rejected: ${m.rejected} | Pending: ${m.pending}`}
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-500">{m.monthName}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-blue-500 to-indigo-400" />
                                <span className="text-xs text-gray-500">Total Requests</span>
                            </div>
                            <span className="text-xs text-gray-400">Hover for details</span>
                        </div>
                    </div>

                    {/* Leave Type Breakdown */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <CalendarDays className="w-5 h-5 text-violet-500" />
                            Leave Type Distribution
                        </h3>
                        {reportData.leaveTypeBreakdown.length > 0 ? (
                            <div className="space-y-4">
                                {reportData.leaveTypeBreakdown.map((type, i) => {
                                    const color = LEAVE_TYPE_COLORS[i % LEAVE_TYPE_COLORS.length]
                                    const pct = totalLeaveTypeCount > 0 ? Math.round((type.count / totalLeaveTypeCount) * 100) : 0
                                    return (
                                        <div key={i} className="group">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                                                    <span className="text-sm font-medium text-gray-700">{type.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-400">{type.days} days</span>
                                                    <span className="text-sm font-bold text-gray-900">{type.count}</span>
                                                    <span className={`text-xs font-semibold ${color.text}`}>{pct}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full ${color.bg} rounded-full transition-all duration-700`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <CalendarDays className="w-8 h-8 mb-2" />
                                <p className="text-sm">No leave data for this period</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================== DEPARTMENT BREAKDOWN ==================== */}
            {loading ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse h-64" />
            ) : reportData && reportData.departmentBreakdown.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                        <Building2 className="w-5 h-5 text-amber-500" />
                        Department-wise Leave Distribution
                    </h3>
                    <div className="space-y-3">
                        {reportData.departmentBreakdown.map((dept, i) => {
                            const pct = maxDeptCount > 0 ? Math.round((dept.count / maxDeptCount) * 100) : 0
                            const colorClass = DEPT_COLORS[i % DEPT_COLORS.length]
                            return (
                                <div key={i} className="flex items-center gap-4 group">
                                    <span className="w-32 text-sm font-medium text-gray-700 truncate">{dept.name}</span>
                                    <div className="flex-1 h-6 bg-gray-50 rounded-lg overflow-hidden relative">
                                        <div
                                            className={`h-full bg-gradient-to-r ${colorClass} rounded-lg transition-all duration-700 flex items-center`}
                                            style={{ width: `${Math.max(pct, 4)}%` }}
                                        >
                                            {pct > 20 && (
                                                <span className="text-xs font-semibold text-white px-2">{dept.count} requests</span>
                                            )}
                                        </div>
                                        {pct <= 20 && (
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 ml-1"
                                                style={{ left: `${Math.max(pct, 4)}%` }}
                                            >
                                                {dept.count} requests
                                            </span>
                                        )}
                                    </div>
                                    <span className="w-20 text-right text-xs text-gray-500">{dept.days} days</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ==================== EMPLOYEE TABLE ==================== */}
            {loading ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse h-80" />
            ) : reportData && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Employee Leave Summary
                            <span className="text-sm font-normal text-gray-400">({filteredEmployees.length})</span>
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={empSearch}
                                onChange={e => { setEmpSearch(e.target.value); setCurrentPage(1) }}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 text-sm"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Emp ID</th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                                        onClick={() => toggleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Name
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
                                    <th
                                        className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                                        onClick={() => toggleSort('totalRequests')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Requests
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                                        onClick={() => toggleSort('approvedDays')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Approved
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Rejected</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {paginatedEmployees.length > 0 ? (
                                    paginatedEmployees.map((emp, i) => (
                                        <tr key={emp.employeeId} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{emp.employeeId}</span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-sm text-gray-600">{emp.department}</span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-sm text-gray-600">{emp.designation}</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                <span className="text-sm font-semibold text-gray-900">{emp.totalRequests}</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                                    {emp.approvedDays} days
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                {emp.pendingDays > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                                                        {emp.pendingDays} days
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                {emp.rejectedDays > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                                                        {emp.rejectedDays} days
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gray-100 p-3 rounded-full mb-3">
                                                    <Users className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-900">No employee data found</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {empSearch ? 'Try adjusting your search criteria.' : 'No leave requests recorded for this period.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <span className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredEmployees.length)} of {filteredEmployees.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                            ? 'bg-blue-500 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-white hover:border-gray-200 border border-transparent'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
