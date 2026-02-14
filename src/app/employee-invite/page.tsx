'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Lock,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle,
    AlertCircle,
    User,
    Building2,
    Briefcase,
    ArrowRight,
    Zap
} from 'lucide-react'

interface InviteDetails {
    email: string
    firstName: string
    lastName: string
    department: string
    designation: string
    employeeId?: string
}

function AcceptInviteContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('Invalid invitation link. No token provided.')
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/employees/accept-invite?token=${token}`)
                const data = await response.json()

                if (!response.ok) {
                    setError(data.error || 'Invalid invitation')
                } else {
                    setInviteDetails(data.invite)
                }
            } catch (err) {
                setError('Failed to validate invitation. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        validateToken()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setSubmitting(true)

        try {
            const response = await fetch('/api/employees/accept-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, confirmPassword })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to create account')
            } else {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const passwordStrength = () => {
        if (password.length === 0) return { strength: 0, label: '', color: '' }
        if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
        if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
        if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return { strength: 3, label: 'Good', color: 'bg-green-500' }
        }
        if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            return { strength: 4, label: 'Strong', color: 'bg-emerald-500' }
        }
        return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
    }

    const { strength, label, color } = passwordStrength()

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
                    <p className="text-white/70 mt-4">Validating your invitation...</p>
                </div>
            </div>
        )
    }

    if (error && !inviteDetails) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
                    <p className="text-white/70 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
                    <p className="text-white/70 mb-6">
                        Your account has been set up successfully. Redirecting to login...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-white/50">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecting...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">HRMS Portal</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome, {inviteDetails?.firstName}!</h1>
                        <p className="text-white/70">
                            Set up your password to complete your account registration
                        </p>
                    </div>

                    {/* Invite Details */}
                    <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {inviteDetails?.firstName?.[0]}{inviteDetails?.lastName?.[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-white">
                                    {inviteDetails?.firstName} {inviteDetails?.lastName}
                                </p>
                                <p className="text-sm text-white/60">{inviteDetails?.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-2 text-white/70">
                                <Building2 className="w-4 h-4" />
                                <span className="text-sm">{inviteDetails?.department}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                                <Briefcase className="w-4 h-4" />
                                <span className="text-sm">{inviteDetails?.designation}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Create Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full ${level <= strength ? color : 'bg-white/10'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-white/60">{label && `Password strength: ${label}`}</p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm your password"
                                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                            )}
                            {confirmPassword && password === confirmPassword && (
                                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Passwords match
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || password.length < 8 || password !== confirmPassword}
                            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Complete Registration
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-white/50 text-sm mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function AcceptEmployeeInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
        }>
            <AcceptInviteContent />
        </Suspense>
    )
}
