
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addDays, startOfWeek, startOfMonth, subMonths } from 'date-fns'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const period = searchParams.get('period') // This Week, This Month, Last 3 Months

        const where: any = { isActive: true }

        // Filter by category
        if (category && category !== 'All Announcements') {
            where.category = category
        }

        // Filter by time period
        if (period && period !== 'All Time') {
            const now = new Date()
            let startDate: Date

            switch (period) {
                case 'This Week':
                    startDate = startOfWeek(now)
                    break
                case 'This Month':
                    startDate = startOfMonth(now)
                    break
                case 'Last 3 Months':
                    startDate = subMonths(now, 3)
                    break
                default:
                    startDate = subMonths(now, 12) // Default reasonable limit
            }
            where.createdAt = { gte: startDate }
        }

        const announcements = await prisma.announcement.findMany({
            where,
            include: {
                author: {
                    select: {
                        employee: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profileImage: true,
                                designation: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        },
                        role: true // Fallback if no employee record
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(announcements)
    } catch (error) {
        console.error('Error fetching announcements:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Check if user has permission to post (Admin, HR, Manager)
        const allowedRoles = ['ADMIN', 'HR', 'MANAGER']
        if (!allowedRoles.includes(session.user.role)) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const body = await req.json()
        const {
            title,
            content, // mapped from 'message' in frontend
            category,
            priority,
            expirationDate,
            attachmentName,
            attachmentUrl,
            attachmentSize
        } = body

        if (!title || !content || !category) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                category,
                priority: priority || null,
                expirationDate: expirationDate ? new Date(expirationDate) : null,
                attachmentName: attachmentName || null,
                attachmentUrl: attachmentUrl || null,
                attachmentSize: attachmentSize || null,
                authorId: session.user.id
            }
        })

        return NextResponse.json(announcement)
    } catch (error) {
        console.error('Error creating announcement:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
