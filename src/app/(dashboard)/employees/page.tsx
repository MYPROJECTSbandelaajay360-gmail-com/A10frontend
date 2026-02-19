'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Users,
    Search,
    Plus,
    Mail,
    Phone,
    Building2,
    Briefcase,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    Send,
    Loader2,
    ChevronDown,
    UserPlus,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import ResetPasswordModal from '@/components/ResetPasswordModal'

interface Employee {
    id: string
    employeeId: string
    name: string
    email: string
    phone: string
    department: string
    designation: string
    joiningDate: string
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    profileImage?: string
    user?: {
        id: string
        email: string
        role: string
        status: string
    }
}

interface EmployeeInvite {
    _id: string
    email: string
    firstName: string
    lastName: string
    department: string
    designation: string
    employeeId?: string
    status: 'pending' | 'accepted' | 'revoked' | 'expired'
    createdAt: string
    expiresAt: string
    invitedByName?: string
}

export default function EmployeesPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [searchTerm, setSearchTerm] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('ALL')
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loadingEmployees, setLoadingEmployees] = useState(true)
    const [invites, setInvites] = useState<EmployeeInvite[]>([])
    const [loadingInvites, setLoadingInvites] = useState(true)
    const [inviteStatusFilter, setInviteStatusFilter] = useState('all')
    const [resendingId, setResendingId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'employees' | 'invites'>('employees')
    const [resetPasswordEmployee, setResetPasswordEmployee] = useState<{ id: string, name: string, email: string } | null>(null)

    const userRole = session?.user?.role || 'EMPLOYEE'
    const canManage = ['HR', 'ADMIN', 'CEO'].includes(userRole)

    const departments = ['ALL', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance']

    const fetchEmployees = async () => {
        setLoadingEmployees(true)
        try {
            const response = await fetch('/api/employees')
            const data = await response.json()
            if (response.ok) {
                setEmployees(data.employees || [])
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error)
        } finally {
            setLoadingEmployees(false)
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return

        try {
            const response = await fetch(`/api/employees/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                // Refresh list
                fetchEmployees()
                setActiveMenu(null)
            } else {
                alert('Failed to delete employee')
            }
        } catch (error) {
            console.error('Error deleting employee:', error)
            alert('Error deleting employee')
        }
    }

    // Fetch employee invites
    const fetchInvites = async () => {
        setLoadingInvites(true)
        try {
            const response = await fetch(`/api/employees/invites?status=${inviteStatusFilter}`)
            const data = await response.json()
            if (response.ok) {
                setInvites(data.invites || [])
            }
        } catch (error) {
            console.error('Failed to fetch invites:', error)
        } finally {
            setLoadingInvites(false)
        }
    }

    useEffect(() => {
        if (canManage) {
            fetchInvites()
        }
    }, [canManage, inviteStatusFilter])

    const handleResendInvite = async (inviteId: string) => {
        setResendingId(inviteId)
        try {
            const response = await fetch('/api/employees/invites/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteId })
            })
            if (response.ok) {
                fetchInvites()
            }
        } catch (error) {
            console.error('Failed to resend invite:', error)
        } finally {
            setResendingId(null)
        }
    }

    const handleRevokeInvite = async (inviteId: string) => {
        try {
            const response = await fetch(`/api/employees/invites/${inviteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'revoked' })
            })
            if (response.ok) {
                fetchInvites()
            }
        } catch (error) {
            console.error('Failed to revoke invite:', error)
        }
    }

    const handleDeleteInvite = async (inviteId: string) => {
        if (!confirm('Are you sure you want to delete this invite?')) return
        try {
            const response = await fetch(`/api/employees/invites/${inviteId}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                fetchInvites()
            }
        } catch (error) {
            console.error('Failed to delete invite:', error)
        }
    }

    const filteredEmployees = employees.filter(emp => {
        if (departmentFilter !== 'ALL' && emp.department !== departmentFilter) return false
        if (searchTerm && !emp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !emp.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) return false
        return true
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-700'
            case 'INACTIVE':
                return 'bg-gray-100 text-gray-700'
            case 'SUSPENDED':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getInviteStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700'
            case 'accepted':
                return 'bg-green-100 text-green-700'
            case 'revoked':
                return 'bg-red-100 text-red-700'
            case 'expired':
                return 'bg-gray-100 text-gray-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getInviteStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-3.5 h-3.5" />
            case 'accepted':
                return <CheckCircle className="w-3.5 h-3.5" />
            case 'revoked':
                return <XCircle className="w-3.5 h-3.5" />
            case 'expired':
                return <AlertCircle className="w-3.5 h-3.5" />
            default:
                return null
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
                    <p className="text-gray-500 mt-1">Manage employees and send invites to new team members</p>
                </div>
                {canManage && (
                    <Link
                        href="/employees/add"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Employee
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                            <p className="text-sm text-gray-500">Total Employees</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.status === 'ACTIVE').length}</p>
                            <p className="text-sm text-gray-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{departments.length - 1}</p>
                            <p className="text-sm text-gray-500">Departments</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{invites.filter(i => i.status === 'pending').length}</p>
                            <p className="text-sm text-gray-500">Pending Invites</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Switcher for Managers */}
            {canManage && (
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'employees'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Users className="w-4 h-4 inline-block mr-2" />
                        Employees
                    </button>
                    <button
                        onClick={() => setActiveTab('invites')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'invites'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Send className="w-4 h-4 inline-block mr-2" />
                        Employee Invites
                        {invites.filter(i => i.status === 'pending').length > 0 && (
                            <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                                {invites.filter(i => i.status === 'pending').length}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Employees Tab */}
            {activeTab === 'employees' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setDepartmentFilter(dept)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${departmentFilter === dept
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Designation</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    {canManage && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingEmployees ? (
                                    <tr>
                                        <td colSpan={canManage ? 6 : 5} className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                                            <p className="text-sm text-gray-500 mt-2">Loading employees...</p>
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={canManage ? 6 : 5} className="px-6 py-12 text-center">
                                            <Users className="w-8 h-8 text-gray-300 mx-auto" />
                                            <p className="text-sm text-gray-500 mt-2">No employees found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {employee.profileImage ? (
                                                        <img
                                                            src={employee.profileImage}
                                                            alt={employee.name}
                                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                                            {getInitials(employee.name)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{employee.name}</p>
                                                        <p className="text-xs text-gray-500">{employee.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{employee.department}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{employee.designation}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        {employee.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        {employee.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                                                    {employee.status}
                                                </span>
                                            </td>
                                            {canManage && (
                                                <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActiveMenu(activeMenu === employee.id ? null : employee.id)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <MoreVertical className="w-5 h-5 text-gray-500" />
                                                        </button>
                                                        {activeMenu === employee.id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                                                                <button
                                                                    onClick={() => router.push(`/employees/${employee.id}`)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => router.push(`/employees/${employee.id}?edit=true`)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setResetPasswordEmployee({
                                                                            id: employee.user?.id || '',
                                                                            name: employee.name,
                                                                            email: employee.email
                                                                        })
                                                                        setActiveMenu(null)
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <RefreshCw className="w-4 h-4" />
                                                                    Reset Password
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteEmployee(employee.id)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Employee Invites Tab */}
            {activeTab === 'invites' && canManage && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Employee Invites</h2>
                                <p className="text-sm text-gray-500">View and manage all employee invitations</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={inviteStatusFilter}
                                        onChange={(e) => setInviteStatusFilter(e.target.value)}
                                        className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="revoked">Revoked</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <button
                                    onClick={fetchInvites}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Invites Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Designation</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invited By</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingInvites ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                                            <p className="text-sm text-gray-500 mt-2">Loading invites...</p>
                                        </td>
                                    </tr>
                                ) : invites.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Send className="w-8 h-8 text-gray-300 mx-auto" />
                                            <p className="text-sm text-gray-500 mt-2">No invites found</p>
                                            <Link
                                                href="/employees/add"
                                                className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block"
                                            >
                                                Send your first invite
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    invites.map((invite) => (
                                        <tr key={invite._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center text-white font-semibold text-sm">
                                                        {getInitials(`${invite.firstName} ${invite.lastName}`)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {invite.firstName} {invite.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{invite.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{invite.department}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{invite.designation}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getInviteStatusColor(invite.status)}`}>
                                                    {getInviteStatusIcon(invite.status)}
                                                    {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm text-gray-700">{invite.invitedByName || 'System'}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(invite.createdAt)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {invite.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleResendInvite(invite._id)}
                                                                disabled={resendingId === invite._id}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Resend Invite"
                                                            >
                                                                {resendingId === invite._id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <RefreshCw className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRevokeInvite(invite._id)}
                                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                                title="Revoke Invite"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteInvite(invite._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Invite"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Results Count */}
                    <div className="p-4 border-t border-gray-100 text-right">
                        <p className="text-sm text-blue-600">
                            Showing {invites.length} Results
                        </p>
                    </div>
                </div>
            )}
            {/* Reset Password Modal */}
            {resetPasswordEmployee && (
                <ResetPasswordModal
                    employee={resetPasswordEmployee}
                    onClose={() => setResetPasswordEmployee(null)}
                />
            )}
        </div>
    )
}
