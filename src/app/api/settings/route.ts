import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = 'http://127.0.0.1:8001/api/settings'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!(session as any)?.accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const res = await fetch(BACKEND_URL, {
            headers: {
                'Authorization': `Bearer ${(session as any).accessToken}`
            }
        })

        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        console.error('Error fetching settings from backend:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        // Note: Role check is done on backend too, but good to have here
        if (!session || !['ADMIN', 'CEO'].includes(session.user?.role || '') || !(session as any)?.accessToken) {
            console.error('Frontend API Unauthorized: Missing session or accessToken', {
                hasSession: !!session,
                role: session?.user?.role,
                hasToken: !!(session as any)?.accessToken
            })
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        const res = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(session as any).accessToken}`
            },
            body: JSON.stringify(body)
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error('Backend API Error:', {
                status: res.status,
                statusText: res.statusText,
                body: errorText
            })
            try {
                return NextResponse.json(JSON.parse(errorText), { status: res.status })
            } catch (e) {
                return NextResponse.json({ error: errorText }, { status: res.status })
            }
        }

        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        console.error('Error saving settings to backend:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}
