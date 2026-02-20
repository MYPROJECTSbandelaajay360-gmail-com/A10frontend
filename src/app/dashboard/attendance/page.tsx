'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import {
    Clock,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Timer,
    LogIn,
    LogOut as LogOutIcon,
    Wifi,
    WifiOff,
    Loader2,
    RefreshCw,
    TrendingUp,
    AlertTriangle,
    Coffee,
    Zap,
    Activity,
    Home,
    Building2,
    CalendarCheck
} from 'lucide-react'
import LateCheckInModal from '@/components/attendance/LateCheckInModal'

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface AttendanceRecord {
    id: string
    date: string
    checkInTime?: string
    checkOutTime?: string
    status: string
    workingHours?: number
}

interface AttendanceStats {
    presentDays: number
    absentDays: number
    leaveDays: number
    totalHours: number
}

interface TodayStatus {
    isCheckedIn: boolean
    isCheckedOut: boolean
    checkInTime?: string
    checkOutTime?: string
}

interface OfficeConfig {
    name: string
    latitude: number
    longitude: number
    radius: number
}

interface TimeWindows {
    checkInStart?: string
    checkInEnd?: string
    checkOutStart?: string
    checkOutEnd?: string
}

// Circular Progress Component
function CircularProgress({ percentage, size = 120, strokeWidth = 10 }: { percentage: number; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference
    const color = percentage >= 90 ? '#10b981' : percentage >= 75 ? '#f59e0b' : '#ef4444'

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="#f1f5f9" strokeWidth={strokeWidth} fill="none"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={color} strokeWidth={strokeWidth} fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Attendance</span>
            </div>
        </div>
    )
}

