'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Calendar,
    DollarSign,
    UserCheck,
    Send,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface FormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    department: string
    designation: string
    employeeId: string
    salary: string
    joiningDate: string
    reportingManager: string
}

const departments = [
    'RPA',
    'AI',
    'Frontend',
    'HR',
    'Digital Marketing',
    'Finance',
    'Operations',
    'Sales'
]

const designations = [
    'CEO',
    'CTO',
    'HR Manager',
    'Manager',
    'Team Lead',
    'Senior Software Engineer',
    'Software Engineer',
    'Associate',
    'Intern'
]

export default function AddEmployeePage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        employeeId: '',
        salary: '',
        joiningDate: '',
        reportingManager: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    const userRole = session?.user?.role || 'EMPLOYEE'
    const canManage = ['HR', 'ADMIN', 'CEO'].includes(userRole)

    useEffect(() => {
        if (!canManage) {
            router.push('/dashboard/employees')
        }
    }, [canManage, router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitStatus('idle')
        setErrorMessage('')

        try {
            const response = await fetch('/api/employees/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    salary: formData.salary ? parseFloat(formData.salary) : null,
                    invitedBy: session?.user?.email || 'system',
                    invitedByName: session?.user?.name || 'System'
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send invite')
            }

            setSubmitStatus('success')

            // Reset form after success
            setTimeout(() => {
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    department: '',
                    designation: '',
                    employeeId: '',
                    salary: '',
                    joiningDate: '',
                    reportingManager: ''
                })
                setSubmitStatus('idle')
            }, 3000)

        } catch (error: any) {
            setSubmitStatus('error')
            setErrorMessage(error.message || 'Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!canManage) {
        return null
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/employees"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
                    <p className="text-gray-500 mt-1">
                        Send an invite to a new employee. They'll receive an email to set up their account.
                    </p>
                </div>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="font-medium text-green-800">Invite sent successfully!</p>
                        <p className="text-sm text-green-600">
                            The employee will receive an email with instructions to create their account.
                        </p>
                    </div>
                </div>
            )}

            {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                        <p className="font-medium text-red-800">Failed to send invite</p>
                        <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information Section */}
                    <div className="md:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Personal Information
                        </h2>
                    </div>

                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                placeholder="John"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                                placeholder="Doe"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="john.doe@company.com"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Invite will be sent to this email address
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+91 98765 43210"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Work Information Section */}
                    <div className="md:col-span-2 mt-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-600" />
                            Work Information
                        </h2>
                    </div>

                    {/* Department */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white"
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Designation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Designation <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white"
                            >
                                <option value="">Select Designation</option>
                                {designations.map(desig => (
                                    <option key={desig} value={desig}>{desig}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Employee ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee ID
                        </label>
                        <div className="relative">
                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleInputChange}
                                placeholder="Auto-generated if left empty"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Joining Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Joining Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                name="joiningDate"
                                value={formData.joiningDate}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Salary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Salary (Monthly)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleInputChange}
                                placeholder="50000"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Reporting Manager */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reporting Manager
                        </label>
                        <div className="relative">
                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="reportingManager"
                                value={formData.reportingManager}
                                onChange={handleInputChange}
                                placeholder="Manager's name"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex gap-3">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">How it works</p>
                            <ul className="text-sm text-blue-700 mt-1 space-y-1">
                                <li>• Employee will receive an email invitation</li>
                                <li>• They can click the link to create their password</li>
                                <li>• Once registered, they can login to access the system</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end gap-3">
                    <Link
                        href="/dashboard/employees"
                        className="px-6 py-2.5 text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending Invite...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Invite
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
