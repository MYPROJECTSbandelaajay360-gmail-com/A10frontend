import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Settings from '@/models/Settings'

const DEFAULT_SETTINGS = {
    officeLocation: {
        name: '',
        latitude: '',
        longitude: '',
        radius: '100'
    },
    wifiIPs: [],
    company: {
        name: 'My Company',
        timezone: 'Asia/Kolkata',
        workStartTime: '09:00',
        workEndTime: '18:00',
        checkinWindowStart: '09:00',
        checkinWindowEnd: '10:30',
        checkoutWindowStart: '18:30',
        checkoutWindowEnd: '20:30'
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        let settings = await Settings.findOne({ key: 'global' })

        if (!settings) {
            // Return defaults if no settings saved yet
            return NextResponse.json(DEFAULT_SETTINGS)
        }

        return NextResponse.json({
            officeLocation: settings.officeLocation,
            wifiIPs: settings.wifiIPs,
            company: settings.company
        })
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['ADMIN', 'CEO'].includes(session.user?.role || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        await dbConnect()

        const settings = await Settings.findOneAndUpdate(
            { key: 'global' },
            {
                $set: {
                    officeLocation: body.officeLocation,
                    wifiIPs: body.wifiIPs || [],
                    company: body.company,
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true }
        )

        return NextResponse.json({
            officeLocation: settings.officeLocation,
            wifiIPs: settings.wifiIPs,
            company: settings.company,
            message: 'Settings saved successfully'
        })
    } catch (error) {
        console.error('Error saving settings:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}
