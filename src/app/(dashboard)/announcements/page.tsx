
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Megaphone,
    Search,
    Filter,
    Plus,
    Calendar,
    Clock,
    FileText,
    MoreHorizontal,
    AlertCircle,
    CheckCircle2,
    Paperclip,
    ArrowUpRight,
    ChevronDown,
    Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AnnouncementsPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [filterCategory, setFilterCategory] = useState('All Announcements')
    const [filterTime, setFilterTime] = useState('All Time')
    const [announcements, setAnnouncements] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const canCreate = ['ADMIN', 'HR', 'MANAGER'].includes(session?.user?.role || '')

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setIsLoading(true)
            try {
                const searchParams = new URLSearchParams()
                if (filterCategory !== 'All Announcements') searchParams.append('category', filterCategory)
                if (filterTime !== 'All Time') searchParams.append('period', filterTime)

                const res = await fetch(`/api/announcements?${searchParams.toString()}`)
                if (res.ok) {
                    const data = await res.json()
                    setAnnouncements(data)
                }
            } catch (error) {
                console.error('Failed to fetch announcements:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAnnouncements()
    }, [filterCategory, filterTime]) // Re-fetch when filters change

    // Helper to get badge style
    const getBadgeStyle = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'urgent':
                return 'bg-red-50 text-red-600 border border-red-100'
            case 'meeting':
                return 'bg-blue-50 text-blue-600 border border-blue-100'
            case 'deadline':
                return 'bg-amber-50 text-amber-600 border border-amber-100'
            case 'general':
                return 'bg-gray-50 text-gray-600 border border-gray-100'
            default:
                return 'bg-gray-50 text-gray-600 border border-gray-100'
        }
    }

    const getIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'urgent':
                return <AlertCircle className="w-3.5 h-3.5" />
            case 'meeting':
                return <Calendar className="w-3.5 h-3.5" />
            case 'deadline':
                return <Clock className="w-3.5 h-3.5" />
            default:
                return <Megaphone className="w-3.5 h-3.5" />
        }
    }

    // Helper function to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const getExpiresText = (dateString: string) => {
        if (!dateString) return null
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Internal Announcements</h1>
                    <p className="text-gray-500 mt-1">Stay updated with important news and updates from leadership.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        All Announcements
                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </button>
                    {canCreate && (
                        <Link
                            href="/announcements/new"
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-sm hover:shadow text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            New Announcement
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Info Feed */}
                <div className="lg:col-span-3 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No Announcements</h3>
                            <p className="text-gray-500 mt-1">There are no announcements matching your filters.</p>
                        </div>
                    ) : (
                        announcements.map((announcement: any) => (
                            <div
                                key={announcement.id}
                                className={`
                                    group relative bg-white rounded-xl border transition-all duration-200
                                    ${announcement.category === 'Urgent'
                                        ? 'border-red-100 shadow-sm hover:shadow-md bg-gradient-to-r from-red-50/30 to-transparent'
                                        : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                                    }
                                `}
                            >
                                <div className="p-5">
                                    {/* Header: Author & Options */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {announcement.author?.employee?.profileImage ? (
                                                <img
                                                    src={announcement.author.employee.profileImage}
                                                    alt={announcement.author.employee.firstName}
                                                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                    {announcement.author?.employee?.firstName?.[0] || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {announcement.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                    <span className="font-medium text-gray-700">
                                                        {announcement.author?.employee?.firstName} {announcement.author?.employee?.lastName}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {announcement.author?.employee?.designation?.name || announcement.author?.role || 'Unknown Role'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatDate(announcement.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Badges */}
                                    <div className="mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeStyle(announcement.category)}`}>
                                            {getIcon(announcement.category)}
                                            {announcement.category}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                                        {announcement.content}
                                    </p>

                                    {/* Attachment */}
                                    {announcement.attachmentName && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4 max-w-md hover:bg-gray-100 transition-colors cursor-pointer group/file">
                                            <div className="p-2 bg-white rounded-md border border-gray-200 md:group-hover/file:border-blue-200 transition-colors">
                                                <FileText className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-700 group-hover/file:text-blue-600 truncate">
                                                    {announcement.attachmentName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {announcement.attachmentSize || 'Unknown size'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer: Expiry & Updated */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-4 text-xs">
                                            {announcement.expirationDate && (
                                                <div className={`flex items-center gap-1.5 font-medium ${announcement.category === 'Urgent' ? 'text-red-500' : 'text-amber-600'}`}>
                                                    {announcement.category === 'Urgent' ? (
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    )}
                                                    Expires {getExpiresText(announcement.expirationDate)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            Last updated {formatDate(announcement.updatedAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
                            <button
                                onClick={() => { setFilterCategory('All Announcements'); setFilterTime('All Time'); }}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Category</label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none cursor-pointer"
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                    >
                                        <option>All Announcements</option>
                                        <option>Urgent</option>
                                        <option>Meeting</option>
                                        <option>Deadline</option>
                                        <option>General</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Time Period</label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none cursor-pointer"
                                        value={filterTime}
                                        onChange={(e) => setFilterTime(e.target.value)}
                                    >
                                        <option>All Time</option>
                                        <option>This Week</option>
                                        <option>This Month</option>
                                        <option>Last 3 Months</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Megaphone className="w-3.5 h-3.5" />
                                <span>{announcements.length} Active Announcements</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
