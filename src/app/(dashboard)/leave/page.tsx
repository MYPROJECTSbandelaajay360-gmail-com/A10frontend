'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    Search,
    FileText,
    Loader2,
    Briefcase,
    Clock,
    Filter,
    ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

interface LeaveRequest {
    id: string
    leaveType: { name: string }
    fromDate: string
    toDate: string
    numberOfDays: number
    reason: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    appliedOn: string
}

interface LeaveBalance {
    leaveTypeId: string
    leaveType: { name: string; code: string }
    allocated: number
    used: number
    pending: number
    carriedForward: number
    adjustment: number
    available: number
}

// ===================== COLORS =====================
const getBalanceColor = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('casual')) return { grad: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', bg: 'bg-blue-50' }
    if (n.includes('sick')) return { grad: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20', bg: 'bg-rose-50' }
    if (n.includes('earned') || n.includes('privilege')) return { grad: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20', bg: 'bg-violet-50' }
    if (n.includes('comp')) return { grad: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', bg: 'bg-amber-50' }
    return { grad: 'from-slate-500 to-gray-600', shadow: 'shadow-gray-500/20', bg: 'bg-gray-50' }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100'
        case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
        case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-100'
        case 'CANCELLED': return 'bg-slate-50 text-slate-700 border-slate-100'
        default: return 'bg-gray-50 text-gray-700 border-gray-100'
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'PENDING': return <AlertCircle className="w-3.5 h-3.5" />
        case 'APPROVED': return <CheckCircle className="w-3.5 h-3.5" />
        case 'REJECTED': return <XCircle className="w-3.5 h-3.5" />
        default: return <AlertCircle className="w-3.5 h-3.5" />
    }
}

export default function LeavePage() {
    const { data: session, status } = useSession()
    const [filter, setFilter] = useState('ALL')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            setLoading(false)
            setError('Please sign in to view your leave data.')
            return
        }

        if (status === 'authenticated' && (session as any)?.accessToken) {
            fetchLeaveData()
        } else if (status === 'authenticated') {
            setLoading(false)
            setError('Session token not found. Please try logging out and in again.')
        }
    }, [session, status])

    const fetchLeaveData = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = (session as any)?.accessToken
            const headers = { 'Authorization': `Bearer ${token}` }

            // Fetch Balances
            const balanceRes = await fetch('http://127.0.0.1:8001/api/leave/balance', { headers })
            if (balanceRes.ok) {
                const json = await balanceRes.json()
                setLeaveBalances(json.data)
            } else {
                setError('Failed to fetch leave balances.')
            }

            // Fetch Requests (assuming /api/leave returns user's request history)
            // Added year=2026 or just current year logic if needed, but endpoint defaults to current year usually
            const requestsRes = await fetch('http://127.0.0.1:8001/api/leave', { headers })
            if (requestsRes.ok) {
                const json = await requestsRes.json()
                setLeaveRequests(json.data)
            }
        } catch (error) {
            console.error('Failed to fetch leave data', error)
            setError('Connection error. Please ensure the backend is running.')
        } finally {
            setLoading(false)
        }
    }

    const filteredRequests = leaveRequests.filter(req => {
        if (filter !== 'ALL' && req.status !== filter) return false
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            const typeMatch = req.leaveType?.name.toLowerCase().includes(term)
            const reasonMatch = req.reason.toLowerCase().includes(term)
            if (!typeMatch && !reasonMatch) return false
        }
        return true
    })

    if (error && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-red-100 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Unable to load dashboard</h2>
                <p className="text-gray-500 max-w-md">{error}</p>
                <button
                    onClick={() => fetchLeaveData()}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leave Management</h1>
                    <p className="text-gray-500 mt-1">Track your leave balances and manage time-off requests</p>
                </div>
                <Link
                    href="/leave/apply"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Apply New Leave
                </Link>
            </div>

            {/* Leave Balance Cards */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    Your Leave Balances
                </h2>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse h-32" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {leaveBalances.map((balance) => {
                            const total = balance.allocated + balance.carriedForward + balance.adjustment
                            const styles = getBalanceColor(balance.leaveType?.name || '')
                            const percentUsed = total > 0 ? ((total - balance.available) / total) * 100 : 0

                            return (
                                <div key={balance.leaveTypeId} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500" />

                                    <div className="relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-600 mb-0.5">{balance.leaveType?.name}</h3>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-3xl font-bold text-gray-900">{balance.available}</span>
                                                    <span className="text-xs font-medium text-gray-400">days left</span>
                                                </div>
                                            </div>
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${styles.grad} ${styles.shadow} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                                                <Calendar className="w-5 h-5 text-white" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-medium text-gray-500">
                                                <span>Used: {balance.used}</span>
                                                <span>Total: {total}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${styles.grad} rounded-full transition-all duration-1000 ease-out`}
                                                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                                />
                                            </div>
                                            {balance.pending > 0 && (
                                                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mt-1 bg-amber-50 px-2 py-1 rounded-md w-fit">
                                                    <Clock className="w-3 h-3" />
                                                    {balance.pending} days pending approval
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Leave Requests Section */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        Recent Requests
                    </h2>

                    {/* Filters & Search - Now closer to table */}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between bg-gray-50/50">
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === status
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {status === 'ALL' ? 'All Requests' : status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by type or reason..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full lg:w-72 text-sm transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                                <span className="text-sm font-medium">Loading your requests...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredRequests.length > 0 ? (
                                    filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900">{request.leaveType?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-700">
                                                    {new Date(request.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    {request.fromDate !== request.toDate && (
                                                        <span className="text-gray-400 mx-1">-</span>
                                                    )}
                                                    {request.fromDate !== request.toDate && new Date(request.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(request.fromDate).getFullYear()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                    {request.numberOfDays} day{request.numberOfDays > 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 max-w-xs truncate" title={request.reason}>
                                                    {request.reason}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                                                    {getStatusIcon(request.status)}
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                {new Date(request.appliedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-24 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                                    <FileText className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900">No leave requests found</p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {filter !== 'ALL'
                                                        ? `You don't have any ${filter.toLowerCase()} requests.`
                                                        : "You haven't submitted any leave requests yet."}
                                                </p>
                                                {filter === 'ALL' && (
                                                    <Link
                                                        href="/leave/apply"
                                                        className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                                    >
                                                        Apply for Leave
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
