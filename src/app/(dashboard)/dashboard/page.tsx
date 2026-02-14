'use client'

import { useState } from 'react'
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

    const statsCards = [
        {
            title: 'Total Employees',
            value: '248',
            sub: '+12 this month',
            icon: Users,
            color: 'text-gray-600',
            bg: 'bg-gray-100',
            trendColor: 'text-green-500'
        },
        {
            title: 'Present Today',
            value: '212',
            sub: '85.5%',
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            trendColor: 'text-green-500'
        },
        {
            title: 'On Leave',
            value: '18',
            sub: '7.3%',
            icon: Calendar,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            trendColor: 'text-orange-500'
        },
        {
            title: 'Pending Leaves',
            value: '24',
            sub: 'Needs attention',
            icon: FileText, // Using FileText as generic info icon similar to image
            color: 'text-red-500',
            bg: 'bg-red-50',
            trendColor: 'text-red-500'
        }
    ]

    const recentActivity = [
        { id: 1, user: 'John Doe', action: 'checked in', time: '9:02 AM', initials: 'JD', color: 'bg-blue-500' },
        { id: 2, user: 'Sarah Wilson', action: 'applied for leave', time: '9:15 AM', initials: 'SW', color: 'bg-yellow-500' },
        { id: 3, user: 'Mike Johnson', action: 'salary processed', time: '9:30 AM', initials: 'MJ', color: 'bg-green-500' },
        { id: 4, user: 'Emily Brown', action: 'checked out', time: '6:05 PM', initials: 'EB', color: 'bg-pink-500' },
        { id: 5, user: 'David Lee', action: 'leave approved', time: '10:00 AM', initials: 'DL', color: 'bg-orange-500' },
    ]

    const upcomingHolidays = [
        { id: 1, name: 'Republic Day', date: 'Jan 26, 2026', day: 'Monday' },
        { id: 2, name: 'Holi', date: 'Mar 14, 2026', day: 'Saturday' },
        { id: 3, name: 'Good Friday', date: 'Apr 3, 2026', day: 'Friday' },
    ]

    const pendingLeaves = [
        { id: 1, name: 'Sarah Wilson', type: 'Casual Leave', days: 2, initials: 'S', color: 'bg-blue-600' },
        { id: 2, name: 'Robert Chen', type: 'Sick Leave', days: 1, initials: 'R', color: 'bg-blue-600' },
        { id: 3, name: 'Lisa Anderson', type: 'Earned Leave', days: 5, initials: 'L', color: 'bg-purple-600' },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className={`absolute top-4 left-4 p-2 rounded-full ${stat.bg}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-4xl font-bold text-slate-800">{stat.value}</h3>
                            <p className="text-gray-500 font-medium text-sm mt-1">{stat.title}</p>
                            <p className={`text-xs mt-1 font-medium ${stat.trendColor}`}>{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Wider) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                            <Link href="/reports" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${activity.color}`}>
                                            {activity.initials}
                                        </div>
                                        <div>
                                            <p className="text-gray-900">
                                                <span className="font-bold">{activity.user}</span> <span className="text-gray-600">{activity.action}</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{activity.time.split(' ')[0]} {activity.time.split(' ')[1]}</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-500 text-sm font-medium">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Leave Requests */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Pending Leave Requests</h2>
                            <Link href="/leave/approvals" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {pendingLeaves.map((leave) => (
                                <div key={leave.id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${leave.color}`}>
                                            {leave.initials}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{leave.name}</p>
                                            <p className="text-sm text-gray-500">{leave.type} • {leave.days} day(s)</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors">
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">

                    {/* Upcoming Holidays */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Upcoming Holidays</h2>
                            <Link href="/holidays" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-5">
                            {upcomingHolidays.map((holiday) => (
                                <div key={holiday.id} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{holiday.name}</p>
                                        <p className="text-sm text-gray-500">{holiday.date} • {holiday.day}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/employees/add" className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors gap-2 text-center group">
                                <Users className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-700">Add Employee</span>
                            </Link>
                            <Link href="/payroll/process" className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors gap-2 text-center group">
                                <Wallet className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-700">Process Payroll</span>
                            </Link>
                            <Link href="/attendance/reports" className="flex flex-col items-center justify-center p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors gap-2 text-center group">
                                <CalendarDays className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-700">Attendance Report</span>
                            </Link>
                            <Link href="/reports" className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors gap-2 text-center group">
                                <FileText className="w-6 h-6 text-orange-600 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-700">View Reports</span>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
