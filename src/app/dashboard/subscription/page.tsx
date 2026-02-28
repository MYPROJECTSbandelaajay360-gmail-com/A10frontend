'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
    CreditCard, Check, AlertTriangle, Clock, Users, Zap, ArrowUpRight,
    Download, Loader2, Shield, Crown, Building2, Calendar, ChevronRight,
    X, RefreshCw, AlertCircle, Receipt, TrendingUp
} from 'lucide-react'

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface SubscriptionData {
    subscription: {
        id: string
        status: string
        billingCycle: string
        trialStartDate: string | null
        trialEndDate: string | null
        currentPeriodStart: string | null
        currentPeriodEnd: string | null
        autoRenew: boolean
        cancelledAt: string | null
        cancelsAtPeriodEnd: boolean
    }
    plan: {
        id: string
        name: string
        slug: string
        monthlyPrice: number
        yearlyPrice: number | null
        maxEmployees: number
        features: string[]
        description: string
        isCustom: boolean
        hasPayroll: boolean
        hasAdvancedAnalytics: boolean
        hasCustomIntegrations: boolean
        hasPrioritySupport: boolean
        trialDays: number
    }
    organization: {
        id: string
        name: string
        slug: string
        email: string
    }
    usage: {
        employees: number
        maxEmployees: number
        percentUsed: number
    }
    daysRemaining: number
    recentPayments: any[]
}

interface Plan {
    id: string
    name: string
    slug: string
    monthlyPrice: number
    yearlyPrice: number | null
    maxEmployees: number
    features: string[]
    description: string
    isCustom: boolean
    trialDays: number
}

interface InvoiceData {
    id: string
    invoiceNumber: string
    subtotal: number
    tax: number
    total: number
    periodStart: string
    periodEnd: string
    status: string
    paidAt: string | null
    createdAt: string
}

