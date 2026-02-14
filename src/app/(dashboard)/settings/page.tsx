'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    MapPin,
    Wifi,
    Building2,
    Save,
    AlertCircle,
    CheckCircle,
    Plus,
    X,
    Loader2,
    Bell,
    Shield,
    Moon,
    Globe,
    Clock
} from 'lucide-react'

export default function SettingsPage() {
    const { data: session } = useSession()
    const userRole = session?.user?.role
    const isAdmin = ['ADMIN', 'CEO'].includes(userRole || '')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Admin settings
    const [officeLocation, setOfficeLocation] = useState({
        name: '',
        latitude: '',
        longitude: '',
        radius: ''
    })

    const [wifiIPs, setWifiIPs] = useState<string[]>([])
    const [newIP, setNewIP] = useState('')

    const [company, setCompany] = useState({
        name: '',
        timezone: 'Asia/Kolkata',
        workStartTime: '09:00',
        workEndTime: '18:00',
        checkinWindowStart: '09:00',
        checkinWindowEnd: '10:30',
        checkoutWindowStart: '18:30',
        checkoutWindowEnd: '20:30'
    })

    // User preferences
    const [userPreferences, setUserPreferences] = useState({
        emailNotifications: true,
        leaveNotifications: true,
        attendanceReminders: true,
        payrollNotifications: true,
        darkMode: false,
        language: 'en',
        twoFactorAuth: false
    })

    // Load settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                if (isAdmin) {
                    const response = await fetch('/api/settings')
                    const data = await response.json()

                    if (response.ok) {
                        setOfficeLocation(data.officeLocation)
                        setWifiIPs(data.wifiIPs || [])
                        setCompany(data.company)
                    } else {
                        setError('Failed to load settings from server.')
                    }
                }

                // Load user preferences from local storage for now
                const savedPrefs = localStorage.getItem('userPreferences')
                if (savedPrefs) {
                    setUserPreferences(JSON.parse(savedPrefs))
                }
            } catch (err) {
                console.error('Error loading settings:', err)
                setError('Connection error while loading settings.')
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [isAdmin])

    const handleAddIP = () => {
        if (newIP && !wifiIPs.includes(newIP)) {
            setWifiIPs([...wifiIPs, newIP])
            setNewIP('')
        }
    }

    const handleRemoveIP = (ip: string) => {
        setWifiIPs(wifiIPs.filter(item => item !== ip))
    }

    const handleSaveAdminSettings = async () => {
        setSaving(true)
        setError(null)

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    officeLocation,
                    wifiIPs,
                    company
                })
            })

            const data = await response.json()

            if (response.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            } else {
                setError(data.error || 'Failed to save settings')
            }
        } catch (err) {
            setError('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveUserPreferences = () => {
        setSaving(true)

        // Save to local storage
        localStorage.setItem('userPreferences', JSON.stringify(userPreferences))

        setSaved(true)
        setSaving(false)
        setTimeout(() => setSaved(false), 3000)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading settings...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl pb-12">
            {/* Page Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">
                        {isAdmin ? 'Configure system settings and preferences' : 'Manage your preferences and notifications'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleSaveAdminSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save All Changes
                    </button>
                )}
            </div>

            {/* Success Message */}
            {saved && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Settings saved successfully!</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* ==================== ADMIN SETTINGS ==================== */}
            {isAdmin && (
                <>
                    {/* Attendance Rules Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Attendance Time Windows</h2>
                                    <p className="text-sm text-gray-500">Define the allowed windows for check-in and check-out</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Check-in Window */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-900 border-l-4 border-emerald-500 pl-3">Check-in Window</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Start Time</label>
                                        <input
                                            type="time"
                                            value={company.checkinWindowStart}
                                            onChange={(e) => setCompany({ ...company, checkinWindowStart: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">End Time</label>
                                        <input
                                            type="time"
                                            value={company.checkinWindowEnd}
                                            onChange={(e) => setCompany({ ...company, checkinWindowEnd: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 italic">Employees will be blocked from checking in outside this window.</p>
                            </div>

                            {/* Check-out Window */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-900 border-l-4 border-rose-500 pl-3">Check-out Window</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Start Time</label>
                                        <input
                                            type="time"
                                            value={company.checkoutWindowStart}
                                            onChange={(e) => setCompany({ ...company, checkoutWindowStart: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">End Time</label>
                                        <input
                                            type="time"
                                            value={company.checkoutWindowEnd}
                                            onChange={(e) => setCompany({ ...company, checkoutWindowEnd: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 italic">Employees will be blocked from checking out outside this window.</p>
                            </div>
                        </div>
                    </div>

                    {/* Office Location & WiFi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Office Location */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Office Geo-fence</h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Office Name</label>
                                    <input
                                        type="text"
                                        value={officeLocation.name}
                                        onChange={(e) => setOfficeLocation({ ...officeLocation, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label>
                                        <input
                                            type="text"
                                            value={officeLocation.latitude}
                                            onChange={(e) => setOfficeLocation({ ...officeLocation, latitude: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label>
                                        <input
                                            type="text"
                                            value={officeLocation.longitude}
                                            onChange={(e) => setOfficeLocation({ ...officeLocation, longitude: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Radius (Meters)</label>
                                    <input
                                        type="number"
                                        value={officeLocation.radius}
                                        onChange={(e) => setOfficeLocation({ ...officeLocation, radius: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* WiFi Settings */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                        <Wifi className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Trusted WiFi</h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newIP}
                                        onChange={(e) => setNewIP(e.target.value)}
                                        placeholder="Add Static IP..."
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button onClick={handleAddIP} className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors">
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {wifiIPs.map((ip, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                            <span className="text-sm font-medium text-slate-700 font-mono">{ip}</span>
                                            <button onClick={() => handleRemoveIP(ip)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {wifiIPs.length === 0 && <p className="text-center py-4 text-slate-400 text-sm">No Trusted IPs yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* General Company Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Organization Settings</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Display Name</label>
                                <input
                                    type="text"
                                    value={company.name}
                                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone</label>
                                <select
                                    value={company.timezone}
                                    onChange={(e) => setCompany({ ...company, timezone: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none bg-white font-medium"
                                >
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                    <option value="UTC">UTC (Universal Time)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ==================== USER PREFERENCES ==================== */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-slate-50 px-3 text-sm font-medium text-gray-400">Personal Account Preferences</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Notifications Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-500" /> Notifications
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Email Alerts', key: 'emailNotifications' },
                            { label: 'Leave Updates', key: 'leaveNotifications' },
                            { label: 'Payroll Alerts', key: 'payrollNotifications' }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{item.label}</span>
                                <button
                                    onClick={() => setUserPreferences(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${userPreferences[item.key as keyof typeof userPreferences] ? 'bg-blue-500' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${userPreferences[item.key as keyof typeof userPreferences] ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appearance Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-500" /> Locale
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Preferred Language</label>
                            <select
                                value={userPreferences.language}
                                onChange={(e) => setUserPreferences(p => ({ ...p, language: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            >
                                <option value="en">English (US)</option>
                                <option value="hi">Hindi (IN)</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Dark Mode</span>
                            <button
                                onClick={() => setUserPreferences(p => ({ ...p, darkMode: !p.darkMode }))}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${userPreferences.darkMode ? 'bg-indigo-500' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${userPreferences.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-rose-500" /> Security
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">2-Factor Auth</span>
                            <button
                                onClick={() => setUserPreferences(p => ({ ...p, twoFactorAuth: !p.twoFactorAuth }))}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${userPreferences.twoFactorAuth ? 'bg-rose-500' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${userPreferences.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <button className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                            Change Master Password
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSaveUserPreferences}
                    className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
                >
                    <Save className="w-4 h-4" />
                    Save Preferences
                </button>
            </div>
        </div>
    )
}
