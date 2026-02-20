"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    Users,
    Clock,
    CalendarDays,
    FileText,
    Wallet,
    Bell,
    Settings,
    LogOut,
    Building2,
    UserCog,
    ClipboardList,
    FileCheck,
    BarChart3,
    Calendar,
    Briefcase,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    Zap,
    Megaphone
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
    roles?: string[]
    children?: NavItem[]
}

const navigation: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        children: [
            { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Virtual Office', href: '/dashboard/virtual-office', icon: Building2 },
        ]
    },
    {
        name: 'Employees',
        href: '/dashboard/employees',
        icon: Users,
        roles: ['ADMIN', 'HR', 'MANAGER'],
        children: [
            { name: 'All Employees', href: '/dashboard/employees', icon: Users },
            { name: 'Departments', href: '/dashboard/employees/departments', icon: Building2 },
            { name: 'Designations', href: '/dashboard/employees/designations', icon: Briefcase },
        ]
    },
    {
        name: 'Attendance',
        href: '/dashboard/attendance',
        icon: Clock,
        children: [
            { name: 'My Attendance', href: '/dashboard/attendance', icon: Clock },
            { name: 'Team Attendance', href: '/dashboard/attendance/team', icon: Users, roles: ['MANAGER', 'HR', 'ADMIN'] },
            { name: 'Reports', href: '/dashboard/attendance/reports', icon: BarChart3, roles: ['HR', 'ADMIN'] },
        ]
    },
    {
        name: 'Leave',
        href: '/dashboard/leave',
        icon: CalendarDays,
        children: [
            { name: 'My Leaves', href: '/dashboard/leave', icon: CalendarDays },
            { name: 'Apply Leave', href: '/dashboard/leave/apply', icon: FileText },
            { name: 'Approvals', href: '/dashboard/leave/approvals', icon: FileCheck, roles: ['MANAGER', 'HR', 'ADMIN'] },
            { name: 'Leave Reports', href: '/dashboard/leave/reports', icon: ClipboardList, roles: ['HR', 'ADMIN'] },
        ]
    },
    {
        name: 'Holidays',
        href: '/dashboard/holidays',
        icon: Calendar
    },
    {
        name: 'Payroll',
        href: '/dashboard/payroll',
        icon: Wallet,
        children: [
            { name: 'My Payslips', href: '/dashboard/payroll', icon: FileText },
            { name: 'Salary Structure', href: '/dashboard/payroll/salary', icon: Wallet, roles: ['HR', 'ADMIN'] },
            { name: 'Process Payroll', href: '/dashboard/payroll/process', icon: ClipboardList, roles: ['HR', 'ADMIN'] },
        ]
    },
    {
        name: 'Reports',
        href: '/dashboard/reports',
        icon: BarChart3,
        roles: ['HR', 'ADMIN']
    },
    {
        name: 'Announcements',
        href: '/dashboard/announcements',
        icon: Megaphone
    },
    {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        roles: ['ADMIN'],
        children: [
            { name: 'General', href: '/dashboard/settings', icon: Settings },
            { name: 'User Management', href: '/dashboard/settings/users', icon: UserCog },
            { name: 'Leave Types', href: '/dashboard/settings/leave-types', icon: CalendarDays },
            { name: 'Shifts', href: '/dashboard/settings/shifts', icon: Clock },
        ]
    },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const userRole = session?.user?.role || 'EMPLOYEE'

    const toggleExpanded = (name: string) => {
        setExpandedItems(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        )
    }

    const hasAccess = (roles?: string[]) => {
        if (!roles) return true
        return roles.includes(userRole)
    }

    const filteredNavigation = navigation.filter(item => hasAccess(item.roles))

    const renderNavItem = (item: NavItem, isChild = false) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedItems.includes(item.name)

        if (!hasAccess(item.roles)) return null

        if (hasChildren) {
            const filteredChildren = item.children?.filter(child => hasAccess(child.roles)) || []
            if (filteredChildren.length === 0) return null

            return (
                <div key={item.name}>
                    <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`
                            w-full sidebar-nav-item
                            ${isActive ? 'active' : ''}
                        `}
                    >
                        <Icon className="w-[18px] h-[18px]" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 sidebar-chevron" />
                        ) : (
                            <ChevronRight className="w-4 h-4 sidebar-chevron" />
                        )}
                    </button>
                    {isExpanded && (
                        <div className="sidebar-children">
                            {filteredChildren.map(child => renderNavItem(child, true))}
                        </div>
                    )}
                </div>
            )
        }

        return (
            <Link
                key={item.name}
                href={item.href}
                className={`
                    sidebar-nav-item
                    ${isChild ? 'text-xs !py-[7px]' : ''}
                    ${isActive ? 'active' : ''}
                `}
                onClick={() => setIsMobileOpen(false)}
            >
                <Icon className={`${isChild ? 'w-4 h-4' : 'w-[18px] h-[18px]'}`} />
                <span>{item.name}</span>
            </Link>
        )
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
                {/* Second star layer for depth */}
                <div className="sidebar-galaxy-stars" />
                <div className="sidebar-logo">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="sidebar-logo-icon">
                            <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="sidebar-logo-text">Musterbook</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-3 overflow-y-auto">
                    <div className="sidebar-menu-label">
                        Menu
                    </div>
                    {filteredNavigation.map(item => renderNavItem(item))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <Link href="/notifications" className="sidebar-nav-item">
                        <Bell className="w-[18px] h-[18px]" />
                        <span>Notifications</span>
                        <span className="sidebar-notification-badge">
                            3
                        </span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="sidebar-nav-item sidebar-logout w-full"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
