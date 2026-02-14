
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = 'http://127.0.0.1:8001/api/notifications/read-all'

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session as any)?.accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const res = await fetch(BACKEND_URL, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${(session as any).accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Empty body for read-all
        })

        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        console.error('Error marking all notifications as read:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
