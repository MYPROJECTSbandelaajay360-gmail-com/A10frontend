'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit2,
    Trash2,
    Clock,
    Calendar,
    Briefcase,
    Sun,
    Moon,
    XCircle,
    CheckCircle
} from 'lucide-react';

// --- Types ---

interface Shift {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
    workDays: string[];
    color: string;
    isActive: boolean;
    notes?: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// --- Components ---

const ShiftCard = ({
    shift,
    onEdit,
    onDelete
}: {
    shift: Shift;
    onEdit: (shift: Shift) => void;
    onDelete: (id: string) => void;
}) => {
    // Determine gradient based on time (simple logic)
    const isMorning = parseInt(shift.startTime.split(':')[0]) < 12;
    const gradient = isMorning
        ? 'from-amber-50 to-orange-50'
        : 'from-indigo-50 to-blue-50';
    const Icon = isMorning ? Sun : Moon;
    const iconColor = isMorning ? 'text-orange-500' : 'text-indigo-500';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 relative`}
        >
            <div className={`h-1.5 w-full`} style={{ backgroundColor: shift.color }} />

            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-inner`}>
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{shift.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{shift.startTime} - {shift.endTime}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(shift)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(shift._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Work Days visualization */}
                <div className="flex gap-1 mb-4">
                    {DAYS_OF_WEEK.map(day => {
                        const isWorkDay = shift.workDays.includes(day);
                        return (
                            <div
                                key={day}
                                className={`flex-1 h-1.5 rounded-full ${isWorkDay ? 'bg-blue-500' : 'bg-slate-100'}`}
                                title={day}
                            />
                        );
                    })}
                </div>
                <div className="text-xs text-slate-400 flex justify-between px-0.5 mb-4 font-medium">
                    <span>Mon</span>
                    <span>Sun</span>
                </div>

                {shift.notes && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{shift.notes}"
                    </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${shift.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {shift.isActive ? <><CheckCircle className="w-3 h-3 mr-1" /> Active</> : <><XCircle className="w-3 h-3 mr-1" /> Inactive</>}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                        {shift.workDays.length} Days / Week
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Page Component ---

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Shift>>({
        name: '',
        startTime: '09:00',
        endTime: '18:00',
        workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        color: '#3B82F6',
        isActive: true,
        notes: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Data
    const fetchShifts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/shifts');
            const data = await res.json();
            if (data.shifts) {
                setShifts(data.shifts);
            }
        } catch (error) {
            console.error('Failed to fetch shifts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    // Handlers
    const handleAddNew = () => {
        setFormData({
            name: '',
            startTime: '09:00',
            endTime: '18:00',
            workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            color: '#3B82F6', // Default blue
            isActive: true,
            notes: ''
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (shift: Shift) => {
        setFormData(shift);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shift configuration?')) return;
        try {
            const res = await fetch(`/api/settings/shifts/${id}`, { method: 'DELETE' });
            if (res.ok) fetchShifts();
            else alert('Failed to delete shift');
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const toggleDay = (day: string) => {
        const currentDays = formData.workDays || [];
        if (currentDays.includes(day)) {
            setFormData({ ...formData, workDays: currentDays.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, workDays: [...currentDays, day] });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = isEditing && formData._id
                ? `/api/settings/shifts/${formData._id}`
                : '/api/settings/shifts';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await fetchShifts();
                setIsModalOpen(false);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save shift');
            }
        } catch (error) {
            console.error('Save failed', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shift Management</h1>
                    <p className="text-slate-500 mt-1">Configure work schedules and operational hours.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-all hover:shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Shift</span>
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center p-12 text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                    Loading schedules...
                </div>
            ) : shifts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No Shifts Configured</h3>
                    <p className="text-slate-500 mb-4">Set up your first work shift schedule.</p>
                    <button
                        onClick={handleAddNew}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Create shift schedule
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {shifts.map((shift) => (
                            <ShiftCard
                                key={shift._id}
                                shift={shift}
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
                                        {isEditing ? 'Edit Shift Schedule' : 'Create Shift Schedule'}
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
                                    {/* Name & Color */}
                                    <div className="grid grid-cols-5 gap-4">
                                        <div className="col-span-4">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Shift Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Standard Day Shift"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="w-full h-[42px] rounded-lg border border-slate-300 p-1 cursor-pointer bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Time Range */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    required
                                                    type="time"
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    required
                                                    type="time"
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Work Days */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Work Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_OF_WEEK.map(day => {
                                                const isSelected = formData.workDays?.includes(day);
                                                return (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => toggleDay(day)}
                                                        className={`
                                                            px-3 py-1.5 text-sm rounded-lg border font-medium transition-all
                                                            ${isSelected
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                            }
                                                        `}
                                                    >
                                                        {day.substring(0, 3)}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Optional details about this shift..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Active Toggle */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                            <span className="text-sm font-medium text-slate-700">Set as Active</span>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
                                            'Save Shift'
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
