'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    User,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Calendar,
    MapPin,
    Edit2,
    Camera,
    Save,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    Trash2,
    Shield,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface ProfileData {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    gender: string
    department: string
    designation: string
    departmentId?: string
    designationId?: string
    employeeId: string
    joiningDate: string
    reportingManager: string
    address: string
    city: string
    state: string
    country: string
    postalCode: string
    emergencyContact: string
    emergencyPhone: string
    profileImage: string | null
    employmentType: string
    status?: string
}

export default function EmployeeDetailsPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { data: session } = useSession()

    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const userRole = session?.user?.role || 'EMPLOYEE'
    const canManage = ['HR', 'ADMIN', 'CEO'].includes(userRole)

    // Check if opened in edit mode
    useEffect(() => {
        if (searchParams.get('edit') === 'true' && canManage) {
            setIsEditing(true)
        }
    }, [searchParams, canManage])

    const [departments, setDepartments] = useState<string[]>([])
    const [designations, setDesignations] = useState<string[]>([])

    // Fetch departments and designations
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [deptsRes, desigsRes] = await Promise.all([
                    fetch('/api/departments'),
                    fetch('/api/designations')
                ])
                const deptsData = await deptsRes.json()
                const desigsData = await desigsRes.json()

                if (deptsData.departments) {
                    setDepartments(deptsData.departments.map((d: any) => d.name))
                }
                if (desigsData.designations) {
                    setDesignations(desigsData.designations.map((d: any) => d.name))
                }
            } catch (error) {
                console.error('Error fetching metadata:', error)
            }
        }
        fetchMetadata()
    }, [])

    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        department: '',
        designation: '',
        departmentId: '',
        designationId: '',
        employeeId: '',
        joiningDate: '',
        reportingManager: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        emergencyContact: '',
        emergencyPhone: '',
        profileImage: null,
        employmentType: ''
    })

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setMessage({ type: 'error', text: 'Image size should be less than 5MB' })
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, profileImage: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    const [originalData, setOriginalData] = useState<ProfileData | null>(null)

    useEffect(() => {
        if (params.id) {
            fetchEmployee(params.id as string)
        }
    }, [params.id])

    const fetchEmployee = async (id: string) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/employees/${id}`, {
                cache: 'no-store'
            })
            const data = await response.json()

            if (response.ok && data.employee) {
                const employee = data.employee
                const profile: ProfileData = {
                    firstName: employee.firstName || '',
                    lastName: employee.lastName || '',
                    email: employee.email || employee.user?.email || '',
                    phone: employee.phone || '',
                    dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: employee.gender || '',
                    department: employee.department?.name || '',
                    designation: employee.designation?.name || '',
                    departmentId: employee.departmentId || '',
                    designationId: employee.designationId || '',
                    employeeId: employee.employeeId || '',
                    joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
                    reportingManager: employee.reportingManager
                        ? `${employee.reportingManager.firstName} ${employee.reportingManager.lastName}`
                        : '',
                    address: employee.address || '',
                    city: employee.city || '',
                    state: employee.state || '',
                    country: employee.country || '',
                    postalCode: employee.postalCode || '',
                    emergencyContact: employee.emergencyContact || '',
                    emergencyPhone: employee.emergencyPhone || '',
                    profileImage: employee.profileImage || null,
                    employmentType: employee.employmentType || '',
                    status: employee.user?.status || 'ACTIVE'
                }
                setProfileData(profile)
                setOriginalData(profile)
            } else {
                setMessage({ type: 'error', text: 'Failed to load employee data' })
            }
        } catch (error) {
            console.error('Error fetching employee: ', error)
            setMessage({ type: 'error', text: 'Failed to load employee data' })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setMessage(null)

            // Create a clean payload removing fields that shouldn't/can't be updated directly via this endpoint
            const {
                reportingManager,
                status,
                departmentId,
                designationId,
                ...payload
            } = profileData

            const response = await fetch(`/api/employees/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Employee profile updated successfully!' })
                setOriginalData(profileData)
                setIsEditing(false)
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
            }
        } catch (error: any) {
            console.error('Error saving profile:', error)
            setMessage({ type: 'error', text: `Error saving profile: ${error.message || 'Unknown error'}` })
        } finally {
            setSaving(false)
        }
    }




    const handleCancel = () => {
        if (originalData) {
            setProfileData(originalData)
        }
        setIsEditing(false)
        router.replace(`/employees/${params.id}`)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 text-lg">Loading employee details...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex items-center gap-4">
                <Link
                    href="/employees"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Details</h1>
                    <p className="text-gray-500 mt-1">View and manage employee information</p>
                </div>
                {!isEditing && canManage ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : isEditing ? (
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ) : null}
            </div>

            {/* Message Banner */}
            {message && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    } animate-in fade-in slide-in-from-top-2`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[size:20px_20px]"></div>
                        </div>
                        <div className="px-6 pb-6 pt-0 relative">
                            <div className="flex flex-col items-center -mt-16">


                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl shadow-black/5 ring-1 ring-gray-100 relative">
                                        {profileData.profileImage ? (
                                            <img
                                                src={profileData.profileImage}
                                                alt="Profile"
                                                className="w-full h-full rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User className="w-12 h-12" />
                                            </div>
                                        )}

                                        {isEditing && (
                                            <>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
                                                    title="Upload Photo"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <h2 className="text-xl font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h2>
                                    <p className="text-blue-600 font-medium text-sm">{profileData.designation}</p>
                                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                                            {profileData.employeeId}
                                        </span>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${profileData.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                            profileData.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {profileData.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 truncate">{profileData.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{profileData.phone || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{profileData.department}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Joined {profileData.joiningDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputField
                                    label="Email Address"
                                    value={profileData.email}
                                    onChange={(val) => setProfileData({ ...profileData, email: val })}
                                    isEditing={isEditing}
                                />
                            </div>
                            <InputField
                                label="First Name"
                                value={profileData.firstName}
                                onChange={(val) => setProfileData({ ...profileData, firstName: val })}
                                isEditing={isEditing}
                            />
                            <InputField
                                label="Last Name"
                                value={profileData.lastName}
                                onChange={(val) => setProfileData({ ...profileData, lastName: val })}
                                isEditing={isEditing}
                            />
                            <InputField
                                label="Date of Birth"
                                value={profileData.dateOfBirth}
                                onChange={(val) => setProfileData({ ...profileData, dateOfBirth: val })}
                                isEditing={isEditing}
                                type="date"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">Gender</label>
                                {isEditing ? (
                                    <select
                                        value={profileData.gender}
                                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-900 font-medium py-2.5 border-b border-transparent">{profileData.gender || 'Not specified'}</p>
                                )}
                            </div>
                            <InputField
                                label="Phone Number"
                                value={profileData.phone}
                                onChange={(val) => setProfileData({ ...profileData, phone: val })}
                                isEditing={isEditing}
                                type="tel"
                            />
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Address Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputField
                                    label="Street Address"
                                    value={profileData.address}
                                    onChange={(val) => setProfileData({ ...profileData, address: val })}
                                    isEditing={isEditing}
                                />
                            </div>
                            <InputField
                                label="City"
                                value={profileData.city}
                                onChange={(val) => setProfileData({ ...profileData, city: val })}
                                isEditing={isEditing}
                            />
                            <InputField
                                label="State/Province"
                                value={profileData.state}
                                onChange={(val) => setProfileData({ ...profileData, state: val })}
                                isEditing={isEditing}
                            />
                            <InputField
                                label="Country"
                                value={profileData.country}
                                onChange={(val) => setProfileData({ ...profileData, country: val })}
                                isEditing={isEditing}
                            />
                            <InputField
                                label="Postal Code"
                                value={profileData.postalCode}
                                onChange={(val) => setProfileData({ ...profileData, postalCode: val })}
                                isEditing={isEditing}
                            />
                        </div>
                    </div>

                    {/* Work Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Briefcase className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Work Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">Department</label>
                                {isEditing ? (
                                    <select
                                        value={profileData.department}
                                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-gray-900 font-medium py-2.5 border-b border-transparent">{profileData.department || 'Not specified'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">Designation</label>
                                {isEditing ? (
                                    <select
                                        value={profileData.designation}
                                        onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
                                    >
                                        <option value="">Select Designation</option>
                                        {designations.map(desig => (
                                            <option key={desig} value={desig}>{desig}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-gray-900 font-medium py-2.5 border-b border-transparent">{profileData.designation || 'Not specified'}</p>
                                )}
                            </div>
                            <InputField
                                label="Joining Date"
                                value={profileData.joiningDate}
                                onChange={(val) => setProfileData({ ...profileData, joiningDate: val })}
                                isEditing={isEditing}
                                type="date"
                            />
                            <InputField
                                label="Reporting Manager"
                                value={profileData.reportingManager}
                                onChange={(val) => setProfileData({ ...profileData, reportingManager: val })}
                                isEditing={isEditing}
                            />
                            {/* Status Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">Status</label>
                                {isEditing ? (
                                    <select
                                        value={profileData.status}
                                        onChange={(e) => setProfileData({ ...profileData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="SUSPENDED">Suspended</option>
                                    </select>
                                ) : (
                                    <div className="py-2.5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${profileData.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                            profileData.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {profileData.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InputField({ label, value, onChange, isEditing, type = "text" }: { label: string, value: string, onChange: (val: string) => void, isEditing: boolean, type?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">{label}</label>
            {isEditing ? (
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder={`Enter ${label}`}
                />
            ) : (
                <p className="text-gray-900 font-medium py-2.5 border-b border-white hover:border-gray-100 transition-colors">{value || 'Not specified'}</p>
            )}
        </div>
    )
}
