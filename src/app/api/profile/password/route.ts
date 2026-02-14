import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST - Change password
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { currentPassword, newPassword, confirmPassword } = body

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({
                error: 'All fields are required'
            }, { status: 400 })
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({
                error: 'New passwords do not match'
            }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({
                error: 'New password must be at least 6 characters long'
            }, { status: 400 })
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password)
        if (!isValid) {
            return NextResponse.json({
                error: 'Current password is incorrect'
            }, { status: 400 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully'
        })
    } catch (error) {
        console.error('Error changing password:', error)
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
    }
}
