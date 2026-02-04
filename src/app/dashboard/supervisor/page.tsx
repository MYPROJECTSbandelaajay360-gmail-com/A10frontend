'use client';

import { useRouter } from 'next/navigation';
import SupervisorDashboardView from '../SupervisorDashboardView';

export default function SupervisorDashboardPage() {
    const router = useRouter();

    const handleNavigate = (view: string) => {
        switch (view) {
            case 'supervisor_team':
                router.push('/dashboard/supervisor/team');
                break;
            case 'supervisor_tickets':
                router.push('/dashboard/supervisor/tickets');
                break;
            default:
                console.log('Navigation to view:', view);
        }
    };

    return <SupervisorDashboardView onNavigate={handleNavigate} />;
}
