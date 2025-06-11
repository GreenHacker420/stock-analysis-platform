'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Navigation from '@/components/layout/Navigation';
import { 
  UserGroupIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  EyeIcon,
  PlayIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface SeedResult {
  success: boolean;
  message: string;
  data?: any;
}

export default function SeedUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [demoCredentials, setDemoCredentials] = useState<any>(null);

  if (status === 'loading') {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const handleAction = async (action: string) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      setResult(data);

      if (action === 'demo' && data.success) {
        setDemoCredentials(data.data);
      }

    } catch (error: any) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const ActionButton = ({ 
    action, 
    icon: Icon, 
    title, 
    description, 
    variant = 'primary' 
  }: {
    action: string;
    icon: any;
    title: string;
    description: string;
    variant?: 'primary' | 'danger' | 'secondary';
  }) => {
    const baseClasses = "flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantClasses = {
      primary: `bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 ${
        isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
      }`,
      danger: `bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 ${
        isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
      }`,
      secondary: `${
        isDark 
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 focus:ring-gray-500 focus:ring-offset-gray-800' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500 focus:ring-offset-white'
      }`,
    };

    return (
      <div className={`rounded-lg border p-6 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="text-center mb-4">
          <Icon className={`w-8 h-8 mx-auto mb-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`} />
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {description}
          </p>
        </div>
        <button
          onClick={() => handleAction(action)}
          disabled={loading}
          className={`w-full ${baseClasses} ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Icon className="w-5 h-5 mr-2" />
              {title}
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navigation />
      <main className="max-w-[1200px] mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              User Database Management
            </h1>
            <p className={`mt-2 text-lg ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Seed demo users into the database for testing authentication
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ActionButton
              action="seed"
              icon={UserGroupIcon}
              title="Seed Users"
              description="Add 12 demo users (5 analysts, 7 investors) to database"
              variant="primary"
            />
            
            <ActionButton
              action="demo"
              icon={EyeIcon}
              title="Show Credentials"
              description="Display demo login credentials for testing"
              variant="secondary"
            />
            
            <ActionButton
              action="verify"
              icon={CheckCircleIcon}
              title="Verify Users"
              description="Check that seeded users can authenticate properly"
              variant="secondary"
            />
            
            <ActionButton
              action="clear"
              icon={TrashIcon}
              title="Clear Users"
              description="Remove all users from database (use with caution!)"
              variant="danger"
            />
          </div>

          {/* Results */}
          {result && (
            <div className={`rounded-lg border p-6 mb-8 ${
              result.success 
                ? isDark 
                  ? 'bg-green-900/20 border-green-700 text-green-300' 
                  : 'bg-green-50 border-green-200 text-green-800'
                : isDark 
                  ? 'bg-red-900/20 border-red-700 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircleIcon className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">
                    {result.success ? 'Success!' : 'Error'}
                  </h3>
                  <p className="mb-4">{result.message}</p>
                  
                  {result.data && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-medium">
                        View Details
                      </summary>
                      <pre className={`mt-2 p-4 rounded text-xs overflow-auto ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Demo Credentials Display */}
          {demoCredentials && (
            <div className={`rounded-lg border p-6 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                🔐 Demo Login Credentials
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Analysts */}
                <div>
                  <h4 className={`text-lg font-medium mb-3 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    👨‍💼 Analysts
                  </h4>
                  <div className="space-y-3">
                    {demoCredentials.analysts?.map((user: any, index: number) => (
                      <div key={index} className={`p-3 rounded border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.name}
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          📧 {user.email}
                        </div>
                        <div className={`text-sm font-mono ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          🔑 {user.password}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Investors */}
                <div>
                  <h4 className={`text-lg font-medium mb-3 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    💼 Investors
                  </h4>
                  <div className="space-y-3">
                    {demoCredentials.investors?.map((user: any, index: number) => (
                      <div key={index} className={`p-3 rounded border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.name}
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          📧 {user.email}
                        </div>
                        <div className={`text-sm font-mono ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          🔑 {user.password}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className={`mt-8 p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-3 ${
              isDark ? 'text-blue-400' : 'text-blue-800'
            }`}>
              📋 Instructions
            </h3>
            <ul className={`space-y-2 text-sm ${
              isDark ? 'text-gray-300' : 'text-blue-700'
            }`}>
              <li>• <strong>Seed Users:</strong> Creates 12 demo users in your database with hashed passwords</li>
              <li>• <strong>Show Credentials:</strong> Displays login credentials for testing authentication</li>
              <li>• <strong>Verify Users:</strong> Checks that all seeded users can authenticate properly</li>
              <li>• <strong>Clear Users:</strong> Removes all users from database (⚠️ destructive action)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
