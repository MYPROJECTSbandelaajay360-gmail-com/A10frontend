'use client'

import { useState } from 'react'
import {
    Wallet,
    FileText,
    Download,
    Calendar,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    TrendingUp,
    Eye
} from 'lucide-react'

interface Payslip {
    id: string
    month: string
    year: number
    grossSalary: number
    totalDeductions: number
    netSalary: number
    status: 'PAID' | 'PENDING' | 'PROCESSING'
    paidDate?: string
}

export default function PayrollPage() {
    const [selectedYear, setSelectedYear] = useState(2026)

    const payslips: Payslip[] = [
        { id: '1', month: 'January', year: 2026, grossSalary: 85000, totalDeductions: 12500, netSalary: 72500, status: 'PAID', paidDate: '2026-01-31' },
        { id: '2', month: 'December', year: 2025, grossSalary: 85000, totalDeductions: 12500, netSalary: 72500, status: 'PAID', paidDate: '2025-12-31' },
        { id: '3', month: 'November', year: 2025, grossSalary: 82000, totalDeductions: 12000, netSalary: 70000, status: 'PAID', paidDate: '2025-11-30' },
        { id: '4', month: 'October', year: 2025, grossSalary: 82000, totalDeductions: 12000, netSalary: 70000, status: 'PAID', paidDate: '2025-10-31' },
    ]

    // Current salary breakdown
    const currentSalary = {
        basic: 45000,
        hra: 18000,
        specialAllowance: 15000,
        conveyance: 4000,
        medical: 3000,
        pf: 5400,
        professionalTax: 200,
        incomeTax: 6900
    }

    const totalEarnings = currentSalary.basic + currentSalary.hra + currentSalary.specialAllowance + currentSalary.conveyance + currentSalary.medical
    const totalDeductions = currentSalary.pf + currentSalary.professionalTax + currentSalary.incomeTax
    const netSalary = totalEarnings - totalDeductions

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-700'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700'
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
                <p className="text-gray-500 mt-1">View your salary structure and download payslips</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Net Salary</p>
                            <p className="text-3xl font-bold mt-1">{formatCurrency(netSalary)}</p>
                            <p className="text-green-100 text-xs mt-2">Monthly Take Home</p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Wallet className="w-7 h-7" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Gross Salary</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalEarnings)}</p>
                            <p className="text-gray-400 text-xs mt-2">Before Deductions</p>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Deductions</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalDeductions)}</p>
                            <p className="text-gray-400 text-xs mt-2">Tax + PF + PT</p>
                        </div>
                        <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-7 h-7 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Salary Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Basic Salary', value: currentSalary.basic },
                            { label: 'HRA', value: currentSalary.hra },
                            { label: 'Special Allowance', value: currentSalary.specialAllowance },
                            { label: 'Conveyance Allowance', value: currentSalary.conveyance },
                            { label: 'Medical Allowance', value: currentSalary.medical },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <span className="text-gray-600">{item.label}</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-3 bg-green-50 rounded-lg px-3 mt-2">
                            <span className="font-semibold text-green-700">Total Earnings</span>
                            <span className="font-bold text-green-700">{formatCurrency(totalEarnings)}</span>
                        </div>
                    </div>
                </div>

                {/* Deductions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Provident Fund (PF)', value: currentSalary.pf },
                            { label: 'Professional Tax', value: currentSalary.professionalTax },
                            { label: 'Income Tax (TDS)', value: currentSalary.incomeTax },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <span className="text-gray-600">{item.label}</span>
                                <span className="font-semibold text-red-600">-{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-3 bg-red-50 rounded-lg px-3 mt-2">
                            <span className="font-semibold text-red-700">Total Deductions</span>
                            <span className="font-bold text-red-700">-{formatCurrency(totalDeductions)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payslip History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Payslip History</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedYear(selectedYear - 1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-gray-900 w-16 text-center">{selectedYear}</span>
                        <button
                            onClick={() => setSelectedYear(selectedYear + 1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Gross</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Deductions</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Net Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payslips.map((payslip) => (
                                <tr key={payslip.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900">{payslip.month} {payslip.year}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{formatCurrency(payslip.grossSalary)}</td>
                                    <td className="px-6 py-4 text-red-600">-{formatCurrency(payslip.totalDeductions)}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(payslip.netSalary)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payslip.status)}`}>
                                            {payslip.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                                                <Download className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
