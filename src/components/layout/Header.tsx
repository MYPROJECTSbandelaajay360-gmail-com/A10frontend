'use client'

import { useSession, signOut } from 'next-auth/react'
import { Award, ChevronDown, LogOut, User, Settings, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
    const { data: session } = useSession()
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const notifRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const notifications = [
        { id: 1, title: 'Leave Request Approved', message: 'Your leave request has been approved by HR', time: '5m ago', unread: true },
        { id: 2, title: 'Salary Credited', message: 'Your salary for January has been credited to your account', time: '2h ago', unread: true },
        { id: 3, title: 'Team Meeting', message: 'Team meeting scheduled at 3 PM in Conference Room A', time: '1d ago', unread: false },
        { id: 4, title: 'Policy Update', message: 'New leave policy has been updated. Please review.', time: '2d ago', unread: false },
    ]

    const unreadCount = notifications.filter(n => n.unread).length

    const getUserInitial = () => {
        return session?.user?.name?.charAt(0)?.toUpperCase() || 'U'
    }

    const getUserRole = () => {
        const role = session?.user?.role || 'Employee'
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-end px-6 h-16">
                <div className="flex items-center gap-4">

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
                        >
                            <div className="relative">
                                <Award className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </div>
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${notif.unread ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                                                </div>
                                                {notif.unread && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-lg bg-gray-200 overflow-hidden">
                                {session?.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white text-sm font-medium">
                                        {getUserInitial()}
                                    </div>
                                )}
                            </div>

                            {/* User Info (Desktop) */}
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-bold text-gray-900 uppercase leading-none">
                                    {session?.user?.name || 'USER'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 font-medium leading-none">
                                    {getUserRole()}
                                </p>
                            </div>

                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
                        </button>

                        {showProfile && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                {/* Dropdown Header */}
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-900 uppercase">
                                        {session?.user?.name || 'USER'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                        {session?.user?.email || 'email@example.com'}
                                    </p>
                                    <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-700">
                                        {getUserRole()}
                                    </span>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowProfile(false)}
                                    >
                                        <User className="w-4 h-4 text-gray-400" />
                                        Profile
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowProfile(false)}
                                    >
                                        <Settings className="w-4 h-4 text-gray-400" />
                                        Settings
                                    </Link>
                                </div>

                                {/* Sign Out */}
                                <div className="border-t border-gray-100 p-2">
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
