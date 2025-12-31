'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-8">
      <div className="text-center max-w-2xl w-full">
        {/* Error Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Main Error Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            Oops!
          </h1>
          <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-5">
            Something went wrong
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
            <p className="text-sm text-gray-600 leading-relaxed text-left">
              We apologize for the inconvenience. An unexpected error has occurred. 
              Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {error.message && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs font-medium text-gray-500 mb-2 text-left">Error Details:</p>
                <p className="text-xs text-gray-600 font-mono bg-white rounded-md p-2.5 border border-gray-300 break-words text-left">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-stretch">
            <button
              onClick={reset}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-gray-900 rounded-lg font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Try Again
            </button>
            <a
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 inline-block text-center"
            >
              Go to Homepage
            </a>
          </div>
        </div>

        {/* Additional Help */}
        <p className="mt-5 text-xs text-gray-500">
          Need help?{' '}
          <a
            href="/contact"
            className="text-primary-dark hover:text-primary font-medium underline decoration-1 underline-offset-2 transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}






