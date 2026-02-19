'use client'

import { useState } from 'react'
import { X, Clock, AlertCircle, Briefcase, CheckCircle, Loader2 } from 'lucide-react'

interface LateCheckInModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: { reason: string; hasProject: boolean; projectName?: string }) => void
    isSubmitting: boolean
    lateThresholdTime: string // Display string like "10:00 AM"
}

export default function LateCheckInModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    lateThresholdTime
}: LateCheckInModalProps) {
    const [reason, setReason] = useState('')
    const [hasProject, setHasProject] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason.trim()) {
            setError('Please provide a reason.')
            return
        }
        if (hasProject && !projectName.trim()) {
            setError('Please provide the project name.')
            return
        }
        setError('')
        onSubmit({
            reason,
            hasProject,
            projectName: hasProject ? projectName : undefined
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/5 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[340px] rounded-xl shadow-xl border border-gray-100 overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                {/* Minimal Header */}
                <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Late Check-in
                    </div>
                </div>

                <div className="p-5">
                    <div className="text-center mb-4">
                        <p className="text-xs text-gray-500">
                            Current time is past <span className="font-medium text-gray-700">{lateThresholdTime}</span>.
                            Please provide a reason.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Reason Input */}
                        <div className="space-y-1">
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Reason for late log in..."
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none min-h-[80px] text-xs text-gray-700 placeholder:text-gray-400"
                                autoFocus
                            />
                        </div>

                        {/* Project Status Toggle */}
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setHasProject(false)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!hasProject
                                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                No Project
                            </button>
                            <button
                                type="button"
                                onClick={() => setHasProject(true)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${hasProject
                                        ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Have Project
                            </button>
                        </div>

                        {/* Project Name Input (Conditional) */}
                        {hasProject && (
                            <div className="animate-in slide-in-from-top-1 duration-200">
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Project Name"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-xs"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-red-500 text-[10px] font-medium flex items-center gap-1.5 bg-red-50 p-2 rounded-md">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
