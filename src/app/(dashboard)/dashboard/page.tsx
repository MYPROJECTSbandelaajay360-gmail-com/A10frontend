'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Calendar,
    Clock,
    FileText,
    Wallet,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Check,
    X,
    Bell,
    CheckSquare,
    CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
    const { data: session } = useSession()
    // Mock user role - in a real app this would come from the session or API
    const isManager = true

    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        pendingLeaves: 0
    })
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [pendingLeaves, setPendingLeaves] = useState<any[]>([])
    const [upcomingHolidays, setUpcomingHolidays] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/dashboard/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data.stats)
                    setRecentActivity(data.recentActivity)
                    setPendingLeaves(data.pendingLeaveRequests)
                    setUpcomingHolidays(data.upcomingHolidays)
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session) {
            fetchDashboardData()
        }
    }, [session])

    const statsCards = [
        {
            title: 'Total Employees',
            value: loading ? '...' : stats.totalEmployees.toString(),
            sub: 'Total Active',
            icon: Users,
            color: 'text-gray-600',
            bg: 'bg-gray-100',
            trendColor: 'text-green-500'
        },
        {
            title: 'Present Today',
            value: loading ? '...' : stats.presentToday.toString(),
            sub: loading ? '...' : `${stats.totalEmployees > 0 ? ((stats.presentToday / stats.totalEmployees) * 100).toFixed(1) : 0}%`,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            trendColor: 'text-green-500'
        },
        {
            title: 'On Leave',
            value: loading ? '...' : stats.onLeave.toString(),
            sub: loading ? '...' : `${stats.totalEmployees > 0 ? ((stats.onLeave / stats.totalEmployees) * 100).toFixed(1) : 0}%`,
            icon: Calendar,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            trendColor: 'text-orange-500'
        },
        {
            title: 'Pending Leaves',
            value: loading ? '...' : stats.pendingLeaves.toString(),
            sub: 'Needs attention',
            icon: FileText, // Using FileText as generic info icon similar to image
            color: 'text-red-500',
            bg: 'bg-red-50',
            trendColor: 'text-red-500'
        }
    ]

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        return 'Good Evening'
    }

    return (
        <div className="flex flex-col gap-6 p-2">
            {/* Header / Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'System'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Here&apos;s what&apos;s happening with your organization today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/attendance" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-emerald-200">
                        <CheckCircle2 className="w-5 h-5" />
                        Check In
                    </Link>
                    <Link href="/leave/apply" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
                        <CalendarDays className="w-5 h-5" />
                        Apply Leave
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.bg} ${stat.trendColor} bg-opacity-50`}>
                                {stat.sub}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left Column (Wider) */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                            <Link href="/reports" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {loading ? (
                                <p className="text-gray-500 text-sm text-center py-4">Loading activity...</p>
                            ) : recentActivity.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No recent activity found.</p>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {activity.image ? (
                                                <img src={activity.image} alt={activity.user} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${activity.color}`}>
                                                    {activity.initials}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-gray-900">
                                                    <span className="font-bold">{activity.user}</span> <span className="text-gray-600">{activity.action}</span>
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pending Leave Requests - Admin Only */}
                    {(session?.user?.role === 'admin' || session?.user?.role === 'manager') && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Pending Leave Requests</h2>
                                <Link href="/leave/approvals" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                                    View all <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <p className="text-gray-500 text-sm text-center py-4">Loading requests...</p>
                                ) : pendingLeaves.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No pending requests.</p>
                                ) : (
                                    pendingLeaves.map((leave) => (
                                        <div key={leave.id} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-4">
                                                {leave.image ? (
                                                    <img src={leave.image} alt={leave.name} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${leave.color}`}>
                                                        {leave.initials}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900">{leave.name}</p>
                                                    <p className="text-sm text-gray-500">{leave.type} • {leave.days} day(s)</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Link href={`/leave/approvals`} className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                                    <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-5">

                    {/* Upcoming Holidays */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Upcoming Holidays</h2>
                            <Link href="/holidays" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-5">
                            {loading ? (
                                <p className="text-gray-500 text-sm text-center py-4">Loading holidays...</p>
                            ) : upcomingHolidays.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No upcoming holidays.</p>
                            ) : (
                                upcomingHolidays.map((holiday) => (
                                    <div key={holiday.id} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{holiday.name}</p>
                                            <p className="text-sm text-gray-500">{holiday.date} • {holiday.day}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
