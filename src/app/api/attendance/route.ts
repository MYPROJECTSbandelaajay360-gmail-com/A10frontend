import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = 'http://127.0.0.1:8001/api/attendance'

// Helper to forward requests to backend
async function forwardToBackend(request: NextRequest, endpoint: string, method: string) {
    const session = await getServerSession(authOptions)
    if (!(session as any)?.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const url = new URL(request.url)
        const backendUrl = `${BACKEND_URL}${endpoint}${url.search}`

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${(session as any).accessToken}`,
            'Content-Type': 'application/json'
        }

        const options: RequestInit = {
            method,
            headers,
        }

        if (['POST', 'PATCH', 'PUT'].includes(method)) {
            const body = await request.json()
            options.body = JSON.stringify(body)
        }

        const res = await fetch(backendUrl, options)
        const data = await res.json()

        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        console.error(`Error proxying to backend ${method} ${endpoint}:`, error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    // Note: The frontend expects a specific format for some things, but the backend's GET / returns modern attendances.
    // However, the backend's GET / returns { data: [...] }.
    // Let's proxy it.
    return forwardToBackend(request, '/', 'GET')
}

export async function POST(request: NextRequest) {
    // The frontend sends { action: 'check-in', latitude, longitude }
    // The backend expects POST /check-in or PATCH /check-out
    const session = await getServerSession(authOptions)
    if (!(session as any)?.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { action, latitude, longitude } = body

        let endpoint = action === 'check-in' ? '/check-in' : '/check-out'
        let method = action === 'check-in' ? 'POST' : 'PATCH'

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${(session as any).accessToken}`,
            'Content-Type': 'application/json'
        }

        // Map frontend fields to backend fields
        const backendBody = {
            latitude,
            longitude,
            ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
        }

        const res = await fetch(`${BACKEND_URL}${endpoint}`, {
            method,
            headers,
            body: JSON.stringify(backendBody)
        })

        const result = await res.json()

        // Return in format expected by frontend
        if (res.ok) {
            return NextResponse.json({
                success: true,
                message: result.message,
                checkInTime: result.data?.checkInTime,
                checkOutTime: result.data?.checkOutTime,
                validationMethod: 'Backend Verified'
            })
        } else {
            return NextResponse.json({ error: result.error || 'Failed to process attendance' }, { status: res.status })
        }

    } catch (error) {
        console.error('Error proxying attendance POST:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
