'use client'

import { useState, useEffect, useRef } from 'react'
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
    Lock,
    Loader2,
    CheckCircle,
    AlertCircle,
    Upload,
    Trash2,
    Shield,
    Globe
} from 'lucide-react'

interface ProfileData {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    gender: string
    department: string
    designation: string
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
}

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        department: '',
        designation: '',
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

    const [originalData, setOriginalData] = useState<ProfileData | null>(null)

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordLoading, setPasswordLoading] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/profile')
            const data = await response.json()

            if (response.ok && data.employee) {
                const employee = data.employee
                const profile: ProfileData = {
                    firstName: employee.firstName || '',
                    lastName: employee.lastName || '',
                    email: data.email || '',
                    phone: employee.phone || '',
                    dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: employee.gender || '',
                    department: employee.department || '',
                    designation: employee.designation || '',
                    employeeId: employee.employeeId || '',
                    joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
                    reportingManager: employee.reportingManager || '',
                    address: employee.address || '',
                    city: employee.city || '',
                    state: employee.state || '',
                    country: employee.country || '',
                    postalCode: employee.postalCode || '',
                    emergencyContact: employee.emergencyContact || '',
                    emergencyPhone: employee.emergencyPhone || '',
                    profileImage: employee.profileImage || null,
                    employmentType: employee.employmentType || ''
                }
                setProfileData(profile)
                setOriginalData(profile)
            }
        } catch (error) {
            console.error('Error fetching profile: ', error)
            setMessage({ type: 'error', text: 'Failed to load profile data' })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setMessage(null)

            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    phone: profileData.phone,
                    dateOfBirth: profileData.dateOfBirth || null,
                    gender: profileData.gender,
                    address: profileData.address,
                    city: profileData.city,
                    state: profileData.state,
                    country: profileData.country,
                    postalCode: profileData.postalCode,
                    emergencyContact: profileData.emergencyContact,
                    emergencyPhone: profileData.emergencyPhone
                })
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                setOriginalData(profileData)
                setIsEditing(false)
                if (session) {
                    await updateSession({
                        ...session,
                        user: {
                            ...session.user,
                            name: `${profileData.firstName} ${profileData.lastName}`
                        }
                    })
                }
                setTimeout(() => setMessage(null), 3000)
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
            }
        } catch (error) {
            console.error('Error saving profile:', error)
            setMessage({ type: 'error', text: 'Failed to save profile' })
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        if (originalData) {
            setProfileData(originalData)
        }
        setIsEditing(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploadingImage(true)
            setMessage(null)

            const formData = new FormData()
            formData.append('image', file)

            const response = await fetch('/api/profile/image', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (response.ok) {
                setProfileData(prev => ({ ...prev, profileImage: data.imageUrl }))
                setMessage({ type: 'success', text: 'Profile picture updated!' })
                if (session) {
                    await updateSession({
                        ...session,
                        user: {
                            ...session.user,
                            image: data.imageUrl
                        }
                    })
                }
                setTimeout(() => setMessage(null), 3000)
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to upload image' })
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            setMessage({ type: 'error', text: 'Failed to upload image' })
        } finally {
            setUploadingImage(false)
        }
    }

    const handleRemoveImage = async () => {
        try {
            setUploadingImage(true)
            const response = await fetch('/api/profile/image', { method: 'DELETE' })
            const data = await response.json()

            if (response.ok) {
                setProfileData(prev => ({ ...prev, profileImage: null }))
                setMessage({ type: 'success', text: 'Profile picture removed' })
                setTimeout(() => setMessage(null), 3000)
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to remove image' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to remove image' })
        } finally {
            setUploadingImage(false)
        }
    }

    const handlePasswordChange = async () => {
        try {
            setPasswordLoading(true)
            setMessage(null)

            const response = await fetch('/api/profile/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData)
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully!' })
                setShowPasswordModal(false)
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                setTimeout(() => setMessage(null), 3000)
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to change password' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password' })
        } finally {
            setPasswordLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 text-lg">Loading your profile...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
                    <p className="text-gray-500 mt-1">Manage your personal information and account settings</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
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
                )}
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
                                    <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl shadow-black/5 ring-1 ring-gray-100">
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
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 flex gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
                                            title="Upload Photo"
                                        >
                                            {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                        </button>
                                        {profileData.profileImage && (
                                            <button
                                                onClick={handleRemoveImage}
                                                className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-red-50 text-red-500 transition-colors"
                                                title="Remove Photo"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                                            {session?.user?.role || 'EMPLOYEE'}
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
                                <span className="text-gray-600">Joined {profileData.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Action */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Security</h3>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors"
                        >
                            <Lock className="w-4 h-4" />
                            Change Password
                        </button>
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
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">Email Address</label>
                                <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium">
                                    {profileData.email}
                                </div>
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

                    {/* Emergency Contact */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-rose-50 rounded-lg">
                                <Shield className="w-5 h-5 text-rose-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Emergency Contact</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Contact Name"
                                value={profileData.emergencyContact}
                                onChange={(val) => setProfileData({ ...profileData, emergencyContact: val })}
                                isEditing={isEditing}
                            />
                            <InputField
                                label="Contact Phone"
                                value={profileData.emergencyPhone}
                                onChange={(val) => setProfileData({ ...profileData, emergencyPhone: val })}
                                isEditing={isEditing}
                                type="tel"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl scale-in-center animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false)
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                disabled={passwordLoading}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {passwordLoading ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                <p className="text-gray-900 font-medium py-2.5 border-b border-transparent">{value || 'Not specified'}</p>
            )}
        </div>
    )
}
