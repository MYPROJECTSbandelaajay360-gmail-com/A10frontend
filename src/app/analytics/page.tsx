'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Clock, CheckCircle, Star, MessageSquare, Users, Award, Calendar, Download, TrendingDown, ArrowLeft, Home, Search, Filter } from 'lucide-react';

interface Stats {
    total_conversations: number;
    resolved_count: number;
    resolution_rate: number;
    active_count: number;
    handled_today: number;
    avg_response_time: string;
    avg_response_seconds: number;
    avg_resolution_time: string;
    avg_rating: number;
    rating_count: number;
    total_hours_month: number;
}

interface WeeklyStat {
    day_name: string;
    date: string;
    total_chats: number;
    resolved_chats: number;
}

interface DailyActivity {
    active_now: number;
    handled_today: number;
    hours_today: number;
}

interface AgentPerformance {
    agent_id: string; // or number
    name: string;
    email: string;
    total_conversations: number;
    resolved_count: number;
    avg_rating: number;
    status: 'online' | 'busy' | 'offline';
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>('user');
    const [agentName, setAgentName] = useState('');

    // Agent View State
    const [stats, setStats] = useState<Stats | null>(null);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
    const [dailyActivity, setDailyActivity] = useState<DailyActivity | null>(null);
    const [previousStats, setPreviousStats] = useState<Stats | null>(null);

    // Team View State
    const [teamAgents, setTeamAgents] = useState<AgentPerformance[]>([]);
    const [systemStats, setSystemStats] = useState<any>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(userStr);
        setUserRole(user.role || 'user');
        setAgentName(user.name || user.email);

        if (user.role === 'admin' || user.role === 'supervisor') {
            fetchTeamAnalytics(user.role);
        } else {
            fetchAgentAnalytics(user.username || user.email);
        }

