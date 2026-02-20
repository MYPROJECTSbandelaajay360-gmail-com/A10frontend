'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Briefcase,
    Plus,
    Search,
    Pencil,
    Trash2,
    Loader2,
    Award
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useSession } from 'next-auth/react';

interface Designation {
    id: string;
    name: string;
    code: string;
    level: number;
    description: string;
    isActive: boolean;
    employeeCount: number;
}

export default function DesignationsPage() {
    const { data: session } = useSession();
    const isAdmin = ['ADMIN', 'HR'].includes(session?.user?.role as string);

    const [designations, setDesignations] = useState<Designation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesg, setEditingDesg] = useState<Designation | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        level: 1,
        description: '',
        isActive: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchDesignations();
    }, []);

    const fetchDesignations = async () => {
        try {
            const res = await fetch('/api/designations');
            const data = await res.json();
            if (data.designations) {
                setDesignations(data.designations);
            }
        } catch (error) {
            console.error('Failed to fetch designations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (desg: Designation) => {
        setEditingDesg(desg);
        setFormData({
            name: desg.name,
            code: desg.code,
            level: desg.level,
            description: desg.description || '',
            isActive: desg.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const res = await fetch(`/api/designations/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
                return;
            }
            fetchDesignations();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingDesg
                ? `/api/designations/${editingDesg.id}`
                : '/api/designations';

            const method = editingDesg ? 'PUT' : 'POST';

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
            fetchDesignations();
            setEditingDesg(null);
            setFormData({ name: '', code: '', level: 1, description: '', isActive: true });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredDesgs = designations.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: designations.length,
        employees: designations.reduce((acc, curr) => acc + curr.employeeCount, 0),
        avgLevel: designations.length > 0
            ? Math.round(designations.reduce((acc, curr) => acc + curr.level, 0) / designations.length)
            : 0
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
                    <h1 className="text-2xl font-bold text-gray-900">Designations</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage job roles, hierarchy levels, and responsibilities</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setEditingDesg(null);
                            setFormData({ name: '', code: '', level: 1, description: '', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="btn btn-primary"
                    >
                        <Plus className="w-4 h-4" />
                        Add Designation
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="stat-icon bg-amber-50 text-amber-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Roles</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="stat-icon bg-indigo-50 text-indigo-600">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.avgLevel}</div>
                            <div className="stat-label">Avg. Level</div>
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
                            <div className="stat-label">Employees Assigned</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="card">
                <div className="card-header flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">All Designations</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search designations..."
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
                                <th>Designation Name</th>
                                <th>Code</th>
                                <th>Level</th>
                                <th>Employees</th>
                                <th>Status</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDesgs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No designations found
                                    </td>
                                </tr>
                            ) : (
                                filteredDesgs.map((desg) => (
                                    <tr key={desg.id}>
                                        <td>
                                            <div>
                                                <div className="font-medium text-gray-900">{desg.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{desg.description}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-neutral bg-gray-100 text-gray-700 font-mono">
                                                {desg.code}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(desg.level, 5) }).map((_, i) => (
                                                    <div key={i} className="w-1.5 h-4 bg-indigo-400 rounded-sm" />
                                                ))}
                                                <span className="text-xs text-gray-500 ml-1">L{desg.level}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span>{desg.employeeCount}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${desg.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                {desg.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(desg)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(desg.id, desg.name)}
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
                    <div>Showing {filteredDesgs.length} designations</div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDesg ? 'Edit Designation' : 'Add New Designation'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="label">Designation Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                placeholder="e.g. Senior Developer"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="label">Designation Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="input uppercase"
                                placeholder="e.g. SDE-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="label">Hierarchy Level</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={formData.level}
                                onChange={e => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                className="flex-1"
                            />
                            <span className="font-bold text-lg w-8 text-center">{formData.level}</span>
                        </div>
                        <p className="text-xs text-gray-500">Level 1 (Junior) to 10 (Executive)</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="label">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[80px]"
                            placeholder="Describe roles and responsibilities..."
                        />
                    </div>

                    {editingDesg && (
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                Designation is Active
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
                                'Save Designation'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
