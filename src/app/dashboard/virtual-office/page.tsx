'use client';

import React, { useState, useEffect } from 'react';
import {
    RefreshCw,
    Printer,
    Clock,
    Crown,
    MoreHorizontal,
    Folder,
    User,
    CheckCircle2,
    XCircle,
    MinusCircle,
    Bell,
    Users,
    ChevronRight,
    Zap,
    Calendar,
    Loader2,
    Home
} from 'lucide-react';

// --- Types ---

type StatusType = 'PRESENT' | 'WFH' | 'BREAK' | 'LEAVE' | 'ABSENT';

interface Employee {
    id: string;
    name: string;
    role: string;
    image?: string;
    status: StatusType;
    time?: string;
    duration?: string;
    meta?: string;
}

interface Stats {
    total: number;
    present: number;
    presentPercentage: number;
    avgLoginTime: string;
    lateEntries: number;
    wfoPercentage: number;
    wfhPercentage: number;
}

// --- Components ---

const StatusBadge = ({ status }: { status: StatusType }) => {
    switch (status) {
        case 'PRESENT':
            return (
                <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-green-50 text-green-700 text-[9px] font-extrabold tracking-wider uppercase border border-green-100">
                    <CheckCircle2 className="w-2.5 h-2.5 fill-green-500 text-white" />
                    <span>Present</span>
                </div>
            );
        case 'WFH':
            return (
                <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-extrabold tracking-wider uppercase border border-blue-100">
                    <CheckCircle2 className="w-2.5 h-2.5 fill-blue-500 text-white" />
                    <span>Remote</span>
                </div>
            );
        case 'BREAK':
            return (
                <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-extrabold tracking-wider uppercase border border-amber-100">
                    <div className="w-2.5 h-2.5 flex items-center justify-center bg-amber-500 rounded-full text-[6px] text-white font-bold">!</div>
                    <span>Break</span>
                </div>
            );
        case 'LEAVE':
            return (
                <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[9px] font-extrabold tracking-wider uppercase border border-rose-100">
                    <XCircle className="w-2.5 h-2.5 fill-rose-500 text-white" />
                    <span>Leave</span>
                </div>
            );
        case 'ABSENT':
        default:
            return (
                <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-extrabold tracking-wider uppercase border border-slate-200">
                    <MinusCircle className="w-2.5 h-2.5 bg-slate-400 rounded-full text-white p-0.5" />
                    <span>Absent</span>
                </div>
            );
    }
};

const LeaderCard = ({ user }: { user: Employee }) => (
    <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow flex flex-col h-full">
        <div className="flex items-start gap-3 mb-2">
            <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-50 border border-slate-100" />
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">{user.name}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{user.role}</p>
            </div>
        </div>

        <div className="flex items-center mb-3">
            <StatusBadge status={user.status} />
        </div>

        <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="text-slate-400 truncate max-w-[50%]">{user.time}</span>
            {user.duration && (
                <span className="flex items-center gap-1 text-slate-400">
                    <User className="w-2.5 h-2.5 text-slate-300" /> {user.duration}
                </span>
            )}
        </div>
    </div>
);

const EmployeeCard = ({ user }: { user: Employee }) => (
    <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow flex items-start justify-between group h-full">
        <div className="flex items-start gap-3 flex-1 min-w-0">
            <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-slate-100 bg-slate-50" />
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 leading-tight mb-0.5 truncate">{user.name}</h4>
                <p className="text-[10px] text-slate-500 mb-2 truncate">{user.role}</p>

                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={user.status} />
                    {user.time && <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{user.time}</span>}
                    {user.meta && <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{user.meta}</span>}
                </div>
            </div>
        </div>

        <div className="text-slate-300 ml-1">
            {user.status === 'LEAVE' ? (
                <Calendar className="w-3.5 h-3.5 text-rose-300" />
            ) : user.status === 'PRESENT' || user.status === 'WFH' ? (
                <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border border-green-100 bg-green-50" />
                    <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]" />
                </div>
            ) : (
                <MinusCircle className="w-3.5 h-3.5 text-slate-200" />
            )}
        </div>
    </div>
);

const RemoteEmployeeRow = ({ user }: { user: Employee }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
        <div className="relative">
            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover bg-slate-100 border border-slate-100" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full shadow-sm"></div>
        </div>
        <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                </div>
            </div>
            <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
        </div>
    </div>
);

