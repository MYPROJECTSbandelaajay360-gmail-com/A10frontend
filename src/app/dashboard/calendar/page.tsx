'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    PartyPopper,
    Gift,
    Briefcase,
    Home,
    CheckCircle2,
    XCircle,
    Clock,
    Sun,
    Loader2,
    ArrowLeft
} from 'lucide-react'

interface CalendarDay {
    date: string
    status: string
    type: string
    details?: any
}

interface Holiday {
    id: string
    name: string
    date: string
    type: 'PUBLIC' | 'RESTRICTED' | 'OPTIONAL'
    description?: string
}

interface CalendarData {
    year: number
    month: number
    calendarData: Record<string, CalendarDay>
    holidays: Holiday[]
    summary: {
        present: number
        wfh: number
        leave: number
        holiday: number
        absent: number
        halfDay: number
    }
    allHolidays: Holiday[]
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
    const { data: session } = useSession()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
    const [viewMode, setViewMode] = useState<'calendar' | 'year'>('calendar')

    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // Fetch calendar data
    useEffect(() => {
        fetchCalendarData()
    }, [currentYear, currentMonth])

    const fetchCalendarData = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/calendar?year=${currentYear}&month=${currentMonth + 1}`)
            const data = await response.json()

            if (response.ok) {
                setCalendarData(data)
            }
        } catch (error) {
            console.error('Error fetching calendar data:', error)
        } finally {
            setLoading(false)
        }
    }

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    }

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const goToPreviousYear = () => {
        setCurrentDate(new Date(currentYear - 1, currentMonth, 1))
    }

    const goToNextYear = () => {
        setCurrentDate(new Date(currentYear + 1, currentMonth, 1))
    }

    // Generate calendar grid
    const generateCalendarDays = () => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
        const daysInMonth = lastDayOfMonth.getDate()
        const startingDay = firstDayOfMonth.getDay()

        const days: (number | null)[] = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null)
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }

        return days
    }

    const getDateKey = (day: number) => {
        const month = (currentMonth + 1).toString().padStart(2, '0')
        const dayStr = day.toString().padStart(2, '0')
        return `${currentYear}-${month}-${dayStr}`
    }

    const getDayData = (day: number): CalendarDay | null => {
        if (!calendarData) return null
        const dateKey = getDateKey(day)
        return calendarData.calendarData[dateKey] || null
    }

    const getStatusStyles = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PRESENT':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    ring: 'ring-green-500',
                    icon: CheckCircle2,
                    label: 'Present'
                }
            case 'WFH':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-700',
                    ring: 'ring-blue-500',
                    icon: Home,
                    label: 'Work from Home'
                }
            case 'HALF_DAY':
                return {
                    bg: 'bg-amber-100',
                    text: 'text-amber-700',
                    ring: 'ring-amber-500',
                    icon: Sun,
                    label: 'Half Day'
                }
            case 'LEAVE':
                return {
                    bg: 'bg-orange-100',
                    text: 'text-orange-700',
                    ring: 'ring-orange-500',
                    icon: Calendar,
                    label: 'On Leave'
                }
            case 'HOLIDAY':
                return {
                    bg: 'bg-purple-100',
                    text: 'text-purple-700',
                    ring: 'ring-purple-500',
                    icon: PartyPopper,
                    label: 'Holiday'
                }
            case 'ABSENT':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                    ring: 'ring-red-500',
                    icon: XCircle,
                    label: 'Absent'
                }
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-400',
                    ring: 'ring-gray-200',
                    icon: Clock,
                    label: 'No Record'
                }
        }
    }

    const getHolidayTypeColor = (type: string) => {
        switch (type) {
            case 'PUBLIC':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'RESTRICTED':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'OPTIONAL':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getHolidayTypeIcon = (type: string) => {
        switch (type) {
            case 'PUBLIC':
                return <PartyPopper className="w-4 h-4" />
            case 'RESTRICTED':
                return <Gift className="w-4 h-4" />
            case 'OPTIONAL':
                return <Briefcase className="w-4 h-4" />
            default:
                return <Calendar className="w-4 h-4" />
        }
    }

    const isToday = (day: number) => {
        const today = new Date()
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        )
    }

    const isWeekend = (dayIndex: number) => {
        return dayIndex % 7 === 0 || dayIndex % 7 === 6
    }

    const calendarDays = generateCalendarDays()

    // Group all holidays by month for year view
    const holidaysByMonth: Record<number, Holiday[]> = {}
    calendarData?.allHolidays?.forEach(holiday => {
        const month = new Date(holiday.date).getMonth()
        if (!holidaysByMonth[month]) {
            holidaysByMonth[month] = []
        }
        holidaysByMonth[month].push(holiday)
    })

    if (loading && !calendarData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading calendar...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                        <p className="text-gray-500 mt-1">View holidays and your attendance</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'calendar'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Month View
                    </button>
                    <button
                        onClick={() => setViewMode('year')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'year'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Year View
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-700" />
                        </div>
                        <span className="text-sm text-gray-600">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                            <Home className="w-4 h-4 text-blue-700" />
                        </div>
                        <span className="text-sm text-gray-600">WFH</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-orange-700" />
                        </div>
                        <span className="text-sm text-gray-600">Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                            <PartyPopper className="w-4 h-4 text-purple-700" />
                        </div>
                        <span className="text-sm text-gray-600">Holiday</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                            <Sun className="w-4 h-4 text-amber-700" />
                        </div>
                        <span className="text-sm text-gray-600">Half Day</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-700" />
                        </div>
                        <span className="text-sm text-gray-600">Absent</span>
                    </div>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <button
                                onClick={goToPreviousMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {monthNames[currentMonth]} {currentYear}
                                </h2>
                                <button
                                    onClick={goToToday}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Today
                                </button>
                            </div>
                            <button
                                onClick={goToNextMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Day Names Header */}
                        <div className="grid grid-cols-7 border-b border-gray-100">
                            {dayNames.map((day, index) => (
                                <div
                                    key={day}
                                    className={`py-3 text-center text-sm font-semibold ${index === 0 || index === 6 ? 'text-red-500' : 'text-gray-600'
                                        }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, index) => {
                                if (day === null) {
                                    return <div key={`empty-${index}`} className="h-24 border-b border-r border-gray-50 bg-gray-50/30" />
                                }

                                const dayData = getDayData(day)
                                const statusStyles = dayData ? getStatusStyles(dayData.status) : getStatusStyles('')
                                const today = isToday(day)
                                const weekend = isWeekend(index)

                                return (
                                    <div
                                        key={day}
                                        onClick={() => dayData && setSelectedDay(dayData)}
                                        className={`h-24 border-b border-r border-gray-50 p-2 cursor-pointer transition-colors hover:bg-gray-50 ${weekend && !dayData ? 'bg-gray-50/50' : ''
                                            }`}
                                    >
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-start justify-between">
                                                <span
                                                    className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${today
                                                            ? 'bg-blue-500 text-white'
                                                            : weekend
                                                                ? 'text-red-500'
                                                                : 'text-gray-700'
                                                        }`}
                                                >
                                                    {day}
                                                </span>
                                            </div>
                                            {dayData && (
                                                <div className={`mt-auto px-2 py-1 rounded-md ${statusStyles.bg} flex items-center gap-1`}>
                                                    <statusStyles.icon className={`w-3 h-3 ${statusStyles.text}`} />
                                                    <span className={`text-xs font-medium ${statusStyles.text} truncate`}>
                                                        {statusStyles.label}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Monthly Summary */}
                        {calendarData?.summary && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <span className="text-gray-600">Present</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{calendarData.summary.present}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                                            <span className="text-gray-600">Work from Home</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{calendarData.summary.wfh}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                                            <span className="text-gray-600">Leave</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{calendarData.summary.leave}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                                            <span className="text-gray-600">Holiday</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{calendarData.summary.holiday}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                                            <span className="text-gray-600">Half Day</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{calendarData.summary.halfDay}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <span className="text-gray-600">Absent</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{calendarData.summary.absent}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Selected Day Details */}
                        {selectedDay && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Day Details</h3>
                                    <button
                                        onClick={() => setSelectedDay(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedDay.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${getStatusStyles(selectedDay.status).bg} ${getStatusStyles(selectedDay.status).text}`}>
                                            {(() => {
                                                const IconComponent = getStatusStyles(selectedDay.status).icon
                                                return <IconComponent className="w-4 h-4" />
                                            })()}
                                            <span className="font-medium">{getStatusStyles(selectedDay.status).label}</span>
                                        </div>
                                    </div>
                                    {selectedDay.details?.checkIn && (
                                        <div>
                                            <p className="text-sm text-gray-500">Check In</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(selectedDay.details.checkIn).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {selectedDay.details?.checkOut && (
                                        <div>
                                            <p className="text-sm text-gray-500">Check Out</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(selectedDay.details.checkOut).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {selectedDay.details?.workingHours && (
                                        <div>
                                            <p className="text-sm text-gray-500">Working Hours</p>
                                            <p className="font-medium text-gray-900">{selectedDay.details.workingHours.toFixed(1)} hours</p>
                                        </div>
                                    )}
                                    {selectedDay.details?.holiday && (
                                        <div>
                                            <p className="text-sm text-gray-500">Holiday</p>
                                            <p className="font-medium text-gray-900">{selectedDay.details.holiday.name}</p>
                                            {selectedDay.details.holiday.description && (
                                                <p className="text-sm text-gray-500 mt-1">{selectedDay.details.holiday.description}</p>
                                            )}
                                        </div>
                                    )}
                                    {selectedDay.details?.leaveType && (
                                        <div>
                                            <p className="text-sm text-gray-500">Leave Type</p>
                                            <p className="font-medium text-gray-900">{selectedDay.details.leaveType}</p>
                                        </div>
                                    )}
                                    {selectedDay.details?.reason && (
                                        <div>
                                            <p className="text-sm text-gray-500">Reason</p>
                                            <p className="font-medium text-gray-900">{selectedDay.details.reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Holidays in this month */}
                        {calendarData?.holidays && calendarData.holidays.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Holidays this Month</h3>
                                <div className="space-y-3">
                                    {calendarData.holidays.map(holiday => (
                                        <div key={holiday.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getHolidayTypeColor(holiday.type).split(' ')[0]}`}>
                                                {getHolidayTypeIcon(holiday.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{holiday.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(holiday.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium border ${getHolidayTypeColor(holiday.type)}`}>
                                                    {holiday.type}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Year View - All Holidays */
                <div className="space-y-6">
                    {/* Year Navigation */}
                    <div className="flex items-center justify-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <button
                            onClick={goToPreviousYear}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">{currentYear} Holidays</h2>
                        <button
                            onClick={goToNextYear}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                    <PartyPopper className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {calendarData?.allHolidays?.filter(h => h.type === 'PUBLIC').length || 0}
                                    </p>
                                    <p className="text-sm text-gray-500">Public Holidays</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                                    <Gift className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {calendarData?.allHolidays?.filter(h => h.type === 'RESTRICTED').length || 0}
                                    </p>
                                    <p className="text-sm text-gray-500">Restricted Holidays</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {calendarData?.allHolidays?.filter(h => h.type === 'OPTIONAL').length || 0}
                                    </p>
                                    <p className="text-sm text-gray-500">Optional Holidays</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Holidays by Month */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {monthNames.map((month, index) => {
                            const monthHolidays = holidaysByMonth[index] || []
                            if (monthHolidays.length === 0) return null

                            return (
                                <div key={month} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-900">{month}</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {monthHolidays.map(holiday => (
                                            <div key={holiday.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getHolidayTypeColor(holiday.type).split(' ')[0]}`}>
                                                    {getHolidayTypeIcon(holiday.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{holiday.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(holiday.date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium border ${getHolidayTypeColor(holiday.type)}`}>
                                                    {holiday.type}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
