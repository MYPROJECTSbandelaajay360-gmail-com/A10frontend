'use client'

import React from 'react'

export default function VirtualOfficePage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Virtual Office</h1>
            <p className="text-gray-500 mt-2">Welcome to your virtual office environment.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder Content */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-lg mb-2">Meeting Rooms</h3>
                    <p className="text-sm text-gray-500">Join virtual meeting rooms with your team.</p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        Join Room
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-lg mb-2">Focus Pods</h3>
                    <p className="text-sm text-gray-500">Enter a quiet space for focused work.</p>
                    <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                        Enter Pod
                    </button>
                </div>
            </div>
        </div>
    )
}
