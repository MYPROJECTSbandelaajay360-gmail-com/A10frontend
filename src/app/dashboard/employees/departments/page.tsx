'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    Loader2,
    Briefcase
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useSession } from 'next-auth/react';

interface Department {
    id: string;
    name: string;
    code: string;
    description: string;
    managerId: string | null;
    isActive: boolean;
    employeeCount: number;
    manager?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage: string | null;
    } | null;
}

interface Manager {
    id: string;
    firstName: string;
    lastName: string;
}

export default function DepartmentsPage() {
    const { data: session } = useSession();
    const isAdmin = ['ADMIN', 'HR'].includes(session?.user?.role as string);

    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        managerId: '',
        isActive: true
    });
    const [managers, setManagers] = useState<Manager[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    // Fetch managers when modal opens
    useEffect(() => {
        if (isModalOpen) {
            fetchManagers();
        }
    }, [isModalOpen]);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments');
            const data = await res.json();
            if (data.departments) {
                setDepartments(data.departments);
            }
        } catch (error) {
            console.error('Failed to fetch departments', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            // Reusing employees API to fetch potential managers
            // In a real app, might want a dedicated endpoint or filter params
            const res = await fetch('/api/employees');
            const data = await res.json();
            if (data.employees) {
                setManagers(data.employees.map((e: any) => ({
                    id: e.id,
                    firstName: e.name.split(' ')[0],
                    lastName: e.name.split(' ').slice(1).join(' ')
                })));
            }
        } catch (error) {
            console.error('Failed to fetch managers', error);
        }
    };

    const handleEdit = (dept: Department) => {
        setEditingDept(dept);
        setFormData({
            name: dept.name,
            code: dept.code,
            description: dept.description || '',
            managerId: dept.managerId || '',
            isActive: dept.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
                return;
            }
            fetchDepartments();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingDept
                ? `/api/departments/${editingDept.id}`
                : '/api/departments';

            const method = editingDept ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            setIsModalOpen(false);
            fetchDepartments();
            setEditingDept(null);
            setFormData({ name: '', code: '', description: '', managerId: '', isActive: true });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredDepts = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: departments.length,
        active: departments.filter(d => d.isActive).length,
        employees: departments.reduce((acc, curr) => acc + curr.employeeCount, 0)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage organizational structure and department details</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setEditingDept(null);
                            setFormData({ name: '', code: '', description: '', managerId: '', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="btn btn-primary"
                    >
                        <Plus className="w-4 h-4" />
                        Add Department
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="stat-icon bg-blue-50 text-blue-600">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Departments</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="stat-icon bg-green-50 text-green-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.active}</div>
                            <div className="stat-label">Active Departments</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="stat-icon bg-purple-50 text-purple-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.employees}</div>
                            <div className="stat-label">Total Employees</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="card">
                <div className="card-header flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">All Departments</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Department Head</th>
                                <th>Employees</th>
                                <th>Status</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDepts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No departments found
                                    </td>
                                </tr>
                            ) : (
                                filteredDepts.map((dept) => (
                                    <tr key={dept.id}>
                                        <td>
                                            <div>
                                                <div className="font-medium text-gray-900">{dept.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{dept.description}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-neutral bg-gray-100 text-gray-700 font-mono">
                                                {dept.code}
                                            </span>
                                        </td>
                                        <td>
                                            {dept.manager ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                                                        {dept.manager.firstName[0]}{dept.manager.lastName[0]}
                                                    </div>
                                                    <span className="text-sm">{dept.manager.firstName} {dept.manager.lastName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">Not Assigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span>{dept.employeeCount}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${dept.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                {dept.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(dept)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(dept.id, dept.name)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card-footer flex justify-between items-center text-sm text-gray-500">
                    <div>Showing {filteredDepts.length} departments</div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDept ? 'Edit Department' : 'Add New Department'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="label">Department Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                placeholder="e.g. Engineering"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="label">Department Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="input uppercase"
                                placeholder="e.g. ENG"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="label">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[80px]"
                            placeholder="Describe the department's function..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="label">Department Head</label>
                        <select
                            value={formData.managerId}
                            onChange={e => setFormData({ ...formData, managerId: e.target.value })}
                            className="input select"
                        >
                            <option value="">Select Manager</option>
                            {managers.map(mgr => (
                                <option key={mgr.id} value={mgr.id}>
                                    {mgr.firstName} {mgr.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {editingDept && (
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                Department is Active
                            </label>
                        </div>
                    )}

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Department'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
