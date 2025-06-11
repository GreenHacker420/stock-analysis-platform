'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-md w-full text-center px-4">
        <div className={`mx-auto h-24 w-24 mb-8 ${
          isDark ? 'text-gray-600' : 'text-gray-400'
        }`}>
          <svg
            className="w-full h-full"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
            />
          </svg>
        </div>
        
        <h1 className={`text-6xl font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          404
        </h1>
        
        <h2 className={`text-2xl font-semibold mb-4 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Page Not Found
        </h2>
        
        <p className={`text-lg mb-8 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className={`inline-flex items-center px-6 py-3 border text-base font-medium rounded-md transition-colors duration-200 ${
                isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>
        </div>
        
        <div className={`mt-12 text-sm ${
          isDark ? 'text-gray-500' : 'text-gray-500'
        }`}>
          <p>
            If you believe this is an error, please{' '}
            <a
              href="mailto:support@stockanalysis.com"
              className="text-blue-600 hover:text-blue-500 underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
