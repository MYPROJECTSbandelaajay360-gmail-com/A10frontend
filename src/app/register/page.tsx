'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Zap, Building2, User, Mail, Lock, Phone, ArrowRight, Check, Loader2, Eye, EyeOff } from 'lucide-react'

interface Plan {
    id: string
    name: string
    slug: string
    monthlyPrice: number
    maxEmployees: number
    trialDays: number
    features: string[]
    description: string
    isCustom: boolean
}

export default function RegisterPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planFromUrl = searchParams.get('plan') || 'starter'

    const [step, setStep] = useState(1)
    const [plans, setPlans] = useState<Plan[]>([])
    const [selectedPlan, setSelectedPlan] = useState(planFromUrl)
    const [loading, setLoading] = useState(false)
    const [plansLoading, setPlansLoading] = useState(true)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        organizationName: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
    })

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

    // Fetch plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(`${API_URL}/subscription/plans`)
                const data = await res.json()
                if (data.data) {
                    setPlans(data.data)
                }
            } catch (err) {
                console.error('Failed to fetch plans:', err)
            } finally {
                setPlansLoading(false)
            }
        }
        fetchPlans()
    }, [API_URL])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_URL}/subscription/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    planSlug: selectedPlan,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            // Auto-login using NextAuth
            const signInResult = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (signInResult?.ok) {
                router.push('/dashboard?welcome=true')
            } else {
                // If NextAuth sign-in fails, redirect to login
                router.push('/login?registered=true')
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const selectedPlanData = plans.find(p => p.slug === selectedPlan)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white fill-white" />
                        </div>
                        <span className="font-bold text-2xl text-white">Musterbook</span>
                    </Link>

                    <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                        Start managing your<br />team like a pro
                    </h1>
                    <p className="text-blue-100 text-lg mb-10">
                        Join thousands of businesses using Musterbook to streamline their HR operations.
                    </p>

                    <div className="space-y-4">
                        {[
                            'Free 14-day trial, no credit card required',
                            'Set up in under 5 minutes',
                            'Cancel anytime, no questions asked',
                            'Dedicated support throughout your trial',
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-blue-100 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-blue-200 text-sm">
                    Trusted by 5,000+ businesses worldwide
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-lg">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-gray-900">Musterbook</span>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    </div>

                    {step === 1 ? (
                        /* Step 1: Select Plan */
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your plan</h2>
                            <p className="text-gray-500 mb-6">All plans include a {selectedPlanData?.trialDays || 14}-day free trial</p>

                            {plansLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-3 mb-8">
                                    {plans.filter(p => !p.isCustom).map((plan) => (
                                        <button
                                            key={plan.slug}
                                            onClick={() => setSelectedPlan(plan.slug)}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedPlan === plan.slug
                                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.slug ? 'border-blue-600' : 'border-gray-300'}`}>
                                                        {selectedPlan === plan.slug && (
                                                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{plan.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-gray-900">₹{plan.monthlyPrice.toLocaleString('en-IN')}</span>
                                                    <span className="text-gray-500 text-sm">/mo</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-7">{plan.description}</p>
                                            <div className="flex flex-wrap gap-2 mt-3 ml-7">
                                                {plan.features.slice(0, 3).map((f) => (
                                                    <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                                                ))}
                                                {plan.features.length > 3 && (
                                                    <span className="text-xs text-blue-600 px-2 py-0.5">+{plan.features.length - 3} more</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <p className="text-center text-sm text-gray-500 mt-4">
                                Need enterprise features?{' '}
                                <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact Sales</Link>
                            </p>
                        </div>
                    ) : (
                        /* Step 2: Organization & Account Details */
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
                            <p className="text-gray-500 mb-6">
                                Starting with {selectedPlanData?.name || 'Starter'} plan — {selectedPlanData?.trialDays || 14}-day free trial
                            </p>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Organization Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.organizationName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Your company name"
                                        />
                                    </div>
                                </div>

                                {/* Name fields */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="First name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="you@company.com"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Min 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Start Free Trial
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 text-center pt-2">
                                    By signing up, you agree to our{' '}
                                    <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                                </p>
                            </form>
                        </div>
                    )}

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
