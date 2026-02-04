'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AllTicketsView from '../../AllTicketsView';

export default function SupervisorTicketsPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserEmail(user.email || '');
                setUserName(user.name || user.email || '');
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    const handleNavigate = (view: string, data?: any) => {
        if (view === 'chat' && data?.sessionId) {
            // Navigate to main dashboard with chat view
            // Store session data for the main dashboard to pick up
            sessionStorage.setItem('pendingChatSession', JSON.stringify(data));
            router.push('/dashboard');
        }
    };

    return (
        <AllTicketsView
            onNavigate={handleNavigate}
            userEmail={userEmail}
            userName={userName}
        />
    );
}
