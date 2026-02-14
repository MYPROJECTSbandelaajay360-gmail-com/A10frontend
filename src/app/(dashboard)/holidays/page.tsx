'use client'

import { useState } from 'react'
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    PartyPopper,
    Gift,
    Briefcase
} from 'lucide-react'

interface Holiday {
    id: string
    name: string
    date: string
    day: string
    type: 'PUBLIC' | 'RESTRICTED' | 'OPTIONAL'
    description?: string
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function HolidaysPage() {
    const [selectedYear, setSelectedYear] = useState(2026)

    const holidays: Holiday[] = [
        { id: '1', name: 'Republic Day', date: '2026-01-26', day: 'Monday', type: 'PUBLIC', description: 'National holiday celebrating the adoption of the Constitution' },
        { id: '2', name: 'Maha Shivaratri', date: '2026-03-01', day: 'Sunday', type: 'RESTRICTED' },
        { id: '3', name: 'Holi', date: '2026-03-14', day: 'Saturday', type: 'PUBLIC', description: 'Festival of colors' },
        { id: '4', name: 'Good Friday', date: '2026-04-03', day: 'Friday', type: 'PUBLIC' },
        { id: '5', name: 'Tamil New Year', date: '2026-04-14', day: 'Tuesday', type: 'OPTIONAL' },
        { id: '6', name: 'Id-ul-Fitr', date: '2026-05-25', day: 'Monday', type: 'PUBLIC', description: 'End of Ramadan' },
        { id: '7', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'PUBLIC', description: 'National holiday celebrating independence' },
        { id: '8', name: 'Janmashtami', date: '2026-08-23', day: 'Sunday', type: 'OPTIONAL' },
        { id: '9', name: 'Ganesh Chaturthi', date: '2026-09-06', day: 'Sunday', type: 'RESTRICTED' },
        { id: '10', name: 'Dussehra', date: '2026-10-06', day: 'Tuesday', type: 'PUBLIC', description: 'Victory of good over evil' },
        { id: '11', name: 'Diwali', date: '2026-10-25', day: 'Sunday', type: 'PUBLIC', description: 'Festival of lights' },
        { id: '12', name: 'Christmas', date: '2026-12-25', day: 'Friday', type: 'PUBLIC', description: 'Christmas celebration' },
    ]

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'PUBLIC':
                return 'bg-green-100 text-green-700'
            case 'RESTRICTED':
                return 'bg-yellow-100 text-yellow-700'
            case 'OPTIONAL':
                return 'bg-blue-100 text-blue-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PUBLIC':
                return <PartyPopper className="w-5 h-5" />
            case 'RESTRICTED':
                return <Gift className="w-5 h-5" />
            case 'OPTIONAL':
                return <Briefcase className="w-5 h-5" />
            default:
                return <Calendar className="w-5 h-5" />
        }
    }

    // Group holidays by month
    const holidaysByMonth: Record<string, Holiday[]> = {}
    holidays.forEach(holiday => {
        const month = new Date(holiday.date).getMonth()
        const monthName = monthNames[month]
        if (!holidaysByMonth[monthName]) {
            holidaysByMonth[monthName] = []
        }
        holidaysByMonth[monthName].push(holiday)
    })

    const publicCount = holidays.filter(h => h.type === 'PUBLIC').length
    const restrictedCount = holidays.filter(h => h.type === 'RESTRICTED').length
    const optionalCount = holidays.filter(h => h.type === 'OPTIONAL').length

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Holiday Calendar</h1>
                    <p className="text-gray-500 mt-1">View all holidays for the year</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setSelectedYear(selectedYear - 1)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-gray-900 w-16 text-center">{selectedYear}</span>
                    <button
                        onClick={() => setSelectedYear(selectedYear + 1)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <PartyPopper className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{publicCount}</p>
                            <p className="text-sm text-gray-500">Public Holidays</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                            <Gift className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{restrictedCount}</p>
                            <p className="text-sm text-gray-500">Restricted Holidays</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{optionalCount}</p>
                            <p className="text-sm text-gray-500">Optional Holidays</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Public Holiday (Company-wide)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600">Restricted Holiday (Choose 2)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Optional Holiday</span>
                </div>
            </div>

            {/* Holiday List by Month */}
            <div className="space-y-6">
                {Object.entries(holidaysByMonth).map(([month, monthHolidays]) => (
                    <div key={month} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {monthHolidays.map(holiday => (
                                <div key={holiday.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(holiday.type).split(' ')[0]}`}>
                                            <span className={getTypeColor(holiday.type).split(' ')[1]}>
                                                {getTypeIcon(holiday.type)}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{holiday.name}</h4>
                                            {holiday.description && (
                                                <p className="text-sm text-gray-500">{holiday.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                                {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-sm text-gray-500">{holiday.day}</p>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(holiday.type)}`}>
                                            {holiday.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
