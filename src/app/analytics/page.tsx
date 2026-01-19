'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Clock, CheckCircle, Star, MessageSquare, Users, Award, Calendar, Download, TrendingDown, ArrowLeft, Home } from 'lucide-react';

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

export default function AnalyticsPage() {
  const router = useRouter();
  const [agentName, setAgentName] = useState('');
  const [agentUsername, setAgentUsername] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousStats, setPreviousStats] = useState<Stats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    setAgentName(user.name || user.email);
    setAgentUsername(user.username || user.email);
    
    // Fetch analytics data
    fetchAnalytics(user.username || user.email);
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics(user.username || user.email);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [router]);

  const fetchAnalytics = async (username: string) => {
    try {
      // Fetch main stats
      const statsRes = await fetch(`http://localhost:8001/api/agent/stats/${username}`);
      const statsData = await statsRes.json();
      
      // Store previous stats for comparison
      if (stats) {
        setPreviousStats(stats);
      }
      setStats(statsData);
      
      // Fetch weekly stats
      const weeklyRes = await fetch(`http://localhost:8001/api/agent/weekly-stats/${username}`);
      const weeklyData = await weeklyRes.json();
      setWeeklyStats(weeklyData.weekly_stats || []);
      
      // Fetch daily activity
      const dailyRes = await fetch(`http://localhost:8001/api/agent/daily-activity/${username}`);
      const dailyData = await dailyRes.json();
      setDailyActivity(dailyData);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

  if (loading || !stats || !dailyActivity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const convTrend = calculateTrend(stats.total_conversations, previousStats?.total_conversations);
  const ratingTrend = calculateTrend(stats.avg_rating, previousStats?.avg_rating);

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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span>Performance Analytics</span>
              </h1>
              <p className="text-gray-600 mt-2">Real-time performance tracking for {agentName}</p>
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              {convTrend.direction !== 'neutral' && (
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  convTrend.direction === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {convTrend.direction === 'up' ? '+' : '-'}{convTrend.value}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_conversations}</div>
            <div className="text-sm text-gray-500 mt-1">Total Conversations</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stats.resolution_rate}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.resolved_count}</div>
            <div className="text-sm text-gray-500 mt-1">Resolved Successfully</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              {stats.avg_response_seconds < 120 && (
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Fast
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.avg_response_time}</div>
            <div className="text-sm text-gray-500 mt-1">Avg Response Time</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              {ratingTrend.direction === 'up' && (
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +{ratingTrend.value}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.avg_rating.toFixed(1)}</div>
            <div className="text-sm text-gray-500 mt-1">Customer Rating ({stats.rating_count} ratings)</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Performance */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-amber-600" />
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
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-200 to-amber-300 rounded-lg transition-all"
                        style={{ width: `${chatWidth}%` }}
                      ></div>
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg transition-all"
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

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-amber-600" />
              Today's Activity
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Active Chats</div>
                    <div className="text-xl font-bold text-gray-900">{dailyActivity.active_now}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Handled Today</div>
                    <div className="text-xl font-bold text-gray-900">{dailyActivity.handled_today}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Hours This Month</div>
                    <div className="text-xl font-bold text-gray-900">{stats.total_hours_month}h</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Hours Today</div>
                    <div className="text-xl font-bold text-gray-900">{dailyActivity.hours_today.toFixed(1)}h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="h-5 w-5 mr-2 text-amber-600" />
            Performance Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-gray-900 mb-1">Response Speed</h3>
              <p className="text-sm text-gray-600 mb-2">
                Average response: {stats.avg_response_time}
              </p>
              <span className="text-xs text-gray-500">
                {stats.avg_response_seconds < 60 ? 'Excellent!' : stats.avg_response_seconds < 120 ? 'Good!' : 'Can be improved'}
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-bold text-gray-900 mb-1">Resolution Rate</h3>
              <p className="text-sm text-gray-600 mb-2">
                {stats.resolution_rate}% of chats resolved
              </p>
              <span className="text-xs text-gray-500">
                {stats.resolution_rate >= 90 ? 'Outstanding!' : stats.resolution_rate >= 75 ? 'Great job!' : 'Keep improving'}
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-bold text-gray-900 mb-1">Customer Satisfaction</h3>
              <p className="text-sm text-gray-600 mb-2">
                {stats.avg_rating.toFixed(1)}/5.0 average rating
              </p>
              <span className="text-xs text-gray-500">
                {stats.avg_rating >= 4.5 ? 'Exceptional!' : stats.avg_rating >= 4.0 ? 'Very good!' : 'Room for growth'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
