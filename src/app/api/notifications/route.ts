
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = 'http://127.0.0.1:8001/api/notifications'

export async function GET(request: NextRequest) {
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
        console.error('Error fetching notifications:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session as any)?.accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const res = await fetch(BACKEND_URL, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${(session as any).accessToken}`
            }
        })

        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        console.error('Error clearing notifications:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
