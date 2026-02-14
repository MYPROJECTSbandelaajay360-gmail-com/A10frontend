'use client'

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
    Zap
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
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
        name: 'Employees',
        href: '/employees',
        icon: Users,
        roles: ['ADMIN', 'HR', 'MANAGER'],
        children: [
            { name: 'All Employees', href: '/employees', icon: Users },
            { name: 'Departments', href: '/employees/departments', icon: Building2 },
            { name: 'Designations', href: '/employees/designations', icon: Briefcase },
        ]
    },
    {
        name: 'Attendance',
        href: '/attendance',
        icon: Clock,
        children: [
            { name: 'My Attendance', href: '/attendance', icon: Clock },
            { name: 'Team Attendance', href: '/attendance/team', icon: Users, roles: ['MANAGER', 'HR', 'ADMIN'] },
            { name: 'Reports', href: '/attendance/reports', icon: BarChart3, roles: ['HR', 'ADMIN'] },
        ]
    },
    {
        name: 'Leave',
        href: '/leave',
        icon: CalendarDays,
        children: [
            { name: 'My Leaves', href: '/leave', icon: CalendarDays },
            { name: 'Apply Leave', href: '/leave/apply', icon: FileText },
            { name: 'Approvals', href: '/leave/approvals', icon: FileCheck, roles: ['MANAGER', 'HR', 'ADMIN'] },
            { name: 'Leave Reports', href: '/leave/reports', icon: ClipboardList, roles: ['HR', 'ADMIN'] },
        ]
    },
    {
        name: 'Holidays',
        href: '/holidays',
        icon: Calendar
    },
    {
        name: 'Payroll',
        href: '/payroll',
        icon: Wallet,
        children: [
            { name: 'My Payslips', href: '/payroll', icon: FileText },
            { name: 'Salary Structure', href: '/payroll/salary', icon: Wallet, roles: ['HR', 'ADMIN'] },
            { name: 'Process Payroll', href: '/payroll/process', icon: ClipboardList, roles: ['HR', 'ADMIN'] },
        ]
    },
    {
        name: 'Reports',
        href: '/reports',
        icon: BarChart3,
        roles: ['HR', 'ADMIN']
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        roles: ['ADMIN'],
        children: [
            { name: 'General', href: '/settings', icon: Settings },
            { name: 'User Management', href: '/settings/users', icon: UserCog },
            { name: 'Leave Types', href: '/settings/leave-types', icon: CalendarDays },
            { name: 'Shifts', href: '/settings/shifts', icon: Clock },
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
              w-full sidebar-nav-item relative
              ${isActive ? 'active' : ''}
            `}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                    {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
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
          sidebar-nav-item relative
          ${isChild ? 'text-sm py-2' : ''}
          ${isActive ? 'active' : ''}
        `}
                onClick={() => setIsMobileOpen(false)}
            >
                <Icon className={`${isChild ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
                {/* Logo Section */}
                <div className="px-5 h-[72px] border-b border-white/10 flex items-center">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                            <Zap className="w-6 h-6 text-white fill-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">HRMS</span>
                    </Link>
                </div>



                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    <div className="px-3 mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                            Menu
                        </p>
                    </div>
                    {filteredNavigation.map(item => renderNavItem(item))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <Link href="/notifications" className="sidebar-nav-item">
                        <Bell className="w-5 h-5" />
                        <span>Notifications</span>
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            3
                        </span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="sidebar-nav-item text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
