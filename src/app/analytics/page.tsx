'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Clock, CheckCircle, Star, MessageSquare, Users, Award, Calendar, Download } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [agentName, setAgentName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    setAgentName(user.name || user.email);
  }, [router]);

  // Mock analytics data
  const stats = {
    totalChats: 342,
    resolvedChats: 298,
    avgResponseTime: '2m 15s',
    avgResolutionTime: '8m 30s',
    customerRating: 4.8,
    totalHours: 156,
    activeToday: 12,
    activeCurrent: 3,
  };

  const weeklyData = [
    { day: 'Mon', chats: 45, resolved: 42 },
    { day: 'Tue', chats: 52, resolved: 48 },
    { day: 'Wed', chats: 48, resolved: 45 },
    { day: 'Thu', chats: 61, resolved: 58 },
    { day: 'Fri', chats: 55, resolved: 51 },
    { day: 'Sat', chats: 38, resolved: 35 },
    { day: 'Sun', chats: 43, resolved: 19 },
  ];

  const recentAchievements = [
    { title: 'Speed Demon', description: 'Resolved 10 tickets in under 5 minutes', date: '2 days ago', icon: '⚡' },
    { title: '5-Star Service', description: 'Received 50 five-star ratings', date: '5 days ago', icon: '⭐' },
    { title: 'Chat Master', description: 'Completed 300 conversations', date: '1 week ago', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span>Performance Analytics</span>
              </h1>
              <p className="text-gray-600 mt-2">Track your support performance and achievements</p>
            </div>
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-all shadow-md hover:shadow-lg">
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
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalChats}</div>
            <div className="text-sm text-gray-500 mt-1">Total Conversations</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">87%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.resolvedChats}</div>
            <div className="text-sm text-gray-500 mt-1">Resolved Successfully</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">-15%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</div>
            <div className="text-sm text-gray-500 mt-1">Avg Response Time</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+0.3</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.customerRating}</div>
            <div className="text-sm text-gray-500 mt-1">Customer Rating</div>
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
              {weeklyData.map((data, index) => {
                const maxValue = Math.max(...weeklyData.map(d => d.chats));
                const chatWidth = (data.chats / maxValue) * 100;
                const resolvedWidth = (data.resolved / maxValue) * 100;
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span className="font-medium">{data.day}</span>
                      <span className="text-gray-500">{data.chats} chats • {data.resolved} resolved</span>
                    </div>
                    <div className="relative h-8">
                      <div className="absolute inset-0 bg-gray-100 rounded-lg"></div>
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-200 to-amber-300 rounded-lg"
                        style={{ width: `${chatWidth}%` }}
                      ></div>
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg"
                        style={{ width: `${resolvedWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
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
                    <div className="text-xl font-bold text-gray-900">{stats.activeCurrent}</div>
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
                    <div className="text-xl font-bold text-gray-900">{stats.activeToday}</div>
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
                    <div className="text-xl font-bold text-gray-900">{stats.totalHours}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="h-5 w-5 mr-2 text-amber-600" />
            Recent Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <span className="text-xs text-gray-500">{achievement.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
