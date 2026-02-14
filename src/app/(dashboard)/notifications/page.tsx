'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
    Bell,
    Check,
    CheckCheck,
    Clock,
    Calendar,
    Wallet,
    Users,
    AlertCircle,
    Trash2,
    Loader2,
    RefreshCw,
    Inbox,
    BellOff
} from 'lucide-react'

interface Notification {
    id: string
    type: 'LEAVE' | 'PAYROLL' | 'ATTENDANCE' | 'SYSTEM' | 'USER'
    title: string
    message: string
    createdAt: string
    isRead: boolean
    link?: string
}

function timeAgo(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)

    if (diffSec < 60) return 'Just now'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
    const diffMonth = Math.floor(diffDay / 30)
    return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`
}

export default function NotificationsPage() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Mark single notification as read
    const markAsRead = async (id: string) => {
        setActionLoading(id)
        try {
            const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                )
            }
        } catch (error) {
            console.error('Error marking as read:', error)
        } finally {
            setActionLoading(null)
        }
    }

    // Mark all as read
    const markAllAsRead = async () => {
        setActionLoading('all')
        try {
            const res = await fetch('/api/notifications/read-all', { method: 'PATCH' })
            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, isRead: true }))
                )
            }
        } catch (error) {
            console.error('Error marking all as read:', error)
        } finally {
            setActionLoading(null)
        }
    }

    // Delete single notification
    const deleteNotification = async (id: string) => {
        setActionLoading(`del-${id}`)
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id))
            }
        } catch (error) {
            console.error('Error deleting notification:', error)
        } finally {
            setActionLoading(null)
        }
    }

    // Clear all notifications
    const clearAll = async () => {
        setActionLoading('clear')
        try {
            const res = await fetch('/api/notifications', { method: 'DELETE' })
            if (res.ok) {
                setNotifications([])
            }
        } catch (error) {
            console.error('Error clearing notifications:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'LEAVE': return <Calendar className="w-5 h-5" />
            case 'PAYROLL': return <Wallet className="w-5 h-5" />
            case 'ATTENDANCE': return <Clock className="w-5 h-5" />
            case 'USER': return <Users className="w-5 h-5" />
            case 'SYSTEM': return <AlertCircle className="w-5 h-5" />
            default: return <Bell className="w-5 h-5" />
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'LEAVE': return 'bg-blue-50 text-blue-600 border-blue-200'
            case 'PAYROLL': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
            case 'ATTENDANCE': return 'bg-violet-50 text-violet-600 border-violet-200'
            case 'USER': return 'bg-amber-50 text-amber-600 border-amber-200'
            case 'SYSTEM': return 'bg-slate-50 text-slate-600 border-slate-200'
            default: return 'bg-gray-50 text-gray-600 border-gray-200'
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <div className={`max-w-3xl mx-auto space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {loading ? 'Loading...' : unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            disabled={actionLoading === 'all'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-full transition-all"
                        >
                            {actionLoading === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            disabled={actionLoading === 'clear'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-full transition-all"
                        >
                            {actionLoading === 'clear' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Clear all
                        </button>
                    )}
                    <button
                        onClick={fetchNotifications}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-all"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Unread Badge */}
            {unreadCount > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm text-blue-700">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</span>
                </div>
            )}

            {/* Notifications List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    // Skeleton loader
                    <div className="divide-y divide-gray-50">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-4 flex gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                                    <div className="h-3 bg-gray-100 rounded w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                className={`p-4 flex gap-4 transition-all duration-200 hover:bg-gray-50/80 ${!notification.isRead ? 'bg-blue-50/30 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getTypeColor(notification.type)}`}>
                                    {getTypeIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {notification.title}
                                        </h4>
                                        {!notification.isRead && (
                                            <span className="flex h-2 w-2 shrink-0 mt-1.5">
                                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{timeAgo(notification.createdAt)}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-start gap-0.5 shrink-0">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            disabled={actionLoading === notification.id}
                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                                            title="Mark as read"
                                        >
                                            {actionLoading === notification.id
                                                ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                                : <Check className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                            }
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        disabled={actionLoading === `del-${notification.id}`}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                        title="Delete"
                                    >
                                        {actionLoading === `del-${notification.id}`
                                            ? <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                                            : <Trash2 className="w-4 h-4 text-gray-300 group-hover:text-red-500" />
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Inbox className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800">No notifications</h3>
                        <p className="text-sm text-gray-400 mt-1">You're all caught up! Check back later.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