export default function AttendancePage() {
    const { data: session } = useSession()
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [loading, setLoading] = useState(false)
    const [fetchingData, setFetchingData] = useState(true)
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
    const [stats, setStats] = useState<AttendanceStats>({ presentDays: 0, absentDays: 0, leaveDays: 0, totalHours: 0 })
    const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null)
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [locationStatus, setLocationStatus] = useState<'checking' | 'valid' | 'invalid' | 'unknown'>('unknown')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [officeConfig, setOfficeConfig] = useState<OfficeConfig>({
        name: 'Hyderabad Office',
        latitude: 17.4438,
        longitude: 78.3831,
        radius: 500
    })
    const [timeWindows, setTimeWindows] = useState<TimeWindows>({})
    const [pendingCheckOuts, setPendingCheckOuts] = useState<any[]>([])
    const [showPendingWarning, setShowPendingWarning] = useState(true)
    const [mounted, setMounted] = useState(false)

    // WFH State
    const [workMode, setWorkMode] = useState<'OFFICE' | 'WFH'>('OFFICE')
    const [isWFHModalOpen, setIsWFHModalOpen] = useState(false)
    const [wfhReason, setWfhReason] = useState('')
    const [wfhDate, setWfhDate] = useState(new Date().toISOString().split('T')[0])
    const [isSubmittingWFH, setIsSubmittingWFH] = useState(false)
    const [myWFHRequests, setMyWFHRequests] = useState<any[]>([])

    // Late Check-in State
    const [isLateModalOpen, setIsLateModalOpen] = useState(false)
    const [pendingLateData, setPendingLateData] = useState<{ latitude: number; longitude: number } | null>(null)

    // Fetch WFH requests
    const fetchWFHRequests = useCallback(async () => {
        try {
            const res = await fetch('/api/wfh/my-requests')
            if (res.ok) {
                const data = await res.json()
                setMyWFHRequests(data)

                // Check if today is approved WFH
                const todayStr = new Date().toISOString().split('T')[0]
                const todayRequest = data.find((r: any) =>
                    new Date(r.date).toISOString().split('T')[0] === todayStr && r.status === 'APPROVED'
                )
                if (todayRequest) {
                    setWorkMode('WFH')
                }
            }
        } catch (error) {
            console.error('Failed to fetch WFH requests', error)
        }
    }, [])

    useEffect(() => {
        if (session?.user) {
            fetchWFHRequests()
        }
    }, [session, fetchWFHRequests])

    const handleWFHSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmittingWFH(true)
        setMessage(null)
        try {
            const res = await fetch('/api/wfh/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: wfhDate, reason: wfhReason })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: 'WFH Request submitted successfully' })
                setIsWFHModalOpen(false)
                setWfhReason('')
                fetchWFHRequests()
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to submit request' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to submit request' })
        } finally {
            setIsSubmittingWFH(false)
        }
    }

    // Mount animation trigger
    useEffect(() => {
        setMounted(true)
    }, [])

    // Update current time every second
    useEffect(() => {
        setCurrentTime(new Date())
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Live working hours calculation
    const liveWorkingTime = useMemo(() => {
        if (!currentTime || !todayStatus?.isCheckedIn || !todayStatus?.checkInTime) return null
        if (todayStatus.isCheckedOut) return null

        const checkIn = new Date(todayStatus.checkInTime)
        const diffMs = currentTime.getTime() - checkIn.getTime()
        const hours = Math.floor(diffMs / (1000 * 60 * 60))
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

        return { hours, minutes, seconds, total: diffMs / (1000 * 60 * 60) }
    }, [currentTime, todayStatus])

    // Attendance percentage
    const attendancePercentage = useMemo(() => {
        const totalTracked = stats.presentDays + stats.absentDays
        if (totalTracked === 0) return 0
        return (stats.presentDays / totalTracked) * 100
    }, [stats])

    // Calculate distance between two points
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3
        const φ1 = lat1 * Math.PI / 180
        const φ2 = lat2 * Math.PI / 180
        const Δφ = (lat2 - lat1) * Math.PI / 180
        const Δλ = (lon2 - lon1) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c
    }

    // Fetch attendance data
    const fetchAttendance = useCallback(async () => {
        try {
            setFetchingData(true)
            const month = currentMonth.getMonth() + 1
            const year = currentMonth.getFullYear()

            const response = await fetch(`/api/attendance?month=${month}&year=${year}`)
            const data = await response.json()

            if (response.ok) {
                setAttendanceData(data.records || [])
                setStats(data.stats || { presentDays: 0, absentDays: 0, leaveDays: 0, totalHours: 0 })
                setTodayStatus(data.todayStatus)

                if (data.officeConfig) {
                    setOfficeConfig(data.officeConfig)
                }
                if (data.timeWindows) {
                    setTimeWindows(data.timeWindows)
                }
                if (data.pendingCheckOuts) {
                    setPendingCheckOuts(data.pendingCheckOuts)
                }
            }
        } catch (error) {
            console.error('Error fetching attendance:', error)
        } finally {
            setFetchingData(false)
        }
    }, [currentMonth])

    // Get user's location
    useEffect(() => {
        if (!officeConfig || !officeConfig.latitude || !officeConfig.longitude) return;

        if (navigator.geolocation) {
            setLocationStatus('checking')
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setLocation({ latitude, longitude })

                    const distance = calculateDistance(latitude, longitude, officeConfig.latitude, officeConfig.longitude)
                    // Strict check: if distance > radius, it is INVALID
                    if (distance <= officeConfig.radius) {
                        setLocationStatus('valid')
                        setLocationError(null)
                    } else {
                        setLocationStatus('invalid')
                        setLocationError(`You are ${Math.round(distance)}m away from office (max ${officeConfig.radius}m)`)
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    setLocationStatus('invalid') // Default to invalid if we can't get location, let backend IP check handle it
                    setLocationError('Location access denied or failed.')
                }
            )
        } else {
            setLocationStatus('unknown')
            setLocationError('Geolocation not supported.')
        }
    }, [officeConfig])

    useEffect(() => {
        fetchAttendance()
    }, [fetchAttendance])

    const handleCheckInAttempt = async () => {
        // Check if late
        if (timeWindows.checkInEnd && currentTime) {
            // Robust time parsing
            const match = timeWindows.checkInEnd.match(/(\d+):(\d+)\s*(AM|PM)/i)
            if (match) {
                const [_, h, m, period] = match
                let endHour = parseInt(h)
                const endMinute = parseInt(m)

                if (period.toUpperCase() === 'PM' && endHour !== 12) endHour += 12
                if (period.toUpperCase() === 'AM' && endHour === 12) endHour = 0

                let checkInEnd = new Date(currentTime)
                checkInEnd.setHours(endHour, endMinute, 0, 0)

                // If current time is AFTER checkInEnd, it is late
                if (currentTime > checkInEnd) {
                    if (location) {
                        setPendingLateData({ latitude: location.latitude, longitude: location.longitude })
                    }
                    setIsLateModalOpen(true)
                    return
                }
            }
        }

        // Not late, proceed with normal check-in
        await performCheckIn({})
    }

    const performCheckIn = async (extraData: { lateReason?: string; hasProject?: boolean; projectName?: string }) => {
        setLoading(true)
        setMessage(null)
        try {
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'check-in',
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    workMode, // 'OFFICE' | 'WFH'
                    ...extraData
                })
            })
            const data = await response.json()
            if (response.ok) {
                setMessage({ type: 'success', text: data.message })
                setTodayStatus({ isCheckedIn: true, isCheckedOut: false, checkInTime: data.checkInTime })
                setIsLateModalOpen(false)
                fetchAttendance()
            } else {
                setMessage({ type: 'error', text: data.error })
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to check in. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const handleCheckIn = () => handleCheckInAttempt()

    const handleCheckOut = async () => {
        setLoading(true)
        setMessage(null)
        try {
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'check-out',
                    latitude: location?.latitude,
                    longitude: location?.longitude
                })
            })
            const data = await response.json()
            if (response.ok) {
                setMessage({ type: 'success', text: data.message })
                setTodayStatus(prev => prev ? { ...prev, isCheckedOut: true, checkOutTime: data.checkOutTime } : null)
                fetchAttendance()
            } else {
                setMessage({ type: 'error', text: data.error })
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to check out. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'ABSENT': return 'bg-red-50 text-red-700 border-red-200'
            case 'HALF_DAY': return 'bg-amber-50 text-amber-700 border-amber-200'
            case 'ON_LEAVE': return 'bg-sky-50 text-sky-700 border-sky-200'
            case 'HOLIDAY': return 'bg-violet-50 text-violet-700 border-violet-200'
            case 'WEEKEND': return 'bg-slate-50 text-slate-500 border-slate-200'
            default: return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'bg-emerald-500'
            case 'ABSENT': return 'bg-red-500'
            case 'HALF_DAY': return 'bg-amber-500'
            case 'ON_LEAVE': return 'bg-sky-500'
            case 'HOLIDAY': return 'bg-violet-500'
            case 'WEEKEND': return 'bg-slate-400'
            default: return 'bg-gray-400'
        }
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const isCheckedIn = todayStatus?.isCheckedIn && !todayStatus?.isCheckedOut
    const isFullyDone = todayStatus?.isCheckedIn && todayStatus?.isCheckedOut
    const isToday = (dateStr: string) => {
        const d = new Date(dateStr)
        const today = new Date()
        return d.toDateString() === today.toDateString()
    }

    const pad = (n: number) => n.toString().padStart(2, '0')

    return (
        <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance</h1>
                    <p className="text-gray-500 mt-0.5 text-sm">Track your daily attendance and working hours</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsWFHModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-all"
                    >
                        <Home className="w-3 h-3" />
                        Request WFH
                    </button>
                    {/* Location/Work Mode Badge */}
                    {workMode === 'WFH' ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Home className="w-3 h-3" />
                            WFH Mode
                        </div>
                    ) : (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${locationStatus === 'valid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : locationStatus === 'invalid'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : locationStatus === 'checking'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                            {locationStatus === 'valid' ? <Wifi className="w-3 h-3" /> :
                                locationStatus === 'invalid' ? <WifiOff className="w-3 h-3" /> :
                                    locationStatus === 'checking' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                                        <MapPin className="w-3 h-3" />}
                            {locationStatus === 'valid' ? 'In Office' :
                                locationStatus === 'invalid' ? 'Outside Office' :
                                    locationStatus === 'checking' ? 'Locating...' : officeConfig.name}
                        </div>
                    )}
                    <button
                        onClick={fetchAttendance}
                        disabled={fetchingData}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all hover:shadow-sm"
                    >
                        <RefreshCw className={`w-3 h-3 ${fetchingData ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border animate-in slide-in-from-top-2 duration-300 ${message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span className="font-medium text-sm">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-auto text-current opacity-40 hover:opacity-100 text-lg leading-none">×</button>
                </div>
            )}

            {/* Pending Check-Out Warning */}
            {pendingCheckOuts.length > 0 && showPendingWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-amber-800 text-sm">Incomplete Attendance Records</h3>
                        <p className="text-xs text-amber-700 mt-1">
                            You have {pendingCheckOuts.length} day(s) without check-out.
                            Contact HR to regularize: <span className="font-medium">{pendingCheckOuts.map(r => new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(', ')}</span>
                        </p>
                    </div>
                    <button onClick={() => setShowPendingWarning(false)} className="text-amber-600 hover:text-amber-800 text-lg leading-none shrink-0">×</button>
                </div>
            )}

            {/* Time Constraints Banner */}
            {timeWindows.checkInStart && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-sky-700">
                    <Clock className="w-4 h-4 shrink-0" />
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                        <span>Check-in: <span className="font-semibold">{timeWindows.checkInStart} – {timeWindows.checkInEnd}</span></span>
                        <span>Check-out: <span className="font-semibold">{timeWindows.checkOutStart} – {timeWindows.checkOutEnd}</span></span>
                    </div>
                </div>
            )}

            {/* ═══════════════ HERO CHECK-IN CARD ═══════════════ */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm">
                {/* Subtle gradient accent at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                <div className="p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                        {/* Left: Clock + Status */}
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                <Clock className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-gray-900 tabular-nums tracking-tight">
                                    {currentTime ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {currentTime ? currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Loading...'}
                                </p>

                                {/* Today's timestamps */}
                                {todayStatus?.isCheckedIn && (
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-emerald-200">
                                            <LogIn className="w-3 h-3" />
                                            In: {formatTime(todayStatus.checkInTime)}
                                        </div>
                                        {todayStatus.isCheckedOut && (
                                            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-rose-200">
                                                <LogOutIcon className="w-3 h-3" />
                                                Out: {formatTime(todayStatus.checkOutTime)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Center: Live Timer (when working) */}
                        {liveWorkingTime && (
                            <div className="flex flex-col items-center gap-1 px-6 py-3 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200/60">
                                <div className="flex items-center gap-1.5 text-blue-600">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-widest">Currently Working</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 tabular-nums font-mono">
                                    {pad(liveWorkingTime.hours)}:{pad(liveWorkingTime.minutes)}:{pad(liveWorkingTime.seconds)}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Hours : Minutes : Seconds</p>
                            </div>
                        )}

                        {isFullyDone && (
                            <div className="flex flex-col items-center gap-1.5 px-6 py-3 bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-2xl border border-emerald-200/60">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                                <p className="text-sm font-semibold text-emerald-700">Shift Complete</p>
                                <p className="text-xs text-emerald-600">
                                    {attendanceData.find(r => isToday(r.date))?.workingHours?.toFixed(1) || '—'}h worked
                                </p>
                            </div>
                        )}

                        {/* Right: Check In/Out Button */}
                        <div className="flex flex-col items-center gap-2">
                            {/* Work Mode Toggle (Only if NOT checked in) */}
                            {!isCheckedIn && !isFullyDone && (
                                <div className="flex p-1 bg-gray-100 rounded-lg mb-2">
                                    <button
                                        onClick={() => setWorkMode('OFFICE')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${workMode === 'OFFICE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Building2 className="w-3.5 h-3.5" /> Office
                                    </button>
                                    <button
                                        onClick={() => setWorkMode('WFH')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${workMode === 'WFH' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Home className="w-3.5 h-3.5" /> WFH
                                    </button>
                                </div>
                            )}

                            {!isFullyDone && (
                                <>
                                    {!isCheckedIn ? (
                                        <button
                                            onClick={handleCheckIn}
                                            disabled={loading}
                                            className="group relative flex items-center gap-2.5 px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="relative flex items-center gap-2.5">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                                                {loading ? 'Checking In...' : 'Check In'}
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleCheckOut}
                                            disabled={loading}
                                            className="group relative flex items-center gap-2.5 px-10 py-3.5 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="relative flex items-center gap-2.5">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOutIcon className="w-5 h-5" />}
                                                {loading ? 'Checking Out...' : 'Check Out'}
                                            </span>
                                        </button>
                                    )}
                                </>
                            )}

                            {!isCheckedIn && !isFullyDone && !todayStatus?.isCheckedIn && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Coffee className="w-3 h-3" /> Not checked in yet
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location Error Strip */}
                {locationError && locationStatus === 'invalid' && (
                    <div className="px-6 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {locationError}
                    </div>
                )}
            </div>

            {/* ═══════════════ STATS SECTION ═══════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Circular Progress */}
                <div className={`col-span-2 lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col items-center justify-center transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <CircularProgress percentage={attendancePercentage} size={85} strokeWidth={8} />
                    <p className="text-[10px] text-gray-500 mt-1 font-medium">
                        {stats.presentDays}/{stats.presentDays + stats.absentDays} days
                    </p>
                </div>

                {/* Present Days */}
                <div className={`group bg-white rounded-xl border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center border border-emerald-200/50">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 leading-none">{stats.presentDays}</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Present</p>
                        </div>
                    </div>
                </div>

                {/* Absent Days */}
                <div className={`group bg-white rounded-xl border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center border border-red-200/50">
                            <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 leading-none">{stats.absentDays}</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Absent</p>
                        </div>
                    </div>
                </div>

                {/* Leave Days */}
                <div className={`group bg-white rounded-xl border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 delay-250 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center border border-sky-200/50">
                            <Calendar className="w-4 h-4 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 leading-none">{stats.leaveDays}</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">On Leave</p>
                        </div>
                    </div>
                </div>

                {/* Total Hours */}
                <div className={`group bg-white rounded-xl border border-gray-100 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center border border-violet-200/50">
                            <Activity className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 leading-none">{stats.totalHours.toFixed(1)}<span className="text-[10px] font-medium text-gray-400 ml-0.5">h</span></p>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Total Hours</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ ATTENDANCE HISTORY TABLE ═══════════════ */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* Month Navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-gray-900">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{attendanceData.length} records</p>
                    </div>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/80">
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Check In</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Check Out</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hours</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {fetchingData ? (
                                // Skeleton loader
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                                        <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
                                    </tr>
                                ))
                            ) : attendanceData.length > 0 ? (
                                attendanceData.map((record) => {
                                    const today = isToday(record.date)
                                    return (
                                        <tr
                                            key={record.id}
                                            className={`group transition-colors ${today
                                                ? 'bg-blue-50/40 hover:bg-blue-50/60'
                                                : 'hover:bg-slate-50/60'
                                                }`}
                                        >
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    {today && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                                    <span className={`text-sm font-medium ${today ? 'text-blue-900' : 'text-gray-900'}`}>
                                                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    {today && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">TODAY</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-gray-600 tabular-nums">{formatTime(record.checkInTime)}</td>
                                            <td className="px-6 py-3.5 text-sm text-gray-600 tabular-nums">
                                                {record.checkOutTime ? formatTime(record.checkOutTime) : (
                                                    record.checkInTime && !record.checkOutTime ? (
                                                        <span className="text-amber-600 text-xs font-medium flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                            Pending
                                                        </span>
                                                    ) : '—'
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-gray-600 tabular-nums">
                                                {record.workingHours ? `${record.workingHours.toFixed(1)}h` : '—'}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(record.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(record.status)}`} />
                                                    {record.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                                <Calendar className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="font-semibold text-gray-700">No attendance records</p>
                                            <p className="text-sm text-gray-400 mt-1">Start checking in to see your attendance history</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* WFH Request Modal */}
            {isWFHModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Home className="w-4 h-4 text-blue-600" />
                                Request Work From Home
                            </h3>
                            <button
                                onClick={() => setIsWFHModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleWFHSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                                <input
                                    type="date"
                                    required
                                    value={wfhDate}
                                    onChange={(e) => setWfhDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    value={wfhReason}
                                    onChange={(e) => setWfhReason(e.target.value)}
                                    placeholder="Why do you need to work from home?"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsWFHModalOpen(false)}
                                    disabled={isSubmittingWFH}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingWFH}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmittingWFH ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Late Check-In Modal */}
            <LateCheckInModal
                isOpen={isLateModalOpen}
                onClose={() => setIsLateModalOpen(false)}
                onSubmit={(data) => performCheckIn(data)}
                isSubmitting={loading}
                lateThresholdTime={timeWindows.checkInEnd || '10:00 AM'}
            />
        </div>
    )
}