export default function SubscriptionPage() {
    const { data: session } = useSession()
    const [subData, setSubData] = useState<SubscriptionData | null>(null)
    const [plans, setPlans] = useState<Plan[]>([])
    const [invoices, setInvoices] = useState<InvoiceData[]>([])
    const [loading, setLoading] = useState(true)
    const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelLoading, setCancelLoading] = useState(false)
    const [showPlans, setShowPlans] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

    const getAccessToken = useCallback(() => {
        return (session as any)?.accessToken || ''
    }, [session])

    const fetchData = useCallback(async () => {
        try {
            const token = getAccessToken()
            if (!token) return

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }

            const [subRes, plansRes, invoicesRes] = await Promise.all([
                fetch(`${API_URL}/subscription/current`, { headers }),
                fetch(`${API_URL}/subscription/plans`),
                fetch(`${API_URL}/subscription/invoices`, { headers }),
            ])

            if (subRes.ok) {
                const subJson = await subRes.json()
                setSubData(subJson.data)
            }

            if (plansRes.ok) {
                const plansJson = await plansRes.json()
                setPlans(plansJson.data || [])
            }

            if (invoicesRes.ok) {
                const invoicesJson = await invoicesRes.json()
                setInvoices(invoicesJson.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch subscription data:', err)
        } finally {
            setLoading(false)
        }
    }, [API_URL, getAccessToken])

    useEffect(() => {
        if (session) {
            fetchData()
        }
    }, [session, fetchData])

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const handlePayment = async (planId: string) => {
        setUpgradeLoading(planId)
        setError('')

        try {
            const token = getAccessToken()

            // Create order
            const orderRes = await fetch(`${API_URL}/subscription/create-order`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId, billingCycle }),
            })

            if (!orderRes.ok) {
                const err = await orderRes.json()
                throw new Error(err.error || 'Failed to create order')
            }

            const orderData = await orderRes.json()
            const { orderId, amount, currency, keyId, description } = orderData.data

            if (!window.Razorpay) {
                throw new Error('Payment gateway not loaded. Please refresh and try again.')
            }

            // Open Razorpay checkout
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: 'Musterbook',
                description: description,
                order_id: orderId,
                handler: async function (response: any) {
                    // Verify payment
                    try {
                        const verifyRes = await fetch(`${API_URL}/subscription/verify-payment`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planId,
                                billingCycle,
                            }),
                        })

                        if (verifyRes.ok) {
                            setSuccessMsg('Payment successful! Your subscription has been activated.')
                            fetchData() // Refresh data
                        } else {
                            const err = await verifyRes.json()
                            setError(err.error || 'Payment verification failed')
                        }
                    } catch (err) {
                        setError('Payment verification failed. Please contact support.')
                    }
                },
                prefill: {
                    email: session?.user?.email || '',
                    name: session?.user?.name || '',
                },
                theme: {
                    color: '#2563EB',
                },
                modal: {
                    ondismiss: function () {
                        setUpgradeLoading(null)
                    }
                }
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err: any) {
            setError(err.message || 'Payment failed')
        } finally {
            setUpgradeLoading(null)
        }
    }

    const handleCancel = async () => {
        setCancelLoading(true)
        try {
            const token = getAccessToken()
            const res = await fetch(`${API_URL}/subscription/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: cancelReason }),
            })

            if (res.ok) {
                setSuccessMsg('Subscription cancelled successfully.')
                setShowCancelModal(false)
                fetchData()
            } else {
                const err = await res.json()
                setError(err.error || 'Failed to cancel subscription')
            }
        } catch (err) {
            setError('Failed to cancel subscription')
        } finally {
            setCancelLoading(false)
        }
    }

    const handleReactivate = async () => {
        try {
            const token = getAccessToken()
            const res = await fetch(`${API_URL}/subscription/reactivate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            const data = await res.json()
            if (data.success) {
                setSuccessMsg('Subscription reactivated!')
                fetchData()
            } else if (data.requiresPayment) {
                setShowPlans(true)
            }
        } catch (err) {
            setError('Failed to reactivate subscription')
        }
    }

    const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
        TRIAL: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
        ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', icon: Check },
        PAST_DUE: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: AlertTriangle },
        CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', icon: X },
        EXPIRED: { bg: 'bg-gray-50', text: 'text-gray-700', icon: AlertCircle },
        SUSPENDED: { bg: 'bg-red-50', text: 'text-red-700', icon: Shield },
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    if (!subData) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subscription Found</h3>
                    <p className="text-gray-600 mb-4">Your account is not linked to any organization subscription.</p>
                    <a href="/register" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700">
                        Create Organization <ArrowUpRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        )
    }

    const statusInfo = statusColors[subData.subscription.status] || statusColors.EXPIRED
    const StatusIcon = statusInfo.icon
    const currentPlan = subData.plan
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
                    <p className="text-gray-500 text-sm mt-1">{subData.organization.name}</p>
                </div>
                <button
                    onClick={() => fetchData()}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Refresh"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                    {error}
                    <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                </div>
            )}
            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                    {successMsg}
                    <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Trial Banner */}
            {subData.subscription.status === 'TRIAL' && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5" />
                                <span className="text-blue-100 text-sm font-medium">Free Trial</span>
                            </div>
                            <h3 className="text-xl font-bold mb-1">
                                {subData.daysRemaining} days remaining
                            </h3>
                            <p className="text-blue-100 text-sm">
                                Your trial ends on {subData.subscription.trialEndDate
                                    ? new Date(subData.subscription.trialEndDate).toLocaleDateString('en-IN', { dateStyle: 'long' })
                                    : 'N/A'}
                            </p>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => setShowPlans(true)}
                                className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all shadow-lg"
                            >
                                Upgrade Now
                            </button>
                        )}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(5, 100 - (subData.daysRemaining / (subData.plan.trialDays || 14)) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Past Due / Expired Banner */}
            {['PAST_DUE', 'EXPIRED', 'SUSPENDED'].includes(subData.subscription.status) && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-800">
                                    {subData.subscription.status === 'PAST_DUE' && 'Payment Overdue'}
                                    {subData.subscription.status === 'EXPIRED' && 'Subscription Expired'}
                                    {subData.subscription.status === 'SUSPENDED' && 'Account Suspended'}
                                </h3>
                                <p className="text-sm text-red-600">Please renew your subscription to continue using all features.</p>
                            </div>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => setShowPlans(true)}
                                className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700"
                            >
                                Renew Now
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Current Plan Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {subData.subscription.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <Crown className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h3>
                            <p className="text-gray-500 text-sm">{currentPlan.description}</p>
                        </div>
                        {!currentPlan.isCustom && (
                            <div className="ml-auto text-right">
                                <div className="text-3xl font-bold text-gray-900">
                                    ₹{currentPlan.monthlyPrice.toLocaleString('en-IN')}
                                </div>
                                <span className="text-gray-500 text-sm">/month</span>
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="grid sm:grid-cols-2 gap-2 mb-6">
                        {currentPlan.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {feature}
                            </div>
                        ))}
                    </div>

                    {/* Billing Info */}
                    {subData.subscription.status === 'ACTIVE' && (
                        <div className="bg-gray-50 rounded-xl p-4 grid sm:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Billing Cycle</span>
                                <div className="font-semibold text-gray-900 mt-0.5">{subData.subscription.billingCycle}</div>
                            </div>
                            <div>
                                <span className="text-gray-500">Current Period</span>
                                <div className="font-semibold text-gray-900 mt-0.5">
                                    {subData.subscription.currentPeriodStart
                                        ? new Date(subData.subscription.currentPeriodStart).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                                        : 'N/A'}
                                    {' - '}
                                    {subData.subscription.currentPeriodEnd
                                        ? new Date(subData.subscription.currentPeriodEnd).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                                        : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500">Next Payment</span>
                                <div className="font-semibold text-gray-900 mt-0.5">
                                    {subData.subscription.currentPeriodEnd
                                        ? new Date(subData.subscription.currentPeriodEnd).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                                        : 'N/A'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {isAdmin && (
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowPlans(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                            >
                                <TrendingUp className="w-4 h-4" />
                                {subData.subscription.status === 'TRIAL' ? 'Upgrade Plan' : 'Change Plan'}
                            </button>
                            {subData.subscription.cancelsAtPeriodEnd ? (
                                <button
                                    onClick={handleReactivate}
                                    className="border border-green-300 text-green-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-50"
                                >
                                    Resume Subscription
                                </button>
                            ) : (
                                ['TRIAL', 'ACTIVE'].includes(subData.subscription.status) && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
                                    >
                                        Cancel Subscription
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Usage Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Usage</h2>

                    <div className="space-y-6">
                        {/* Employee Usage */}
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Employees
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {subData.usage.employees} / {subData.usage.maxEmployees === -1 ? '∞' : subData.usage.maxEmployees}
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${subData.usage.percentUsed >= 90 ? 'bg-red-500' :
                                        subData.usage.percentUsed >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}
                                    style={{
                                        width: `${subData.usage.maxEmployees === -1 ? 5 : Math.min(100, subData.usage.percentUsed)}%`
                                    }}
                                />
                            </div>
                            {subData.usage.percentUsed >= 80 && subData.usage.maxEmployees !== -1 && (
                                <p className="text-xs text-yellow-600 mt-1.5 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {subData.usage.percentUsed >= 100
                                        ? 'Employee limit reached! Upgrade to add more.'
                                        : 'Approaching employee limit. Consider upgrading.'}
                                </p>
                            )}
                        </div>

                        {/* Feature Access */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Feature Access</h3>
                            <div className="space-y-2">
                                {[
                                    { name: 'Payroll', enabled: currentPlan.hasPayroll },
                                    { name: 'Analytics', enabled: currentPlan.hasAdvancedAnalytics },
                                    { name: 'Integrations', enabled: currentPlan.hasCustomIntegrations },
                                    { name: 'Priority Support', enabled: currentPlan.hasPrioritySupport },
                                ].map((feature) => (
                                    <div key={feature.name} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{feature.name}</span>
                                        {feature.enabled ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <X className="w-4 h-4 text-gray-300" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Days Remaining */}
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{subData.daysRemaining}</div>
                            <div className="text-xs text-gray-500">days remaining</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-gray-400" />
                        Billing History
                    </h2>
                </div>

                {invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Invoice</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Amount</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {new Date(invoice.periodStart).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                                            {' - '}
                                            {new Date(invoice.periodEnd).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-gray-900">
                                            ₹{invoice.total.toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'PAID' ? 'bg-green-50 text-green-700' :
                                                invoice.status === 'OVERDUE' ? 'bg-red-50 text-red-700' :
                                                    'bg-gray-50 text-gray-700'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {new Date(invoice.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        No invoices yet
                    </div>
                )}
            </div>

            {/* Plan Selection Modal */}
            {showPlans && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Choose a Plan</h2>
                            <button
                                onClick={() => setShowPlans(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Billing toggle */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <span className={`text-sm ${billingCycle === 'MONTHLY' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Monthly</span>
                            <button
                                onClick={() => setBillingCycle(prev => prev === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
                                className={`relative w-12 h-6 rounded-full transition-colors ${billingCycle === 'YEARLY' ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billingCycle === 'YEARLY' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                            <span className={`text-sm ${billingCycle === 'YEARLY' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                Yearly <span className="text-green-600 text-xs font-medium">(Save ~17%)</span>
                            </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {plans.map((plan) => {
                                const isCurrentPlan = plan.slug === currentPlan.slug
                                const price = billingCycle === 'YEARLY' && plan.yearlyPrice
                                    ? Math.round(plan.yearlyPrice / 12)
                                    : plan.monthlyPrice

                                return (
                                    <div
                                        key={plan.id}
                                        className={`rounded-xl border-2 p-5 ${isCurrentPlan
                                            ? 'border-blue-500 bg-blue-50/50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3">{plan.description}</p>

                                        <div className="mb-4">
                                            {plan.isCustom ? (
                                                <span className="text-2xl font-bold text-gray-900">Custom</span>
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                                                    <span className="text-gray-500 text-sm">/mo</span>
                                                    {billingCycle === 'YEARLY' && plan.yearlyPrice && (
                                                        <div className="text-xs text-gray-500">Billed ₹{plan.yearlyPrice.toLocaleString('en-IN')}/year</div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="text-sm text-gray-600 mb-4">
                                            {plan.maxEmployees === -1 ? 'Unlimited' : `Up to ${plan.maxEmployees}`} employees
                                        </div>

                                        <ul className="space-y-2 mb-5">
                                            {plan.features.map((f) => (
                                                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        {isCurrentPlan ? (
                                            <div className="text-center py-2.5 rounded-xl bg-blue-100 text-blue-700 text-sm font-semibold">
                                                Current Plan
                                            </div>
                                        ) : plan.isCustom ? (
                                            <a
                                                href="/contact"
                                                className="block text-center py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                                            >
                                                Contact Sales
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => handlePayment(plan.id)}
                                                disabled={upgradeLoading === plan.id}
                                                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                                            >
                                                {upgradeLoading === plan.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        {price > currentPlan.monthlyPrice ? 'Upgrade' : 'Switch'} to {plan.name}
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Cancel Subscription</h3>
                                <p className="text-sm text-gray-500">This action can be undone before period ends</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-700">
                            Your access will continue until the end of the current billing period. After that, your account will be limited.
                        </div>

                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Please tell us why you're cancelling (optional)"
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm mb-4 h-24 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Keep Subscription
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelLoading}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Subscription'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
