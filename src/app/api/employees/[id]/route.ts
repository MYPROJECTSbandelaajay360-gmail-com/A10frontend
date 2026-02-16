import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!['HR', 'ADMIN', 'CEO'].includes(session?.user?.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const employee = await prisma.employee.findUnique({
            where: { id: params.id },
            include: {
                department: true,
                designation: true,
                user: {
                    select: {
                        status: true,
                        email: true
                    }
                },
                reportingManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        return NextResponse.json({ employee })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!['HR', 'ADMIN', 'CEO'].includes(session?.user?.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const {
            firstName, lastName, email, phone, department, designation,
            status, role, joiningDate, salary
        } = body

        // Find existing employee to get userId
        const existingEmployee = await prisma.employee.findUnique({
            where: { id: params.id },
            include: { user: true }
        })

        if (!existingEmployee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        // Update User (email, status, role)
        if (email || status || role) {
            await prisma.user.update({
                where: { id: existingEmployee.userId },
                data: {
                    email: email || undefined,
                    status: status || undefined,
                    role: role || undefined
                }
            })
        }

        // Update Employee
        // First find department/designation IDs if names provided
        let departmentId = existingEmployee.departmentId
        let designationId = existingEmployee.designationId

        if (department) {
            const dept = await prisma.department.findFirst({ where: { name: department } })
            if (dept) departmentId = dept.id
        }

        if (designation) {
            const desig = await prisma.designation.findFirst({ where: { name: designation } })
            if (desig) designationId = desig.id
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id: params.id },
            data: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                email: email || undefined,
                phone: phone || undefined,
                departmentId,
                designationId,
                joiningDate: joiningDate ? new Date(joiningDate) : undefined,
                // Salary is not in Employee model in previous schema view, likely in SalaryStructure
                // Ignoring salary for now as it requires complex logic
            },
            include: {
                department: true,
                designation: true
            }
        })

        return NextResponse.json({
            message: 'Employee updated successfully',
            employee: updatedEmployee
        })
    } catch (error) {
        console.error('Update error', error)
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!['HR', 'ADMIN', 'CEO'].includes(session?.user?.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const {
            firstName, lastName, email, phone, gender, dateOfBirth,
            address, city, state, country, postalCode,
            emergencyContact, emergencyPhone,
            department, designation, employmentType,
            joiningDate, profileImage, status, role
        } = body

        // Find existing employee
        const existingEmployee = await prisma.employee.findUnique({
            where: { id: params.id },
            include: { user: true }
        })

        if (!existingEmployee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        // Update User if needed
        if (email || status || role) {
            await prisma.user.update({
                where: { id: existingEmployee.userId },
                data: {
                    email: email || undefined,
                    status: (status as string) || undefined,
                    role: (role as string) || undefined
                }
            })
        }

        // Handle relations by name
        let departmentId = undefined
        let designationId = undefined

        if (department) {
            const dept = await prisma.department.findFirst({ where: { name: department } })
            if (dept) {
                departmentId = dept.id
                console.log(`Resolved department "${department}" to ID: ${departmentId}`)
            } else {
                console.log(`Failed to resolve department: "${department}"`)
            }
        }

        if (designation) {
            const desig = await prisma.designation.findFirst({ where: { name: designation } })
            if (desig) {
                designationId = desig.id
                console.log(`Resolved designation "${designation}" to ID: ${designationId}`)
            } else {
                console.log(`Failed to resolve designation: "${designation}"`)
            }
        }

        const parseDate = (d: any) => {
            if (!d) return undefined
            const date = new Date(d)
            return isNaN(date.getTime()) ? undefined : date
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id: params.id },
            data: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                email: email || undefined,
                phone: phone || undefined,
                gender: gender || undefined,
                dateOfBirth: parseDate(dateOfBirth),
                address: address || undefined,
                city: city || undefined,
                state: state || undefined,
                country: country || undefined,
                postalCode: postalCode || undefined,
                emergencyContact: emergencyContact || undefined,
                emergencyPhone: emergencyPhone || undefined,
                departmentId: departmentId || undefined,
                designationId: designationId || undefined,
                employmentType: employmentType || undefined,
                joiningDate: parseDate(joiningDate),
                profileImage: profileImage || undefined
            },
            include: {
                department: true,
                designation: true
            }
        })

        return NextResponse.json({
            message: 'Employee updated successfully',
            employee: updatedEmployee
        })
    } catch (error) {
        console.error('Patch error', error)
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!['HR', 'ADMIN', 'CEO'].includes(session?.user?.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const employee = await prisma.employee.findUnique({
            where: { id: params.id },
            select: { userId: true }
        })

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        // Delete User (cascades to Employee)
        await prisma.user.delete({
            where: { id: employee.userId }
        })

        return NextResponse.json({ message: 'Employee deleted successfully' })
    } catch (error) {
        console.error('Delete error', error)
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
    }
}
