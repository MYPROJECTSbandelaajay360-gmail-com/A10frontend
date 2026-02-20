import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="page-container">
                <Header />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    )
}