export default function VirtualOfficePage() {
    const [loading, setLoading] = useState(true);
    const [leaders, setLeaders] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Record<string, Employee[]>>({});
    const [stats, setStats] = useState<Stats>({
        total: 0,
        present: 0,
        presentPercentage: 0,
        avgLoginTime: '--:--',
        lateEntries: 0,
        wfoPercentage: 0,
        wfhPercentage: 0
    });

    // Calculate WFH Employees
    const [wfhEmployees, setWfhEmployees] = useState<Employee[]>([]);

    const [currentTime, setCurrentTime] = useState('');

    const fetchData = async () => {
        if (!currentTime) setLoading(true);
        try {
            const res = await fetch('/api/virtual-office');
            if (res.ok) {
                const data = await res.json();
                const leadership = data.leadership || [];
                const depts = data.departments || {};

                setLeaders(leadership);
                setDepartments(depts);
                setStats(data.stats || {});

                // Aggregate WFH lists
                const allTeam = [...leadership, ...Object.values(depts).flat()] as Employee[];
                setWfhEmployees(allTeam.filter(e => e.status === 'WFH'));
            }
        } catch (error) {
            console.error("Failed to fetch virtual office data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);

        const tick = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
        };
        tick();
        const clockInterval = setInterval(tick, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(clockInterval);
        };
    }, []);

    if (loading && !currentTime) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-4">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Virtual Office</h1>
                    <p className="text-slate-500 mt-1 text-xs font-medium">Real-time visibility of today's workforce.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchData()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold shadow-sm hover:bg-slate-50 transition-colors active:scale-95"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading && currentTime ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold shadow-sm">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        {currentTime}
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold shadow-sm hover:bg-slate-50 transition-colors active:scale-95">
                        <Printer className="w-3.5 h-3.5" />
                        Print
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start">

                {/* --- Left Column: Main Content --- */}
                <div className="flex-1 min-w-0 space-y-4">

                    {/* Leadership Team */}
                    {leaders.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    Leadership Team
                                </h2>
                                <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                                {leaders.map(leader => <LeaderCard key={leader.id} user={leader} />)}
                            </div>
                        </div>
                    )}

                    {/* Departments */}
                    {Object.entries(departments).map(([deptName, employees]) => {
                        const presentCount = employees.filter(e => e.status === 'PRESENT' || e.status === 'WFH').length;
                        const leaveCount = employees.filter(e => e.status === 'LEAVE').length;

                        return (
                            <div key={deptName}>
                                <div className="flex items-center gap-2 px-1 mb-2">
                                    <Folder className="w-4 h-4 text-blue-500 fill-blue-50" />
                                    <h2 className="text-sm font-bold text-slate-800">{deptName}</h2>
                                    <span className="text-[10px] text-slate-500 font-medium ml-1">
                                        ({presentCount} Present, {leaveCount} On Leave)
                                    </span>
                                    <div className="ml-auto">
                                        <button className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {employees.map(emp => <EmployeeCard key={emp.id} user={emp} />)}
                                </div>
                            </div>
                        );
                    })}

                    {Object.keys(departments).length === 0 && leaders.length === 0 && !loading && (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                            <p className="text-slate-400 font-medium text-sm">No active employees found today.</p>
                        </div>
                    )}

                </div>

                {/* --- Right Column: Stats (Sticky) --- */}
                <div className="w-full lg:w-[260px] flex-none flex flex-col gap-4">

                    {/* Live Stats Card - Compact */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-20">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm">Live Stats</h3>

                        <div className="space-y-4">
                            {/* Total Employees */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Employees</p>
                                        <p className="text-xl font-bold text-slate-900 leading-none">{stats.total}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Present Today */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700">Present</span>
                                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                        {stats.presentPercentage}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${stats.presentPercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-50 space-y-3">
                                {/* Avg Login */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-[10px] font-medium text-slate-500">Avg Login</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-900">{stats.avgLoginTime}</p>
                                </div>

                                {/* Late Entries */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-[10px] font-medium text-slate-500">Late Entries</span>
                                    </div>
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                                        {stats.lateEntries}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Remote Team Components (Replacing Work Mode) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 text-sm">Remote Team</h3>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {wfhEmployees.length}
                            </span>
                        </div>

                        <div className="space-y-1">
                            {wfhEmployees.length > 0 ? (
                                wfhEmployees.map(emp => (
                                    <RemoteEmployeeRow key={emp.id} user={emp} />
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <Home className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-[10px] text-slate-400">No one working remotely today</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
 