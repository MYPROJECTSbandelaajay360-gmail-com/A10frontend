'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    Shield,
    User as UserIcon,
    CheckCircle,
    XCircle,
    Clock,
    Mail,
    Users,
    UserCheck,
    Briefcase,
    ShieldCheck,
    ChevronRight,
    Loader2,
    AlertCircle,
    X,
    Lock,
    ArrowRight,
    Eye
} from 'lucide-react';
import Link from 'next/link';

// --- Types ---

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLoginAt?: string;
    createdAt: string;
    image?: string;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

// --- Components ---

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
    </div>
);

const RoleBadge = ({ role }: { role: string }) => {
    const r = role.toUpperCase();
    switch (r) {
        case 'ADMIN':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-tighter">
                    <ShieldCheck className="w-3 h-3" /> Admin
                </span>
            );
        case 'HR':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-100 uppercase tracking-tighter">
                    <Briefcase className="w-3 h-3" /> HR
                </span>
            );
        case 'MANAGER':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-tighter">
                    <UserCheck className="w-3 h-3" /> Manager
                </span>
            );
        case 'SUPERVISOR':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tighter">
                    <UserIcon className="w-3 h-3" /> Supervisor
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100 uppercase tracking-tighter">
                    <UserIcon className="w-3 h-3" /> Employee
                </span>
            );
    }
};

const StatusBadge = ({ status }: { status: string }) => {
    const s = status.toUpperCase();
    switch (s) {
        case 'APPROVED':
        case 'ACTIVE':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-600 border border-green-100">
                    <CheckCircle className="w-3 h-3" /> Active
                </span>
            );
        case 'PENDING':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100">
                    <Clock className="w-3 h-3" /> Pending
                </span>
            );
        case 'SUSPENDED':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-100">
                    <XCircle className="w-3 h-3" /> Suspended
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-50 text-gray-500 border border-gray-100">
                    {s}
                </span>
            );
    }
};

// --- Main Page Component ---

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Edit/Modal State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<{ role: string; status: string }>({ role: 'EMPLOYEE', status: 'ACTIVE' });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch Users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role.toUpperCase() === roleFilter.toUpperCase();
        return matchesSearch && matchesRole;
    });

    // Stats Logic
    const stats = {
        total: users.length,
        admins: users.filter(u => ['ADMIN', 'HR'].includes(u.role.toUpperCase())).length,
        active: users.filter(u => ['APPROVED', 'ACTIVE'].includes(u.status.toUpperCase())).length,
        pending: users.filter(u => u.status.toUpperCase() === 'PENDING').length,
    };

    // Actions
    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditForm({ role: user.role.toUpperCase(), status: user.status.toUpperCase() });
        setIsEditModalOpen(true);
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                await fetchUsers();
                setMessage({ type: 'success', text: 'User updated successfully' });
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                    setMessage(null);
                }, 1500);
            } else {
                setMessage({ type: 'error', text: 'Failed to update user' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection failed' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This will revoke their system access.')) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        Security & Access
                    </h1>
                    <p className="text-gray-500 text-sm">Control system roles, permissions, and account integrity for all employees.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/employees/add"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add User
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.total} icon={Users} color="bg-blue-600" />
                <StatCard title="Security Staff" value={stats.admins} icon={ShieldCheck} color="bg-indigo-600" />
                <StatCard title="Active Now" value={stats.active} icon={UserCheck} color="bg-emerald-600" />
                <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-amber-600" />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none cursor-pointer"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">Global View (All Roles)</option>
                            <option value="ADMIN">Administrators</option>
                            <option value="HR">HR Managers</option>
                            <option value="MANAGER">Team Managers</option>
                            <option value="SUPERVISOR">Supervisors</option>
                            <option value="EMPLOYEE">Employees</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Identity</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Security Clearance</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Account Status</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Creation Date</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                            <span className="text-sm text-gray-500">Retrieving system accounts...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-sm text-gray-400">No matching accounts found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <img src={user.image} className="w-10 h-10 rounded-full object-cover ring-2 ring-white" alt="" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                                                        {!(user as any).hasAccount && (
                                                            <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">No Access</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(user as any).hasAccount ? (
                                                <RoleBadge role={user.role} />
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">Not Assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {(() => {
                                                const d = new Date(user.createdAt);
                                                if (isNaN(d.getTime())) return 'N/A';
                                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs font-semibold text-gray-500">
                                            <div className="flex items-center justify-end gap-2">
                                                {(user as any).hasAccount ? (
                                                    <>
                                                        <Link
                                                            href={`/employees/${(user as any).employeeId || user._id}`}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View Profile"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleEditClick(user)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Modify Role"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <Link
                                                        href="/dashboard/employees"
                                                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Go to Employee List to Invite"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                {(user as any).hasAccount && (
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Modify Clearance</h2>
                                    <p className="text-sm text-gray-500">Update role for {selectedUser.name}</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {message && (
                                    <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        <AlertCircle className="w-4 h-4" />
                                        {message.text}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">Assign Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="EMPLOYEE">Employee (Standard)</option>
                                        <option value="SUPERVISOR">Supervisor (Team View)</option>
                                        <option value="MANAGER">Manager (Department)</option>
                                        <option value="HR">HR Manager (Admin Access)</option>
                                        <option value="ADMIN">System Admin (Full Control)</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">Account Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="ACTIVE">Active Duty</option>
                                        <option value="PENDING">Pending Provisioning</option>
                                        <option value="SUSPENDED">Suspended / Deactivated</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-[2] py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    Update Security Clearance
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
