'use client'

import { useState } from 'react'
import { X, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ResetPasswordModalProps {
    employee: {
        id: string
        name: string
        email: string
    }
    onClose: () => void
}

export default function ResetPasswordModal({ employee, onClose }: ResetPasswordModalProps) {
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Reusing the employee update endpoint to change user password 
            // We should ensure the backend handles 'password' in the updates
            // Alternatively, we could have a specific reset endpoint, but let's check auth.ts
            const res = await fetch(`/api/auth/reset-password-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: employee.id, // Usually employee.id is same as userId in some contexts, but let's be careful
                    newPassword
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to reset password')
            } else {
                setSuccess(true)
                setTimeout(onClose, 2000)
            }
        } catch (err) {
            setError('Failed to connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Reset Password</h2>
                            <p className="text-xs text-gray-500">For {employee.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8 space-y-4 animate-scale-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Password Reset!</h3>
                                <p className="text-gray-500">The password has been updated successfully.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">New Password</label>
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new strong password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <p className="text-[10px] text-gray-400 ml-1 italic">Make sure to share this password with the employee securely.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Resetting...</span>
                                        </>
                                    ) : (
                                        <span>Reset Password</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