        // Refresh interval
        const interval = setInterval(() => {
            if (user.role === 'admin' || user.role === 'supervisor') {
                fetchTeamAnalytics(user.role);
            } else {
                fetchAgentAnalytics(user.username || user.email);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [router]);

    const fetchAgentAnalytics = async (username: string) => {
        try {
            const statsRes = await fetch(`http://localhost:8001/api/agent/stats/${username}`);
            const statsData = await statsRes.json();

            if (stats) setPreviousStats(stats);
            setStats(statsData);

            const weeklyRes = await fetch(`http://localhost:8001/api/agent/weekly-stats/${username}`);
            const weeklyData = await weeklyRes.json();
            setWeeklyStats(weeklyData.weekly_stats || []);

            const dailyRes = await fetch(`http://localhost:8001/api/agent/daily-activity/${username}`);
            const dailyData = await dailyRes.json();
            setDailyActivity(dailyData);

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch agent analytics:', error);
            setLoading(false);
        }
    };

    const fetchTeamAnalytics = async (role: string) => {
        try {
            const endpoint = 'http://localhost:8001/api/supervisor/team';

            const res = await fetch(endpoint);
            const data = await res.json();

            if (data && Array.isArray(data.team)) {
                const mappedAgents = data.team.map((agent: any) => ({
                    agent_id: agent.email,
                    name: agent.name,
                    email: agent.email,
                    status: agent.status,
                    total_conversations: agent.totalResolved || 0,
                    resolved_count: agent.totalResolved || 0,
                    avg_rating: agent.avgRating || 0
                }));
                setTeamAgents(mappedAgents);
            } else if (Array.isArray(data)) {
                setTeamAgents(data);
            }

            // Fetch overview stats
            const statsRes = await fetch('http://localhost:8001/api/supervisor/stats');
            const statsData = await statsRes.json();
            setSystemStats(statsData);

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch team analytics:', error);
            setLoading(false);
        }
    };

    const calculateTrend = (current: number, previous: number | undefined) => {
        if (!previous || previous === 0) return { value: 0, direction: 'neutral' as const };
        const change = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(Math.round(change)),
            direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // --- Render Functions ---

    const renderAgentView = () => {
        if (!stats || !dailyActivity) return null;
        const convTrend = calculateTrend(stats.total_conversations, previousStats?.total_conversations);

        return (
            <div className="space-y-8">
                {/* Key Metrics Grid (Simplified Theme) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Total Conversations</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-bold text-gray-900">{stats.total_conversations}</div>
                            {convTrend.direction !== 'neutral' && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${convTrend.direction === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                    }`}>
                                    {convTrend.direction === 'up' ? '+' : ''}{convTrend.value}%
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Resolution Rate</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-bold text-gray-900">{stats.resolution_rate}%</div>
                            <div className="text-xs text-gray-500 mb-1">{stats.resolved_count} resolved</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Avg Response Time</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-bold text-gray-900">{stats.avg_response_time}</div>
                            {stats.avg_response_seconds < 120 && (
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Fast</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-2 mb-2">
                            <Star className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Customer Rating</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-bold text-gray-900">{stats.avg_rating.toFixed(1)}</div>
                            <div className="text-xs text-gray-500 mb-1">{stats.rating_count} ratings</div>
                        </div>
                    </div>
                </div>

                {/* Charts & Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Weekly Performance */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-gray-500" />
                            Weekly Performance
                        </h2>
                        <div className="space-y-4">
                            {weeklyStats.length > 0 ? weeklyStats.map((data, index) => {
                                const maxValue = Math.max(...weeklyStats.map(d => d.total_chats), 1);
                                const chatWidth = (data.total_chats / maxValue) * 100;
                                const resolvedWidth = (data.resolved_chats / maxValue) * 100;

                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                            <span className="font-medium">{data.day_name}</span>
                                            <span className="text-gray-500">{data.total_chats} chats • {data.resolved_chats} resolved</span>
                                        </div>
                                        <div className="relative h-8">
                                            <div className="absolute inset-0 bg-gray-100 rounded-lg"></div>
                                            <div
                                                className="absolute inset-y-0 left-0 bg-amber-200 rounded-lg transition-all"
                                                style={{ width: `${chatWidth}%` }}
                                            ></div>
                                            <div
                                                className="absolute inset-y-0 left-0 bg-amber-500 rounded-lg transition-all"
                                                style={{ width: `${resolvedWidth}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center text-gray-500 py-8">
                                    No data available for the past week
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Award className="h-5 w-5 mr-2 text-gray-500" />
                            Performance Insights
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 transition-colors">
                                <div className="flex items-center space-x-2 mb-3">
                                    <span className="text-xl">⚡</span>
                                    <h3 className="font-medium text-gray-900">Response Speed</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Average response: <span className="font-semibold text-gray-900">{stats.avg_response_time}</span>
                                </p>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                    {stats.avg_response_seconds < 60 ? 'Excellent' : stats.avg_response_seconds < 120 ? 'Good' : 'Can be improved'}
                                </span>
                            </div>

                            <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 transition-colors">
                                <div className="flex items-center space-x-2 mb-3">
                                    <span className="text-xl">🎯</span>
                                    <h3 className="font-medium text-gray-900">Resolution Rate</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-semibold text-gray-900">{stats.resolution_rate}%</span> of chats resolved
                                </p>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                    {stats.resolution_rate >= 90 ? 'Outstanding' : stats.resolution_rate >= 75 ? 'Great job' : 'Keep improving'}
                                </span>
                            </div>

                            <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 transition-colors">
                                <div className="flex items-center space-x-2 mb-3">
                                    <span className="text-xl">⭐</span>
                                    <h3 className="font-medium text-gray-900">Customer Satisfaction</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-semibold text-gray-900">{stats.avg_rating.toFixed(1)}</span>/5.0 average rating
                                </p>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                    {stats.avg_rating >= 4.5 ? 'Exceptional' : stats.avg_rating >= 4.0 ? 'Very good' : 'Room for growth'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTeamView = () => {
        // Aggregate data if systemStats is not full
        const totalConversations = teamAgents.reduce((acc, curr) => acc + (curr.total_conversations || 0), 0);
        const totalResolved = teamAgents.reduce((acc, curr) => acc + (curr.resolved_count || 0), 0);
        const activeAgents = teamAgents.filter(a => a.status !== 'offline').length;

        const dashboardStats = systemStats || {
            total: totalConversations,
            resolved: totalResolved,
            active: activeAgents,
            avgResolutionTime: '0m'
        };

        return (
            <div className="space-y-8">
                {/* Team Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Total Team Chats</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{dashboardStats.total}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Resolved</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{dashboardStats.closed || dashboardStats.resolved}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Active Agents</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{activeAgents}</div>
                        <p className="text-xs text-green-600 mt-1">{activeAgents} Online Now</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Avg Resolution</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{dashboardStats.avgResolutionTime}</div>
                    </div>
                </div>

                {/* Agents Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-900">Agent Performance</h3>
                        <button className="text-sm text-amber-600 font-medium hover:text-amber-700">Download Report</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-medium border-b border-gray-200">
                                    <th className="px-6 py-3">Agent</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-right">Total Chats</th>
                                    <th className="px-6 py-3 text-right">Resolved</th>
                                    <th className="px-6 py-3 text-right">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teamAgents.length > 0 ? teamAgents.map((agent, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {agent.name || 'Unknown Agent'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {agent.email}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.status === 'online' ? 'bg-green-100 text-green-800' :
                                                    agent.status === 'busy' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {agent.status === 'online' ? 'Online' : agent.status === 'busy' ? 'Busy' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {agent.total_conversations || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            {agent.resolved_count || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {agent.avg_rating ? (
                                                <span className="inline-flex items-center text-amber-600 font-medium">
                                                    {Number(agent.avg_rating).toFixed(1)} <Star className="h-3 w-3 ml-1 fill-current" />
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No agents found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Navigation */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center text-amber-600 hover:text-amber-700 mb-4 font-medium transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        <span>Back to Dashboard</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                {userRole === 'user' || userRole === 'agent' ? 'My Performance' : 'Team Analytics'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {userRole === 'user' || userRole === 'agent'
                                    ? `Real-time performance metrics and insights for ${agentName}`
                                    : `Overview of ${userRole === 'admin' ? 'all system' : 'team'} performance and agent detailed stats.`
                                }
                            </p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>

                {/* Content based on Role */}
                {(userRole === 'admin' || userRole === 'supervisor') ? renderTeamView() : renderAgentView()}

            </div>
        </div>
    );
}
