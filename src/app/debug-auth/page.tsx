'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      setAuthState({
        hasToken: !!accessToken,
        token: accessToken ? accessToken.substring(0, 20) + '...' : null,
        hasUser: !!userStr,
        user: userStr ? JSON.parse(userStr) : null,
        timestamp: new Date().toISOString()
      });
    };

    checkAuth();

    // Update every second
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h2 className="font-semibold text-lg mb-2">Current Auth State:</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto">
                {JSON.stringify(authState, null, 2)}
              </pre>
            </div>

            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Go to Signup
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go to Home
              </Link>
              <button
                onClick={clearAuth}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear Auth & Refresh
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>If not logged in, click "Go to Signup" to create an account</li>
                <li>After signup, you'll be redirected to login</li>
                <li>Login with your credentials</li>
                <li>Come back to this page to see your auth state</li>
                <li>Check the header - you should see your name and logout button</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded">
              <h3 className="font-semibold mb-2">Test Credentials Format:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Email: yourname@gmail.com (must be Gmail)</li>
                <li>Password: YourPass123! (must have uppercase, lowercase, number, special char)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
