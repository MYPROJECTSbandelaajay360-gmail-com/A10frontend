import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch current user's profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find the user and their employee record
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                employee: {
                    include: {
                        department: true,
                        designation: true,
                        reportingManager: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Return profile data
        const profile = {
            id: user.id,
            email: user.email,
            role: user.role,
            employee: user.employee ? {
                id: user.employee.id,
                employeeId: user.employee.employeeId,
                firstName: user.employee.firstName,
                lastName: user.employee.lastName,
                phone: user.employee.phone,
                dateOfBirth: user.employee.dateOfBirth,
                gender: user.employee.gender,
                address: user.employee.address,
                city: user.employee.city,
                state: user.employee.state,
                country: user.employee.country,
                postalCode: user.employee.postalCode,
                emergencyContact: user.employee.emergencyContact,
                emergencyPhone: user.employee.emergencyPhone,
                department: user.employee.department?.name,
                designation: user.employee.designation?.name,
                reportingManager: user.employee.reportingManager
                    ? `${user.employee.reportingManager.firstName} ${user.employee.reportingManager.lastName}`
                    : null,
                joiningDate: user.employee.joiningDate,
                employmentType: user.employee.employmentType,
                profileImage: user.employee.profileImage
            } : null
        }

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Error fetching profile:', error)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
}

// PUT - Update current user's profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            address,
            city,
            state,
            country,
            postalCode,
            emergencyContact,
            emergencyPhone
        } = body

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { employee: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (!user.employee) {
            return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
        }

        // Update the employee record
        const updatedEmployee = await prisma.employee.update({
            where: { id: user.employee.id },
            data: {
                firstName: firstName || user.employee.firstName,
                lastName: lastName || user.employee.lastName,
                phone: phone ?? user.employee.phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : user.employee.dateOfBirth,
                gender: gender ?? user.employee.gender,
                address: address ?? user.employee.address,
                city: city ?? user.employee.city,
                state: state ?? user.employee.state,
                country: country ?? user.employee.country,
                postalCode: postalCode ?? user.employee.postalCode,
                emergencyContact: emergencyContact ?? user.employee.emergencyContact,
                emergencyPhone: emergencyPhone ?? user.employee.emergencyPhone
            },
            include: {
                department: true,
                designation: true,
                reportingManager: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            employee: {
                id: updatedEmployee.id,
                employeeId: updatedEmployee.employeeId,
                firstName: updatedEmployee.firstName,
                lastName: updatedEmployee.lastName,
                phone: updatedEmployee.phone,
                dateOfBirth: updatedEmployee.dateOfBirth,
                gender: updatedEmployee.gender,
                address: updatedEmployee.address,
                city: updatedEmployee.city,
                state: updatedEmployee.state,
                country: updatedEmployee.country,
                postalCode: updatedEmployee.postalCode,
                emergencyContact: updatedEmployee.emergencyContact,
                emergencyPhone: updatedEmployee.emergencyPhone,
                department: updatedEmployee.department?.name,
                designation: updatedEmployee.designation?.name,
                reportingManager: updatedEmployee.reportingManager
                    ? `${updatedEmployee.reportingManager.firstName} ${updatedEmployee.reportingManager.lastName}`
                    : null,
                joiningDate: updatedEmployee.joiningDate,
                profileImage: updatedEmployee.profileImage
            }
        })
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
