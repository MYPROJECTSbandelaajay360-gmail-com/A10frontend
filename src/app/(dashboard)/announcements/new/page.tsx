
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ChevronLeft,
    Calendar,
    AlertCircle,
    Clock,
    Type,
    AlignLeft,
    Bold,
    Italic,
    List,
    Link as LinkIcon,
    Image as ImageIcon,
    MoreHorizontal,
    X,
    UploadCloud,
    Loader2
} from 'lucide-react'

export default function NewAnnouncementPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        content: '',
        expirationDate: '',
        priority: '',
        attachmentName: '',
        attachmentSize: ''
    })
    const [error, setError] = useState('')

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.title || !formData.category || !formData.content) {
            setError('Please fill in all required fields.')
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    // If attachment logic is added later, handle it here. Current UI is just visual.
                    attachmentName: formData.attachmentName || null,
                    attachmentSize: formData.attachmentSize || null
                })
            })

            if (!res.ok) {
                if (res.status === 403) throw new Error('You do not have permission to post announcements.')
                throw new Error('Failed to create announcement')
            }

            router.push('/announcements')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-[1000px] mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/announcements"
                    className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New Announcement</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Link href="/announcements" className="hover:text-blue-600 transition-colors">Announcements</Link>
                        <span>/</span>
                        <span>New Announcement</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100">
                            Create Announcement
                        </h2>

                        {/* Title Input */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Type className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter the title of your announcement"
                                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Category Selection */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <select
                                    className="block w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="" disabled>Select Category</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Deadline">Deadline</option>
                                    <option value="General">General</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Rich Text Editor Simulation */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all bg-white">
                                {/* Toolbar */}
                                <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                                    <button type="button" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"><Bold className="w-4 h-4" /></button>
                                    <button type="button" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"><Italic className="w-4 h-4" /></button>
                                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                    <button type="button" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"><AlignLeft className="w-4 h-4" /></button>
                                    <button type="button" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"><List className="w-4 h-4" /></button>
                                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                    <button type="button" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"><LinkIcon className="w-4 h-4" /></button>
                                    <button type="button" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"><ImageIcon className="w-4 h-4" /></button>
                                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                    <button type="button" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors ml-auto"><MoreHorizontal className="w-4 h-4" /></button>
                                </div>
                                <textarea
                                    placeholder="Write your announcement message..."
                                    className="block w-full p-4 min-h-[200px] outline-none resize-y text-sm text-gray-700"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Date & Priority Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">
                                    Expiration Date <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="date"
                                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-600"
                                        value={formData.expirationDate}
                                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">
                                    Priority <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <select
                                        className="block w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="" disabled>Select priority</option>
                                        <option value="Low">Low</option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* File Upload (Optional visuals) */}
                        <div className="pt-2">
                            <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="p-3 bg-blue-50 text-blue-500 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-900">Click to upload or drag and drop</h4>
                                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or PDF (max. 800x400px)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Publishing...
                            </>
                        ) : 'Publish Announcement'}
                    </button>
                </div>
            </div>
        </div>
    )
}
