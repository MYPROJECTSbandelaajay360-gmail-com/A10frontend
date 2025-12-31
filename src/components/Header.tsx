'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu, X, Phone, Mail, MessageCircle, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Check if user is logged in
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      if (accessToken && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (for multi-tab sync)
    window.addEventListener('storage', checkAuth);
    
    // Listen for custom auth events
    window.addEventListener('auth-change', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Prevent hydration mismatch by not rendering auth buttons until mounted
  if (!mounted) {
    return (
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/images/logo.png"
                  alt="ExtraHand Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
                  priority
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                ExtraHand Support
              </span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="ExtraHand Logo"
                width={40}
                height={40}
                className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                ExtraHand
              </div>
              <div className="text-xs text-gray-500 -mt-1">Agent Portal</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all font-medium"
            >
              Dashboard
            </Link>

            {/* Auth Buttons */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-3 ml-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded-lg transition-all font-medium flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all font-medium"
                >
                  Login
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slideDown">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border-t border-gray-200 mt-2 pt-4 mx-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Logged in as</div>
                        <div className="font-medium text-gray-700">{user?.name}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all font-medium flex items-center justify-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="mx-4 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium text-center border border-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
