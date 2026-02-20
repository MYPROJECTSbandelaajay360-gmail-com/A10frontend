'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    Calendar,
    ArrowLeft,
    FileText,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Clock
} from 'lucide-react'
import Link from 'next/link'

export default function ApplyLeavePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetchingTypes, setFetchingTypes] = useState(true)
    const [leaveTypes, setLeaveTypes] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        fromDate: '',
        toDate: '',
        reason: '',
        contactNumber: '',
        isHalfDay: false,
        halfDayType: 'FIRST_HALF'
    })

    // Fetch Leave Types & Balances
    useEffect(() => {
        if (status === 'unauthenticated') {
            setFetchingTypes(false)
            setError('Please sign in to apply for leave.')
            return
        }

        if (status === 'authenticated' && (session as any)?.accessToken) {
            fetchLeaveTypes()
        } else if (status === 'authenticated') {
            setFetchingTypes(false)
            setError('Session token not found. Please try logging out and in again.')
        }
    }, [session, status])

    const fetchLeaveTypes = async () => {
        setFetchingTypes(true)
        setError(null)
        try {
            const token = (session as any)?.accessToken
            const res = await fetch('/api/leave/balance', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const json = await res.json()
                const types = json.data.map((b: any) => ({
                    id: b.leaveTypeId,
                    name: b.leaveType.name,
                    balance: b.allocated + b.carriedForward + b.adjustment - b.used - b.pending,
                    color: getColorForType(b.leaveType.name)
                }))
                setLeaveTypes(types)
                if (types.length > 0) {
                    setFormData(prev => ({ ...prev, leaveTypeId: types[0].id }))
                }
            } else {
                setError('Failed to fetch available leave types.')
            }
        } catch (error) {
            console.error('Failed to fetch leave types', error)
            setError('Connection error. Please ensure the backend is running.')
        } finally {
            setFetchingTypes(false)
        }
    }

    const getColorForType = (name: string) => {
        const n = name.toLowerCase()
        if (n.includes('casual')) return 'bg-blue-50 text-blue-700'
        if (n.includes('sick')) return 'bg-rose-50 text-rose-700'
        if (n.includes('earned') || n.includes('privilege')) return 'bg-purple-50 text-purple-700'
        if (n.includes('comp')) return 'bg-amber-50 text-amber-700'
        return 'bg-gray-50 text-gray-700'
    }

    const calculateDays = () => {
        if (!formData.fromDate || !formData.toDate) return 0
        if (formData.isHalfDay) return 0.5
        const from = new Date(formData.fromDate)
        const to = new Date(formData.toDate)
        const diffTime = Math.abs(to.getTime() - from.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.leaveTypeId) {
            alert('Please select a leave type')
            return
        }

        setLoading(true)
        try {
            const token = (session as any)?.accessToken
            const res = await fetch('/api/leave/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    leaveTypeId: formData.leaveTypeId,
                    fromDate: formData.fromDate,
                    toDate: formData.toDate,
                    reason: formData.reason,
                    isHalfDay: formData.isHalfDay,
                    halfDayType: formData.isHalfDay ? formData.halfDayType : null,
                    contactNumber: formData.contactNumber
                })
            })

            if (res.ok) {
                router.push('/dashboard/leave')
                router.refresh()
            } else {
                const err = await res.json()
                alert(err.message || 'Failed to submit leave request')
            }
        } catch (error) {
            console.error('Submit failed', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/dashboard/leave"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Leave Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Leave Request</h1>
                    <p className="text-slate-500 mt-1">Submit your leave application for approval.</p>
                </div>
            </div>

            {error && !fetchingTypes && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center space-y-4">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                    <p className="text-red-800 font-medium">{error}</p>
                    <button
                        onClick={() => fetchLeaveTypes()}
                        className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                        Retry Loading
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Request Details
                            </h2>
                        </div>

                        {fetchingTypes ? (
                            <div className="p-12 text-center text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                Loading leave types...
                            </div>
                        ) : !error && (
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Leave Type Selection */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-slate-700">Type of Leave <span className="text-rose-500">*</span></label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {leaveTypes.map((type) => (
                                            <label
                                                key={type.id}
                                                className={`
                                                    relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all
                                                    ${formData.leaveTypeId === type.id
                                                        ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20'
                                                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="radio"
                                                    name="leaveTypeId"
                                                    value={type.id}
                                                    checked={formData.leaveTypeId === type.id}
                                                    onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                                                    className="hidden"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`font-semibold ${formData.leaveTypeId === type.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                                            {type.name}
                                                        </span>
                                                        {formData.leaveTypeId === type.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        Available Balance: <span className="font-medium text-slate-700">{type.balance} days</span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {leaveTypes.length === 0 && (
                                        <p className="text-sm text-red-500">No leave types found. Please contact HR.</p>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 my-6"></div>

                                {/* Duration Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            Duration
                                        </h3>

                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.isHalfDay}
                                                onChange={(e) => setFormData({ ...formData, isHalfDay: e.target.checked })}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                            />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Apply for Half Day</span>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">From Date <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.fromDate}
                                                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">To Date <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.toDate}
                                                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                                                    min={formData.fromDate}
                                                    disabled={formData.isHalfDay}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {formData.isHalfDay && (
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex gap-6 animate-in slide-in-from-top-2">
                                            {/* Half Day Radio Buttons */}
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="halfDayType"
                                                    value="FIRST_HALF"
                                                    checked={formData.halfDayType === 'FIRST_HALF'}
                                                    onChange={(e) => setFormData({ ...formData, halfDayType: e.target.value })}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-slate-900">First Half (9:30 - 1:30)</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="halfDayType"
                                                    value="SECOND_HALF"
                                                    checked={formData.halfDayType === 'SECOND_HALF'}
                                                    onChange={(e) => setFormData({ ...formData, halfDayType: e.target.value })}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-slate-900">Second Half (2:00 - 6:00)</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 my-6"></div>

                                {/* Reason & Contact */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Leave <span className="text-rose-500">*</span></label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            placeholder="Please maintain professional tone. e.g., 'Attending a family wedding'"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 resize-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact</label>
                                        <input
                                            type="tel"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                            placeholder="+91"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-all font-mono"
                                        />
                                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Optional. Only used for emergencies during your absence.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row gap-4 items-center justify-between -mx-6 -mb-6 mt-6">
                                    <Link
                                        href="/dashboard/leave"
                                        className="w-full sm:w-auto px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900 hover:bg-white rounded-lg transition-all text-center"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Request'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Summary Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-base font-semibold text-slate-800 mb-4">Request Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Leave Type</span>
                                <span className="text-sm font-medium text-slate-800">
                                    {leaveTypes.find(t => t.id === formData.leaveTypeId)?.name || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Duration</span>
                                <span className="text-sm font-medium text-slate-800">
                                    {calculateDays() > 0 ? `${calculateDays()} ${calculateDays() === 1 ? 'Day' : 'Days'}` : '-'}
                                </span>
                            </div>
                            <div className="pt-2">
                                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                    <div className="flex gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-800 leading-relaxed">
                                            Your manager will utilize this request to approve or reject your leave. Ensure dates are correct.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Policy Quick Links */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Leave Policy</h3>
                        <ul className="space-y-2">
                            <li className="text-xs text-slate-600 flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                Casual leaves must be applied 2 days in advance.
                            </li>
                            <li className="text-xs text-slate-600 flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                Sick leaves require a medical certificate if &gt; 2 days.
                            </li>
                            <li className="text-xs text-slate-600 flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                Earned leaves carry forward to next year.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
