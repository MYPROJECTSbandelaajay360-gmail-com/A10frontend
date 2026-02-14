'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Palette,
    FileText,
    Calendar,
    Briefcase,
    Shield
} from 'lucide-react';

// --- Types ---

interface LeaveType {
    _id: string;
    name: string;
    code: string;
    daysAllowed: number;
    description?: string;
    color: string;
    requiresApproval: boolean;
    isActive: boolean;
    paid: boolean;
}

// --- Components ---

const LeaveTypeCard = ({
    type,
    onEdit,
    onDelete
}: {
    type: LeaveType;
    onEdit: (type: LeaveType) => void;
    onDelete: (id: string) => void;
}) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 relative"
    >
        <div className={`h-2 w-full`} style={{ backgroundColor: type.color }} />
        <div className="p-5">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                        style={{ backgroundColor: type.color }}
                    >
                        {type.code}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{type.name}</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{type.daysAllowed} Days / Year</p>
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(type)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(type._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-4 min-h-[2.5em]">
                {type.description || "No description provided."}
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-medium">
                {type.isActive ? (
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-100 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Active
                    </span>
                ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Inactive
                    </span>
                )}
                {type.paid ? (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Paid
                    </span>
                ) : (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Unpaid
                    </span>
                )}
                {type.requiresApproval && (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-100 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Approval Req.
                    </span>
                )}
            </div>
        </div>
    </motion.div>
);

// --- Main Page Component ---

export default function LeaveTypesPage() {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<LeaveType>>({
        name: '',
        code: '',
        daysAllowed: 0,
        description: '',
        color: '#3B82F6',
        requiresApproval: true,
        isActive: true,
        paid: true
    });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Data
    const fetchLeaveTypes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/leave-types');
            const data = await res.json();
            if (data.leaveTypes) {
                setLeaveTypes(data.leaveTypes);
            }
        } catch (error) {
            console.error('Failed to fetch leave types', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    // Handlers
    const handleAddNew = () => {
        setFormData({
            name: '',
            code: '',
            daysAllowed: 0,
            description: '',
            color: '#3B82F6',
            requiresApproval: true,
            isActive: true,
            paid: true
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (type: LeaveType) => {
        setFormData(type);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this leave type?')) return;
        try {
            const res = await fetch(`/api/settings/leave-types/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchLeaveTypes();
            } else {
                alert('Failed to delete leave type');
            }
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = isEditing && formData._id
                ? `/api/settings/leave-types/${formData._id}`
                : '/api/settings/leave-types';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await fetchLeaveTypes();
                setIsModalOpen(false);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save leave type');
            }
        } catch (error) {
            console.error('Save failed', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Stats
    const totalTypes = leaveTypes.length;
    const activeTypes = leaveTypes.filter(t => t.isActive).length;

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Types</h1>
                    <p className="text-slate-500 mt-1">Configure the types of leave employees can request.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-all hover:shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Type</span>
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center p-12 text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                    Loading configurations...
                </div>
            ) : leaveTypes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No Leave Types Found</h3>
                    <p className="text-slate-500 mb-4">Get started by adding a new leave type.</p>
                    <button
                        onClick={handleAddNew}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Create your first leave type
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {leaveTypes.map((type) => (
                            <LeaveTypeCard
                                key={type._id}
                                type={type}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={handleSave}>
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {isEditing ? 'Edit Leave Type' : 'Create Leave Type'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Type Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Annual Leave"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. AL"
                                                maxLength={3}
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Daily Allowance</label>
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                value={formData.daysAllowed}
                                                onChange={(e) => setFormData({ ...formData, daysAllowed: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Brief description of when this leave should be used..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Appearance */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Color Tag</label>
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="w-12 h-12 rounded-lg border-2 border-slate-200 p-1 cursor-pointer"
                                            />
                                            <div className="text-sm text-slate-500">
                                                Selected Color: <span className="font-mono font-medium text-slate-700">{formData.color}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                            <span className="text-sm font-medium text-slate-700">Active Status</span>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </div>
                                        </label>

                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                            <span className="text-sm font-medium text-slate-700">Requires Approval</span>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.requiresApproval}
                                                    onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </div>
                                        </label>

                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                            <span className="text-sm font-medium text-slate-700">Paid Leave</span>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.paid}
                                                    onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-70 transition-all shadow-sm hover:shadow"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Configuration'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
