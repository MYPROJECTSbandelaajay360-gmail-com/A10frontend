'use client';

import { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Search,
    Filter,
    Download,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Building2,
    Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

interface TeamAttendanceRecord {
    employee: {
        id: string;
        name: string;
        employeeId: string;
        profileImage: string | null;
        designation: string;
        department: string;
    };
    attendance: {
        status: string;
        checkIn: string | null;
        checkOut: string | null;
        workingHours: number;
        remarks: string;
    };
}

interface Stats {
    total: number;
    present: number;
    absent: number;
    onLeave: number;
    late: number;
}

export default function TeamAttendancePage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState<TeamAttendanceRecord[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, present: 0, absent: 0, onLeave: 0, late: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState(''); // 'ALL' or specific ID
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchTeamAttendance();
    }, [date]);

    const fetchTeamAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/attendance/team?date=${date}`);
            const data = await res.json();
            if (data.records) {
                setRecords(data.records);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch team attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (isoString: string | null) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PRESENT': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle };
            case 'ABSENT': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle };
            case 'ON_LEAVE': return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: CalendarIcon };
            case 'HALF_DAY': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock };
            case 'HOLIDAY': return { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: Briefcase };
            case 'WEEKEND': return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: Building2 };
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: AlertCircle };
        }
    };

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || record.attendance.status === statusFilter;
        // Department filtering is handled loosely here, ideally strictly by ID if available in frontend list
        // Since API returns Dept Name, we filter by name if departmentFilter is set to Name for this example
        // (Improving: Fetch departments to populate dropdown)

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team Attendance</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor daily attendance and team availability</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input max-w-[160px]"
                    />
                    <button className="btn btn-secondary">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Employees</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.present}</div>
                            <div className="stat-label">Present</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.absent}</div>
                            <div className="stat-label">Absent</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.onLeave}</div>
                            <div className="stat-label">On Leave</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.late}</div>
                            <div className="stat-label">Late Arrivals</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="card">
                <div className="card-header flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input select w-full md:w-40"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="ON_LEAVE">On Leave</option>
                            <option value="HALF_DAY">Half Day</option>
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Designation</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Work Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td><div className="h-10 w-40 bg-gray-100 rounded-lg" /></td>
                                        <td><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                        <td><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                                        <td><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                                        <td><div className="h-4 w-12 bg-gray-100 rounded" /></td>
                                        <td><div className="h-6 w-20 bg-gray-100 rounded-full" /></td>
                                    </tr>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        No records found for this date.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => {
                                    const statusStyle = getStatusBadge(record.attendance.status);
                                    const StatusIcon = statusStyle.icon;

                                    return (
                                        <tr key={record.employee.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                        {record.employee.profileImage ? (
                                                            <img
                                                                src={record.employee.profileImage}
                                                                alt={record.employee.name}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>{record.employee.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{record.employee.name}</div>
                                                        <div className="text-xs text-gray-500">{record.employee.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-700">{record.employee.designation}</span>
                                                    <span className="text-xs text-gray-400">{record.employee.department}</span>
                                                </div>
                                            </td>
                                            <td className="font-mono text-sm text-gray-600">
                                                {formatTime(record.attendance.checkIn)}
                                            </td>
                                            <td className="font-mono text-sm text-gray-600">
                                                {formatTime(record.attendance.checkOut)}
                                            </td>
                                            <td>
                                                {record.attendance.workingHours > 0 ? (
                                                    <span className="font-mono text-gray-900 font-medium">
                                                        {record.attendance.workingHours.toFixed(1)}h
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {record.attendance.status === 'ON_LEAVE' && record.attendance.remarks ?
                                                        record.attendance.remarks :
                                                        record.attendance.status.replace('_', ' ')
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
