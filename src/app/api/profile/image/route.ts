import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// POST - Upload profile image
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('image') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
            }, { status: 400 })
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({
                error: 'File too large. Maximum size is 5MB'
            }, { status: 400 })
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { employee: true }
        })

        if (!user || !user.employee) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
        await mkdir(uploadsDir, { recursive: true })

        // Generate unique filename
        const extension = file.name.split('.').pop()
        const filename = `${user.employee.employeeId}_${Date.now()}.${extension}`
        const filepath = path.join(uploadsDir, filename)

        // Write file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Update employee record with image path
        const imageUrl = `/uploads/profiles/${filename}`
        await prisma.employee.update({
            where: { id: user.employee.id },
            data: { profileImage: imageUrl }
        })

        return NextResponse.json({
            success: true,
            message: 'Profile image uploaded successfully',
            imageUrl
        })
    } catch (error) {
        console.error('Error uploading profile image:', error)
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }
}

// DELETE - Remove profile image
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { employee: true }
        })

        if (!user || !user.employee) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Remove profile image from database
        await prisma.employee.update({
            where: { id: user.employee.id },
            data: { profileImage: null }
        })

        return NextResponse.json({
            success: true,
            message: 'Profile image removed successfully'
        })
    } catch (error) {
        console.error('Error removing profile image:', error)
        return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 })
    }
}
