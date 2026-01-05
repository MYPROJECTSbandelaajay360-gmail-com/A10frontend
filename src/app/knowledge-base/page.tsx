'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Book, FileText, HelpCircle, ExternalLink, ChevronRight, Bookmark, Clock, Star } from 'lucide-react';

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  const categories = [
    { id: 'all', name: 'All Articles', icon: '📚', count: 45 },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀', count: 12 },
    { id: 'payments', name: 'Payments & Billing', icon: '💳', count: 8 },
    { id: 'account', name: 'Account Management', icon: '👤', count: 10 },
    { id: 'safety', name: 'Safety & Security', icon: '🔒', count: 7 },
    { id: 'policies', name: 'Policies', icon: '📋', count: 8 },
  ];

  const articles = [
    {
      id: 1,
      title: 'How to Handle Payment Disputes',
      category: 'payments',
      excerpt: 'Step-by-step guide on resolving payment issues and disputes between customers and helpers.',
      views: 1243,
      lastUpdated: '2 days ago',
      popular: true,
    },
    {
      id: 2,
      title: 'Customer Account Verification Process',
      category: 'account',
      excerpt: 'Learn about the verification steps and how to help customers through the process.',
      views: 987,
      lastUpdated: '5 days ago',
      popular: true,
    },
    {
      id: 3,
      title: 'Safety Guidelines for Task Completion',
      category: 'safety',
      excerpt: 'Important safety protocols and guidelines that both customers and helpers should follow.',
      views: 856,
      lastUpdated: '1 week ago',
      popular: false,
    },
    {
      id: 4,
      title: 'Refund and Cancellation Policies',
      category: 'policies',
      excerpt: 'Complete guide to ExtraHand refund policies and how to process cancellations.',
      views: 1521,
      lastUpdated: '3 days ago',
      popular: true,
    },
    {
      id: 5,
      title: 'Onboarding New Users',
      category: 'getting-started',
      excerpt: 'Best practices for helping new users get started with the ExtraHand platform.',
      views: 2104,
      lastUpdated: '1 day ago',
      popular: true,
    },
    {
      id: 6,
      title: 'Handling Multiple Payment Methods',
      category: 'payments',
      excerpt: 'Guide to supporting various payment options and troubleshooting payment issues.',
      views: 654,
      lastUpdated: '1 week ago',
      popular: false,
    },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const quickLinks = [
    { title: 'Escalation Procedures', icon: '🚨' },
    { title: 'Common Issues FAQ', icon: '❓' },
    { title: 'Contact Support Team', icon: '📞' },
    { title: 'Report a Bug', icon: '🐛' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Book className="h-6 w-6 text-white" />
            </div>
            <span>Knowledge Base</span>
          </h1>
          <p className="text-gray-600 mt-2">Search articles, guides, and documentation to help customers</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, guides, or topics..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Categories</h2>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                      selectedCategory === category.id
                        ? 'bg-amber-50 text-amber-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Quick Links</h2>
              <div className="space-y-2">
                {quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-lg transition-all"
                  >
                    <span>{link.icon}</span>
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Popular Articles Badge */}
            {selectedCategory === 'all' && !searchQuery && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-amber-600 mb-4">
                  <Star className="h-5 w-5 fill-amber-600" />
                  <span className="font-semibold">Popular Articles</span>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="space-y-4">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {article.popular && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                              Popular
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{categories.find(c => c.id === article.category)?.name}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">{article.excerpt}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.lastUpdated}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>{article.views} views</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors flex-shrink-0 ml-4" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
