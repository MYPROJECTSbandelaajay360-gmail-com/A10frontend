'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Calendar,
    ChevronDown,
    CheckCircle,
    XCircle,
    Filter,
    Search,
    User as UserIcon,
    AlertCircle,
    FileText,
    MessageSquare,
    Loader2
} from 'lucide-react';

// --- Types ---

interface LeaveRequest {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
        image?: string; // Add optional image
    };
    leaveType: {
        _id: string;
        name: string;
        color: string;
        code: string;
    };
    fromDate: string;
    toDate: string;
    days: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    createdAt: string;
    contactNumber?: string;
    isHalfDay?: boolean;
    halfDayType?: string;
}

// --- Status Badge ---

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'APPROVED':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" /> Approved
                </span>
            );
        case 'REJECTED':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <XCircle className="w-3 h-3 mr-1" /> Rejected
                </span>
            );
        case 'PENDING':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-3 h-3 mr-1" /> Pending Review
                </span>
            );
        case 'CANCELLED':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                    <XCircle className="w-3 h-3 mr-1" /> Cancelled
                </span>
            );
        default:
            return null;
    }
};

// --- Main Page Component ---

export default function LeaveApprovalsPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('PENDING'); // PENDING | ALL | HISTORY

    // Modal / Active Request State
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [adminComment, setAdminComment] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch Data
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const endpoint = filterStatus === 'HISTORY'
                ? '/api/leave/approvals?status=ALL' // fetch all history
                : '/api/leave/approvals?status=PENDING';

            const res = await fetch(endpoint);
            const data = await res.json();

            if (data.requests) {
                // Client-side filtering if needed, but API handles status
                let filtered = data.requests;
                if (filterStatus === 'HISTORY') {
                    filtered = filtered.filter((r: LeaveRequest) => r.status !== 'PENDING');
                }

                // MAP & SANITIZE to prevent crashes
                const sanitized = filtered.map((r: any) => ({
                    ...r,
                    user: r.user || { name: 'Unknown User', email: 'N/A', role: 'Unknown', _id: 'unknown' },
                    leaveType: r.leaveType || { name: 'Unknown Type', color: '#94a3b8', code: 'UNK', _id: 'unknown' }
                }));

                setRequests(sanitized);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filterStatus]);

    // Actions
    const handleViewDetails = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setAdminComment('');
        setIsDetailsOpen(true);
    };

    const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
        if (!selectedRequest) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/leave/approvals/${selectedRequest._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminComments: adminComment }),
            });

            if (res.ok) {
                await fetchRequests();
                setIsDetailsOpen(false);
                setSelectedRequest(null);
            } else {
                alert('Failed to process request');
            }
        } catch (error) {
            console.error('Action failed', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper to format date range
    const formatDateRange = (from: string, to: string) => {
        const fromDate = new Date(from).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const toDate = new Date(to).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${fromDate} - ${toDate}`;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Approvals</h1>
                    <p className="text-slate-500 mt-1">Review and manage employee leave requests.</p>
                </div>

                {/* Filters */}
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setFilterStatus('PENDING')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterStatus === 'PENDING' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Pending Requests
                    </button>
                    <button
                        onClick={() => setFilterStatus('HISTORY')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterStatus === 'HISTORY' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Approval History
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                        <p>Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">All Caught Up!</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-1">
                            {filterStatus === 'PENDING'
                                ? "There are no pending leave requests requiring your attention right now."
                                : "No historical records found based on your search criteria."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {requests.map((request) => (
                            <motion.div
                                layout
                                key={request._id}
                                onClick={() => handleViewDetails(request)}
                                className="group p-5 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                            >
                                {/* Left: User Info */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {request.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Overlap Status Icon */}
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                            {request.status === 'PENDING' && <Clock className="w-4 h-4 text-amber-500" />}
                                            {request.status === 'APPROVED' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                            {request.status === 'REJECTED' && <XCircle className="w-4 h-4 text-red-500" />}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{request.user.name}</h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                            <span className="capitalize">{request.user.role}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>Applied {new Date(request.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Centers: Leave Details */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 flex-1 w-full md:w-auto">
                                    <div className="flex items-center gap-2 min-w-[140px]">
                                        <div
                                            className="w-1 h-8 rounded-full"
                                            style={{ backgroundColor: request.leaveType.color || '#3b82f6' }}
                                        />
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Type</p>
                                            <p className="font-medium text-slate-800 text-sm">{request.leaveType.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Duration</p>
                                            <p className="font-medium text-slate-800 text-sm">
                                                {formatDateRange(request.fromDate, request.toDate)}
                                                <span className="ml-2 text-slate-500 font-normal">({request.days} Days)</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Status / Action Indicator */}
                                <div className="flex items-center gap-4">
                                    <StatusBadge status={request.status} />
                                    <div className="hidden md:block text-slate-400">
                                        <ChevronDown className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailsOpen && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                        onClick={() => setIsDetailsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Compact Header */}
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {selectedRequest.user.image ? (
                                        <img src={selectedRequest.user.image} alt="User" className="w-8 h-8 rounded-full border border-blue-200 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
                                            {selectedRequest.user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800 leading-none">{selectedRequest.user.name}</h2>
                                        <p className="text-slate-500 text-[10px] mt-0.5">{selectedRequest.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <StatusBadge status={selectedRequest.status} />
                                    <span className="text-[10px] text-slate-400 font-mono">#{selectedRequest._id.slice(-4)}</span>
                                </div>
                            </div>

                            {/* Ultra Compact Content */}
                            <div className="p-4 space-y-3">
                                {/* Stats Strip */}
                                <div className="flex divide-x divide-slate-100 border border-slate-100 rounded-lg bg-slate-50/50">
                                    <div className="flex-1 p-2 text-center">
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase">Type</p>
                                        <p className="text-xs font-bold text-slate-800">{selectedRequest.leaveType.name}</p>
                                    </div>
                                    <div className="flex-1 p-2 text-center">
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase">Duration</p>
                                        <p className="text-xs font-bold text-slate-800">{selectedRequest.days} Days</p>
                                    </div>
                                    <div className="flex-1 p-2 text-center">
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase">Dates</p>
                                        <p className="text-[10px] font-bold text-slate-800 pt-0.5">
                                            {new Date(selectedRequest.fromDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })} - {new Date(selectedRequest.toDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Reason & Details Split */}
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> Reason
                                        </p>
                                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 text-xs italic">
                                            "{selectedRequest.reason}"
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 bg-white p-2 border border-slate-100 rounded-lg">
                                        <div className="flex flex-col">
                                            <span className="text-slate-400">Emergency Contact</span>
                                            <span className="font-medium text-slate-800">{selectedRequest.contactNumber || '-'}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-slate-400">Mode</span>
                                            <span className="font-medium text-slate-800">
                                                {selectedRequest.isHalfDay ? `Half Day` : 'Full Day'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Action Section - Compact */}
                                {selectedRequest.status === 'PENDING' && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-[10px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" /> Note (Optional)
                                        </p>
                                        <div className="flex gap-2">
                                            <textarea
                                                value={adminComment}
                                                onChange={(e) => setAdminComment(e.target.value)}
                                                placeholder="Reason..."
                                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs resize-none"
                                                rows={1}
                                            />
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleAction('REJECTED')}
                                                    disabled={isProcessing}
                                                    className="w-8 h-full bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleAction('APPROVED')}
                                                    disabled={isProcessing}
                                                    className="w-8 h-full bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer for non-actionable requests */}
                            {selectedRequest.status !== 'PENDING' && (
                                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => setIsDetailsOpen(false)}
                                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
