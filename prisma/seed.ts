import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Clear existing data
    await prisma.notification.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.leaveApproval.deleteMany()
    await prisma.leaveRequest.deleteMany()
    await prisma.leaveBalance.deleteMany()
    await prisma.leaveTypeConfig.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.payrollDeduction.deleteMany()
    await prisma.payrollEarning.deleteMany()
    await prisma.payslip.deleteMany()
    await prisma.payrollRecord.deleteMany()
    await prisma.salaryDetail.deleteMany()
    await prisma.salaryComponent.deleteMany()
    await prisma.salaryStructure.deleteMany()
    await prisma.holiday.deleteMany()
    await prisma.shift.deleteMany()
    await prisma.employee.deleteMany()
    await prisma.designation.deleteMany()
    await prisma.department.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Cleared existing data')

    // Create Departments
    const departments = await Promise.all([
        prisma.department.create({ data: { name: 'Engineering', code: 'ENG', description: 'Software Development Team' } }),
        prisma.department.create({ data: { name: 'Human Resources', code: 'HR', description: 'HR & People Operations' } }),
        prisma.department.create({ data: { name: 'Marketing', code: 'MKT', description: 'Marketing & Communications' } }),
        prisma.department.create({ data: { name: 'Sales', code: 'SAL', description: 'Sales & Business Development' } }),
        prisma.department.create({ data: { name: 'Finance', code: 'FIN', description: 'Finance & Accounting' } }),
        prisma.department.create({ data: { name: 'Operations', code: 'OPS', description: 'Operations & Administration' } }),
    ])
    console.log(`✅ Created ${departments.length} departments`)

    // Create Designations
    const designations = await Promise.all([
        prisma.designation.create({ data: { name: 'CEO', code: 'CEO', level: 1 } }),
        prisma.designation.create({ data: { name: 'CTO', code: 'CTO', level: 2 } }),
        prisma.designation.create({ data: { name: 'HR Manager', code: 'HRM', level: 3 } }),
        prisma.designation.create({ data: { name: 'Engineering Manager', code: 'EM', level: 3 } }),
        prisma.designation.create({ data: { name: 'Senior Developer', code: 'SD', level: 4 } }),
        prisma.designation.create({ data: { name: 'Software Developer', code: 'DEV', level: 5 } }),
        prisma.designation.create({ data: { name: 'HR Executive', code: 'HRE', level: 5 } }),
        prisma.designation.create({ data: { name: 'Marketing Manager', code: 'MM', level: 4 } }),
        prisma.designation.create({ data: { name: 'Sales Executive', code: 'SE', level: 5 } }),
    ])
    console.log(`✅ Created ${designations.length} designations`)

    // Create Default Shift
    const generalShift = await prisma.shift.create({
        data: {
            name: 'General Shift',
            code: 'GEN',
            type: 'GENERAL',
            startTime: '09:00',
            endTime: '18:00',
            graceMinutes: 15,
            workingHours: 8,
            breakMinutes: 60,
            weekDays: JSON.stringify([1, 2, 3, 4, 5])
        }
    })
    console.log('✅ Created default shift')

    // Create Leave Types
    const leaveTypes = await Promise.all([
        prisma.leaveTypeConfig.create({ data: { name: 'Casual Leave', code: 'CL', defaultBalance: 12, maxCarryForward: 3, isPaidLeave: true } }),
        prisma.leaveTypeConfig.create({ data: { name: 'Sick Leave', code: 'SL', defaultBalance: 10, maxCarryForward: 0, isPaidLeave: true, requiresDocument: true, documentAfterDays: 2 } }),
        prisma.leaveTypeConfig.create({ data: { name: 'Earned Leave', code: 'EL', defaultBalance: 15, maxCarryForward: 10, isPaidLeave: true, isEncashable: true } }),
        prisma.leaveTypeConfig.create({ data: { name: 'Compensatory Off', code: 'CO', defaultBalance: 0, isPaidLeave: true } }),
        prisma.leaveTypeConfig.create({ data: { name: 'Leave Without Pay', code: 'LWP', defaultBalance: 0, isPaidLeave: false } }),
        prisma.leaveTypeConfig.create({ data: { name: 'Maternity Leave', code: 'ML', defaultBalance: 182, isPaidLeave: true, applicableGender: 'FEMALE' } }),
        prisma.leaveTypeConfig.create({ data: { name: 'Paternity Leave', code: 'PL', defaultBalance: 15, isPaidLeave: true, applicableGender: 'MALE' } }),
    ])
    console.log(`✅ Created ${leaveTypes.length} leave types`)

    // Create Holidays for 2026
    const holidays = await Promise.all([
        prisma.holiday.create({ data: { name: 'Republic Day', date: new Date('2026-01-26'), type: 'PUBLIC', year: 2026 } }),
        prisma.holiday.create({ data: { name: 'Holi', date: new Date('2026-03-14'), type: 'PUBLIC', year: 2026 } }),
        prisma.holiday.create({ data: { name: 'Good Friday', date: new Date('2026-04-03'), type: 'PUBLIC', year: 2026 } }),
        prisma.holiday.create({ data: { name: 'Id-ul-Fitr', date: new Date('2026-05-25'), type: 'PUBLIC', year: 2026 } }),
        prisma.holiday.create({ data: { name: 'Independence Day', date: new Date('2026-08-15'), type: 'PUBLIC', year: 2026 } }),
        prisma.holiday.create({ data: { name: 'Dussehra', date: new Date('2026-10-06'), type: 'PUBLIC', year: 2026 } }),
        prisma.holiday.create({ data: { name: 'Diwali', date: new Date('2026-10-25'), type: 'PUBLIC', year: 2026 } }),
        prisma.holiday.create({ data: { name: 'Christmas', date: new Date('2026-12-25'), type: 'PUBLIC', year: 2026 } }),
    ])
    console.log(`✅ Created ${holidays.length} holidays`)

    // Hash password function
    const hashPassword = async (password: string) => bcrypt.hash(password, 10)

    // Create Users and Employees
    const usersData = [
        { email: 'admin@hrms.com', password: 'admin123', role: 'ADMIN', firstName: 'Admin', lastName: 'User', department: 'Operations', designation: 'CEO' },
        { email: 'hr@hrms.com', password: 'hr123', role: 'HR', firstName: 'Sarah', lastName: 'Johnson', department: 'Human Resources', designation: 'HR Manager' },
        { email: 'manager@hrms.com', password: 'manager123', role: 'MANAGER', firstName: 'Michael', lastName: 'Scott', department: 'Engineering', designation: 'Engineering Manager' },
        { email: 'employee@hrms.com', password: 'emp123', role: 'EMPLOYEE', firstName: 'John', lastName: 'Doe', department: 'Engineering', designation: 'Senior Developer' },
        { email: 'dev1@hrms.com', password: 'dev123', role: 'EMPLOYEE', firstName: 'Emily', lastName: 'Chen', department: 'Engineering', designation: 'Software Developer' },
        { email: 'dev2@hrms.com', password: 'dev123', role: 'EMPLOYEE', firstName: 'David', lastName: 'Lee', department: 'Engineering', designation: 'Software Developer' },
        { email: 'sales@hrms.com', password: 'sales123', role: 'EMPLOYEE', firstName: 'Lisa', lastName: 'Anderson', department: 'Sales', designation: 'Sales Executive' },
        { email: 'marketing@hrms.com', password: 'mkt123', role: 'MANAGER', firstName: 'Robert', lastName: 'Wilson', department: 'Marketing', designation: 'Marketing Manager' },
    ]

    for (let i = 0; i < usersData.length; i++) {
        const userData = usersData[i]
        const hashedPassword = await hashPassword(userData.password)
        const dept = departments.find(d => d.name === userData.department)!
        const desig = designations.find(d => d.name === userData.designation)!

        const user = await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                status: 'ACTIVE'
            }
        })

        const employee = await prisma.employee.create({
            data: {
                employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
                userId: user.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: `+91 98765 4321${i}`,
                departmentId: dept.id,
                designationId: desig.id,
                joiningDate: new Date('2023-01-15'),
                shiftId: generalShift.id,
                employmentType: 'FULL_TIME'
            }
        })

        // Create leave balances
        for (const leaveType of leaveTypes.slice(0, 4)) {
            await prisma.leaveBalance.create({
                data: {
                    employeeId: employee.id,
                    leaveTypeId: leaveType.id,
                    year: 2026,
                    allocated: leaveType.defaultBalance,
                    used: Math.floor(Math.random() * 3),
                    pending: 0
                }
            })
        }
    }
    console.log(`✅ Created ${usersData.length} users with employees and leave balances`)

    // Create Salary Components
    const salaryComponents = await Promise.all([
        prisma.salaryComponent.create({ data: { name: 'Basic Salary', code: 'BASIC', type: 'EARNING', isFixed: true, isTaxable: true, order: 1 } }),
        prisma.salaryComponent.create({ data: { name: 'House Rent Allowance', code: 'HRA', type: 'EARNING', isFixed: true, isTaxable: true, order: 2 } }),
        prisma.salaryComponent.create({ data: { name: 'Special Allowance', code: 'SA', type: 'EARNING', isFixed: true, isTaxable: true, order: 3 } }),
        prisma.salaryComponent.create({ data: { name: 'Conveyance Allowance', code: 'CA', type: 'EARNING', isFixed: true, isTaxable: false, order: 4 } }),
        prisma.salaryComponent.create({ data: { name: 'Medical Allowance', code: 'MA', type: 'EARNING', isFixed: true, isTaxable: false, order: 5 } }),
        prisma.salaryComponent.create({ data: { name: 'Provident Fund', code: 'PF', type: 'DEDUCTION', calculationType: 'PERCENTAGE', percentage: 12, isTaxable: false, order: 1 } }),
        prisma.salaryComponent.create({ data: { name: 'Professional Tax', code: 'PT', type: 'DEDUCTION', isFixed: true, isTaxable: false, order: 2 } }),
        prisma.salaryComponent.create({ data: { name: 'Income Tax', code: 'TDS', type: 'STATUTORY', isTaxable: false, order: 3 } }),
    ])
    console.log(`✅ Created ${salaryComponents.length} salary components`)

    // Create System Settings
    await prisma.systemSetting.createMany({
        data: [
            { key: 'company_name', value: 'HRMS Portal', category: 'general' },
            { key: 'company_address', value: 'Bangalore, India', category: 'general' },
            { key: 'work_week_start', value: 'MONDAY', category: 'attendance' },
            { key: 'default_currency', value: 'INR', category: 'payroll' },
            { key: 'financial_year_start', value: 'APRIL', category: 'payroll' },
        ]
    })
    console.log('✅ Created system settings')

    console.log('')
    console.log('🎉 Database seeded successfully!')
    console.log('')
    console.log('Demo Login Credentials:')
    console.log('------------------------')
    console.log('Admin: admin@hrms.com / admin123')
    console.log('HR: hr@hrms.com / hr123')
    console.log('Manager: manager@hrms.com / manager123')
    console.log('Employee: employee@hrms.com / emp123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
